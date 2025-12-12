import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { INDIAN_COLLEGES } from '../data/colleges';
import { notifications } from './firebase';

// Helper to get db instance safely
const getDb = () => {
    if (!db) throw new Error("Firebase Firestore not initialized");
    return db;
};

export const userApi = {
    logAction: async (userId: string, action: string, details: any = {}) => {
        try {
            await addDoc(collection(getDb(), 'audit_logs'), {
                user_id: userId,
                action,
                details,
                created_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    },

    getProfile: async (id: string) => {
        const docRef = doc(getDb(), 'users', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    createProfile: async (id: string, metadata: any) => {
        console.log("createProfile: Start", id);
        const randomCollege = INDIAN_COLLEGES[Math.floor(Math.random() * INDIAN_COLLEGES.length)].name;

        // Sanitize handle
        let handle = metadata.handle || metadata.full_name || 'Student';
        handle = handle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        if (handle.length < 3) handle = `Student_${id.slice(0, 4)}`;

        // Handle Uniqueness
        const checkUnique = async (h: string) => {
            try {
                console.log("checkUnique: Checking", h);
                const q = query(collection(getDb(), 'users'), where('handle', '==', h));
                
                // Add 3s timeout to uniqueness check
                const snap = await Promise.race([
                    getDocs(q),
                    new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
                ]);

                console.log("checkUnique: Result", !snap.empty);
                return !snap.empty;
            } catch (e) {
                console.warn("Handle uniqueness check failed or timed out, assuming unique.");
                return false; // Assume unique to proceed
            }
        };

        let uniqueHandle = handle;
        let counter = 1;
        // Safety limit for loop
        let attempts = 0;
        while (await checkUnique(uniqueHandle) && attempts < 10) {
            uniqueHandle = `${handle}${counter++}`;
            attempts++;
        }
        if (attempts >= 10) uniqueHandle = `${handle}_${Date.now().toString().slice(-4)}`;

        const newProfile = {
            id,
            handle: uniqueHandle,
            full_name: metadata.full_name || 'Student',
            email: metadata.email,
            avatar_url: metadata.avatar_url,
            school: metadata.school || randomCollege,
            created_at: new Date().toISOString(), // Store as string for consistency with UI
            is_verified: 'pending',
            xp: 0,
            tags: ['Student'],
            is_writer: metadata.is_writer || false,
            role: 'user',
            portfolio: [],
            saved_writers: []
        };

        console.log("createProfile: Writing doc", uniqueHandle);
        await setDoc(doc(getDb(), 'users', id), newProfile);
        console.log("createProfile: Done");
        return newProfile;
    },

    deleteProfile: async (id: string) => {
        await deleteDoc(doc(getDb(), 'users', id));
    }
};

export const dbService = {
    getWriters: async () => {
        const q = query(
            collection(getDb(), 'users'), 
            where('is_writer', '==', true),
            orderBy('created_at', 'desc'),
            limit(500)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data());
    },

    updateProfile: async (userId: string, updates: any) => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, updates);
        return { error: null };
    },

    uploadFile: async (file: File) => {
        if (!storage) throw new Error("Storage not initialized");
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storageRef = ref(storage, `portfolio/${fileName}`);
        
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    addToPortfolio: async (userId: string, imageUrl: string) => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, {
            portfolio: arrayUnion(imageUrl)
        });
    },

    deleteFromPortfolio: async (userId: string, urlToDelete: string) => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, {
            portfolio: arrayRemove(urlToDelete)
        });
    },

    toggleSaveWriter: async (userId: string, writerId: string) => {
        const docRef = doc(getDb(), 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;

        const currentSaved = docSnap.data().saved_writers || [];
        if (currentSaved.includes(writerId)) {
            await updateDoc(docRef, { saved_writers: arrayRemove(writerId) });
        } else {
            await updateDoc(docRef, { saved_writers: arrayUnion(writerId) });
        }
    },

    // --- CONNECTION SYSTEM ---
    sendConnectionRequest: async (requesterId: string, receiverId: string) => {
        const newConn = {
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        const res = await addDoc(collection(getDb(), 'connections'), newConn);
        return { ...newConn, id: res.id };
    },

    respondToConnectionRequest: async (connectionId: string, status: 'accepted' | 'rejected') => {
        const docRef = doc(getDb(), 'connections', connectionId);
        if (status === 'rejected') {
            await deleteDoc(docRef);
        } else {
            await updateDoc(docRef, { status: 'accepted' });
        }
    },

    getNetworkMap: async (userId: string) => {
        // Firestore doesn't support OR queries across fields easily efficiently without multiple queries
        // Query 1: I am requester
        const q1 = query(collection(getDb(), 'connections'), where('requester_id', '==', userId));
        // Query 2: I am receiver
        const q2 = query(collection(getDb(), 'connections'), where('receiver_id', '==', userId));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const allDocs = [...snap1.docs, ...snap2.docs].map(d => d.data());

        const map: Record<string, string> = {};
        allDocs.forEach((c: any) => {
            if (c.status === 'accepted') {
                const other = c.requester_id === userId ? c.receiver_id : c.requester_id;
                map[other] = 'connected';
            } else if (c.status === 'pending') {
                if (c.requester_id === userId) map[c.receiver_id] = 'pending_sent';
                else map[c.requester_id] = 'pending_received';
            }
        });
        return map;
    },

    getIncomingRequests: async (userId: string) => {
        const q = query(
            collection(getDb(), 'connections'), 
            where('receiver_id', '==', userId), 
            where('status', '==', 'pending')
        );
        const snap = await getDocs(q);
        
        // Join with profiles manually
        const requests = await Promise.all(snap.docs.map(async d => {
            const data = d.data();
            const profileSnap = await getDoc(doc(getDb(), 'users', data.requester_id));
            return {
                id: d.id,
                ...data,
                requester: profileSnap.exists() ? profileSnap.data() : null
            };
        }));
        return requests;
    },

    getMyConnections: async (userId: string) => {
        const q1 = query(collection(getDb(), 'connections'), where('requester_id', '==', userId), where('status', '==', 'accepted'));
        const q2 = query(collection(getDb(), 'connections'), where('receiver_id', '==', userId), where('status', '==', 'accepted'));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const ids = new Set<string>();
        
        snap1.forEach(d => ids.add(d.data().receiver_id));
        snap2.forEach(d => ids.add(d.data().requester_id));

        if (ids.size === 0) return [];

        // Fetch profiles in batches of 10 (Firestore 'in' limit)
        const idArray = Array.from(ids);
        const chunks = [];
        for (let i = 0; i < idArray.length; i += 10) {
            chunks.push(idArray.slice(i, i + 10));
        }

        const profiles = [];
        for (const chunk of chunks) {
            const q = query(collection(getDb(), 'users'), where('id', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(d => profiles.push(d.data()));
        }
        return profiles;
    },

    // --- CHAT SYSTEM ---
    getChats: async (userId: string) => {
        const q1 = query(collection(getDb(), 'chats'), where('poster_id', '==', userId));
        const q2 = query(collection(getDb(), 'chats'), where('writer_id', '==', userId));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        // Merge and deduplicate by ID
        const chatMap = new Map();
        [...snap1.docs, ...snap2.docs].forEach(d => chatMap.set(d.id, { id: d.id, ...d.data() }));
        
        const chats = Array.from(chatMap.values());
        
        // Sort manually since we merged results
        chats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        // Hydrate with user data
        return await Promise.all(chats.map(async (c: any) => {
            const isPoster = c.poster_id === userId;
            const otherId = isPoster ? c.writer_id : c.poster_id;
            const otherSnap = await getDoc(doc(getDb(), 'users', otherId));
            const other = otherSnap.exists() ? otherSnap.data() : null;
            
            return {
                ...c,
                gig_title: 'Direct Chat',
                other_handle: other?.handle || 'User',
                other_avatar: other?.avatar_url
            };
        }));
    },

    getChatDetails: async (chatId: string, userId: string) => {
        const docSnap = await getDoc(doc(getDb(), 'chats', chatId));
        if (!docSnap.exists()) throw new Error("Not found");
        
        const data = docSnap.data();
        const isPoster = data.poster_id === userId;
        const otherId = isPoster ? data.writer_id : data.poster_id;
        const otherSnap = await getDoc(doc(getDb(), 'users', otherId));
        const other = otherSnap.exists() ? otherSnap.data() : null;

        return {
            id: chatId,
            ...data,
            other_handle: other?.handle || 'Unknown',
            other_avatar: other?.avatar_url
        };
    },

    createChat: async (gigId: string | null, posterId: string, writerId: string) => {
        // Check existing
        const q = query(
            collection(getDb(), 'chats'), 
            where('poster_id', '==', posterId), 
            where('writer_id', '==', writerId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

        // Check reverse
        const q2 = query(
            collection(getDb(), 'chats'), 
            where('poster_id', '==', writerId), 
            where('writer_id', '==', posterId)
        );
        const snap2 = await getDocs(q2);
        if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() };

        const newChat = {
            gig_id: gigId,
            poster_id: posterId,
            writer_id: writerId,
            updated_at: new Date().toISOString(),
            last_message: null
        };
        
        const res = await addDoc(collection(getDb(), 'chats'), newChat);
        return { id: res.id, ...newChat };
    },

    getMessages: async (chatId: string) => {
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'), 
            orderBy('created_at', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    sendMessage: async (chatId: string, senderId: string, content: string, type = 'TEXT') => {
        const newMessage = {
            sender_id: senderId,
            content,
            type,
            created_at: new Date().toISOString(),
            read_at: null
        };

        // 1. Add to subcollection
        await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);

        // 2. Update chat metadata
        await updateDoc(doc(getDb(), 'chats', chatId), {
            last_message: type === 'TEXT' ? content : `[${type}]`,
            updated_at: new Date().toISOString()
        });

        // 3. Notify
        const chatSnap = await getDoc(doc(getDb(), 'chats', chatId));
        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const receiverId = chatData.poster_id === senderId ? chatData.writer_id : chatData.poster_id;
            const senderSnap = await getDoc(doc(getDb(), 'users', senderId));
            const senderName = senderSnap.exists() ? senderSnap.data().handle : 'User';
            
            notifications.send(receiverId, senderName, type === 'TEXT' ? content : 'Attachment sent', chatId);
        }

        return newMessage;
    },

    markMessagesAsRead: async (chatId: string, readerId: string) => {
        // In Firestore, we'd typically have to batch update. 
        // For simplicity, we'll just update the last read timestamp on the chat member object if we had one.
        // Or query unread messages and batch update them.
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            where('read_at', '==', null),
            where('sender_id', '!=', readerId)
        );
        const snap = await getDocs(q);
        const batch = (await import('firebase/firestore')).writeBatch(getDb());
        
        snap.docs.forEach(d => {
            batch.update(d.ref, { read_at: new Date().toISOString() });
        });
        
        if (!snap.empty) await batch.commit();
    },

    listenToMessages: (chatId: string, callback: (messages: any[]) => void) => {
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            orderBy('created_at', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(messages);
        });
    },

    listenToChats: (userId: string, callback: (chats: any[]) => void) => {
        // Listening to complex queries is hard, so we'll listen to the collection and filter client-side 
        // OR set up two listeners. For simplicity/cost, we'll poll or just listen to one query if possible.
        // Better approach: Listen to 'chats' where poster_id == userId OR writer_id == userId.
        // Firestore OR queries in snapshot are tricky. Let's use two listeners and merge.
        
        const q1 = query(collection(getDb(), 'chats'), where('poster_id', '==', userId));
        const q2 = query(collection(getDb(), 'chats'), where('writer_id', '==', userId));

        let chats1: any[] = [];
        let chats2: any[] = [];

        const mergeAndCallback = async () => {
            const allChats = [...chats1, ...chats2];
            // Dedupe
            const chatMap = new Map();
            allChats.forEach(c => chatMap.set(c.id, c));
            const uniqueChats = Array.from(chatMap.values());
            
            // Sort
            uniqueChats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

            // Hydrate (This is expensive in a listener loop, but necessary for UI)
            // Optimization: Cache user profiles or only fetch if missing.
            const hydrated = await Promise.all(uniqueChats.map(async (c: any) => {
                const isPoster = c.poster_id === userId;
                const otherId = isPoster ? c.writer_id : c.poster_id;
                // Simple cache check or fetch
                let other = null;
                try {
                    const otherSnap = await getDoc(doc(getDb(), 'users', otherId));
                    other = otherSnap.exists() ? otherSnap.data() : null;
                } catch (e) { console.error(e); }

                return {
                    ...c,
                    gig_title: 'Direct Chat',
                    other_handle: other?.handle || 'User',
                    other_avatar: other?.avatar_url
                };
            }));
            callback(hydrated);
        };

        const unsub1 = onSnapshot(q1, (snap) => {
            chats1 = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            mergeAndCallback();
        });

        const unsub2 = onSnapshot(q2, (snap) => {
            chats2 = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            mergeAndCallback();
        });

        return () => { unsub1(); unsub2(); };
    },

    // --- ADMIN METHODS ---
    getPendingVerifications: async () => {
        const q = query(collection(getDb(), 'users'), where('is_verified', '==', 'pending'));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    },

    verifyUser: async (userId: string, status: 'verified' | 'rejected') => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, { is_verified: status });
    }
};
