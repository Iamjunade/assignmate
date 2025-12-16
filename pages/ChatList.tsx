import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;

export const ChatList = ({ user, onSelect, selectedId }) => {
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

    const getTimeAgo = (dateStr: string) => {
        try {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return formatDistanceToNow(d, { addSuffix: true }).replace('about ', '');
        } catch { return ''; }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.other_handle?.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'unread') return chat.unread_count > 0;
        return true;
    });

    const handleSelect = (id: string) => {
        navigate(`/chats/${id}`);
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-5xl mx-auto h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold tracking-tight text-text-main">Messages</h1>
                            <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined">edit_square</span>
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-light mb-4">
                            <div className="relative group mb-4">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-secondary">search</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-3 rounded-xl bg-background border-none text-sm font-medium text-text-main placeholder-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="Search conversations..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-background text-secondary hover:bg-gray-100'}`}
                                >
                                    All Messages
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-primary text-white shadow-md' : 'bg-background text-secondary hover:bg-gray-100'}`}
                                >
                                    Unread
                                    <span className={`ml-1.5 flex size-1.5 rounded-full ${filter === 'unread' ? 'bg-white' : 'bg-primary'}`}></span>
                                </button>
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto space-y-2 bg-white rounded-3xl p-4 shadow-soft border border-border-light">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="animate-spin text-primary" />
                                </div>
                            ) : filteredChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare className="text-secondary opacity-50" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main mb-1">No messages yet</h3>
                                    <p className="text-sm text-secondary">Start a conversation with a writer or student.</p>
                                </div>
                            ) : (
                                filteredChats.map((chat, i) => {
                                    const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;

                                    return (
                                        <MotionDiv
                                            key={chat.id}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                            onClick={() => handleSelect(chat.id)}
                                            className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-background border border-transparent hover:border-border-light"
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={chat.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_handle}`}
                                                    alt={chat.other_handle}
                                                    className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm object-cover bg-white border border-border-light"
                                                />
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                    <UserPresence userId={otherId} size={10} className="border-2 border-white" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-bold truncate text-[15px] text-text-main group-hover:text-primary transition-colors">
                                                        {chat.other_handle || 'Unknown'}
                                                    </h3>
                                                    <span className="text-xs font-bold text-secondary/70">
                                                        {getTimeAgo(chat.updated_at)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-sm truncate font-medium ${chat.unread_count > 0 ? 'text-text-main' : 'text-secondary'}`}>
                                                        {chat.last_message || <span className="italic opacity-70">Start conversation...</span>}
                                                    </p>
                                                    {chat.unread_count > 0 && (
                                                        <span className="ml-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                            {chat.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};