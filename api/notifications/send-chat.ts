```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to init admin locally to avoid shared module crashes in Vercel
const getLocalFirebaseAdmin = async () => {
    // @ts-ignore
    const adminModule = await import('firebase-admin');
    const admin = adminModule.default || adminModule;

    if (!admin.apps.length) {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (key) {
            const serviceAccount = JSON.parse(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            throw new Error("Missing Env Var: FIREBASE_SERVICE_ACCOUNT_KEY");
        }
    }
    return admin;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let admin: any;
    try {
        admin = await getLocalFirebaseAdmin();
    } catch (e: any) {
        console.error("Firebase Init Error:", e);
        return res.status(500).json({ error: `Server Config Error: ${ e.message } ` });
    }

    const { chatId, senderId, senderName, content, type } = req.body;

    if (!chatId || !senderId) {
        return res.status(400).json({ error: 'Missing chatId or senderId' });
    }

    try {
        const db = admin.firestore();
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const chatData = chatDoc.data();
        const participants = chatData?.participants || [];
        const recipientId = participants.find((uid: string) => uid !== senderId);

        if (!recipientId) {
            return res.status(200).json({ message: 'No recipient to notify' });
        }

        // Get Recipient Tokens
        const tokensSnapshot = await db.collection('users').doc(recipientId).collection('fcm_tokens').get();
        if (tokensSnapshot.empty) {
            return res.status(200).json({ message: 'No tokens found for user' });
        }

        const tokens = tokensSnapshot.docs.map((d: any) => d.data().token).filter((t: any) => t);
        if (tokens.length === 0) return res.status(200).json({ message: 'No valid tokens' });

        // Send Multicast
        const messagePayload = {
            tokens: tokens, // array of tokens
            notification: {
                title: senderName || 'New Message',
                body: content || 'You have a new message',
            },
            data: {
                url: `/ chats / ${ chatId } `,
                chatId: chatId,
                type: type || 'chat'
            },
            webpush: {
                fcmOptions: {
                    link: `/ chats / ${ chatId } `
                }
            }
        };

        const response: any = await admin.messaging().sendEachForMulticast(messagePayload);

        // Cleanup Invalid Tokens
        const tokensToRemove: Promise<any>[] = [];
        response.responses.forEach((resp: any, idx: number) => {
            if (!resp.success) {
                const error = resp.error;
                if (error && (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered')) {
                    const failedToken = tokens[idx];
                    // Find the doc ID for this token - assumes 1:1 if token is ID? No, deviceId is ID. 
                    // We need to find the doc where token == failedToken.
                    const tokenDoc = tokensSnapshot.docs.find((d: any) => d.data().token === failedToken);
                    if (tokenDoc) {
                        tokensToRemove.push(tokenDoc.ref.delete());
                    }
                }
            }
        });

        await Promise.all(tokensToRemove);

        return res.status(200).json({ success: true, successCount: response.successCount, failureCount: response.failureCount });

    } catch (error: any) {
        console.error('Send Chat Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
```
