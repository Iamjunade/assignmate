"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onConnectionRequest = exports.onTokenWrite = exports.onNewPost = exports.onNewMessage = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize admin app if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Trigger: When a new message is added to a chat
 * Path: chats/{chatId}/messages/{messageId}
 */
exports.onNewMessage = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;
    if (!message || !message.sender_id)
        return;
    try {
        // 1. Get Chat Metadata to find participants
        const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
        if (!chatDoc.exists)
            return;
        const chatData = chatDoc.data();
        const participants = (chatData === null || chatData === void 0 ? void 0 : chatData.participants) || [];
        // 2. Identify Recipient(s) - exclude sender
        const recipientIds = participants.filter((uid) => uid !== message.sender_id);
        if (recipientIds.length === 0)
            return;
        // 3. Fetch Sender Details (for Title)
        // Optimization: Message usually contains sender_name, use that if available to save read
        const senderName = message.sender_name || 'Someone';
        const messageBody = message.type === 'offer' ? 'Sent you a project offer' : (message.content || 'Sent a message');
        // 4. Send to each recipient
        const sendPromises = recipientIds.map(async (uid) => {
            // Fetch user's tokens
            const tokensSnap = await admin.firestore()
                .collection('users')
                .doc(uid)
                .collection('fcm_tokens')
                .get();
            if (tokensSnap.empty)
                return;
            const tokens = tokensSnap.docs.map(t => t.data().token).filter(t => !!t);
            if (tokens.length === 0)
                return;
            // Create Payload
            const payload = {
                notification: {
                    title: senderName,
                    body: messageBody,
                    clickAction: `https://assignmate.live/chats/${chatId}`,
                    icon: '/logo.png'
                },
                data: {
                    type: 'chat',
                    chatId: chatId,
                    url: `/chats/${chatId}`
                }
            };
            // Send
            const response = await admin.messaging().sendToDevice(tokens, payload);
            // Cleanup Invalid Tokens
            const tokensToRemove = [];
            response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        // Delete invalid token
                        tokensToRemove.push(tokensSnap.docs[index].ref.delete());
                    }
                }
            });
            await Promise.all(tokensToRemove);
        });
        await Promise.all(sendPromises);
    }
    catch (error) {
        console.error('[onNewMessage] Error:', error);
    }
});
/**
 * Trigger: When a new community post is created
 * Path: community_posts/{postId}
 */
exports.onNewPost = functions.firestore
    .document('community_posts/{postId}')
    .onCreate(async (snap, context) => {
    const post = snap.data();
    if (!post)
        return;
    const scope = post.scope || 'global';
    const school = post.user_school;
    try {
        let topic = 'global_posts';
        let title = 'New Global Discussion';
        if (scope === 'campus' && school) {
            // Sanitize school name for topic (remove spaces, special chars)
            // standard topic format: "school_CMRIT"
            const sanitizedSchool = school.replace(/[^a-zA-Z0-9]/g, '_');
            topic = `school_${sanitizedSchool}`;
            title = `New in ${school}`;
        }
        const payload = {
            notification: {
                title: title,
                body: post.content ? (post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')) : 'New post',
                icon: '/logo.png',
                clickAction: '/community'
            },
            data: {
                type: 'post',
                postId: context.params.postId,
                url: '/community'
            }
        };
        await admin.messaging().sendToTopic(topic, payload);
    }
    catch (error) {
        console.error('[onNewPost] Error:', error);
    }
});
/**
 * Trigger: When a token is written (Manage Topic Subscriptions)
 * Path: users/{userId}/fcm_tokens/{tokenId}
 */
exports.onTokenWrite = functions.firestore
    .document('users/{userId}/fcm_tokens/{tokenId}')
    .onWrite(async (change, context) => {
    // If deleted, do nothing (Firebase handles topic unsubscribe lazily or we can't do it easily without token)
    if (!change.after.exists)
        return;
    const data = change.after.data();
    const token = data === null || data === void 0 ? void 0 : data.token;
    const userId = context.params.userId;
    if (!token)
        return;
    try {
        // 1. Subscribe to Global Topic
        await admin.messaging().subscribeToTopic(token, 'global_posts');
        // 2. Fetuch User to get School
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
        if (userData && userData.school) {
            const sanitizedSchool = userData.school.replace(/[^a-zA-Z0-9]/g, '_');
            await admin.messaging().subscribeToTopic(token, `school_${sanitizedSchool}`);
        }
    }
    catch (error) {
        console.error('[onTokenWrite] Error:', error);
    }
});
/**
 * Trigger: When a connection request is created
 * Path: requests/{requestId}
 */
exports.onConnectionRequest = functions.firestore
    .document('requests/{requestId}')
    .onCreate(async (snap, context) => {
    var _a;
    const request = snap.data();
    if (!request)
        return;
    const toUserId = request.toId; // Recipient
    const fromUserId = request.fromId; // Sender
    if (!toUserId || !fromUserId)
        return;
    try {
        // 1. Fetch Sender Details
        const senderDoc = await admin.firestore().collection('users').doc(fromUserId).get();
        const senderName = ((_a = senderDoc.data()) === null || _a === void 0 ? void 0 : _a.full_name) || 'Someone';
        // 2. Fetch Recipient Tokens
        const tokensSnap = await admin.firestore()
            .collection('users')
            .doc(toUserId)
            .collection('fcm_tokens')
            .get();
        if (tokensSnap.empty) {
            console.log(`[onConnectionRequest] No tokens for user ${toUserId}`);
            return;
        }
        const tokens = tokensSnap.docs.map(t => t.data().token).filter(Boolean);
        // 3. Send Notification
        const payload = {
            notification: {
                title: 'New Connection Request',
                body: `${senderName} wants to connect with you.`,
                icon: '/logo.png',
                clickAction: `/profile/${fromUserId}`
            },
            data: {
                type: 'connection_request',
                fromUserId: fromUserId,
                url: `/profile/${fromUserId}`
            }
        };
        const response = await admin.messaging().sendToDevice(tokens, payload);
        // 4. Cleanup
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(tokensSnap.docs[index].ref.delete());
                }
            }
        });
        await Promise.all(tokensToRemove);
    }
    catch (error) {
        console.error('[onConnectionRequest] Error:', error);
    }
});
//# sourceMappingURL=notifications.js.map