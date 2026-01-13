import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin, { tryInitAdmin } from '../_utils/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        tryInitAdmin();
    } catch (e: any) {
        return res.status(500).json({ error: `Server Config Error: ${e.message}` });
    }

    const { chatId, senderId, senderName, content, type } = req.body;

    if (!chatId || !senderId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Fetch Chat Metadata to find participants (Secure Source of Truth)
        const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
        if (!chatDoc.exists) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const chatData = chatDoc.data();
        const participants: string[] = chatData?.participants || [];

        // 2. Identify Recipients (exclude sender)
        const recipientIds = participants.filter((uid) => uid !== senderId);

        if (recipientIds.length === 0) {
            return res.status(200).json({ status: 'No recipients' });
        }

        const messageBody = type === 'offer' ? 'Sent you a project offer' : (content || 'Sent a message');

        // 3. Send to each recipient
        await Promise.all(recipientIds.map(async (uid) => {
            const tokensSnap = await admin.firestore()
                .collection('users')
                .doc(uid)
                .collection('fcm_tokens')
                .get();

            if (tokensSnap.empty) return;

            const tokens = tokensSnap.docs.map(t => t.data().token).filter(t => !!t);

            if (tokens.length === 0) return;

            // Create Multicast Message
            const messagePayload: admin.messaging.MulticastMessage = {
                tokens: tokens,
                notification: {
                    title: senderName || 'Someone',
                    body: messageBody,
                },
                data: {
                    type: 'chat',
                    chatId: chatId,
                    url: `/chats/${chatId}`,
                    click_action: `/chats/${chatId}`
                },
                webpush: {
                    fcmOptions: {
                        link: `/chats/${chatId}`
                    }
                }
            };

            const response = await admin.messaging().sendEachForMulticast(messagePayload);

            // Cleanup Invalid Tokens
            const tokensToRemove: Promise<any>[] = [];
            response.responses.forEach((resp, index) => {
                if (!resp.success && resp.error) {
                    const errorCode = resp.error.code;
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        tokensToRemove.push(tokensSnap.docs[index].ref.delete());
                    }
                }
            });
            await Promise.all(tokensToRemove);
        }));

        return res.status(200).json({ success: true, recipients: recipientIds.length });

    } catch (error: any) {
        console.error('Send Chat Notification Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
