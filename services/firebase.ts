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
    serverTimestamp,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import {
    getMessaging,
    getToken,
    onMessage
} from 'firebase/messaging';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, onDisconnect, set, onValue, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';

// Environment variables with fallbacks
const firebaseConfig = {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyCkILlkf-LHXyTOnIuwQgnisczB3fT9GYA",
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "planning-with-ai-be6ab.firebaseapp.com",
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "planning-with-ai-be6ab",
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "planning-with-ai-be6ab.firebasestorage.app",
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "202841406595",
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:202841406595:web:ed3abcf976f969a0052fb6",
    databaseURL: (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || "https://planning-with-ai-be6ab-default-rtdb.firebaseio.com"
};

let app: any;
let authInstance: any;
let dbInstance: any;
let messagingInstance: any;
let rtdbInstance: any;
let storageInstance: any;

export const isConfigured = true;

try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    rtdbInstance = getDatabase(app);
    try {
        messagingInstance = getMessaging(app);
    } catch (e) {
        console.log("Messaging not supported (e.g., non-https or private mode)");
    }
    // Initialize Storage
    storageInstance = getStorage(app);
} catch (e) {
    console.error("Firebase Init Error:", e);
}

export const storage = storageInstance;

// --- Notifications System (Firestore Based - Legacy/Internal) ---
export const notifications = {
    send: async (receiverId: string, senderName: string, content: string, chatId: string, type: 'chat' | 'connection' | 'system' = 'chat') => {
        if (!dbInstance) return;
        try {
            await addDoc(collection(dbInstance, 'notifications'), {
                receiverId,
                senderName,
                content,
                chatId,
                type,
                read: false,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Notification Send Error", e);
        }
    },

    listen: (userId: string, onNotify: (data: any) => void) => {
        if (!dbInstance) return () => { };

        const q = query(
            collection(dbInstance, 'notifications'),
            where('receiverId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const now = Date.now();
                    const notifTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || 0);

                    // Only notify for recent events (last 30 seconds) to avoid spam on load
                    if (now - notifTime < 30000) {
                        onNotify({ id: change.doc.id, ...data });
                    }
                }
            });
        });
    },

    markAsRead: async (notificationId: string) => {
        if (!dbInstance) return;
        try {
            await setDoc(doc(dbInstance, 'notifications', notificationId), { read: true }, { merge: true });
        } catch (e) {
            console.error("Mark Read Error", e);
        }
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
                    vapidKey: 'BOOb9zriS5sKaWRI6aqOwPNVgyA_hLRFLTG2GhjeL5dqZvH-axcB0OxmRwuzszJypFtpHJmu5AXGJOJpo89kxac'
                });

                if (currentToken) {
                    console.log("FCM Token:", currentToken);
                    // Save token to Firestore for backend use
                    await setDoc(doc(dbInstance, 'fcm_tokens', userId), {
                        token: currentToken,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
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

// --- Presence System (Realtime Database) ---
export const presence = {
    init: (userId: string) => {
        if (!rtdbInstance) return;

        const userStatusDatabaseRef = ref(rtdbInstance, '/status/' + userId);
        const isOfflineForDatabase = {
            state: 'offline',
            last_changed: rtdbServerTimestamp(),
        };
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: rtdbServerTimestamp(),
        };

        const connectedRef = ref(rtdbInstance, '.info/connected');
        onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }

            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase);
            });
        });
    },

    listenToUserStatus: (userId: string, callback: (isOnline: boolean, lastSeen: number) => void) => {
        if (!rtdbInstance) return () => { };
        const userStatusRef = ref(rtdbInstance, '/status/' + userId);
        return onValue(userStatusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data.state === 'online', data.last_changed);
            } else {
                callback(false, 0);
            }
        });
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
        if (!authInstance) return () => { };
        return onAuthStateChanged(authInstance, callback);
    }
};