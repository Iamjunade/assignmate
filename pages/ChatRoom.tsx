import React, { useEffect, useState, useRef } from 'react';
import { dbService as db } from '../services/firestoreService';
import { presence } from '../services/firebase';
import { Send, ArrowLeft, Briefcase, Paperclip, Smile, CheckCheck, MoreVertical, Phone, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const ChatRoom = ({ user, chatId, onBack }: { user: any, chatId: string, onBack?: () => void }) => {
    const navigate = useNavigate();
    const { error: toastError } = useToast();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [chatDetails, setChatDetails] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 1. Fetch Chat Metadata
        db.getChatDetails(chatId, user.id).then(setChatDetails);

        // 2. Fetch Messages and Mark as Read
        db.getMessages(chatId).then(msgs => {
            setMessages(msgs);
            db.markMessagesAsRead(chatId, user.id);
        });

        // 3. Realtime Subscription
        const unsubscribe = db.listenToMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.sender_id !== user.id) {
                db.markMessagesAsRead(chatId, user.id);
            }
        });

        // 4. Typing Indicators
        const unsubTyping = presence.listenToTypingStatus(chatId, user.id === chatDetails?.poster_id ? chatDetails?.writer_id : chatDetails?.poster_id, (typing) => {
            setIsOtherTyping(typing);
        });

        return () => {
            unsubscribe();
            if (unsubTyping) unsubTyping();
        };
    }, [chatId, user.id, chatDetails]);

    // Scroll to bottom
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOtherTyping]);

    // Handle Typing Status
    useEffect(() => {
        if (!chatDetails) return;
        const timeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                presence.setTypingStatus(chatId, user.id, false);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [text, isTyping, chatId, user.id]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            presence.setTypingStatus(chatId, user.id, true);
        }
    };

    const send = async (e: any) => {
        e.preventDefault();
        if (!text.trim()) return;

        const contentToSend = text;
        setText('');
        setIsTyping(false);
        presence.setTypingStatus(chatId, user.id, false);

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const sentMsg = await db.sendMessage(chatId, user.id, contentToSend);
        setMessages(prev => {
            if (prev.some(m => m.id === sentMsg.id)) return prev;
            return [...prev, sentMsg];
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 10MB Limit
        if (file.size > 10 * 1024 * 1024) {
            toastError("File too large. Max 10MB.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const path = `chat_files/${chatId}/${Date.now()}_${file.name}`;
            const url = await db.uploadFile(file, path);

            // Save file metadata to database
            await db.saveChatFile(chatId, {
                name: file.name,
                url: url,
                type: file.type,
                size: file.size,
                uploadedBy: user.id
            });

            const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
            const content = type === 'IMAGE' ? url : `${file.name}|${url}`;

            const sentMsg = await db.sendMessage(chatId, user.id, content, type);
            setMessages(prev => [...prev, sentMsg]);
        } catch (error: any) {
            console.error("Upload failed", error);
            toastError(error.message || "Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCreateOffer = async () => {
        const msg = `📋 **OFFER PROPOSAL**\nI'd like to hire you for an assignment. Let's discuss the details and price.`;
        const sentMsg = await db.sendMessage(chatId, user.id, msg);
        setMessages(prev => [...prev, sentMsg]);
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
                                            {isOtherTyping ? <span className="text-primary animate-pulse font-bold">Typing...</span> : <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} showLastSeen={true} />}
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
                        <div className="flex justify-center w-full my-4">
                            <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-[16px]">shield_lock</span>
                                <p className="text-xs text-secondary font-medium">Bank-Grade Trust: Payments held in escrow until you approve the work.</p>
                            </div>
                        </div>

                        {messages.map((m, i) => {
                            const isMe = m.sender_id === user.id;
                            const isSystem = m.content.includes("**OFFER PROPOSAL**");

                            // Check if previous message was from same person (for grouping)
                            const isSequence = i > 0 && messages[i - 1].sender_id === m.sender_id && !messages[i - 1].content.includes("**OFFER PROPOSAL**");

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
                                    className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end self-end' : 'items-start'} ${isSequence ? 'mt-1' : 'mt-4'}`}
                                >
                                    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isMe && (
                                            <div className="size-8 shrink-0 mb-1">
                                                {!isSequence && (
                                                    <div
                                                        className="bg-center bg-no-repeat bg-cover rounded-full size-8 shadow-sm border border-white"
                                                        style={{ backgroundImage: `url(${chatDetails?.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatDetails?.other_handle}`})` }}
                                                    ></div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`p-4 shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe
                                            ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl'
                                            : 'bg-white text-text-main rounded-r-2xl rounded-tl-2xl border border-border-light'
                                            } ${isSequence && isMe ? 'rounded-br-md' : 'rounded-br-2xl'} ${isSequence && !isMe ? 'rounded-bl-md' : 'rounded-bl-2xl'}`}>
                                            {m.type === 'IMAGE' ? (
                                                <img src={m.content} alt="Shared" className="max-w-full rounded-lg" />
                                            ) : m.type === 'FILE' ? (
                                                <a href={m.content.split('|')[1]} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors border border-white/20">
                                                    <div className="bg-white p-2 rounded-lg">
                                                        <FileText size={24} className="text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm truncate max-w-[150px]">{m.content.split('|')[0]}</span>
                                                        <span className="text-[10px] opacity-80">Click to download</span>
                                                    </div>
                                                </a>
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                    </div>

                                    <span className={`text-[11px] font-medium flex items-center gap-1 ${isMe ? 'text-secondary mr-1' : 'text-secondary ml-12'}`}>
                                        {formatTime(m.created_at)}
                                        {isMe && (
                                            <span className={`material-symbols-outlined text-[14px] ${m.readBy && m.readBy.length > 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                                {m.readBy && m.readBy.length > 1 ? 'done_all' : 'check'}
                                            </span>
                                        )}
                                    </span>
                                </MotionDiv>
                            );
                        })}
                        {isOtherTyping && (
                            <div className="flex items-center gap-2 ml-12 mb-4">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2 bg-white border-t border-border-light z-20">
                        <form
                            onSubmit={send}
                            className="bg-background p-2 pl-4 rounded-[2rem] border border-border-light flex items-end gap-2 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 mb-1 rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>

                            <div className="flex-1 py-3">
                                <textarea
                                    ref={textareaRef}
                                    className="w-full bg-transparent border-none p-0 text-text-main placeholder-secondary focus:ring-0 resize-none max-h-32 text-[15px] leading-relaxed"
                                    placeholder="Type a secure message..."
                                    rows={1}
                                    value={text}
                                    onChange={handleTextChange}
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

                            {text.trim() || isUploading ? (
                                <MotionButton
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={isUploading}
                                    className={`size-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-opacity-90 shadow-md shadow-primary/30 transition-all active:scale-95 mb-0.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isUploading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">send</span>}
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