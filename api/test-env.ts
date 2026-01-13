import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from './_utils/firebaseAdmin';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    const status = {
        hasKey: !!key,
        keyLength: key ? key.length : 0,
        nodeVersion: process.version,
        adminAppsLength: admin.apps.length, // Check if init worked
        initError: (global as any).firebaseInitError // Access global error if we stored it (need to modify utility for this, but testing length is a good start)
    };

    try {
        if (key) {
            JSON.parse(key);
            (status as any).jsonParse = 'Success';
        }
    } catch (e: any) {
        (status as any).jsonParse = 'Failed: ' + e.message;
    }

    // Try to init if 0
    if (admin.apps.length === 0 && key) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(key)),
            });
            (status as any).manualInit = "Success";
        } catch (e: any) {
            (status as any).manualInit = "Failed: " + e.message;
        }
    }

    res.status(200).json(status);
}
