import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    // Do NOT return the full key for security, just length/presence
    const status = {
        hasKey: !!key,
        keyLength: key ? key.length : 0,
        nodeVersion: process.version,
        envKeys: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')), // minimal debug
    };

    try {
        if (key) {
            JSON.parse(key);
            (status as any).jsonParse = 'Success';
        }
    } catch (e: any) {
        (status as any).jsonParse = 'Failed: ' + e.message;
    }

    res.status(200).json(status);
}
