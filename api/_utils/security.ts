import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://assignmate.live',
  'https://www.assignmate.live',
  'http://localhost:5173',
];

const getAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return configured && configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
};

export const applySecurityHeaders = (res: VercelResponse) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
};

export const applyCors = (req: VercelRequest, res: VercelResponse) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
};

export const enforceHttps = (req: VercelRequest, res: VercelResponse): boolean => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  if (process.env.NODE_ENV === 'production' && forwardedProto && forwardedProto !== 'https') {
    res.status(400).json({ error: 'HTTPS is required.' });
    return false;
  }
  return true;
};

export const normalizeString = (value: unknown, maxLength = 200): string => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

export const normalizeId = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
};
