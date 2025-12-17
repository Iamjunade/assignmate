import React, { useEffect, useState, useRef } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Send, ArrowLeft, Briefcase, Paperclip, Smile, CheckCheck, MoreVertical, Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const ChatRoom = ({ user, chatId, onBack }: { user: any, chatId: string, onBack?: () => void }) => {
    const navigate = useNavigate();
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

    const handleBack = () => {
        if (onBack) onBack();
        else navigate('/chats');
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white lg:rounded-tl-3xl shadow-soft border-l border-t border-border-light">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-white z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBack} className="p-2 -ml-2 text-secondary hover:bg-background rounded-full transition-colors">
                                <ArrowLeft size={22} />
                            </button>
                            {chatDetails ? (
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={chatDetails.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails.other_handle}`}
                                            className="bg-center bg-no-repeat bg-cover rounded-full size-11 shadow-sm object-cover bg-background border border-border-light"
                                            alt={chatDetails.other_handle}
                                        />
                                        <div className="absolute bottom-0 right-0 block size-3 rounded-full ring-2 ring-white bg-white overflow-hidden">
                                            <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} size={12} showLastSeen={false} className="w-full h-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-text-main leading-tight">{chatDetails.other_handle}</h2>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                                <span className="material-symbols-outlined text-[12px]">verified</span> Verified Peer
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-secondary flex items-center gap-1">
                                            Response time: &lt; 5 mins • <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} showLastSeen={true} />
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="size-11 bg-background rounded-full animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-background rounded animate-pulse"></div>
                                        <div className="h-3 w-24 bg-background rounded animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleCreateOffer} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border-light text-sm font-bold text-secondary hover:bg-gray-50 transition shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                Create Offer
                            </button>
                            <button className="p-2 rounded-full hover:bg-background text-secondary transition">
                                <span className="material-symbols-outlined">more_vert</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages Stream */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-background/30">
                        {/* System Trust Message */}
                        <div className="flex justify-center w-full my-4">
                            <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-[16px]">shield_lock</span>
                                <p className="text-xs text-secondary font-medium">Bank-Grade Trust: Payments held in escrow until you approve the work.</p>
                            </div>
                        </div>

                        {messages.map((m, i) => {
                            const isMe = m.sender_id === user.id;
                            const isSystem = m.content.includes("**OFFER PROPOSAL**");

                            if (isSystem) {
                                return (
                                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="flex justify-center my-4">
                                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center max-w-xs shadow-sm">
                                            <Briefcase className="mx-auto text-green-600 mb-2" size={24} />
                                            <p className="text-sm font-bold text-green-900">Offer Proposal</p>
                                            <p className="text-xs text-green-700 mt-1">Hire request sent.</p>
                                            <div className="text-[10px] text-green-600 mt-2 font-medium">{formatTime(m.created_at)}</div>
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
                                                className="bg-center bg-no-repeat bg-cover rounded-full size-8 shrink-0 mb-1 shadow-sm border border-white"
                                                style={{ backgroundImage: `url(${chatDetails?.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails?.other_handle}`})` }}
                                            ></div>
                                        )}

                                        <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe
                                            ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20'
                                            : 'bg-white text-text-main rounded-bl-sm border border-border-light'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>

                                    <span className={`text-[11px] font-medium flex items-center gap-1 ${isMe ? 'text-secondary mr-1' : 'text-secondary ml-12'}`}>
                                        {formatTime(m.created_at)}
                                        {isMe && (
                                            <span className="material-symbols-outlined text-[14px] text-primary">
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
                    <div className="p-6 pt-2 bg-white border-t border-border-light z-20">
                        <form
                            onSubmit={send}
                            className="bg-background p-2 pl-4 rounded-[2rem] border border-border-light flex items-end gap-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                        >
                            <button type="button" className="p-2 mb-1 rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined rotate-45">attach_file</span>
                            </button>

                            <div className="flex-1 py-3">
                                <textarea
                                    ref={textareaRef}
                                    className="w-full bg-transparent border-none p-0 text-text-main placeholder-secondary focus:ring-0 resize-none max-h-32 text-[15px] leading-relaxed"
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

                            <button type="button" className="p-2 mb-1 rounded-full text-secondary hover:text-text-main transition-colors">
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
                                <button disabled className="size-11 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-0.5 cursor-not-allowed">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            )}
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-secondary">Press Enter to send. Messages are protected by <span className="text-text-main font-bold">AssignMate Secure Guarantee™</span></p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};