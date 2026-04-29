import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from '../_utils/firebaseAdmin';
import { requireAuth } from '../_utils/auth';
import { applyCors, applySecurityHeaders, enforceHttps, normalizeId, normalizeString } from '../_utils/security';
import { checkRateLimit } from '../_utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);
  applyCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!enforceHttps(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || auth.uid;
  const limit = checkRateLimit(`send-chat:${ip}:${auth.uid}`, 40, 60_000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const chatId = normalizeId(req.body?.chatId);
  const senderId = normalizeId(req.body?.senderId);
  const senderName = normalizeString(req.body?.senderName, 80);
  const content = normalizeString(req.body?.content, 300);
  const type = normalizeString(req.body?.type, 30) || 'chat';

  if (!chatId || !senderId) {
    return res.status(400).json({ error: 'Missing chatId or senderId' });
  }

  if (senderId !== auth.uid) {
    return res.status(403).json({ error: 'Forbidden: senderId must match authenticated user' });
  }

  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = chatDoc.data();
    const participants = Array.isArray(chatData?.participants) ? chatData.participants : [];

    if (!participants.includes(auth.uid)) {
      return res.status(403).json({ error: 'Forbidden: user is not a chat participant' });
    }

    const recipientId = participants.find((uid: string) => uid !== senderId);
    if (!recipientId) {
      return res.status(200).json({ message: 'No recipient to notify' });
    }

    const tokensSnapshot = await db.collection('users').doc(recipientId).collection('fcm_tokens').get();
    if (tokensSnapshot.empty) {
      return res.status(200).json({ message: 'No tokens found for user' });
    }

    const tokens = tokensSnapshot.docs.map((d: any) => d.data().token).filter(Boolean);
    if (tokens.length === 0) return res.status(200).json({ message: 'No valid tokens' });

    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderData = senderDoc.exists ? senderDoc.data() : {};
    const senderAvatar = senderData?.avatar_url || 'https://assignmate.live/logo.png';

    const messagePayload = {
      tokens,
      notification: {
        title: senderName || 'New Message',
        body: content || 'You have a new message',
        imageUrl: senderAvatar,
      },
      data: {
        url: `/chats/${chatId}`,
        chatId,
        type,
        click_action: `/chats/${chatId}`,
      },
      webpush: {
        headers: { image: senderAvatar },
        notification: {
          icon: senderAvatar,
          image: senderAvatar,
          body: content || 'You have a new message',
          title: senderName || 'New Message',
        },
        fcmOptions: { link: `/chats/${chatId}` },
      },
    };

    const response: any = await admin.messaging().sendEachForMulticast(messagePayload);

    const tokensToRemove: Promise<any>[] = [];
    const errorCodes: string[] = [];
    response.responses.forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const error = resp.error;
        errorCodes.push(error?.code || 'unknown');
        if (
          error &&
          (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered')
        ) {
          const failedToken = tokens[idx];
          const tokenDoc = tokensSnapshot.docs.find((d: any) => d.data().token === failedToken);
          if (tokenDoc) tokensToRemove.push(tokenDoc.ref.delete());
        }
      }
    });

    await Promise.all(tokensToRemove);

    if (response.failureCount > 0 && response.successCount === 0) {
      return res.status(500).json({
        error: 'Delivery Failed',
        details: errorCodes.join(', '),
        debug: 'All tokens invalid or unreachable',
      });
    }

    return res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error('Send Chat Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
