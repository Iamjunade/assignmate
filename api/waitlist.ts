import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY in environment variables");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const { email, college } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const collegeName = college || 'your college';

    try {
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
                <h2 style="color: #f97316;">Welcome to AssignMate! 🚀</h2>
                <p>Hi there,</p>
                <p>I'm Junaid, the founder of AssignMate. I wanted to personally reach out and say <strong>thank you</strong> for joining our waitlist!</p>
                <p>We are building India's first hyper-local student collaboration network, and we're thrilled to have students from ${collegeName} jumping on board early.</p>
                <p>We're working day and night to get everything perfect for our April 2026 launch. In the meantime, I have one quick favor to ask:</p>
                <p><strong>Reply to this email and let me know the #1 struggle you face with academics or finding peers on your campus right now.</strong></p>
                <p>I read every single reply, and it helps us build exactly what you need.</p>
                <br/>
                <p>Stay tuned for updates!</p>
                <p>Best,<br/>
                <strong>Junaid Pasha</strong><br/>
                Founder, AssignMate</p>
            </div>
        `;

        const data = await resend.emails.send({
            from: 'Junaid at AssignMate <founders@assignmate.com>', // User needs a verified domain for Resend to use this, or fallback to onboarding@resend.dev
            to: [email],
            subject: 'Welcome to the AssignMate Waitlist 🚀',
            html: htmlContent,
            reply_to: 'founders@assignmate.com' // Adjust as needed
        });

        return res.status(200).json(data);

    } catch (error: any) {
        console.error("Waitlist Email Error:", error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
}
