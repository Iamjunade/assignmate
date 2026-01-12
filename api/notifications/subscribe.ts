import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from '../_utils/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { token, school } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    if (!admin.apps.length) {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!key) {
            console.error('FIREBASE_SERVICE_ACCOUNT_KEY is missing');
            return res.status(500).json({ error: 'Server Config: Missing FIREBASE_SERVICE_ACCOUNT_KEY' });
        }
        try {
            const parsed = JSON.parse(key);
            if (!parsed.project_id) {
                return res.status(500).json({ error: 'Server Config: Invalid Service Account (missing project_id)' });
            }
            // Attempt manual init if it failed during import for some reason
            admin.initializeApp({
                credential: admin.credential.cert(parsed),
            });
        } catch (e: any) {
            console.error('JSON Parse Error for Service Account:', e);
            return res.status(500).json({ error: `Server Config: Invalid JSON in Key - ${e.message}` });
        }
    }

    // Double check after potential manual init
    if (!admin.apps.length) {
        return res.status(500).json({ error: 'Server Config: Admin Init Failed Unknown Reason' });
    }

    try {
        // Subscribe to Global
        await admin.messaging().subscribeToTopic(token, 'global_posts');

        // Subscribe to School if provided
        if (school) {
            const sanitizedSchool = school.replace(/[^a-zA-Z0-9]/g, '_');
            await admin.messaging().subscribeToTopic(token, `school_${sanitizedSchool}`);
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Subscribe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
