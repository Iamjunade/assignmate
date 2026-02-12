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
  const limit = checkRateLimit(`send-connection:${ip}:${auth.uid}`, 30, 60_000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const toId = normalizeId(req.body?.toId);
  const fromId = normalizeId(req.body?.fromId);
  const senderName = normalizeString(req.body?.senderName, 80);
  const type = normalizeString(req.body?.type, 32);

  if (!toId || !fromId) {
    return res.status(400).json({ error: 'Missing IDs' });
  }

  if (fromId !== auth.uid) {
    return res.status(403).json({ error: 'Forbidden: fromId must match authenticated user' });
  }

  try {
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const tokensSnapshot = await db.collection('users').doc(toId).collection('fcm_tokens').get();
    if (tokensSnapshot.empty) {
      return res.status(200).json({ message: 'No tokens found for user' });
    }

    const tokens = tokensSnapshot.docs.map((d: any) => d.data().token).filter(Boolean);
    if (tokens.length === 0) return res.status(200).json({ message: 'No valid tokens' });

    const senderDoc = await db.collection('users').doc(fromId).get();
    const senderData = senderDoc.exists ? senderDoc.data() : {};
    const senderAvatar = senderData?.avatar_url || 'https://assignmate.live/logo.png';

    const isAccepted = type === 'accepted';
    const title = isAccepted ? 'Connection Accepted' : 'New Connection Request';
    const body = isAccepted
      ? `${senderName || 'A user'} is now in your network.`
      : `${senderName || 'Someone'} wants to connect with you.`;

    const messagePayload = {
      tokens,
      notification: {
        title,
        body,
        imageUrl: senderAvatar,
      },
      data: {
        url: `/users/${fromId}`,
        type: isAccepted ? 'connection_accepted' : 'connection_request',
        click_action: `/users/${fromId}`,
      },
      webpush: {
        headers: { image: senderAvatar },
        notification: {
          title,
          body,
          icon: senderAvatar,
          image: senderAvatar,
        },
        fcmOptions: { link: `/users/${fromId}` },
      },
    };

    const response: any = await admin.messaging().sendEachForMulticast(messagePayload);

    const tokensToRemove: Promise<any>[] = [];
    response.responses.forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const error = resp.error;
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
        details: response.responses.map((r: any) => r.error?.code),
      });
    }

    return res.status(200).json({ success: true, count: response.successCount });
  } catch (error: any) {
    console.error('Send Connection Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
