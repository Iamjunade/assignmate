import { VercelRequest, VercelResponse } from '@vercel/node';
import { searchCollegeFallback } from './fallbackLogic';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Helper to init Firebase safely (reused logic from other handlers)
const initFirebase = () => {
    if (getApps().length) return;

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (!privateKey && process.env.NODE_ENV !== 'production') {
            // In dev/test without full env, we might skip or warn
            return;
        }

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({ error: 'Query required and must be at least 3 characters' });
    }

    try {
        initFirebase(); // Ensure firebase is ready for ingestion logic

        const results = await searchCollegeFallback(query);
        return res.status(200).json(results);
    } catch (error: any) {
        console.error('Search Fallback Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
