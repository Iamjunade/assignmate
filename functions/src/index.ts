import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// 1. Notify on Connection Request
export const sendConnectionRequestNotification = functions.firestore
    .document("requests/{requestId}")
    .onCreate(async (snap, context) => {
        const request = snap.data();
        const toUserId = request.toId;
        const fromUserId = request.fromId;

        try {
            // Get Recipient's FCM Token
            const userDoc = await admin.firestore().collection("users").doc(toUserId).get();
            const userData = userDoc.data();
            const fcmToken = userData?.fcm_token;

            if (!fcmToken) {
                console.log("No FCM token for user:", toUserId);
                return;
            }

            // Get Sender's Name
            const senderDoc = await admin.firestore().collection("users").doc(fromUserId).get();
            const senderName = senderDoc.data()?.full_name || "Someone";

            // Prepare Notification
            const payload = {
                notification: {
                    title: "New Connection Request",
                    body: `${senderName} wants to connect with you on AssignMate.`,
                },
                data: {
                    click_action: "https://your-website.com/profile/" + fromUserId, // Link to sender profile
                    type: "connection_request"
                },
                token: fcmToken
            };

            // Send
            await admin.messaging().send(payload);
            console.log("Notification sent to:", toUserId);

        } catch (error) {
            console.error("Error sending notification:", error);
        }
    });

// 2. Notify on New Chat Message
export const sendChatNotification = functions.firestore
    .document("chats/{chatId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const chatId = context.params.chatId;
        const senderId = message.senderId;

        // Get Chat Participants to find the "Other" person
        const chatDoc = await admin.firestore().collection("chats").doc(chatId).get();
        const participants = chatDoc.data()?.participants || [];

        // Find the recipient (the one who didn't send the message)
        const recipientId = participants.find((uid: string) => uid !== senderId);

        if (!recipientId) return;

        // Fetch Recipient Token & Sender Name
        const [recipientDoc, senderDoc] = await Promise.all([
            admin.firestore().collection("users").doc(recipientId).get(),
            admin.firestore().collection("users").doc(senderId).get()
        ]);

        const fcmToken = recipientDoc.data()?.fcm_token;
        const senderName = senderDoc.data()?.full_name || "User";

        if (fcmToken) {
            await admin.messaging().send({
                notification: {
                    title: senderName,
                    body: message.text || "Sent an attachment",
                },
                data: {
                    click_action: `https://your-website.com/chats/${chatId}`,
                    type: "chat_message"
                },
                token: fcmToken
            });
        }
    });
