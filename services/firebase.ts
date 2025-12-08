import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
  signInAnonymously
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp 
} from 'firebase/firestore';
import { 
    getMessaging, 
    getToken, 
    onMessage 
} from 'firebase/messaging';

// Environment variables with fallbacks to the provided public credentials
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyCkILlkf-LHXyTOnIuwQgnisczB3fT9GYA",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "planning-with-ai-be6ab.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "planning-with-ai-be6ab",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "planning-with-ai-be6ab.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "202841406595",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:202841406595:web:ed3abcf976f969a0052fb6"
};

let app: any;
let authInstance: any;
let dbInstance: any;
let messagingInstance: any;

export const isConfigured = true;

try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    try {
        messagingInstance = getMessaging(app);
    } catch (e) {
        console.log("Messaging not supported (e.g., non-https or private mode)");
    }
} catch (e) {
    console.error("Firebase Init Error:", e);
}

// --- Notifications System (Firestore Based - Legacy/Internal) ---
export const notifications = {
    send: async (receiverId: string, senderName: string, content: string, chatId: string) => {
        if (!dbInstance) return;
        try {
            await addDoc(collection(dbInstance, 'notifications'), {
                receiverId,
                senderName,
                content,
                chatId,
                read: false,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Notification Send Error", e);
        }
    },

    listen: (userId: string, onNotify: (data: any) => void) => {
        if (!dbInstance) return () => {};
        
        const q = query(
            collection(dbInstance, 'notifications'),
            where('receiverId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const now = Date.now();
                    const notifTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || 0);
                    
                    if (now - notifTime < 30000) { 
                        onNotify(data);
                    }
                }
            });
        });
    }
};

// --- FCM Service (Web Push) ---
export const fcm = {
    requestPermission: async (userId: string) => {
        if (!messagingInstance) return null;
        
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const currentToken = await getToken(messagingInstance, { 
                    // Your VAPID Key from the provided screenshot
                    vapidKey: 'BOOb9zriS5sKaWRI6aqOwPNVgyA_hLRFLTG2GhjeL5dqZvH-axcB0OxmRwuzszJypFtpHJmu5AXGJOJpo89kxac' 
                });

                if (currentToken) {
                    console.log("FCM Token:", currentToken);
                    return currentToken;
                }
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
        return null;
    },

    onForegroundMessage: (callback: (payload: any) => void) => {
        if (messagingInstance) {
            onMessage(messagingInstance, (payload) => {
                callback(payload);
            });
        }
    }
};

// --- Authentication Service ---
export const auth = {
    login: async (email: string, password: string) => {
        try {
            const res = await signInWithEmailAndPassword(authInstance, email, password);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    register: async (email: string, password: string) => {
        try {
            const res = await createUserWithEmailAndPassword(authInstance, email, password);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    loginWithGoogle: async () => {
        try {
            const provider = new GoogleAuthProvider();
            // CRITICAL: Forces Google to show the account chooser every time.
            // This prevents auto-login to the wrong account and solves the duplicate/wrong user issue.
            provider.setCustomParameters({ prompt: 'select_account' });
            
            const res = await signInWithPopup(authInstance, provider);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    loginAnonymously: async () => {
        try {
            const res = await signInAnonymously(authInstance);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    logout: async () => {
        if (authInstance) await signOut(authInstance);
    },
    deleteUser: async () => {
        if (authInstance?.currentUser) {
            try {
                await deleteUser(authInstance.currentUser);
                return { success: true };
            } catch (e: any) {
                return { error: e };
            }
        }
        return { error: { message: "No user" } };
    },
    resetPassword: async (email: string) => {
        try {
            await sendPasswordResetEmail(authInstance, email);
            return { success: true };
        } catch (error: any) {
            return { error };
        }
    },
    onAuthStateChange: (callback: (user: any) => void) => {
        if (!authInstance) return () => {};
        return onAuthStateChanged(authInstance, callback);
    }
};