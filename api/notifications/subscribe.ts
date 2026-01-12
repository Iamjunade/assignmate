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
