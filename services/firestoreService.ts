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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Keep for backwards compat if needed
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
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
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
            // Fetch all users without server-side is_incomplete filter
            // because Firestore won't match docs where the field doesn't exist
            const q = query(
                collection(getDb(), 'users'),
                limit(500)
            );
            const snapshot = await getDocs(q);
            // Filter client-side: exclude users where is_incomplete is explicitly true
            return snapshot.docs
                .map(doc => doc.data())
                .filter(user => user.is_incomplete !== true);
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

    getDashboardWriters: async (college?: string, limitCount: number = 5, currentUserId?: string) => {
        const usersRef = collection(getDb(), 'users');
        const constraints: any[] = [
            where('is_writer', '==', true),
            // where('is_verified', '==', 'verified'), // Removed to show all writers
            limit(limitCount + 1) // Fetch one extra in case we filter out self
        ];

        if (college) {
            constraints.push(where('search_school', '==', college.toLowerCase()));
        }

        const q = query(usersRef, ...constraints);
        const snap = await getDocs(q);

        let writers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (currentUserId) {
            writers = writers.filter((w: any) => w.id !== currentUserId);
        }

        return writers.slice(0, limitCount);
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



    addToPortfolio: async (userId: string, file: File) => {
        const { supabaseStorage } = await import('./supabaseStorage');

        // 1. Upload to Supabase Storage
        const url = await supabaseStorage.uploadPortfolio(userId, file);

        // 2. Update Firestore
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, {
            portfolio: arrayUnion(url)
        });

        return url;
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
        try {
            if (!userId) return [];
            const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));
            const snap = await getDocs(q);
            const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Sort manually
            chats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

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
                    other_avatar: other?.avatar_url,
                    unread_count: isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0)
                };
            });
        } catch (error) {
            console.error("Error fetching chats:", error);
            return [];
        }
    },

    getChatDetails: async (chatId: string, userId: string) => {
        try {
            const docSnap = await getDoc(doc(getDb(), 'chats', chatId));
            if (!docSnap.exists()) {
                console.error('[Chat] Chat not found:', chatId);
                return null;
            }

            const data = docSnap.data();
            const isPoster = data.poster_id === userId;
            const otherId = isPoster ? data.writer_id : data.poster_id;

            let other = null;
            try {
                const otherSnap = await getDoc(doc(getDb(), 'users', otherId));
                other = otherSnap.exists() ? otherSnap.data() : null;
            } catch (userError) {
                console.error('[Chat] Error fetching other user:', userError);
            }

            return {
                id: chatId,
                ...data,
                poster_id: data.poster_id,
                writer_id: data.writer_id,
                other_handle: other?.handle || 'Unknown',
                other_avatar: other?.avatar_url,
                other_verified: other?.is_verified || 'none'
            };
        } catch (error) {
            console.error('[Chat] Error getting chat details:', error);
            return null;
        }
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
            unread_count_poster: 0,
            unread_count_writer: 0
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

    uploadChatFile: async (chatId: string, file: File) => {
        const { supabaseStorage } = await import('./supabaseStorage');
        try {
            return await supabaseStorage.uploadChatFile(chatId, file);
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },

    sendMessage: async (chatId: string, senderId: string, text: string, type: string = 'text', fileUrl: string = '') => {
        const newMessage = {
            sender_id: senderId,
            text,
            type,
            fileUrl,
            created_at: new Date().toISOString(),
            readBy: [senderId]
        };

        // 1. Add to subcollection
        const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);

        // 2. Update chat metadata
        // 2. Update chat metadata and unread counts
        const chatRef = doc(getDb(), 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const isSenderPoster = chatData.poster_id === senderId;

            const updates: any = {
                last_message: type === 'text' ? text : `Sent an ${type}`,
                updated_at: new Date().toISOString()
            };

            // Increment unread count for the RECEIVER
            if (isSenderPoster) {
                // Sender is poster, increment writer's unread count
                updates.unread_count_writer = (chatData.unread_count_writer || 0) + 1;
            } else {
                // Sender is writer, increment poster's unread count
                updates.unread_count_poster = (chatData.unread_count_poster || 0) + 1;
            }

            await updateDoc(chatRef, updates);

            // 3. Notify
            const receiverId = isSenderPoster ? chatData.writer_id : chatData.poster_id;
            const senderSnap = await getDoc(doc(getDb(), 'users', senderId));
            const senderName = senderSnap.exists() ? senderSnap.data().handle : 'User';

            notifications.send(receiverId, senderName, type === 'text' ? text : 'Attachment sent', chatId);
        }

        return { id: res.id, ...newMessage };
    },

    markMessagesAsRead: async (chatId: string, readerId: string) => {
        const chatRef = doc(getDb(), 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const isReaderPoster = chatData.poster_id === readerId;

            // Reset unread count for the READER
            const updates: any = {};
            if (isReaderPoster) {
                updates.unread_count_poster = 0;
            } else {
                updates.unread_count_writer = 0;
            }

            await updateDoc(chatRef, updates);
        }

        // Also mark individual messages as read (existing logic)
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
        }, (error) => {
            console.error('[Chat] Error listening to messages:', error);
        });
    },

    listenToChats: (userId: string, callback: (chats: any[]) => void) => {
        if (!userId) return () => { };

        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));

        // Cache to store user profiles and avoid re-fetching on every message
        const userCache = new Map<string, any>();

        return onSnapshot(q, async (snap) => {
            try {
                const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Sort
                chats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                // Identify missing users
                const otherIds = chats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
                const missingIds = otherIds.filter(id => !userCache.has(id));

                // Fetch only missing users
                if (missingIds.length > 0) {
                    const newUsersMap = await dbService.getUsersBatch(missingIds);
                    newUsersMap.forEach((user, id) => userCache.set(id, user));
                }

                const hydrated = chats.map((c: any) => {
                    const isPoster = c.poster_id === userId;
                    const otherId = isPoster ? c.writer_id : c.poster_id;
                    const other = userCache.get(otherId);

                    return {
                        ...c,
                        gig_title: 'Direct Chat',
                        other_handle: other?.handle || 'User',
                        other_avatar: other?.avatar_url,
                        unread_count: isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0)
                    };
                });
                callback(hydrated);
            } catch (error) {
                console.error("Error in listenToChats:", error);
            }
        }, (error) => {
            console.error("Error listening to chats:", error);
        });
    },

    listenToUnreadCount: (userId: string, callback: (count: number) => void) => {
        if (!userId) return () => { };

        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));

        return onSnapshot(q, (snap) => {
            let total = 0;
            snap.docs.forEach(d => {
                const c = d.data();
                const isPoster = c.poster_id === userId;
                total += isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0);
            });
            callback(total);
        }, (error) => {
            console.error("Error listening to unread count:", error);
        });
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

        // 1. Get Active Orders - Query for both student_id (hirer) and writer_id
        // This ensures both students and writers see their active projects
        const studentOrdersQuery = query(
            collection(getDb(), 'orders'),
            where('student_id', '==', userId),
            where('status', '==', 'in_progress')
        );

        const writerOrdersQuery = query(
            collection(getDb(), 'orders'),
            where('writer_id', '==', userId),
            where('status', '==', 'in_progress')
        );

        const [studentSnap, writerSnap] = await Promise.all([
            getDocs(studentOrdersQuery),
            getDocs(writerOrdersQuery)
        ]);

        // Merge and deduplicate
        const orderMap = new Map();
        studentSnap.docs.forEach(d => orderMap.set(d.id, { id: d.id, ...d.data() }));
        writerSnap.docs.forEach(d => orderMap.set(d.id, { id: d.id, ...d.data() }));

        // Sort by deadline
        const activeOrders = Array.from(orderMap.values()).sort((a: any, b: any) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }) as any[];

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

    // Real-time listener for active orders (for immediate updates)
    listenToActiveOrders: (userId: string, callback: (orders: any[]) => void) => {
        if (!userId) {
            callback([]);
            return () => { };
        }

        // Create two listeners - one for student orders, one for writer orders
        const studentOrdersQuery = query(
            collection(getDb(), 'orders'),
            where('student_id', '==', userId),
            where('status', '==', 'in_progress')
        );

        const writerOrdersQuery = query(
            collection(getDb(), 'orders'),
            where('writer_id', '==', userId),
            where('status', '==', 'in_progress')
        );

        const orderMap = new Map<string, any>();
        let studentOrders: any[] = [];
        let writerOrders: any[] = [];

        const processOrders = async () => {
            // Merge orders
            orderMap.clear();
            studentOrders.forEach(o => orderMap.set(o.id, o));
            writerOrders.forEach(o => orderMap.set(o.id, o));

            // Sort by deadline
            const allOrders = Array.from(orderMap.values()).sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });

            // Hydrate with writer data
            const hydratedOrders = await Promise.all(allOrders.map(async (order) => {
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
                    console.error("Error hydrating order:", e);
                }
                return order;
            }));

            callback(hydratedOrders);
        };

        const unsubStudent = onSnapshot(studentOrdersQuery, (snap) => {
            studentOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            processOrders();
        });

        const unsubWriter = onSnapshot(writerOrdersQuery, (snap) => {
            writerOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            processOrders();
        });

        return () => {
            unsubStudent();
            unsubWriter();
        };
    },

    // --- STORAGE METHODS (Now using Supabase) ---
    uploadFile: async (file: File, path: string) => {
        const { supabaseStorage } = await import('./supabaseStorage');
        return await supabaseStorage.uploadFile(file, path);
    },

    saveChatFile: async (chatId: string, fileData: { name: string, url: string, type: string, size: number, uploadedBy: string }) => {
        const { addDoc, collection } = await import('firebase/firestore');
        const filesRef = collection(getDb(), 'chats', chatId, 'files');
        await addDoc(filesRef, {
            ...fileData,
            created_at: new Date().toISOString()
    findExistingChat: async (uid1: string, uid2: string) => {
                const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', uid1));
                const snap = await getDocs(q);
                return snap.docs.find(doc => {
                    const participants = doc.data().participants || [];
                    return participants.includes(uid2);
                });
            },

            // --- PROJECT/GIG METHODS ---
            getUserProjects: async (userId: string) => {
                const q = query(
                    collection(getDb(), 'gigs'),
                    where('poster_id', '==', userId),
                    orderBy('created_at', 'desc')
                );
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },

            getConnectionStatus: async (uid1: string, uid2: string) => {
                // Check Requests
                const requestsRef = collection(getDb(), 'requests');
                const q = query(requestsRef, where('fromId', '==', uid1), where('toId', '==', uid2), where('status', '==', 'pending'));
                const reqSnap = await getDocs(q);
                if (!reqSnap.empty) return 'pending';

                // Check Actual Connection
                const connQ = query(collection(getDb(), 'connections'), where('participants', 'array-contains', uid1));
                const connSnap = await getDocs(connQ);
                const isConnected = connSnap.docs.some(doc => {
                    const data = doc.data();
                    return data.participants && data.participants.some((p: any) => (p.id === uid2 || p === uid2));
                });

                return isConnected ? 'connected' : 'none';
            },

            // ==========================================
            // OFFER SYSTEM
            // ==========================================

            sendOffer: async (chatId: string, senderId: string, senderName: string, offerData: {
                subject: string;
                title: string;
                description?: string;
                pages: number;
                deadline: string;
                budget: number;
            }) => {
                const offer = {
                    sender_id: senderId,
                    sender_name: senderName,
                    type: 'offer',
                    text: `📋 Project Offer: ${offerData.title}`,
                    offer: {
                        ...offerData,
                        status: 'pending' as 'pending' | 'accepted' | 'rejected',
                        senderId: senderId,
                        senderName: senderName
                    },
                    created_at: new Date().toISOString(),
                    readBy: [senderId]
                };

                // Add to messages subcollection
                const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), offer);

                // Update chat metadata
                const chatRef = doc(getDb(), 'chats', chatId);
                const chatSnap = await getDoc(chatRef);

                if (chatSnap.exists()) {
                    const chatData = chatSnap.data();
                    const isPoster = chatData.poster_id === senderId;

                    await updateDoc(chatRef, {
                        last_message: `📋 Offer: ${offerData.title}`,
                        updated_at: new Date().toISOString(),
                        [isPoster ? 'unread_count_writer' : 'unread_count_poster']: (chatData[isPoster ? 'unread_count_writer' : 'unread_count_poster'] || 0) + 1
                    });
                }

                return { id: res.id, ...offer };
            },

            respondToOffer: async (chatId: string, messageId: string, userId: string, response: 'accepted' | 'rejected') => {
                const messageRef = doc(getDb(), 'chats', chatId, 'messages', messageId);
                const messageSnap = await getDoc(messageRef);

                if (!messageSnap.exists()) {
                    throw new Error('Offer not found');
                }

                const messageData = messageSnap.data();
                if (messageData.type !== 'offer') {
                    throw new Error('Message is not an offer');
                }

                // Update the offer status
                await updateDoc(messageRef, {
                    'offer.status': response,
                    'offer.respondedAt': new Date().toISOString(),
                    'offer.respondedBy': userId
                });

                // If accepted, create a project/order
                if (response === 'accepted' && messageData.offer) {
                    const offer = messageData.offer;
                    const chatRef = doc(getDb(), 'chats', chatId);
                    const chatSnap = await getDoc(chatRef);

                    if (chatSnap.exists()) {
                        const chatData = chatSnap.data();

                        // Create the order/project
                        const orderId = `order_${Date.now()}`;
                        await setDoc(doc(getDb(), 'orders', orderId), {
                            id: orderId,
                            chat_id: chatId,
                            student_id: offer.senderId, // The person who sent the offer (student/hirer)
                            poster_id: offer.senderId, // Keep for backward compatibility
                            writer_id: userId, // The person accepting is the writer
                            title: offer.title,
                            subject: offer.subject,
                            description: offer.description || '',
                            pages: offer.pages,
                            deadline: offer.deadline,
                            budget: offer.budget,
                            amount: offer.budget, // For escrow balance calculation
                            status: 'in_progress',
                            completion_percentage: 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });

                        // Send a system message about acceptance
                        await addDoc(collection(getDb(), 'chats', chatId, 'messages'), {
                            sender_id: 'system',
                            type: 'system',
                            text: `✅ Offer accepted! Project "${offer.title}" has been started.`,
                            created_at: new Date().toISOString(),
                            readBy: []
                        });
                    }
                } else if (response === 'rejected') {
                    // Send a system message about rejection
                    await addDoc(collection(getDb(), 'chats', chatId, 'messages'), {
                        sender_id: 'system',
                        type: 'system',
                        text: `❌ Offer was declined.`,
                        created_at: new Date().toISOString(),
                        readBy: []
                    });
                }

                return { success: true, status: response };
            },

            getOffersByChat: async (chatId: string) => {
                const q = query(
                    collection(getDb(), 'chats', chatId, 'messages'),
                    where('type', '==', 'offer'),
                    orderBy('created_at', 'desc')
                );
                const snap = await getDocs(q);
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        };
