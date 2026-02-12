import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirebaseAdmin } from './firebaseAdmin';

export interface AuthResult {
  uid: string;
  token: any;
}

export const requireAuth = async (
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthResult | null> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    return null;
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    res.status(401).json({ error: 'Unauthorized: Empty token' });
    return null;
  }

  try {
    const admin = await getFirebaseAdmin();
    const token = await admin.auth().verifyIdToken(idToken);
    return { uid: token.uid, token };
  } catch (error) {
    console.error('Auth verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return null;
  }
};
