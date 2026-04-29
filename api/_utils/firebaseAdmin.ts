// Lazy load firebase-admin to prevent top-level cold start crashes in Vercel
let adminInstance: any;

const parseServiceAccount = () => {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    return JSON.parse(serviceAccountKey);
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    return { privateKey, clientEmail, projectId };
  }

  throw new Error('Missing Firebase service account credentials.');
};

export const getFirebaseAdmin = async () => {
  if (adminInstance) return adminInstance;

  try {
    const adminModule = await import('firebase-admin');
    const admin = adminModule.default || adminModule;

    if (!admin.apps.length) {
      const serviceAccount = parseServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin Initialized (Lazy)');
    }

    adminInstance = admin;
    return admin;
  } catch (error: any) {
    console.error('Firebase Admin Lazy Init Error:', error.message);
    throw error;
  }
};
