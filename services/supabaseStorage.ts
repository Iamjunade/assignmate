import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase Storage] Initializing...');
console.log('[Supabase Storage] URL configured:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING!');
console.log('[Supabase Storage] Key configured:', supabaseAnonKey ? 'Yes (hidden)' : 'MISSING!');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Storage] ❌ Missing environment variables. File uploads will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');


// Bucket names
const BUCKETS = {
    PORTFOLIOS: 'portfolios',
    AVATARS: 'avatars',
    CHAT_FILES: 'chat-files',
    VERIFICATION: 'verification'
} as const;

/**
 * Upload a file to Supabase Storage and get the public URL
 */
async function uploadToSupabase(
    bucket: string,
    path: string,
    file: File
): Promise<string> {
    console.log(`[Supabase] Uploading to ${bucket}/${path}`);

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true // Overwrite if exists
        });

    if (error) {
        console.error('[Supabase] Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    console.log('[Supabase] Upload success. URL:', urlData.publicUrl);
    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 */
async function deleteFromSupabase(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
        console.error('[Supabase] Delete error:', error);
        throw error;
    }
}

// ============ PUBLIC API ============

export const supabaseStorage = {
    /**
     * Upload portfolio image for a user
     */
    uploadPortfolio: async (userId: string, file: File): Promise<string> => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${userId}/${fileName}`;
        return uploadToSupabase(BUCKETS.PORTFOLIOS, path, file);
    },

    /**
     * Upload avatar for a user
     */
    uploadAvatar: async (userId: string, file: File): Promise<string> => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${userId}/${fileName}`;
        return uploadToSupabase(BUCKETS.AVATARS, path, file);
    },

    /**
     * Upload file in a chat
     */
    uploadChatFile: async (chatId: string, file: File): Promise<string> => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${chatId}/${fileName}`;
        return uploadToSupabase(BUCKETS.CHAT_FILES, path, file);
    },

    /**
     * Upload verification ID card
     */
    uploadVerification: async (userId: string, file: File): Promise<string> => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${userId}/${fileName}`;
        return uploadToSupabase(BUCKETS.VERIFICATION, path, file);
    },

    /**
     * General file upload (for backwards compatibility)
     */
    uploadFile: async (file: File, path: string): Promise<string> => {
        // Determine bucket from path
        if (path.startsWith('portfolio/')) {
            const newPath = path.replace('portfolio/', '');
            return uploadToSupabase(BUCKETS.PORTFOLIOS, newPath, file);
        } else if (path.startsWith('avatars/')) {
            const newPath = path.replace('avatars/', '');
            return uploadToSupabase(BUCKETS.AVATARS, newPath, file);
        } else if (path.startsWith('chat_files/')) {
            const newPath = path.replace('chat_files/', '');
            return uploadToSupabase(BUCKETS.CHAT_FILES, newPath, file);
        } else if (path.startsWith('verification/')) {
            const newPath = path.replace('verification/', '');
            return uploadToSupabase(BUCKETS.VERIFICATION, newPath, file);
        }
        // Default to portfolios bucket
        return uploadToSupabase(BUCKETS.PORTFOLIOS, path, file);
    },

    /**
     * Delete a file by its full URL
     */
    deleteByUrl: async (url: string): Promise<void> => {
        // Extract bucket and path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/path
        const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
            const [, bucket, path] = match;
            await deleteFromSupabase(bucket, path);
        }
    }
};
