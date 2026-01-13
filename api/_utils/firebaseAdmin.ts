import * as admin from 'firebase-admin';

export const tryInitAdmin = () => {
    if (!admin.apps.length) {
        try {
            const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (key) {
                const serviceAccount = JSON.parse(key);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("Firebase Admin Initialized (Runtime)");
            } else {
                console.error("FIREBASE_SERVICE_ACCOUNT_KEY missing");
                throw new Error("Missing Env Var: FIREBASE_SERVICE_ACCOUNT_KEY");
            }
        } catch (error: any) {
            console.error('Firebase Admin Init Error:', error.message);
            throw error;
        }
    }
    return admin;
};

export default admin;
