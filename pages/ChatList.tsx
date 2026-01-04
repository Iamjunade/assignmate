import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '../components/dashboard/MobileNav';
import { Avatar } from '../components/ui/Avatar';

const MotionDiv = motion.div as any;

export const ChatList = ({ user, onSelect, selectedId }: { user: any, onSelect?: any, selectedId?: any }) => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'active'
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadChats = () => {
            db.getChats(user.id).then(data => {
                setChats(data);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to load chats:", err);
                setLoading(false);
            });
        };

        // Initial Load
        loadChats();

        // Realtime Subscription
        const unsubscribe = db.listenToChats(user.id, (data) => {
            setChats(data);
            setLoading(false);
        });

        return () => { unsubscribe(); };
    }, [user.id]);

    const formatTimestamp = (dateStr: string) => {
        try {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';

            if (isToday(d)) {
                return format(d, 'h:mm a');
            } else if (isYesterday(d)) {
                return 'Yesterday';
            } else {
                return format(d, 'MMM d');
            }
        } catch { return ''; }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.other_handle?.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'unread') return chat.unread_count > 0;
        return true;
    });

    const unreadCount = chats.filter(c => c.unread_count > 0).length;

    const handleSelect = (id: string) => {
        navigate(`/chats/${id}`);
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-4xl mx-auto h-full flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-dark">Messages</h1>
                                <p className="text-sm text-text-muted mt-1">
                                    {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                                    {unreadCount > 0 && <span className="text-primary font-bold ml-1">• {unreadCount} unread</span>}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/writers')}
                                className="h-11 px-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                <span className="hidden sm:inline">New Chat</span>
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="bg-white rounded-2xl p-4 shadow-card border border-border-subtle mb-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-text-muted">search</span>
                                    </div>
                                    <input
                                        className="block w-full pl-11 pr-4 py-3 rounded-xl bg-secondary-bg border-none text-sm font-medium text-text-dark placeholder-text-muted focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                                        placeholder="Search conversations..."
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === 'all'
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-secondary-bg text-text-muted hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-1.5">inbox</span>
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('unread')}
                                        className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === 'unread'
                                                ? 'bg-primary text-white shadow-md'
                                                : 'bg-secondary-bg text-text-muted hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg mr-1.5">mark_email_unread</span>
                                        Unread
                                        {unreadCount > 0 && (
                                            <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-primary text-white'
                                                }`}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-card border border-border-subtle">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-64">
                                    <Loader2 className="animate-spin text-primary mb-3" size={32} />
                                    <p className="text-text-muted text-sm">Loading conversations...</p>
                                </div>
                            ) : filteredChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="size-20 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                                        <MessageSquare className="text-primary" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-dark mb-2">
                                        {filter === 'unread' ? 'All caught up!' : 'No messages yet'}
                                    </h3>
                                    <p className="text-text-muted mb-6 max-w-sm">
                                        {filter === 'unread'
                                            ? "You've read all your messages. Great job staying on top of things!"
                                            : "Start a conversation with a writer to get help with your assignments."
                                        }
                                    </p>
                                    {filter !== 'unread' && (
                                        <button
                                            onClick={() => navigate('/writers')}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                        >
                                            Find Writers
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    <AnimatePresence>
                                        {filteredChats.map((chat, i) => {
                                            const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;
                                            const hasUnread = chat.unread_count > 0;
                                            const isOffer = chat.last_message?.includes('📋');

                                            return (
                                                <MotionDiv
                                                    key={chat.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -50 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onClick={() => handleSelect(chat.id)}
                                                    className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-secondary-bg ${hasUnread ? 'bg-primary/5' : ''
                                                        }`}
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative shrink-0">
                                                        <Avatar
                                                            src={chat.other_avatar}
                                                            alt={chat.other_handle}
                                                            className="size-14 rounded-full shadow-sm border-2 border-white"
                                                            fallback={chat.other_handle?.charAt(0)}
                                                        />
                                                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                            <UserPresence userId={otherId} size={12} className="border border-white" />
                                                        </div>
                                                        {hasUnread && (
                                                            <div className="absolute -top-1 -left-1 size-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                                                                {chat.unread_count}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <h3 className={`font-bold truncate text-base group-hover:text-primary transition-colors ${hasUnread ? 'text-text-dark' : 'text-text-dark'
                                                                    }`}>
                                                                    {chat.other_handle || 'Unknown'}
                                                                </h3>
                                                                {chat.other_verified === 'verified' && (
                                                                    <span className="material-symbols-outlined text-blue-500 text-sm shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-medium shrink-0 ml-2 ${hasUnread ? 'text-primary font-bold' : 'text-text-muted'
                                                                }`}>
                                                                {formatTimestamp(chat.updated_at)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {isOffer && (
                                                                <span className="shrink-0 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                                                                    OFFER
                                                                </span>
                                                            )}
                                                            <p className={`text-sm truncate ${hasUnread ? 'text-text-dark font-medium' : 'text-text-muted'
                                                                }`}>
                                                                {chat.last_message || <span className="italic opacity-70">Start conversation...</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Arrow */}
                                                    <span className="material-symbols-outlined text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                                        chevron_right
                                                    </span>
                                                </MotionDiv>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};