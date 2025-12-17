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
            bio: metadata.bio || '',
            // Search fields (lowercase)
            search_handle: uniqueHandle.toLowerCase(),
            search_name: (metadata.full_name || 'Student').toLowerCase(),
            search_school: (metadata.school || randomCollege).toLowerCase(),
            search_bio: (metadata.bio || '').toLowerCase(),
            created_at: new Date().toISOString(),
            is_verified: 'pending',
            xp: 0,
            tags: ['Student'],
            is_writer: metadata.is_writer || false,
            role: 'user' as 'user' | 'admin' | 'moderator',
            visibility: 'global' as 'global' | 'college', // Default to global visibility
            portfolio: [],
            saved_writers: [],
            total_earned: 0,
            on_time_rate: 100,
            response_time: 60, // 60 minutes default
            languages: ['English'],
            is_online: true,
            id_card_url: null,
            is_incomplete: metadata.is_incomplete ?? false // ✅ Added is_incomplete
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
    },

};

import { User } from '../types';

// ... existing imports ...

export const dbService = {
    getAllUsers: async () => {
        try {
            // ✅ Filter out incomplete profiles at query level
            const q = query(
                collection(getDb(), 'users'),
                where('is_incomplete', '==', false),
                limit(50)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    getUser: async (userId: string) => {
        const docRef = doc(getDb(), 'users', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    getUserProfile: async (userId: string) => {
        try {
            const docRef = doc(getDb(), 'users', userId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    },

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

    getWriters: async (currentUser: User | null, filters: { college?: string, searchQuery?: string, tag?: string } = {}) => {
        const usersRef = collection(getDb(), 'users');
        const { college, searchQuery, tag } = filters;

        // 1. Base Query Constraints
        const constraints: any[] = [
            where('is_writer', '==', true),
            limit(50) // Limit to 50 for performance
        ];

        // 2. Apply Filters
        // Note: Firestore has limitations on multiple range/inequality filters.
        // We will prioritize the most specific filter for the query and do the rest client-side if needed.

        if (college) {
            constraints.push(where('search_school', '==', college.toLowerCase()));
        }

        // If searching by name/handle, we might need a separate query strategy or client-side filtering
        // because we can't easily combine 'search_school == X' AND 'search_name >= Y' efficiently without specific indexes.
        // For now, we'll fetch based on college/writer status and filter name client-side if both are present.

        // 3. Execute Query
        const q = query(usersRef, ...constraints);
        const snap = await getDocs(q);
        let writers = snap.docs.map(d => d.data());

        // 4. Client-side Filtering (for search query and tags to avoid index explosion)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            writers = writers.filter((w: any) =>
                (w.search_name && w.search_name.includes(lowerQuery)) ||
                (w.search_handle && w.search_handle.includes(lowerQuery)) ||
                (w.search_school && w.search_school.includes(lowerQuery)) ||
                (w.search_bio && w.search_bio.includes(lowerQuery)) // Added bio search
            );
        }

        if (tag && tag !== 'All') {
            writers = writers.filter((w: any) => w.tags && w.tags.includes(tag));
        }

        // 5. Deduplicate (just in case)
        const uniqueWriters = Array.from(new Map(writers.map((item: any) => [item.id, item])).values());

        // 6. Sort by creation (client-side)
        return uniqueWriters.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    updateProfile: async (userId: string, updates: any) => {
        const docRef = doc(getDb(), 'users', userId);

        // Maintain search fields
        if (updates.full_name) updates.search_name = updates.full_name.toLowerCase();
        if (updates.school) updates.search_school = updates.school.toLowerCase();
        if (updates.handle) updates.search_handle = updates.handle.toLowerCase();
        if (updates.bio) updates.search_bio = updates.bio.toLowerCase();

        // Use setDoc with merge to safely update specific fields like fcm_token
        await setDoc(docRef, {
            ...updates,
            last_seen: new Date().toISOString()
        }, { merge: true });
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
    // --- CONNECTION SYSTEM ---
    sendConnectionRequest: async (fromUserId: string, toUserId: string) => {
        const id = `${fromUserId}_${toUserId}`;
        await setDoc(doc(getDb(), 'requests', id), {
            id,
            fromId: fromUserId,
            toId: toUserId,
            status: 'pending',
            created_at: new Date().toISOString()
        });
    },

    respondToConnectionRequest: async (requestId: string, status: 'accepted' | 'rejected') => {
        const reqRef = doc(getDb(), 'requests', requestId);
        await updateDoc(reqRef, { status });

        if (status === 'accepted') {
            // Create the connection entry
            const reqSnap = await getDoc(reqRef);
            const reqData = reqSnap.data();
            if (!reqData) return;

            const connId = `${reqData.fromId}_${reqData.toId}`;
            await setDoc(doc(getDb(), 'connections', connId), {
                id: connId,
                participants: [reqData.fromId, reqData.toId],
                created_at: new Date().toISOString()
            });
        }
    },

    getNetworkMap: async (currentUserId: string) => {
        // This fetches who I am connected to
        const connectionsRef = collection(getDb(), 'connections');
        const q = query(connectionsRef, where('participants', 'array-contains', currentUserId));
        const snapshot = await getDocs(q);

        const map: any = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const otherId = data.participants.find((id: string) => id !== currentUserId);
            if (otherId) map[otherId] = 'connected';
        });

        // Also check pending sent requests
        const requestsRef = collection(getDb(), 'requests');
        const sentQ = query(requestsRef, where('fromId', '==', currentUserId), where('status', '==', 'pending'));
        const sentSnap = await getDocs(sentQ);
        sentSnap.docs.forEach(doc => {
            map[doc.data().toId] = 'pending_sent';
        });

        // Check pending received requests
        const receivedQ = query(requestsRef, where('toId', '==', currentUserId), where('status', '==', 'pending'));
        const receivedSnap = await getDocs(receivedQ);
        receivedSnap.docs.forEach(doc => {
            map[doc.data().fromId] = 'pending_received';
        });

        return map;
    },

    getIncomingRequests: async (userId: string) => {
        const q = query(
            collection(getDb(), 'requests'),
            where('toId', '==', userId),
            where('status', '==', 'pending')
        );
        const snap = await getDocs(q);

        // Join with profiles manually
        const rawRequests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const requesterIds = rawRequests.map((r: any) => r.fromId);
        const userMap = await dbService.getUsersBatch(requesterIds);

        return rawRequests.map((r: any) => ({
            ...r,
            fromUser: userMap.get(r.fromId) || null
        }));
    },

    getMyConnections: async (userId: string) => {
        const q = query(collection(getDb(), 'connections'), where('participants', 'array-contains', userId));
        const snap = await getDocs(q);

        const connections = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const otherIds = new Set<string>();

        connections.forEach(c => {
            const other = c.participants.find((id: string) => id !== userId);
            if (other) otherIds.add(other);
        });

        if (otherIds.size === 0) return [];

        const userMap = await dbService.getUsersBatch(Array.from(otherIds));

        // Return connections with hydrated participants for Profile.tsx
        return connections.map(c => ({
            ...c,
            participants: c.participants.map((id: string) => userMap.get(id) || { id })
        }));
    },

    searchStudents: async (queryText: string) => {
        if (!queryText || queryText.length < 2) return [];

        const lowerQuery = queryText.toLowerCase();

        const q1 = query(collection(getDb(), 'users'), where('search_handle', '>=', lowerQuery), where('search_handle', '<=', lowerQuery + '\uf8ff'), limit(5));
        const q2 = query(collection(getDb(), 'users'), where('search_name', '>=', lowerQuery), where('search_name', '<=', lowerQuery + '\uf8ff'), limit(5));
        const q3 = query(collection(getDb(), 'users'), where('search_school', '>=', lowerQuery), where('search_school', '<=', lowerQuery + '\uf8ff'), limit(5));

        const [s1, s2, s3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

        const results = new Map();
        [...s1.docs, ...s2.docs, ...s3.docs].forEach(d => {
            results.set(d.id, { id: d.id, ...d.data() });
        });

        return Array.from(results.values());
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
        const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);

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

        return { id: res.id, ...newMessage };
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
    },

    // --- DASHBOARD METHODS ---
    getDashboardStats: async (userId: string) => {
        // 1. Get Active Orders (where student_id == userId AND status == 'in_progress')
        const q = query(
            collection(getDb(), 'orders'),
            where('student_id', '==', userId),
            where('status', '==', 'in_progress'),
            orderBy('deadline', 'asc')
        );

        const snap = await getDocs(q);
        const activeOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // 2. Calculate Stats
        const activeCount = activeOrders.length;
        const escrowBalance = activeOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        // 3. Next Deadline
        let nextDeadline = null;
        let nextDeadlineProject = null;

        if (activeOrders.length > 0) {
            // Since we ordered by deadline asc, the first one is the next deadline
            const firstOrder = activeOrders[0];
            if (firstOrder.deadline) {
                const daysLeft = Math.ceil((new Date(firstOrder.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                nextDeadline = daysLeft > 0 ? daysLeft : 0; // 0 means due today or overdue
                nextDeadlineProject = firstOrder.title;
            }
        }

        // 4. Hydrate Orders with Writer Data
        const hydratedOrders = await Promise.all(activeOrders.map(async (order) => {
            if (!order.writer_id) return order;
            try {
                const writerSnap = await getDoc(doc(getDb(), 'users', order.writer_id));
                if (writerSnap.exists()) {
                    const w = writerSnap.data();
                    return {
                        ...order,
                        writer_handle: w.handle,
                        writer_avatar: w.avatar_url,
                        writer_school: w.school,
                        writer_verified: w.is_verified === 'verified'
                    };
                }
            } catch (e) {
                console.error("Error hydrating order writer:", e);
            }
            return order;
        }));

        return {
            activeCount,
            escrowBalance,
            nextDeadline,
            nextDeadlineProject,
            activeOrders: hydratedOrders
        };
    }
};
