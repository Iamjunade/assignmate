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

    if (loading && chats.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-orange-500" />
            </div>
        );
    }

    if (chats.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-orange-300" size={32} />
            </div>
            <h3 className="font-bold text-slate-800">No connections yet</h3>
            <p className="text-sm text-slate-500 mt-1">Browse the feed and find peers to help with your assignments!</p>
        </div>
    );

    return (
        <div className="p-4 space-y-2 h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 px-2 text-slate-800 flex items-center justify-between">
                <span>Connections</span>
                <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{chats.length}</span>
            </h2>
            {chats.map((chat, i) => {
                const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;

                return (
                    <MotionDiv
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => onSelect(chat.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden group ${selectedId === chat.id ? 'bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-200' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-orange-100'}`}
                    >
                        {/* Active Indicator Strip */}
                        {selectedId === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}

                        <div className="relative shrink-0">
                            <img
                                src={chat.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_handle}`}
                                alt={chat.other_handle}
                                className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200"
                            />
                            <div className="absolute bottom-0 right-0">
                                <UserPresence userId={otherId} className="border-2 border-white rounded-full" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className={`font-bold text-sm truncate ${selectedId === chat.id ? 'text-slate-900' : 'text-slate-700'}`}>{chat.other_handle || 'Unknown'}</h3>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 font-medium">{getTimeAgo(chat.updated_at)}</span>
                            </div>
                            <p className={`text-xs truncate ${selectedId === chat.id ? 'text-orange-800 font-medium' : 'text-slate-500'}`}>
                                {chat.last_message || <span className="italic text-slate-400">Start the conversation...</span>}
                            </p>
                        </div>
                    </MotionDiv>
                );
            })}
        </div>
    );
};