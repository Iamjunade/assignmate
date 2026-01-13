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

    const { toId, fromId, senderName } = req.body;

    if (!toId || !fromId) {
        return res.status(400).json({ error: 'Missing user IDs' });
    }

    try {
        // Fetch Recipient Tokens
        const tokensSnap = await admin.firestore()
            .collection('users')
            .doc(toId)
            .collection('fcm_tokens')
            .get();

        if (tokensSnap.empty) {
            return res.status(200).json({ message: 'No tokens found for user' });
        }

        const tokens = tokensSnap.docs.map(t => t.data().token).filter(t => !!t);
        if (tokens.length === 0) return res.status(200).json({ message: 'No valid tokens' });

        const messagePayload: admin.messaging.MulticastMessage = {
            tokens: tokens,
            notification: {
                title: 'New Connection Request',
                body: `${senderName || 'Someone'} wants to connect with you.`,
            },
            data: {
                type: 'connection_request',
                fromUserId: fromId,
                url: `/profile/${fromId}`,
                click_action: `/profile/${fromId}`
            },
            webpush: {
                fcmOptions: {
                    link: `/profile/${fromId}`
                }
            }
        };

        const response = await admin.messaging().sendEachForMulticast(messagePayload);

        // Cleanup
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

        return res.status(200).json({ success: true, sentCount: response.successCount });

    } catch (error: any) {
        console.error('Send Connection Notification Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
