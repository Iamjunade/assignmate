import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import { UserPresence } from '../components/UserPresence';

const MotionDiv = motion.div as any;

export const ChatList = ({ user, onSelect, selectedId }) => {
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
        // if (filter === 'active') return chat.has_active_order; // Assuming this property exists or logic needs to be added
        return true;
    });

    if (loading && chats.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1a120b] border-r border-[#e6e1db] dark:border-neutral-800">
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Messages</h1>
                    <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined">edit_square</span>
                    </button>
                </div>
                {/* Search */}
                <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-neutral-400">search</span>
                    </div>
                    <input
                        className="block w-full pl-11 pr-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                        placeholder="Search conversations..."
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex items-center px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                    >
                        All Messages
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                    >
                        Unread
                        <span className={`ml-1.5 flex size-1.5 rounded-full ${filter === 'unread' ? 'bg-white' : 'bg-primary'}`}></span>
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'active' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                    >
                        Active Orders
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
                            <MessageSquare className="text-neutral-400" size={24} />
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">No conversations found</p>
                    </div>
                ) : (
                    filteredChats.map((chat, i) => {
                        const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;
                        const isSelected = selectedId === chat.id;

                        return (
                            <MotionDiv
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => onSelect(chat.id)}
                                className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={chat.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_handle}`}
                                        alt={chat.other_handle}
                                        className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm object-cover bg-neutral-100"
                                    />
                                    {/* Online Status Indicator could go here */}
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1a120b] rounded-full p-0.5">
                                        <UserPresence userId={otherId} size={10} className="border-2 border-white dark:border-[#1a120b]" />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-bold truncate text-[15px] ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-900 dark:text-neutral-200'}`}>
                                            {chat.other_handle || 'Unknown'}
                                        </h3>
                                        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-neutral-400'}`}>
                                            {getTimeAgo(chat.updated_at)}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate font-medium ${isSelected ? 'text-neutral-900 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                        {chat.last_message || <span className="italic opacity-70">Start conversation...</span>}
                                    </p>
                                </div>
                                {isSelected && <div className="size-2.5 rounded-full bg-primary shrink-0 ml-1"></div>}
                            </MotionDiv>
                        );
                    })
                )}
            </div>

            {/* Trust Footer in Sidebar */}
            <div className="p-4 border-t border-[#e6e1db] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    End-to-End Encrypted
                </div>
            </div>
        </div>
    );
};