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
        const { college, searchQuery, tag } = filters;
        const usersRef = collection(getDb(), 'users');
        let writers: any[] = [];

        if (searchQuery && searchQuery.length >= 2) {
            // Perform Server-Side Search
            const lowerQuery = searchQuery.toLowerCase();
            const endQuery = lowerQuery + '\uf8ff';

            // We need to search across multiple fields. Firestore requires separate queries.
            // All must filter by is_writer == true.

            const queries = [];

            // 1. Search by Name
            queries.push(query(usersRef,
                where('is_writer', '==', true),
                where('search_name', '>=', lowerQuery),
                where('search_name', '<=', endQuery),
                limit(20)
            ));

            // 2. Search by Handle
            queries.push(query(usersRef,
                where('is_writer', '==', true),
                where('search_handle', '>=', lowerQuery),
                where('search_handle', '<=', endQuery),
                limit(20)
            ));

            // 3. Search by School (only if college filter is NOT set, otherwise we filter by college separately)
            if (!college) {
                queries.push(query(usersRef,
                    where('is_writer', '==', true),
                    where('search_school', '>=', lowerQuery),
                    where('search_school', '<=', endQuery),
                    limit(20)
                ));
            }

            const snapshots = await Promise.all(queries.map(q => getDocs(q)));
            const resultMap = new Map();
            snapshots.forEach(snap => {
                snap.docs.forEach(doc => resultMap.set(doc.id, doc.data()));
            });

            writers = Array.from(resultMap.values());

        } else {
            // Default: Fetch recent writers (existing logic)
            const constraints: any[] = [
                where('is_writer', '==', true),
                orderBy('created_at', 'desc'), // Explicit sort
                limit(50)
            ];

            if (college) {
                constraints.push(where('search_school', '==', college.toLowerCase()));
            }

            const q = query(usersRef, ...constraints);
            const snap = await getDocs(q);
            writers = snap.docs.map(d => d.data());
        }

        // Client-side filtering for remaining fields (Tags, College if search was used)
        if (college && searchQuery) {
            writers = writers.filter((w: any) => w.search_school === college.toLowerCase());
        }

        if (tag && tag !== 'All') {
            writers = writers.filter((w: any) => w.tags && w.tags.includes(tag));
        }

        return writers;
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
        if (!currentUserId) return {};
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
        if (!userId) return [];
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
        if (!userId) return [];
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
        if (!userId) return [];
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
        // 1. Query for existing chat with these exact participants
        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', posterId));
        const snaps = await getDocs(q);
        const existing = snaps.docs.find(doc => {
            const data = doc.data();
            return data.participants && data.participants.includes(writerId);
        });

        if (existing) return { id: existing.id, ...existing.data() };

        // 2. If none, create new
        const newChatRef = doc(collection(getDb(), 'chats'));
        const newChat = {
            participants: [posterId, writerId],
            poster_id: posterId, // Keep for backward compatibility if needed
            writer_id: writerId, // Keep for backward compatibility if needed
            createdAt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message: '',
            unread_count: 0
        };
        await setDoc(newChatRef, newChat);
        return { id: newChatRef.id, ...newChat };
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
            readBy: [senderId] // Initialize with sender
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
        // Query messages where readerId is NOT in readBy
        // Firestore doesn't support "not-in-array" directly easily, so we query all and filter or query by readBy not-contains (not supported)
        // Alternative: Query messages where sender != readerId

        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            where('sender_id', '!=', readerId)
        );
        const snap = await getDocs(q);
        const batch = (await import('firebase/firestore')).writeBatch(getDb());

        let count = 0;
        snap.docs.forEach(d => {
            const data = d.data();
            if (!data.readBy || !data.readBy.includes(readerId)) {
                batch.update(d.ref, {
                    readBy: arrayUnion(readerId),
                    read_at: new Date().toISOString() // Keep for backward compat
                });
                count++;
            }
        });

        if (count > 0) await batch.commit();
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
        if (!userId) return () => { };
        // Listening to complex queries is hard, so we'll listen to the collection and filter client-side 
        // OR set up two listeners. For simplicity/cost, we'll poll or just listen to one query if possible.
        // Better approach: Listen to 'chats' where poster_id == userId OR writer_id == userId.
        // Firestore OR queries in snapshot are tricky. Let's use two listeners and merge.

        const q1 = query(collection(getDb(), 'chats'), where('poster_id', '==', userId));
        const q2 = query(collection(getDb(), 'chats'), where('writer_id', '==', userId));

        let chats1: any[] = [];
        let chats2: any[] = [];

        // Cache to store user profiles and avoid re-fetching on every message
        const userCache = new Map<string, any>();

        const mergeAndCallback = async () => {
            const allChats = [...chats1, ...chats2];
            // Dedupe
            const chatMap = new Map();
            allChats.forEach(c => chatMap.set(c.id, c));
            const uniqueChats = Array.from(chatMap.values());

            // Sort
            uniqueChats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

            // Identify missing users
            const otherIds = uniqueChats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
            const missingIds = otherIds.filter(id => !userCache.has(id));

            // Fetch only missing users
            if (missingIds.length > 0) {
                const newUsersMap = await dbService.getUsersBatch(missingIds);
                newUsersMap.forEach((user, id) => userCache.set(id, user));
            }

            const hydrated = uniqueChats.map((c: any) => {
                const isPoster = c.poster_id === userId;
                const otherId = isPoster ? c.writer_id : c.poster_id;
                const other = userCache.get(otherId);

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
        if (!userId) return { activeCount: 0, escrowBalance: 0, nextDeadline: null, nextDeadlineProject: null, activeOrders: [] };
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
    },

    // --- STORAGE METHODS ---
    uploadFile: async (file: File, path: string) => {
        const { storage } = await import('./firebase');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    }
};
