import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from '../_utils/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { postId, content, scope, userSchool, userSchoolName } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'Missing postId' });
    }

    try {
        let topic = 'global_posts';
        let title = 'New Global Discussion';

        // Logic must match client-side scope
        if (scope === 'campus' && userSchoolName) {
            // Sanitize school name for topic
            const sanitizedSchool = userSchoolName.replace(/[^a-zA-Z0-9]/g, '_');
            topic = `school_${sanitizedSchool}`;
            title = `New in ${userSchoolName}`;
        }

        const messagePayload: admin.messaging.Message = {
            topic: topic,
            notification: {
                title: title,
                body: content ? (content.substring(0, 100) + (content.length > 100 ? '...' : '')) : 'New post',
            },
            data: {
                type: 'post',
                postId: postId,
                url: '/community',
                click_action: '/community'
            },
            webpush: {
                fcmOptions: {
                    link: '/community'
                }
            }
        };

        const response = await admin.messaging().send(messagePayload);
        return res.status(200).json({ success: true, messageId: response });

    } catch (error: any) {
        console.error('Send Post Notification Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
