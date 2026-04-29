import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from '../_utils/firebaseAdmin';
import { requireAuth } from '../_utils/auth';
import { applyCors, applySecurityHeaders, enforceHttps, normalizeString } from '../_utils/security';
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
  const limit = checkRateLimit(`subscribe:${ip}:${auth.uid}`, 20, 60_000);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const token = normalizeString(req.body?.token, 4096);
  const school = normalizeString(req.body?.school, 100);

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const admin = await getFirebaseAdmin();

    await admin.messaging().subscribeToTopic(token, 'global_posts');

    if (school) {
      const sanitizedSchool = school.replace(/[^a-zA-Z0-9]/g, '_');
      await admin.messaging().subscribeToTopic(token, `school_${sanitizedSchool}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Subscribe Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
