import React, { useEffect, useState, useRef } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Send, ArrowLeft, Briefcase, Paperclip, Smile, CheckCheck, MoreVertical, Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserPresence } from '../components/UserPresence';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const ChatRoom = ({ user, chatId, onBack }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [chatDetails, setChatDetails] = useState<any>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // 1. Fetch Chat Metadata
        db.getChatDetails(chatId, user.id).then(setChatDetails);

        // 2. Fetch Messages and Mark as Read
        db.getMessages(chatId).then(msgs => {
            setMessages(msgs);
            // Mark messages as read when entering the room
            db.markMessagesAsRead(chatId, user.id);
        });

        // 3. Realtime Subscription
        const unsubscribe = db.listenToMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            // Mark as read if the last message is not from me
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.sender_id !== user.id) {
                db.markMessagesAsRead(chatId, user.id);
            }
        });

        return () => { unsubscribe(); };
    }, [chatId, user.id]);

    // Scroll to bottom when messages change
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 96)}px`;
        }
    }, [text]);

    const send = async (e: any) => {
        e.preventDefault();
        if (!text.trim()) return;

        const contentToSend = text;
        setText('');

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const sentMsg = await db.sendMessage(chatId, user.id, contentToSend);

        setMessages(prev => {
            if (prev.some(m => m.id === sentMsg.id)) return prev;
            return [...prev, sentMsg];
        });
    };

    const handleCreateOffer = async () => {
        const msg = `📋 **OFFER PROPOSAL**\nI'd like to hire you for an assignment. Let's discuss the details and price.`;
        const sentMsg = await db.sendMessage(chatId, user.id, msg);
        setMessages(prev => [...prev, sentMsg]);
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="flex flex-col h-full md:h-screen md:max-h-[calc(100vh-2rem)] bg-[#efeae2]">

            {/* 1. Header (WhatsApp Style) */}
            <div className="px-4 py-2 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
                <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeft size={22} />
                </button>

                {chatDetails ? (
                    <div className="flex items-center gap-3 flex-1 cursor-pointer">
                        <img
                            src={chatDetails.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails.other_handle}`}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="Avatar"
                        />
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 leading-tight text-base">{chatDetails.other_handle}</h3>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                {/* Use UserPresence Component here */}
                                <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} showLastSeen={true} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex gap-3 items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                )}

                <div className="flex items-center gap-4 text-[#54656f]">
                    <button onClick={handleCreateOffer} className="hidden sm:flex items-center gap-1.5 bg-[#d9fdd3] text-[#008069] border border-[#008069]/20 px-3 py-1.5 rounded-full text-xs font-bold transition-colors hover:bg-[#c9fcc1]">
                        <Briefcase size={14} /> Hire
                    </button>
                    <button className="hidden sm:block hover:bg-slate-200 p-2 rounded-full transition-colors"><Video size={20} /></button>
                    <button className="hidden sm:block hover:bg-slate-200 p-2 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="hover:bg-slate-200 p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* 2. Messages Area (WhatsApp Doodle Background) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:400px]">
                <div className="text-center py-4 mb-2">
                    <span className="text-[10px] bg-[#fff5c4] text-slate-600 px-3 py-1.5 rounded-lg shadow-sm border border-[#ffeeb0] font-medium inline-block">
                        Messages are end-to-end encrypted. No one outside of this chat, not even AssignMate, can read or listen to them.
                    </span>
                </div>

                {messages.map((m, i) => {
                    const isMe = m.sender_id === user.id;
                    const isSystem = m.content.includes("**OFFER PROPOSAL**");

                    if (isSystem) {
                        return (
                            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex justify-center my-4">
                                <div className="bg-[#e7ffdb] border border-[#d9fdd3] p-3 rounded-lg text-center max-w-xs shadow-sm">
                                    <Briefcase className="mx-auto text-[#008069] mb-1" size={20} />
                                    <p className="text-sm font-bold text-slate-800">Offer Proposal</p>
                                    <p className="text-xs text-slate-600">Hire request sent.</p>
                                    <div className="text-[10px] text-slate-400 mt-1">{formatTime(m.created_at)}</div>
                                </div>
                            </MotionDiv>
                        )
                    }

                    return (
                        <MotionDiv
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={m.id || i}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}
                        >
                            <div className={`relative px-3 py-1.5 text-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] max-w-[80%] sm:max-w-[70%] leading-relaxed
                        ${isMe
                                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-lg rounded-tr-none'
                                    : 'bg-white text-[#111b21] rounded-lg rounded-tl-none'
                                }
                    `}>
                                {/* Tail Pseudo-elements */}
                                {isMe ? (
                                    <div className="absolute top-0 -right-2 w-2 h-3 bg-[#d9fdd3] [clip-path:polygon(0_0,0%_100%,100%_0)]"></div>
                                ) : (
                                    <div className="absolute top-0 -left-2 w-2 h-3 bg-white [clip-path:polygon(0_0,100%_100%,100%_0)]"></div>
                                )}

                                <div className="break-words whitespace-pre-wrap pr-16 min-w-[80px] pt-1">
                                    {m.content}
                                </div>

                                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                    <span className="text-[10px] text-slate-500">
                                        {formatTime(m.created_at)}
                                    </span>
                                    {isMe && (
                                        <CheckCheck size={14} className={m.read_at ? "text-[#53bdeb]" : "text-slate-400"} />
                                    )}
                                </div>
                            </div>
                        </MotionDiv>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* 3. Input Area */}
            <form onSubmit={send} className="px-2 py-2 bg-[#f0f2f5] flex items-end gap-2 z-20">
                <button type="button" className="p-2 text-[#54656f] hover:text-slate-800 transition-colors mb-1.5">
                    <Smile size={24} />
                </button>
                <button type="button" className="p-2 text-[#54656f] hover:text-slate-800 transition-colors mb-1.5">
                    <Paperclip size={22} />
                </button>

                <div className="flex-1 bg-white rounded-lg border border-transparent focus-within:border-slate-300 transition-all flex items-end px-3 py-1.5 min-h-[42px] mb-1">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent outline-none text-[15px] text-[#111b21] placeholder-slate-500 resize-none overflow-y-auto no-scrollbar max-h-24 leading-6"
                        placeholder="Type a message"
                        rows={1}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send(e);
                            }
                        }}
                    />
                </div>

                {text.trim() ? (
                    <MotionButton
                        whileTap={{ scale: 0.9 }}
                        layout
                        className="p-3 flex items-center justify-center bg-[#008069] text-white rounded-full shadow-sm mb-1"
                    >
                        <Send size={20} className="ml-0.5" />
                    </MotionButton>
                ) : (
                    <button type="button" className="p-3 text-[#54656f] hover:bg-slate-200 rounded-full transition-colors mb-1">
                        <div className="w-5 h-5 border-2 border-[#54656f] rounded-full flex items-center justify-center">
                            <div className="w-2 h-3 bg-[#54656f] rounded-sm"></div>
                        </div>
                    </button>
                )}
            </form>
        </div>
    );
};