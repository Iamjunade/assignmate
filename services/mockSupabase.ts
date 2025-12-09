import { createClient } from '@supabase/supabase-js';
import { INDIAN_COLLEGES } from '../data/colleges';
import { notifications } from './firebase';

// Safely access environment variables
const env = (import.meta as any).env || {};

const SUPABASE_URL: string = env.VITE_SUPABASE_URL || 'https://blpwnqrqtxmbcmfxpbod.supabase.co';
const SUPABASE_ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscHducXJxdHhtYmNtZnhwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDY2MzksImV4cCI6MjA3OTU4MjYzOX0.dFOFS-PVQ9QfYl6MGoPRFj11-h3CZSoMCXsOcEunzI4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Local Storage Helpers (Fallback Mechanism) ---
const LOCAL_KEYS = {
    PROFILES: 'assignmate_profiles',
    CHATS: 'assignmate_chats',
    MESSAGES: 'assignmate_messages',
    CONNECTIONS: 'assignmate_connections'
};

const getLocal = <T>(key: string): T[] => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
};
const setLocal = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));
// --------------------------------------------------

// Profile Management to Sync with Firebase Auth
export const userApi = {
    getProfile: async (id: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
            if (!error && data) return data;
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Not found"
        } catch (e) {
            // Fallback to local
            const localProfiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            return localProfiles.find(p => p.id === id) || null;
        }
        return null;
    },

    createProfile: async (id: string, metadata: any) => {
        const randomCollege = INDIAN_COLLEGES[Math.floor(Math.random() * INDIAN_COLLEGES.length)].name;

        // Sanitize handle - ensure uniqueness
        let handle = metadata.handle || metadata.full_name || 'Student';
        handle = handle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        if (handle.length < 3) handle = `Student_${id.slice(0, 4)}`;

        // Check if email already exists
        const checkEmail = async (email: string) => {
            try {
                const { data } = await supabase.from('profiles').select('id').eq('email', email).single();
                return !!data;
            } catch {
                // Local fallback check
                const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
                return profiles.some(p => p.email === email);
            }
        };

        if (await checkEmail(metadata.email)) {
            throw new Error("This email is already registered. Please login instead.");
        }

        // Uniqueness Check Helper
        const checkUnique = async (h: string) => {
            try {
                const { data } = await supabase.from('profiles').select('id').eq('handle', h).single();
                return !!data;
            } catch { return false; }
        };

        let uniqueHandle = handle;
        let counter = 1;

        try {
            // Only append numbers if the handle ALREADY exists
            while (await checkUnique(uniqueHandle)) {
                uniqueHandle = `${handle}${counter++}`;
            }

            const newProfile = {
                id,
                handle: uniqueHandle,
                full_name: metadata.full_name,
                email: metadata.email,
                avatar_url: metadata.avatar_url,
                school: randomCollege,
                created_at: new Date().toISOString(),
                is_verified: 'pending',
                xp: 0,
                tags: ['Student']
            };

            const { error } = await supabase.from('profiles').insert([newProfile]);
            if (error) throw error;
            return newProfile;
        } catch (e) {
            // Local fallback
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            const newProfile = {
                id,
                handle: uniqueHandle,
                full_name: metadata.full_name,
                email: metadata.email,
                avatar_url: metadata.avatar_url,
                school: randomCollege,
                created_at: new Date().toISOString(),
                is_verified: 'pending',
                xp: 0,
                tags: ['Student']
            };
            setLocal(LOCAL_KEYS.PROFILES, [...profiles, newProfile]);
            return newProfile;
        }
    },

    deleteProfile: async (id: string) => {
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            // Fallback: Remove from local storage
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            const newProfiles = profiles.filter(p => p.id !== id);
            setLocal(LOCAL_KEYS.PROFILES, newProfiles);
        }
    }
};

export const db = {
    getWriters: async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*')
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) throw error;

            // Hybrid Merge: Merge Supabase results with Local Storage results
            // This ensures that if the DB is empty or partially failing, local data still shows up
            const local = getLocal<any>(LOCAL_KEYS.PROFILES);
            const combined = [...(data || [])];

            local.forEach(l => {
                if (!combined.some(r => r.id === l.id)) {
                    combined.push(l);
                }
            });

            return filterWriters(combined);
        } catch (e) {
            console.warn("Fetch Writers Failed. Using Local Fallback.");
            const local = getLocal<any>(LOCAL_KEYS.PROFILES);
            local.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
            return filterWriters(local);
        }
    },

    updateProfile: async (userId: string, updates: any) => {
        try {
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) throw error;
            return { error: null };
        } catch (e) {
            // Fallback
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            const index = profiles.findIndex(p => p.id === userId);
            if (index !== -1) {
                profiles[index] = { ...profiles[index], ...updates };
                setLocal(LOCAL_KEYS.PROFILES, profiles);
                return { error: null };
            }
            return { error: e };
        }
    },

    uploadFile: async (file: File) => {
        const MAX_SIZE_MB = 2;

        // 1. Try Real Storage
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('portfolio')
                .upload(fileName, file, { upsert: true });

            if (!error && data?.path) {
                const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(data.path);
                return publicUrl;
            }
        } catch (e) {
            console.warn("Storage upload not available, falling back to Base64.");
        }

        // 2. Fallback to Base64
        return new Promise<string>((resolve, reject) => {
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                reject(new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(e);
        });
    },

    addToPortfolio: async (userId: string, imageUrl: string) => {
        let currentPortfolio: string[] = [];
        try {
            const { data } = await supabase.from('profiles').select('portfolio').eq('id', userId).single();
            if (data) currentPortfolio = data.portfolio || [];
        } catch {
            const local = getLocal<any>(LOCAL_KEYS.PROFILES).find(p => p.id === userId);
            if (local) currentPortfolio = local.portfolio || [];
        }

        const updated = [imageUrl, ...currentPortfolio];
        return db.updateProfile(userId, { portfolio: updated });
    },

    deleteFromPortfolio: async (userId: string, urlToDelete: string) => {
        let currentPortfolio: string[] = [];
        try {
            const { data } = await supabase.from('profiles').select('portfolio').eq('id', userId).single();
            if (data) currentPortfolio = data.portfolio || [];
        } catch {
            const local = getLocal<any>(LOCAL_KEYS.PROFILES).find(p => p.id === userId);
            if (local) currentPortfolio = local.portfolio || [];
        }

        const updated = currentPortfolio.filter(url => url !== urlToDelete);
        return db.updateProfile(userId, { portfolio: updated });
    },

    toggleSaveWriter: async (userId: string, writerId: string) => {
        let currentSaved: string[] = [];
        try {
            const { data } = await supabase.from('profiles').select('saved_writers').eq('id', userId).single();
            if (data) currentSaved = data.saved_writers || [];
        } catch {
            const local = getLocal<any>(LOCAL_KEYS.PROFILES).find(p => p.id === userId);
            if (local) currentSaved = local.saved_writers || [];
        }

        let updated;
        if (currentSaved.includes(writerId)) {
            updated = currentSaved.filter(id => id !== writerId);
        } else {
            updated = [...currentSaved, writerId];
        }

        return db.updateProfile(userId, { saved_writers: updated });
    },

    // --- CONNECTION SYSTEM ---

    sendConnectionRequest: async (requesterId: string, receiverId: string) => {
        const newConn = {
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('connections').insert([newConn]).select().single();
            if (error) throw error;
            return data;
        } catch {
            // Fallback
            const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS);
            if (!conns.some(c => c.requester_id === requesterId && c.receiver_id === receiverId)) {
                setLocal(LOCAL_KEYS.CONNECTIONS, [...conns, newConn]);
            }
            return newConn;
        }
    },

    respondToConnectionRequest: async (connectionId: string, status: 'accepted' | 'rejected') => {
        if (status === 'rejected') {
            try {
                await supabase.from('connections').delete().eq('id', connectionId);
            } catch {
                const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS);
                setLocal(LOCAL_KEYS.CONNECTIONS, conns.filter(c => c.id !== connectionId));
            }
            return;
        }

        try {
            await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
        } catch {
            const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS);
            const idx = conns.findIndex(c => c.id === connectionId);
            if (idx !== -1) {
                conns[idx].status = 'accepted';
                setLocal(LOCAL_KEYS.CONNECTIONS, conns);
            }
        }
    },

    getNetworkMap: async (userId: string) => {
        try {
            const { data } = await supabase.from('connections').select('*')
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

            return processConnections(data || [], userId);
        } catch {
            const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS).filter(c => c.requester_id === userId || c.receiver_id === userId);
            return processConnections(conns, userId);
        }
    },

    getIncomingRequests: async (userId: string) => {
        try {
            const { data } = await supabase.from('connections')
                .select('*, requester:profiles!requester_id(*)')
                .eq('receiver_id', userId)
                .eq('status', 'pending');

            return data || [];
        } catch {
            const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS).filter(c => c.receiver_id === userId && c.status === 'pending');
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            return conns.map(c => ({
                ...c,
                requester: profiles.find(p => p.id === c.requester_id)
            }));
        }
    },

    getMyConnections: async (userId: string) => {
        try {
            const { data } = await supabase.from('connections')
                .select('*')
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
                .eq('status', 'accepted');

            const connectedIds = (data || []).map(c => c.requester_id === userId ? c.receiver_id : c.requester_id);
            if (connectedIds.length === 0) return [];

            const { data: profiles } = await supabase.from('profiles').select('*').in('id', connectedIds);
            return profiles || [];

        } catch {
            const conns = getLocal<any>(LOCAL_KEYS.CONNECTIONS)
                .filter(c => (c.requester_id === userId || c.receiver_id === userId) && c.status === 'accepted');

            const connectedIds = conns.map(c => c.requester_id === userId ? c.receiver_id : c.requester_id);
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            return profiles.filter(p => connectedIds.includes(p.id));
        }
    },

    // CHAT SYSTEM
    getChats: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select(`*, poster:poster_id(handle, avatar_url), writer:writer_id(handle, avatar_url)`)
                .or(`poster_id.eq.${userId},writer_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return data?.map(c => {
                const isPoster = c.poster_id === userId;
                const other = isPoster ? c.writer : c.poster;
                return {
                    ...c,
                    gig_title: 'Direct Chat',
                    other_handle: other?.handle || 'User',
                    other_avatar: other?.avatar_url
                };
            }) || [];
        } catch {
            const chats = getLocal<any>(LOCAL_KEYS.CHATS).filter(c => c.poster_id === userId || c.writer_id === userId);
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            return chats.map(c => {
                const otherId = c.poster_id === userId ? c.writer_id : c.poster_id;
                const otherUser = profiles.find(p => p.id === otherId);
                return {
                    ...c,
                    other_handle: otherUser?.handle || 'User',
                    other_avatar: otherUser?.avatar_url
                };
            }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        }
    },

    getChatDetails: async (chatId: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select(`*, poster:poster_id(handle, avatar_url), writer:writer_id(handle, avatar_url)`)
                .eq('id', chatId)
                .single();

            if (error || !data) throw new Error("Not found");

            const isPoster = data.poster_id === userId;
            const other = isPoster ? data.writer : data.poster;

            return {
                ...data,
                other_handle: other?.handle || 'Unknown',
                other_avatar: other?.avatar_url
            };
        } catch {
            const chat = getLocal<any>(LOCAL_KEYS.CHATS).find(c => c.id === chatId);
            if (!chat) return null;
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            const otherId = chat.poster_id === userId ? chat.writer_id : chat.poster_id;
            const otherUser = profiles.find(p => p.id === otherId);
            return {
                ...chat,
                other_handle: otherUser?.handle || 'Unknown',
                other_avatar: otherUser?.avatar_url
            };
        }
    },

    createChat: async (gigId: string | null, posterId: string, writerId: string) => {
        try {
            const { data } = await supabase.from('chats').select('*')
                .or(`and(poster_id.eq.${posterId},writer_id.eq.${writerId}),and(poster_id.eq.${writerId},writer_id.eq.${posterId})`)
                .maybeSingle();

            if (data) return data;
        } catch (e) { console.warn("Check chat failed", e); }

        const newChat = {
            id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            gig_id: gigId,
            poster_id: posterId,
            writer_id: writerId,
            updated_at: new Date().toISOString(),
            last_message: null
        };

        try {
            const { data, error } = await supabase.from('chats').insert([newChat]).select().single();
            if (error) throw error;
            return data;
        } catch {
            console.warn("HINT: Check if the 'chats' table exists in Supabase.");
            const chats = getLocal<any>(LOCAL_KEYS.CHATS);
            const existing = chats.find(c =>
                (c.poster_id === posterId && c.writer_id === writerId) ||
                (c.poster_id === writerId && c.writer_id === posterId)
            );
            if (existing) return existing;

            setLocal(LOCAL_KEYS.CHATS, [...chats, newChat]);
            return newChat;
        }
    },

    getMessages: async (chatId: string) => {
        try {
            const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch {
            return getLocal<any>(LOCAL_KEYS.MESSAGES)
                .filter(m => m.chat_id === chatId)
                .sort((a, b) => a.created_at.localeCompare(b.created_at));
        }
    },

    sendMessage: async (chatId: string, senderId: string, content: string, type = 'TEXT') => {
        const newMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            chat_id: chatId,
            sender_id: senderId,
            content,
            type,
            created_at: new Date().toISOString(),
            read_at: null
        };

        try {
            // 1. Save to Supabase DB (Truth)
            const { error } = await supabase.from('messages').insert([newMessage]);
            if (error) throw error;

            await supabase.from('chats').update({
                last_message: type === 'TEXT' ? content : `[${type}]`,
                updated_at: new Date().toISOString()
            }).eq('id', chatId);

            // 2. Trigger Firebase Notification (Real-time Signal)
            // Find the other user to notify
            const chatRes = await supabase.from('chats').select('poster_id, writer_id').eq('id', chatId).single();
            if (chatRes.data) {
                const receiverId = chatRes.data.poster_id === senderId ? chatRes.data.writer_id : chatRes.data.poster_id;
                const senderRes = await supabase.from('profiles').select('handle').eq('id', senderId).single();
                const senderName = senderRes.data?.handle || 'AssignMate User';

                // Send signal
                notifications.send(receiverId, senderName, type === 'TEXT' ? content : 'Attachment sent', chatId);
            }

            return newMessage;
        } catch (e) {
            console.warn("Message send failed, using local fallback", e);
            const msgs = getLocal<any>(LOCAL_KEYS.MESSAGES);
            setLocal(LOCAL_KEYS.MESSAGES, [...msgs, newMessage]);

            const chats = getLocal<any>(LOCAL_KEYS.CHATS);
            const chatIdx = chats.findIndex(c => c.id === chatId);
            if (chatIdx !== -1) {
                chats[chatIdx] = {
                    ...chats[chatIdx],
                    last_message: type === 'TEXT' ? content : `[${type}]`,
                    updated_at: new Date().toISOString()
                };
                setLocal(LOCAL_KEYS.CHATS, chats);
            }
            return newMessage;
        }
    },

    markMessagesAsRead: async (chatId: string, readerId: string) => {
        const now = new Date().toISOString();
        try {
            const { error } = await supabase.from('messages')
                .update({ read_at: now })
                .eq('chat_id', chatId)
                .neq('sender_id', readerId)
                .is('read_at', null);

            if (error) throw error;
        } catch {
            const msgs = getLocal<any>(LOCAL_KEYS.MESSAGES);
            let changed = false;
            const updated = msgs.map(m => {
                if (m.chat_id === chatId && m.sender_id !== readerId && !m.read_at) {
                    changed = true;
                    return { ...m, read_at: now };
                }
                return m;
            });
            if (changed) setLocal(LOCAL_KEYS.MESSAGES, updated);
        }
    },

    // --- ADMIN METHODS ---
    getPendingVerifications: async () => {
        try {
            const { data } = await supabase.from('profiles').select('*').eq('is_verified', 'pending');
            return data || [];
        } catch {
            const profiles = getLocal<any>(LOCAL_KEYS.PROFILES);
            return profiles.filter(p => p.is_verified === 'pending');
        }
    },

    verifyUser: async (userId: string, status: 'verified' | 'rejected') => {
        return db.updateProfile(userId, { is_verified: status });
    }
};

function filterWriters(data: any[]) {
    return data?.map(u => ({
        ...u,
        tags: u.tags || ['General']
    })) || [];
}

function processConnections(data: any[], userId: string) {
    const map: Record<string, string> = {};
    data.forEach(c => {
        if (c.status === 'accepted') {
            const other = c.requester_id === userId ? c.receiver_id : c.requester_id;
            map[other] = 'connected';
        } else if (c.status === 'pending') {
            if (c.requester_id === userId) map[c.receiver_id] = 'pending_sent';
            else map[c.requester_id] = 'pending_received';
        }
    });
    return map;
}