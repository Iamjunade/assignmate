import { supabase } from './supabaseService';
import { db } from './supabaseService'; // Reuse existing db helpers if needed
import { notifications } from './firebase';

export const adminApi = {
    // --- ANALYTICS ---
    getSystemStats: async () => {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: chatsCount } = await supabase.from('chats').select('*', { count: 'exact', head: true });
        const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
        const { count: connectionsCount } = await supabase.from('connections').select('*', { count: 'exact', head: true });

        // Mock daily stats for now as we don't have a separate analytics table
        // In a real app, we'd query a 'daily_stats' table or aggregate by created_at
        return {
            totalUsers: usersCount || 0,
            totalChats: chatsCount || 0,
            totalMessages: messagesCount || 0,
            totalConnections: connectionsCount || 0,
            activeUsers: Math.floor((usersCount || 0) * 0.4), // Mock active users
        };
    },

    // --- USERS ---
    getAllUsers: async () => {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    deleteUser: async (userId: string) => {
        // Cascade delete is handled by database or manual cleanup script logic
        // For now, we'll try direct delete, assuming RLS allows it for admin
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
    },

    suspendUser: async (userId: string, isSuspended: boolean) => {
        // Assuming we add a 'suspended' column or use metadata
        // For now, we'll toggle a tag or just mock it if column doesn't exist
        // Let's assume we add a 'status' field to profiles in the future.
        // For this demo, we'll just return success.
        console.log(`User ${userId} suspension status: ${isSuspended}`);
        return true;
    },

    // --- CHATS ---
    getAllChats: async () => {
        const { data, error } = await supabase
            .from('chats')
            .select(`*, poster:poster_id(handle, avatar_url), writer:writer_id(handle, avatar_url)`)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    getChatMessages: async (chatId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    deleteMessage: async (messageId: string) => {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);
        if (error) throw error;
    },

    // --- CONNECTIONS ---
    getAllConnections: async () => {
        const { data, error } = await supabase
            .from('connections')
            .select(`*, requester:requester_id(handle), receiver:receiver_id(handle)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // --- NOTIFICATIONS ---
    sendSystemNotification: async (userId: string, message: string) => {
        // Use the existing notification service
        // We need to fetch the user's handle to use as 'senderName' or use 'System'
        await notifications.send(userId, 'System Admin', message, 'system_alert', 'system');
    },

    broadcastNotification: async (message: string) => {
        // Fetch all users and send
        // CAUTION: This is expensive client-side. 
        // In production, use a Cloud Function.
        const users = await adminApi.getAllUsers();
        for (const user of users) {
            await notifications.send(user.id, 'System Announcement', message, 'broadcast', 'system');
        }
    }
};
