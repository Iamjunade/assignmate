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
  const limit = checkRateLimit(`send-post:${ip}:${auth.uid}`, 20, 60_000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const postId = normalizeId(req.body?.postId);
  const content = normalizeString(req.body?.content, 300);
  const scope = normalizeString(req.body?.scope, 16);
  const userSchool = normalizeString(req.body?.userSchool, 100);
  const userSchoolName = normalizeString(req.body?.userSchoolName, 120);

  if (!postId) {
    return res.status(400).json({ error: 'Missing postId' });
  }

  try {
    const admin = await getFirebaseAdmin();

    let topic = 'global_posts';
    let body = content;

    if (scope === 'campus' && userSchool) {
      const sanitizedSchool = userSchool.replace(/[^a-zA-Z0-9]/g, '_');
      topic = `school_${sanitizedSchool}`;
      body = `New in ${userSchoolName || 'Campus'}: ${content}`;
    }

    const messagePayload = {
      topic,
      notification: {
        title: scope === 'campus' ? 'Null Class Discussion' : 'New Global Discussion',
        body: body ? (body.length > 100 ? `${body.substring(0, 100)}...` : body) : 'New post shared',
      },
      data: {
        url: '/community',
        postId,
      },
      webpush: {
        fcmOptions: {
          link: '/community',
        },
      },
    };

    const response: any = await admin.messaging().send(messagePayload);
    return res.status(200).json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Send Post Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
