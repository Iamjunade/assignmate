import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dbService as db } from '../services/firestoreService';
import { CommunityPost } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { Avatar } from '../components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Send, Loader2, Image as ImageIcon } from 'lucide-react';

export const Community: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [viewMode, setViewMode] = useState<'global' | 'campus'>('global');

    useEffect(() => {
        fetchPosts();
    }, [viewMode]); // Re-fetch when view mode changes

    const fetchPosts = async () => {
        try {
            setLoading(true); // Set loading true on re-fetch
            const collegeFilter = viewMode === 'campus' && user?.school ? user.school : undefined;
            const data = await db.getCommunityPosts(collegeFilter);
            setPosts(data as CommunityPost[]);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newPost.trim() || posting) return;

        setPosting(true);
        try {
            // Firestore explicitly forbids 'undefined' values.
            // We must ensure every field is a valid type (string or null).
            const safePostData = {
                user_id: user.id, // Auth user ID is guaranteed if user check passed
                user_handle: (user.handle || user.full_name || 'Anonymous User') ?? 'Anonymous',
                user_avatar: user.avatar_url ?? null,
                user_school: (user.school || 'Unknown University') ?? 'Unknown School',
                content: newPost.trim() ?? '',
            };

            await db.createCommunityPost(safePostData);
            setNewPost('');
            toast('Post shared successfully!', 'success');
            fetchPosts();
        } catch (error: any) {
            console.error("Failed to share post. Full error:", error);
            const errorMessage = error?.message || "Unknown error";
            toast(`Failed to share post: ${errorMessage}`, 'error');
        } finally {
            setPosting(false);
        }
    };

    const handleToggleLike = async (postId: string) => {
        if (!user) return;
        try {
            await db.toggleLikePost(postId, user.id);
            // Optimistic update
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const likes = p.likes || [];
                    const newLikes = likes.includes(user.id)
                        ? likes.filter(id => id !== user.id)
                        : [...likes, user.id];
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">Community Feed</h1>
                            <p className="text-text-muted text-sm mt-1">Share thoughts and connect with peers.</p>

                            {/* View Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl w-fit mt-4">
                                <button
                                    onClick={() => setViewMode('global')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'global' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Global
                                </button>
                                <button
                                    onClick={() => setViewMode('campus')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'campus' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    My Campus
                                </button>
                            </div>
                        </div>

                        {/* Post Creation Form */}
                        <div className="bg-white p-4 rounded-[1.5rem] border border-border-subtle shadow-card mb-8">
                            <form onSubmit={handleCreatePost}>
                                <div className="flex gap-3">
                                    <Avatar
                                        src={user?.avatar_url}
                                        alt={user?.handle}
                                        className="size-10 rounded-full"
                                        fallback={user?.handle?.charAt(0)}
                                    />
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="What's on your mind?"
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none min-h-[80px] pt-2"
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <button type="button" className="text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50">
                                        <ImageIcon size={18} />
                                        <span className="text-xs font-bold">Photo</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPost.trim() || posting}
                                        className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                    >
                                        {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Posts Feed */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-[1.5rem] border border-border-subtle">
                                <div className="size-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-text-dark">No posts yet</h3>
                                <p className="text-text-muted text-sm mt-1">Be the first to share something with the community!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white p-6 rounded-[1.5rem] border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar
                                                src={post.user_avatar}
                                                alt={post.user_handle}
                                                className="size-10 rounded-full"
                                                fallback={post.user_handle?.charAt(0)}
                                            />
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="text-sm font-bold text-text-dark">{post.user_handle}</h3>
                                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {post.user_school.split(' ')[0]}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-text-muted">
                                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-text-dark leading-relaxed whitespace-pre-wrap">
                                            {post.content}
                                        </p>

                                        <div className="mt-4 flex items-center gap-6 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleToggleLike(post.id)}
                                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${post.likes?.includes(user?.id || '') ? 'text-red-500' : 'text-text-muted hover:text-red-500'}`}
                                            >
                                                <Heart size={18} fill={post.likes?.includes(user?.id || '') ? 'currentColor' : 'none'} />
                                                {post.likes?.length || 0}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors">
                                                <MessageSquare size={18} />
                                                {post.comments_count || 0}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
