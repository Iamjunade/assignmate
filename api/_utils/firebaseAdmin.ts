import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (key) {
            const serviceAccount = JSON.parse(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin Initialized Successfully");
        } else {
            console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in process.env");
        }
    } catch (error: any) {
        console.error('Firebase Admin Init Error:', error.message);
        // We do NOT throw here to avoid crashing the module import, 
        // but the individual handlers will check admin.apps.length and fail if needed.
    }
}

export default admin;
