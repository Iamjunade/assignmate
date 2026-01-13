import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const status: any = {
        step: 'Start',
        nodeVersion: process.version,
    };

    try {
        // 1. Check Env Var
        status.step = 'Check Env';
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        status.hasKey = !!key;
        status.keyLength = key ? key.length : 0;

        // 2. Parse JSON
        status.step = 'Parse JSON';
        let serviceAccount: any = null;
        if (key) {
            try {
                serviceAccount = JSON.parse(key);
                status.jsonParse = 'Success';
                status.projectId = serviceAccount.project_id; // useful debug
                status.clientEmail = serviceAccount.client_email;
            } catch (e: any) {
                status.jsonParse = 'Failed: ' + e.message;
                throw new Error('JSON Parse Failed');
            }
        } else {
            status.jsonParse = 'Skipped (No Key)';
        }

        // 3. Dynamic Import Firebase Admin
        status.step = 'Import Firebase Admin';
        // @ts-ignore
        const adminModule = await import('firebase-admin');
        const admin = adminModule.default || adminModule;
        status.adminImport = 'Success';
        status.adminAppsLength = admin.apps ? admin.apps.length : 'undefined';

        // 4. Manual Init Test
        if (admin.apps.length === 0 && serviceAccount) {
            status.step = 'Attempt Init';
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                status.manualInit = 'Success';
                status.adminAppsLengthAfter = admin.apps.length;
            } catch (initErr: any) {
                status.manualInit = 'Failed: ' + initErr.message;
                status.initStack = initErr.stack;
            }
        } else {
            status.manualInit = 'Skipped (Already Init or No Account)';
        }

    } catch (err: any) {
        status.error = err.message;
        status.stack = err.stack;
    }

    res.status(200).json(status);
}
