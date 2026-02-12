import { VercelRequest, VercelResponse } from '@vercel/node';
import { searchCollegeFallback } from './fallbackLogic';
import { applyCors, applySecurityHeaders, enforceHttps, normalizeString } from '../_utils/security';
import { checkRateLimit } from '../_utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!enforceHttps(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(`college-search:${ip}`, 60, 60_000);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Too many requests' });
  }

  const query = normalizeString(req.query.query, 120);

  if (query.length < 3) {
    return res.status(400).json({ error: 'Query required and must be at least 3 characters' });
  }

  try {
    const results = await searchCollegeFallback(query);
    return res.status(200).json(results);
  } catch (error: any) {
    console.error('Search Fallback Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
