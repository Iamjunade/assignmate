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
import { collegeService } from './collegeService';
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
        const randomCollege = await collegeService.getRandomCollege();

        // Clean handle
        let baseHandle = metadata.handle || metadata.full_name || 'Student';
        baseHandle = baseHandle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        // Check availability
        const q = query(collection(getDb(), 'users'), where('handle', '==', baseHandle));
        const snap = await getDocs(q);

        let uniqueHandle = baseHandle;
        // Check if any existing user with this handle is NOT the current user
        const isTaken = snap.docs.some(doc => doc.id !== id);

        if (isTaken) {
            // Handle taken by someone else, append suffix
            uniqueHandle = `${baseHandle}_${Math.random().toString(36).substring(2, 6)}`;
        }

        const newProfile = {
            id,
            handle: uniqueHandle,
            full_name: metadata.full_name || 'Student',
            email: metadata.email,
            avatar_url: metadata.avatar_url,
            school: metadata.school || randomCollege,
            created_at: new Date().toISOString(),
            is_verified: 'pending',
            xp: 0,
            tags: ['Student'],
            is_writer: metadata.is_writer || false,
            role: 'user',
            portfolio: [],
            saved_writers: []
        };

        try {
            // Write to Firestore with timeout protection
            await Promise.race([
                setDoc(doc(getDb(), 'users', id), newProfile),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database write timeout. Please check your connection.")), 10000)
                )
            ]);
        } catch (e) {
            console.error("createProfile: Failed", e);
            throw e;
        }

        return newProfile;
    },

    deleteProfile: async (id: string) => {
        await deleteDoc(doc(getDb(), 'users', id));
    }
};

import { User } from '../types';

// ... existing imports ...

export const dbService = {
    getUsersBatch: async (userIds: string[]) => {
        const uniqueIds = Array.from(new Set(userIds)).filter(id => id);
        if (uniqueIds.length === 0) return new Map();

        const chunks = [];
        for (let i = 0; i < uniqueIds.length; i += 10) {
            chunks.push(uniqueIds.slice(i, i + 10));
        }

        const userMap = new Map();
        await Promise.all(chunks.map(async (chunk) => {
            const q = query(collection(getDb(), 'users'), where('id', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(d => userMap.set(d.id, d.data()));
        }));

        return userMap;
    },

    getWriters: async (currentUser: User | null, tag: string = 'All') => {
        const usersRef = collection(getDb(), 'users');

        // 1. Base Query Constraints
        const constraints: any[] = [
            where('is_writer', '==', true),
            limit(100)
        ];

        // 2. Visibility Constraint (Global only for now to keep query simple)
        // Note: Complex OR queries with array-contains require multiple indexes.
        // We will prioritize fetching global writers.
        constraints.push(where('visibility', '==', 'global'));

        // 3. Tag Constraint
        if (tag && tag !== 'All') {
            constraints.push(where('tags', 'array-contains', tag));
        }

        const globalQuery = query(usersRef, ...constraints);

        // 4. Execute Global Query
        const globalSnap = await getDocs(globalQuery);
        let writers = globalSnap.docs.map(d => d.data());

        // 5. Fetch College Writers (If user is logged in) - Separate query to avoid complex OR
        // Only fetch if we are NOT filtering by tag OR if we can filter by tag + college (requires index)
        // For now, we'll fetch college writers and filter tags client-side for this subset to avoid index explosion
        if (currentUser && currentUser.school) {
            const collegeQuery = query(
                usersRef,
                where('is_writer', '==', true),
                where('visibility', '==', 'college'),
                where('school', '==', currentUser.school),
                limit(50)
            );
            const snap = await getDocs(collegeQuery);
            const collegeWriters = snap.docs.map(d => d.data());

            // Filter college writers by tag client-side (small dataset)
            const filteredCollegeWriters = (tag && tag !== 'All')
                ? collegeWriters.filter((w: any) => w.tags?.includes(tag))
                : collegeWriters;

            writers = [...writers, ...filteredCollegeWriters];
        }

        // 6. Deduplicate
        const uniqueWriters = Array.from(new Map(writers.map((item: any) => [item.id, item])).values());

        // 7. Sort by creation (client-side sort since we merged results)
        return uniqueWriters.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
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
        const rawRequests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const requesterIds = rawRequests.map((r: any) => r.requester_id);
        const userMap = await dbService.getUsersBatch(requesterIds);

        return rawRequests.map((r: any) => ({
            ...r,
            requester: userMap.get(r.requester_id) || null
        }));
    },

    getMyConnections: async (userId: string) => {
        const q1 = query(collection(getDb(), 'connections'), where('requester_id', '==', userId), where('status', '==', 'accepted'));
        const q2 = query(collection(getDb(), 'connections'), where('receiver_id', '==', userId), where('status', '==', 'accepted'));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const ids = new Set<string>();

        snap1.forEach(d => ids.add(d.data().receiver_id));
        snap2.forEach(d => ids.add(d.data().requester_id));

        if (ids.size === 0) return [];

        // Fetch profiles in batches using helper
        const userMap = await dbService.getUsersBatch(Array.from(ids));
        return Array.from(userMap.values());
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
        const otherIds = chats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
        const userMap = await dbService.getUsersBatch(otherIds);

        return chats.map((c: any) => {
            const isPoster = c.poster_id === userId;
            const otherId = isPoster ? c.writer_id : c.poster_id;
            const other = userMap.get(otherId);

            return {
                ...c,
                gig_title: 'Direct Chat',
                other_handle: other?.handle || 'User',
                other_avatar: other?.avatar_url
            };
        });
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

            // Hydrate using batch fetch
            const otherIds = uniqueChats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
            const userMap = await dbService.getUsersBatch(otherIds);

            const hydrated = uniqueChats.map((c: any) => {
                const isPoster = c.poster_id === userId;
                const otherId = isPoster ? c.writer_id : c.poster_id;
                const other = userMap.get(otherId);

                return {
                    ...c,
                    gig_title: 'Direct Chat',
                    other_handle: other?.handle || 'User',
                    other_avatar: other?.avatar_url
                };
            });
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
