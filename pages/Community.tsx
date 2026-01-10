import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService as db } from '../services/firestoreService';
import { Post } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { Avatar } from '../components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Trash2, Globe, Building2, Send, Loader2 } from 'lucide-react';

type FilterType = 'all' | 'campus' | 'global';

export const Community: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');

    // New post form
    const [newContent, setNewContent] = useState('');
    const [newVisibility, setNewVisibility] = useState<'campus' | 'global'>('global');

    // Load posts
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        db.getPosts(user.id, user.school || '', filter)
            .then(setPosts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user, filter]);

    const handleCreatePost = async () => {
        if (!user || !newContent.trim()) return;
        setPosting(true);
        try {
            const newPost = await db.createPost(user, newContent.trim(), newVisibility);
            setPosts(prev => [newPost as Post, ...prev]);
            setNewContent('');
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!user) return;
        try {
            if (isLiked) {
                await db.unlikePost(postId, user.id);
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, likes: p.likes.filter(id => id !== user.id) } : p
                ));
            } else {
                await db.likePost(postId, user.id);
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, likes: [...p.likes, user.id] } : p
                ));
            }
        } catch (error) {
            console.error('Like action failed:', error);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!user) return;
        try {
            await db.deletePost(postId, user.id);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-3xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-text-dark">Community</h1>
                                <p className="text-text-muted text-sm">Share thoughts, ask for help, connect with peers</p>
                            </div>
                        </div>

                        {/* Create Post Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex gap-4">
                                <Avatar
                                    src={user?.avatar_url}
                                    alt={user?.full_name}
                                    className="size-10 rounded-full shrink-0"
                                    fallback={user?.full_name?.charAt(0)}
                                />
                                <div className="flex-1 space-y-4">
                                    <textarea
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        placeholder="What's on your mind? Ask for help, share tips..."
                                        className="w-full resize-none border-0 bg-transparent text-text-dark placeholder:text-text-muted focus:outline-none text-sm min-h-[80px]"
                                        rows={3}
                                    />

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        {/* Visibility Toggle */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-text-muted">Visible to:</span>
                                            <div className="flex rounded-lg overflow-hidden border border-gray-200">
                                                <button
                                                    onClick={() => setNewVisibility('campus')}
                                                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${newVisibility === 'campus'
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-50 text-text-muted hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Building2 className="size-3" />
                                                    Campus
                                                </button>
                                                <button
                                                    onClick={() => setNewVisibility('global')}
                                                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${newVisibility === 'global'
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-50 text-text-muted hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Globe className="size-3" />
                                                    Global
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreatePost}
                                            disabled={posting || !newContent.trim()}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm flex items-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {posting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            {(['all', 'campus', 'global'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white text-text-muted hover:bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    {f === 'all' ? '🌐 All' : f === 'campus' ? '🏫 My Campus' : '🌍 Global'}
                                </button>
                            ))}
                        </div>

                        {/* Posts Feed */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="size-8 animate-spin text-primary" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📝</span>
                                </div>
                                <h3 className="text-lg font-bold text-text-dark mb-2">No posts yet</h3>
                                <p className="text-text-muted text-sm">Be the first to share something with the community!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => {
                                    const isLiked = post.likes?.includes(user?.id || '');
                                    const isOwn = post.author_id === user?.id;

                                    return (
                                        <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                                            <div className="flex gap-4">
                                                <Avatar
                                                    src={post.author_avatar}
                                                    alt={post.author_handle}
                                                    className="size-10 rounded-full shrink-0"
                                                    fallback={post.author_handle?.charAt(0)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-text-dark">{post.author_handle}</span>
                                                        <span className="text-xs text-text-muted">•</span>
                                                        <span className="text-xs text-text-muted">{post.author_school}</span>
                                                        <span className="text-xs text-text-muted">•</span>
                                                        <span className="text-xs text-text-muted">
                                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                        </span>
                                                        {post.visibility === 'campus' && (
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                                                                Campus
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-text-dark text-sm leading-relaxed whitespace-pre-wrap mb-4">
                                                        {post.content}
                                                    </p>

                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleLike(post.id, isLiked)}
                                                            className={`flex items-center gap-1.5 text-sm ${isLiked ? 'text-red-500' : 'text-text-muted hover:text-red-500'
                                                                } transition-colors`}
                                                        >
                                                            <Heart className={`size-4 ${isLiked ? 'fill-red-500' : ''}`} />
                                                            <span>{post.likes?.length || 0}</span>
                                                        </button>

                                                        {isOwn && (
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
