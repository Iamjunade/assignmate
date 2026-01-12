import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
    try {
        // Validation: Check for required environment variables or fallback to standard init
        // In local development, you might rely on GOOGLE_APPLICATION_CREDENTIALS
        // In Vercel, use FIREBASE_SERVICE_ACCOUNT or individual vars
        // Note: For now, we attempt standard init. User must set FIREBASE_SERVICE_ACCOUNT in Vercel.

        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountStr) {
            const serviceAccount = JSON.parse(serviceAccountStr);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else if (process.env.VITE_FIREBASE_PROJECT_ID) {
            // Fallback attempt (might fail if no private key) - strictly for local dev if emulator/ADC is set
            admin.initializeApp({
                projectId: process.env.VITE_FIREBASE_PROJECT_ID
            });
        } else {
            admin.initializeApp(); // Last resort (ADC)
        }
    } catch (e) {
        console.error("Firebase Admin Init Error:", e);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS HEADERS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, uid, fullName } = req.body;

    if (!email || !uid) {
        return res.status(400).json({ error: 'Missing email or uid' });
    }

    try {
        console.log(`Starting verification for ${email} (${uid})`);

        // 1. Generate Link
        // Note: This requires the Firebase Admin SDK to be properly authenticated with a service account
        // that has permission to manage users.
        const link = await admin.auth().generateEmailVerificationLink(email);
        console.log("Link generated successfully");

        // 2. Setup Nodemailer (Zoho SMTP)
        const transporter = nodemailer.createTransport({
            host: process.env.ZOHO_HOST || 'smtppro.zoho.in', // Updated per user screenshot
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.ZOHO_EMAIL || 'contact@assignmate.live',
                pass: process.env.ZOHO_PASSWORD
            }
        });

        if (!process.env.ZOHO_PASSWORD) {
            console.warn("Missing ZOHO_PASSWORD env var");
        }

        // 3. Send Email
        const info = await transporter.sendMail({
            from: 'AssignMate Team <contact@assignmate.live>', // User indicated this is their verified sender
            to: `${fullName || 'Student'} <${email}>`,
            subject: "Verify your AssignMate Account",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                        .btn { display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                        .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 style="color: #1b140d;">Welcome to AssignMate! 🎓</h2>
                        <p>Hi ${fullName || 'there'},</p>
                        <p>Thanks for joining the community. To unlock full access and start collaborating, please verify your email address.</p>
                        <a href="${link}" class="btn">Verify Email Address</a>
                        <p style="margin-top:20px; color:#666;">Or copy this link: <br> <a href="${link}" style="color:#f97316;">${link}</a></p>
                        
                        <div class="footer">
                            <p>© 2026 AssignMate. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        console.log("Email sent:", info.messageId);
        return res.status(200).json({ success: true, messageId: info.messageId });

    } catch (error: any) {
        console.error("Verification API Error:", error);
        // Clean error for response
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
