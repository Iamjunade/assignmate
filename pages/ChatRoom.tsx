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
            textareaRef.current.style.height = `${Math.min(scrollHeight, 128)}px`;
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
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e1db] dark:border-neutral-800 bg-white/80 dark:bg-[#1a120b]/80 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={22} />
                    </button>
                    {chatDetails ? (
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={chatDetails.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails.other_handle}`}
                                    className="bg-center bg-no-repeat bg-cover rounded-full size-11 shadow-sm object-cover bg-neutral-100"
                                    alt={chatDetails.other_handle}
                                />
                                <div className="absolute bottom-0 right-0 block size-3 rounded-full ring-2 ring-white dark:ring-[#1a120b] bg-white dark:bg-[#1a120b] overflow-hidden">
                                    <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} size={12} showLastSeen={false} className="w-full h-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">{chatDetails.other_handle}</h2>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                                        <span className="material-symbols-outlined text-[12px]">verified</span> Verified Peer
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                    Response time: &lt; 5 mins • <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} showLastSeen={true} />
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="size-11 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                                <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleCreateOffer} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        Create Offer
                    </button>
                    <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                {/* System Trust Message */}
                <div className="flex justify-center w-full my-4">
                    <div className="bg-[#fff8f0] dark:bg-[#2a221a] border border-[#f3ede7] dark:border-neutral-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[16px]">shield_lock</span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Bank-Grade Trust: Payments held in escrow until you approve the work.</p>
                    </div>
                </div>

                {messages.map((m, i) => {
                    const isMe = m.sender_id === user.id;
                    const isSystem = m.content.includes("**OFFER PROPOSAL**");

                    if (isSystem) {
                        return (
                            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex justify-center my-4">
                                <div className="bg-[#e7ffdb] border border-[#d9fdd3] p-4 rounded-2xl text-center max-w-xs shadow-sm">
                                    <Briefcase className="mx-auto text-[#008069] mb-2" size={24} />
                                    <p className="text-sm font-bold text-slate-800">Offer Proposal</p>
                                    <p className="text-xs text-slate-600 mt-1">Hire request sent.</p>
                                    <div className="text-[10px] text-slate-400 mt-2 font-medium">{formatTime(m.created_at)}</div>
                                </div>
                            </MotionDiv>
                        )
                    }

                    return (
                        <MotionDiv
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={m.id || i}
                            className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end self-end' : 'items-start'}`}
                        >
                            <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && (
                                    <div
                                        className="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0 mb-1 shadow-sm border border-white dark:border-neutral-800"
                                        style={{ backgroundImage: `url(${chatDetails?.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails?.other_handle}`})` }}
                                    ></div>
                                )}

                                <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe
                                        ? 'bg-primary text-white rounded-br-sm shadow-primary/20'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm border border-neutral-100 dark:border-neutral-700'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>

                            <span className={`text-[11px] font-medium flex items-center gap-1 ${isMe ? 'text-neutral-400 mr-1' : 'text-neutral-400 ml-12'}`}>
                                {formatTime(m.created_at)}
                                {isMe && (
                                    <span className="material-symbols-outlined text-[14px] text-neutral-300">
                                        {m.read_at ? 'done_all' : 'done'}
                                    </span>
                                )}
                            </span>
                        </MotionDiv>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 pt-2 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark z-20">
                <form
                    onSubmit={send}
                    className="bg-white dark:bg-neutral-800 p-2 pl-4 rounded-[2rem] border border-neutral-200 dark:border-neutral-700 flex items-end gap-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-lg"
                >
                    <button type="button" className="p-2 mb-1 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined rotate-45">attach_file</span>
                    </button>

                    <div className="flex-1 py-3">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-none p-0 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-0 resize-none max-h-32 text-[15px] leading-relaxed"
                            placeholder="Type a secure message..."
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

                    <button type="button" className="p-2 mb-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                    </button>

                    {text.trim() ? (
                        <MotionButton
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="size-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-opacity-90 shadow-md shadow-primary/30 transition-all active:scale-95 mb-0.5"
                        >
                            <span className="material-symbols-outlined">send</span>
                        </MotionButton>
                    ) : (
                        <button disabled className="size-11 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-400 flex items-center justify-center mb-0.5 cursor-not-allowed">
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    )}
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-neutral-400">Press Enter to send. Messages are protected by <span className="text-neutral-500 font-semibold">AssignMate Secure Guarantee™</span></p>
                </div>
            </div>
        </div>
    );
};