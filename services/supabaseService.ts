import { createClient } from '@supabase/supabase-js';
import { INDIAN_COLLEGES } from '../data/colleges';
import { notifications } from './firebase';

// Safely access environment variables
const env = (import.meta as any).env || {};

const SUPABASE_URL: string = env.VITE_SUPABASE_URL || 'https://hgeeqtwzuwvgtalyjoes.supabase.co';
const SUPABASE_ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZWVxdHd6dXd2Z3RhbHlqb2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Njg3MjUsImV4cCI6MjA4MTA0NDcyNX0.8A2OMxfUYoHamEoSoULVK0w6UUkuz1ZusFbkR1Frcrg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Profile Management to Sync with Firebase Auth
export const userApi = {
    getProfile: async (id: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Not found"
        return data || null;
    },

    createProfile: async (id: string, metadata: any) => {
        const randomCollege = INDIAN_COLLEGES[Math.floor(Math.random() * INDIAN_COLLEGES.length)].name;

        // Sanitize handle - ensure uniqueness
        let handle = metadata.handle || metadata.full_name || 'Student';
        handle = handle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        if (handle.length < 3) handle = `Student_${id.slice(0, 4)}`;

        // Check if email already exists
        const { data: existingEmail } = await supabase.from('profiles').select('id').eq('email', metadata.email).single();
        if (existingEmail) {
            throw new Error("This email is already registered. Please login instead.");
        }

        // Uniqueness Check Helper
        const checkUnique = async (h: string) => {
            const { data } = await supabase.from('profiles').select('id').eq('handle', h).single();
            return !!data;
        };

        let uniqueHandle = handle;
        let counter = 1;

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
            school: metadata.school || randomCollege,
            created_at: new Date().toISOString(),
            is_verified: 'pending',
            xp: 0,
            tags: ['Student'],
            is_writer: metadata.is_writer || false
        };

        const { error } = await supabase.from('profiles').insert([newProfile]);
        if (error) throw error;
        return newProfile;
    },

    deleteProfile: async (id: string) => {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
    }
};

export const db = {
    getWriters: async () => {
        const { data, error } = await supabase.from('profiles').select('*')
            .eq('is_writer', true)
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) throw error;
        return filterWriters(data || []);
    },

    updateProfile: async (userId: string, updates: any) => {
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if (error) throw error;
        return { error: null };
    },

    uploadFile: async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('portfolio')
            .upload(fileName, file, { upsert: true });

        if (error) throw error;

        if (data?.path) {
            const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(data.path);
            return publicUrl;
        }
        throw new Error("Upload failed");
    },

    addToPortfolio: async (userId: string, imageUrl: string) => {
        const { data } = await supabase.from('profiles').select('portfolio').eq('id', userId).single();
        const currentPortfolio = data?.portfolio || [];
        const updated = [imageUrl, ...currentPortfolio];
        return db.updateProfile(userId, { portfolio: updated });
    },

    deleteFromPortfolio: async (userId: string, urlToDelete: string) => {
        const { data } = await supabase.from('profiles').select('portfolio').eq('id', userId).single();
        const currentPortfolio = data?.portfolio || [];
        const updated = currentPortfolio.filter((url: string) => url !== urlToDelete);
        return db.updateProfile(userId, { portfolio: updated });
    },

    toggleSaveWriter: async (userId: string, writerId: string) => {
        const { data } = await supabase.from('profiles').select('saved_writers').eq('id', userId).single();
        const currentSaved = data?.saved_writers || [];

        let updated;
        if (currentSaved.includes(writerId)) {
            updated = currentSaved.filter((id: string) => id !== writerId);
        } else {
            updated = [...currentSaved, writerId];
        }

        return db.updateProfile(userId, { saved_writers: updated });
    },

    // --- CONNECTION SYSTEM ---

    sendConnectionRequest: async (requesterId: string, receiverId: string) => {
        const newConn = {
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('connections').insert([newConn]).select().single();
        if (error) throw error;
        return data;
    },

    respondToConnectionRequest: async (connectionId: string, status: 'accepted' | 'rejected') => {
        if (status === 'rejected') {
            const { error } = await supabase.from('connections').delete().eq('id', connectionId);
            if (error) throw error;
            return;
        }

        const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
        if (error) throw error;
    },

    getNetworkMap: async (userId: string) => {
        const { data } = await supabase.from('connections').select('*')
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

        return processConnections(data || [], userId);
    },

    getIncomingRequests: async (userId: string) => {
        const { data, error } = await supabase.from('connections')
            .select('*, requester:profiles!requester_id(*)')
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        if (error) throw error;
        return data || [];
    },

    getMyConnections: async (userId: string) => {
        const { data } = await supabase.from('connections')
            .select('*')
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
            .eq('status', 'accepted');

        const connectedIds = (data || []).map(c => c.requester_id === userId ? c.receiver_id : c.requester_id);
        if (connectedIds.length === 0) return [];

        const { data: profiles, error } = await supabase.from('profiles').select('*').in('id', connectedIds);
        if (error) throw error;
        return profiles || [];
    },

    // CHAT SYSTEM
    getChats: async (userId: string) => {
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
    },

    getChatDetails: async (chatId: string, userId: string) => {
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
    },

    createChat: async (gigId: string | null, posterId: string, writerId: string) => {
        // Check existing
        const { data } = await supabase.from('chats').select('*')
            .or(`and(poster_id.eq.${posterId},writer_id.eq.${writerId}),and(poster_id.eq.${writerId},writer_id.eq.${posterId})`)
            .maybeSingle();

        if (data) return data;

        const newChat = {
            gig_id: gigId,
            poster_id: posterId,
            writer_id: writerId,
            updated_at: new Date().toISOString(),
            last_message: null
        };

        const { data: created, error } = await supabase.from('chats').insert([newChat]).select().single();
        if (error) throw error;
        return created;
    },

    getMessages: async (chatId: string) => {
        const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    sendMessage: async (chatId: string, senderId: string, content: string, type = 'TEXT') => {
        const newMessage = {
            chat_id: chatId,
            sender_id: senderId,
            content,
            type,
            created_at: new Date().toISOString(),
            read_at: null
        };

        // 1. Save to Supabase DB (Truth)
        const { error } = await supabase.from('messages').insert([newMessage]);
        if (error) throw error;

        await supabase.from('chats').update({
            last_message: type === 'TEXT' ? content : `[${type}]`,
            updated_at: new Date().toISOString()
        }).eq('id', chatId);

        // 2. Trigger Firebase Notification (Real-time Signal)
        // Find the other user to notify
        const { data: chatData } = await supabase.from('chats').select('poster_id, writer_id').eq('id', chatId).single();
        if (chatData) {
            const receiverId = chatData.poster_id === senderId ? chatData.writer_id : chatData.poster_id;
            const { data: senderRes } = await supabase.from('profiles').select('handle').eq('id', senderId).single();
            const senderName = senderRes?.handle || 'AssignMate User';

            // Send signal
            notifications.send(receiverId, senderName, type === 'TEXT' ? content : 'Attachment sent', chatId);
        }

        return newMessage;
    },

    markMessagesAsRead: async (chatId: string, readerId: string) => {
        const now = new Date().toISOString();
        const { error } = await supabase.from('messages')
            .update({ read_at: now })
            .eq('chat_id', chatId)
            .neq('sender_id', readerId)
            .is('read_at', null);

        if (error) throw error;
    },

    // --- ADMIN METHODS ---
    getPendingVerifications: async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('is_verified', 'pending');
        if (error) throw error;
        return data || [];
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