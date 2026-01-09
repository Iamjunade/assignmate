import React, { useEffect, useState, useRef } from 'react';
import { dbService as db } from '../services/firestoreService';
import { presence } from '../services/firebase';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { OfferModal, OfferData } from '../components/chat/OfferModal';
import { OfferCard } from '../components/chat/OfferCard';
import { Avatar } from '../components/ui/Avatar';
import { format, isToday, isYesterday } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

export const ChatRoom = ({ user, chatId, onBack }: { user: any, chatId: string, onBack?: () => void }) => {
    const navigate = useNavigate();
    const { error: toastError, success: toastSuccess } = useToast();
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [chatDetails, setChatDetails] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const endRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch Chat Details on mount
    useEffect(() => {
        db.getChatDetails(chatId, user.id)
            .then((details) => {
                if (details) {
                    setChatDetails(details);
                } else {
                    toastError("Failed to load chat. Please try again.");
                    navigate('/chats');
                }
            })
            .catch((err) => {
                console.error('[ChatRoom] Error loading chat details:', err);
                toastError("Failed to load chat.");
                navigate('/chats');
            });
    }, [chatId, user.id, navigate, toastError]);

    // Fetch connections and recent chats for sidebar
    useEffect(() => {
        db.getMyConnections(user.id).then(conns => {
            const processed = conns.map((c: any) => {
                const other = c.participants?.find((p: any) => (p.id || p) !== user.id);
                return other?.id ? other : { id: other, ...other };
            }).filter(Boolean);
            setConnections(processed);
        });

        db.getChats(user.id).then(chats => {
            setRecentChats(chats.slice(0, 10));
        });
    }, [user.id]);

    // 2. Message Subscription - runs once on mount
    useEffect(() => {
        // Initial fetch
        db.getMessages(chatId).then(msgs => {
            setMessages(msgs);
            db.markMessagesAsRead(chatId, user.id);
        }).catch(console.error);

        // Realtime listener
        const unsubscribe = db.listenToMessages(chatId, (newMessages) => {
            setMessages(newMessages);
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.sender_id !== user.id) {
                db.markMessagesAsRead(chatId, user.id);
            }
        });

        return () => unsubscribe();
    }, [chatId, user.id]);

    // 3. Typing Indicators - depends on chatDetails
    useEffect(() => {
        if (!chatDetails || !chatId || chatId.includes('[object')) return;

        const otherId = user.id === chatDetails.poster_id ? chatDetails.writer_id : chatDetails.poster_id;
        const unsubTyping = presence.listenToTypingStatus(chatId, otherId, (typing) => {
            setIsOtherTyping(typing);
        });

        return () => {
            if (unsubTyping) unsubTyping();
        };
    }, [chatId, user.id, chatDetails]);

    // Scroll to bottom
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOtherTyping]);

    // Handle Typing Status
    useEffect(() => {
        if (!chatDetails || !chatId || chatId.includes('[object')) return;
        const timeout = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                presence.setTypingStatus(chatId, user.id, false);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [text, isTyping, chatId, user.id, chatDetails]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        if (!isTyping && chatId && !chatId.includes('[object')) {
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
        if (chatId && !chatId.includes('[object')) {
            presence.setTypingStatus(chatId, user.id, false);
        }

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const sentMsg = await db.sendMessage(chatId, user.id, contentToSend);
        setMessages(prev => {
            if (prev.some(m => m.id === sentMsg.id)) return prev;
            return [...prev, sentMsg];
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // 10MB Limit
            if (file.size > 10 * 1024 * 1024) {
                toastError("File too large. Max 10MB.");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setIsUploading(true);

            try {
                // 1. Upload to Storage
                const url = await db.uploadChatFile(chatId, file);

                // 2. Determine Type
                const type = file.type.startsWith('image/') ? 'image' : 'file';

                // 3. Save File Metadata to Firestore
                await db.saveChatFile(chatId, {
                    name: file.name,
                    url: url,
                    type: file.type,
                    size: file.size,
                    uploadedBy: user.id
                });

                // 4. Send Message (Pass extra params for file)
                await db.sendMessage(chatId, user.id, file.name, type, url);

            } catch (error: any) {
                console.error("File upload failed", error);
                toastError(error.message || "Failed to upload file");
            } finally {
                setIsUploading(false);
                // Reset input so you can select the same file again if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const onEmojiClick = (emojiObject: any) => {
        setText((prev) => prev + emojiObject.emoji);
        // Don't close picker automatically to allow multiple emoji selection or keep it open
        // setShowEmojiPicker(false); 
    };

    const handleCreateOffer = () => {
        setShowOfferModal(true);
        setShowActions(false);
    };

    const handleSubmitOffer = async (offerData: OfferData) => {
        try {
            const sentOffer = await db.sendOffer(chatId, user.id, user.full_name || user.handle, {
                subject: offerData.subject,
                title: offerData.title,
                description: offerData.description,
                pages: offerData.pages,
                deadline: offerData.deadline,
                budget: offerData.budget
            });
            setMessages(prev => [...prev, sentOffer]);
            toastSuccess("Offer sent successfully!");
        } catch (error: any) {
            console.error("Failed to send offer", error);
            toastError(error.message || "Failed to send offer");
            throw error;
        }
    };

    const handleAcceptOffer = async (messageId: string) => {
        try {
            await db.respondToOffer(chatId, messageId, user.id, 'accepted');
            toastSuccess("Offer accepted! Project started.");
        } catch (error: any) {
            console.error("Failed to accept offer", error);
            toastError(error.message || "Failed to accept offer");
        }
    };

    const handleRejectOffer = async (messageId: string) => {
        try {
            await db.respondToOffer(chatId, messageId, user.id, 'rejected');
            toastSuccess("Offer declined.");
        } catch (error: any) {
            console.error("Failed to reject offer", error);
            toastError(error.message || "Failed to decline offer");
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDateDivider = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isToday(d)) return 'Today';
        if (isYesterday(d)) return 'Yesterday';
        return format(d, 'EEEE, MMM d');
    };

    const handleBack = () => {
        if (onBack) onBack();
        else navigate('/chats');
    };

    const handleSwitchChat = async (otherId: string) => {
        // Find existing chat or create new one
        const existingChatId = await db.findExistingChat(user.id, otherId);
        if (existingChatId) {
            navigate(`/chats/${existingChatId}`);
        } else {
            const newChat = await db.createChat(null, user.id, otherId);
            navigate(`/chats/${newChat.id}`);
        }
    };

    // Group messages by date
    const getDateKey = (dateStr: string) => {
        const d = new Date(dateStr);
        return format(d, 'yyyy-MM-dd');
    };

    const messagesByDate: { [key: string]: any[] } = {};
    messages.forEach(m => {
        const key = getDateKey(m.created_at);
        if (!messagesByDate[key]) messagesByDate[key] = [];
        messagesByDate[key].push(m);
    });

    return (
        <div className="bg-background text-text-dark antialiased h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />
            <main className="flex-1 flex h-full overflow-hidden relative">
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white lg:rounded-tl-3xl shadow-soft lg:border-l lg:border-t border-border-subtle">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border-subtle bg-white z-10 sticky top-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button onClick={handleBack} className="p-2 -ml-2 text-text-muted hover:bg-secondary-bg rounded-full transition-colors">
                                    <ArrowLeft size={22} />
                                </button>
                                {chatDetails ? (
                                    <div className="flex items-center gap-3 md:gap-4">
                                        {/* Clickable avatar - navigates to profile */}
                                        <div
                                            className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => navigate(`/profile/${chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id}`)}
                                        >
                                            <Avatar
                                                src={chatDetails.other_avatar}
                                                alt={chatDetails.other_handle}
                                                className="size-11 md:size-12 rounded-full shadow-sm border-2 border-white"
                                                fallback={chatDetails.other_handle?.charAt(0)}
                                            />
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} size={12} showLastSeen={false} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {/* Clickable handle - navigates to profile */}
                                                <h2
                                                    className="text-base md:text-lg font-bold text-text-dark leading-tight cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => navigate(`/profile/${chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id}`)}
                                                >
                                                    {chatDetails.other_handle}
                                                </h2>
                                                {chatDetails.other_verified === 'verified' && (
                                                    <span className="material-symbols-outlined text-blue-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-medium text-text-muted flex items-center gap-1">
                                                {isOtherTyping ? (
                                                    <span className="text-primary font-bold flex items-center gap-1">
                                                        <span className="flex gap-0.5">
                                                            <span className="size-1.5 bg-primary rounded-full animate-bounce"></span>
                                                            <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                                            <span className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                        </span>
                                                        typing...
                                                    </span>
                                                ) : (
                                                    <UserPresence userId={chatDetails.poster_id === user.id ? chatDetails.writer_id : chatDetails.poster_id} showLastSeen={true} />
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 bg-secondary-bg rounded-full animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-secondary-bg rounded animate-pulse"></div>
                                            <div className="h-3 w-24 bg-secondary-bg rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCreateOffer}
                                    className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white text-sm font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                                    Create Offer
                                </button>
                                <button
                                    onClick={handleCreateOffer}
                                    className="md:hidden size-10 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white flex items-center justify-center shadow-md"
                                >
                                    <span className="material-symbols-outlined">receipt_long</span>
                                </button>
                                <button
                                    onClick={() => navigate(`/profile/${chatDetails?.poster_id === user.id ? chatDetails?.writer_id : chatDetails?.poster_id}`)}
                                    className="size-10 rounded-xl bg-secondary-bg text-text-muted hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <span className="material-symbols-outlined">person</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col bg-gradient-to-b from-secondary-bg/50 to-white">
                            {/* Security Banner */}
                            <div className="flex justify-center w-full mb-6">
                                <div className="bg-white border border-border-subtle px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-green-500 text-base">verified_user</span>
                                    <p className="text-[11px] text-text-muted font-medium">Messages are encrypted & payments held securely</p>
                                </div>
                            </div>

                            {/* Messages grouped by date */}
                            {Object.entries(messagesByDate).map(([dateKey, dayMessages]) => (
                                <div key={dateKey}>
                                    {/* Date Divider */}
                                    <div className="flex items-center justify-center my-3">
                                        <div className="bg-white border border-border-subtle px-4 py-1.5 rounded-full">
                                            <span className="text-xs font-bold text-text-muted">{formatDateDivider(dayMessages[0].created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Messages for this day */}
                                    <div className="space-y-1">
                                        {dayMessages.map((m, i) => {
                                            const isMe = m.sender_id === user.id;
                                            const isOffer = m.type === 'offer';
                                            const isSystem = m.type === 'system' || m.content?.includes("**OFFER PROPOSAL**");

                                            // Check if previous message was from same person (for grouping)
                                            const prevMsg = i > 0 ? dayMessages[i - 1] : null;
                                            const isSequence = prevMsg && prevMsg.sender_id === m.sender_id && !prevMsg.type?.includes('offer') && !prevMsg.type?.includes('system');

                                            // Render Offer Card
                                            if (isOffer && m.offer) {
                                                return (
                                                    <OfferCard
                                                        key={m.id || i}
                                                        offer={{
                                                            id: m.id,
                                                            subject: m.offer.subject,
                                                            title: m.offer.title,
                                                            description: m.offer.description,
                                                            pages: m.offer.pages,
                                                            deadline: m.offer.deadline,
                                                            budget: m.offer.budget,
                                                            status: m.offer.status || 'pending',
                                                            senderId: m.sender_id,
                                                            senderName: m.sender_name
                                                        }}
                                                        isOwn={isMe}
                                                        onAccept={() => handleAcceptOffer(m.id)}
                                                        onReject={() => handleRejectOffer(m.id)}
                                                        timestamp={m.created_at}
                                                    />
                                                );
                                            }

                                            // Render System Message
                                            if (isSystem) {
                                                return (
                                                    <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id || i} className="flex justify-center my-4">
                                                        <div className={`px-4 py-2 rounded-2xl text-center max-w-sm shadow-sm ${m.text?.includes('✅') ? 'bg-green-50 border border-green-100' : m.text?.includes('❌') ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}>
                                                            <p className={`text-sm font-medium ${m.text?.includes('✅') ? 'text-green-700' : m.text?.includes('❌') ? 'text-red-600' : 'text-blue-700'}`}>{m.text || m.content}</p>
                                                        </div>
                                                    </MotionDiv>
                                                )
                                            }

                                            return (
                                                <MotionDiv
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={m.id || `${dateKey}-${i}`}
                                                    className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? '' : 'mt-2'}`}
                                                >
                                                    <div className={`flex flex-col gap-0.5 max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            {!isMe && (
                                                                <div className="size-7 shrink-0 mb-1">
                                                                    {!isSequence && (
                                                                        <Avatar
                                                                            src={chatDetails?.other_avatar}
                                                                            alt={chatDetails?.other_handle}
                                                                            className="size-7 rounded-full"
                                                                            fallback={chatDetails?.other_handle?.charAt(0)}
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe
                                                                ? 'bg-gradient-to-br from-primary to-orange-500 text-white rounded-2xl rounded-br-md'
                                                                : 'bg-white text-text-dark rounded-2xl rounded-bl-md border border-border-subtle'
                                                                }`}>

                                                                {/* Dynamic Rendering based on Message Type */}
                                                                {m.type === 'image' ? (
                                                                    <div className="space-y-1">
                                                                        <img
                                                                            src={m.fileUrl}
                                                                            alt="attachment"
                                                                            className="rounded-xl max-h-60 w-auto object-cover border border-white/20 cursor-pointer"
                                                                            onClick={() => window.open(m.fileUrl, '_blank')}
                                                                        />
                                                                    </div>
                                                                ) : m.type === 'file' ? (
                                                                    <a
                                                                        href={m.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 ${isMe ? 'text-white hover:text-white/80' : 'text-primary hover:text-primary/80'}`}
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">attach_file</span>
                                                                        <span className="underline">{m.text}</span>
                                                                    </a>
                                                                ) : (
                                                                    <p className="text-sm">{m.text || m.content}</p>
                                                                )}

                                                            </div>
                                                        </div>

                                                        {!isSequence && (
                                                            <span className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${isMe ? 'text-text-muted mr-1' : 'text-text-muted ml-9'}`}>
                                                                {formatTime(m.created_at)}
                                                                {isMe && (
                                                                    <span className={`material-symbols-outlined text-xs ${m.readBy && m.readBy.length > 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                                                        {m.readBy && m.readBy.length > 1 ? 'done_all' : 'check'}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </MotionDiv>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            <AnimatePresence>
                                {isOtherTyping && (
                                    <MotionDiv
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex items-center gap-2 ml-9 mb-4"
                                    >
                                        <div className="bg-white px-4 py-3 rounded-2xl border border-border-subtle flex items-center gap-1">
                                            <span className="size-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                            <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        </div>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                            <div ref={endRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 md:p-4 bg-white border-t border-border-subtle z-20">
                            <form
                                onSubmit={send}
                                className="relative bg-secondary-bg rounded-2xl border border-border-subtle focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                                    onChange={handleFileSelect}
                                />

                                {/* Text Input */}
                                <div className="px-4 py-3">
                                    <textarea
                                        ref={textareaRef}
                                        className="w-full bg-transparent border-none p-0 text-text-dark placeholder-text-muted focus:ring-0 resize-none max-h-32 text-[15px] leading-relaxed outline-none"
                                        placeholder="Type a message..."
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

                                {/* Action Bar */}
                                <div className="flex items-center justify-between px-3 py-2 border-t border-border-subtle/50">
                                    {/* Left Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="size-9 rounded-lg text-text-muted hover:text-primary hover:bg-white flex items-center justify-center transition-all disabled:opacity-50"
                                            title="Attach file"
                                        >
                                            {isUploading ? (
                                                <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                                            ) : (
                                                <Paperclip size={18} />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.accept = 'image/*';
                                                    fileInputRef.current.click();
                                                    setTimeout(() => {
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z';
                                                        }
                                                    }, 100);
                                                }
                                            }}
                                            className="size-9 rounded-lg text-text-muted hover:text-primary hover:bg-white flex items-center justify-center transition-all"
                                            title="Send image"
                                        >
                                            <span className="material-symbols-outlined text-lg">image</span>
                                        </button>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className={`size-9 rounded-lg hover:text-primary hover:bg-white flex items-center justify-center transition-all ${showEmojiPicker ? 'text-primary bg-white shadow-sm' : 'text-text-muted'}`}
                                                title="Emoji"
                                            >
                                                <span className="material-symbols-outlined text-lg">mood</span>
                                            </button>

                                            {/* Emoji Picker Popover */}
                                            {showEmojiPicker && (
                                                <div className="absolute bottom-12 left-0 shadow-xl rounded-2xl z-50">
                                                    <div
                                                        className="fixed inset-0 z-40"
                                                        onClick={() => setShowEmojiPicker(false)}
                                                    ></div>
                                                    <div className="relative z-50">
                                                        <EmojiPicker
                                                            onEmojiClick={onEmojiClick}
                                                            width={300}
                                                            height={400}
                                                            searchDisabled={false}
                                                            previewConfig={{ showPreview: false }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Send Button */}
                                    {text.trim() ? (
                                        <MotionButton
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            className="h-9 px-5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                                        >
                                            <span>Send</span>
                                            <span className="material-symbols-outlined text-base">send</span>
                                        </MotionButton>
                                    ) : (
                                        <button
                                            type="button"
                                            className="h-9 px-5 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center gap-2 cursor-not-allowed"
                                            disabled
                                        >
                                            <span>Send</span>
                                            <span className="material-symbols-outlined text-base">send</span>
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Connections for Quick Switching */}
                <aside className="hidden xl:flex flex-col w-72 h-full bg-white border-l border-border-subtle">
                    <div className="p-4 border-b border-border-subtle">
                        <h3 className="font-bold text-text-dark flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            Quick Switch
                        </h3>
                        <p className="text-xs text-text-muted mt-1">Tap to switch conversation</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Recent Chats */}
                        {recentChats.length > 0 && (
                            <div className="p-3">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide px-2 mb-2">Recent Chats</p>
                                <div className="space-y-1">
                                    {recentChats.map((chat) => {
                                        const isActive = chat.id === chatId;
                                        const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;
                                        return (
                                            <button
                                                key={chat.id}
                                                onClick={() => navigate(`/chats/${chat.id}`)}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary-bg'}`}
                                            >
                                                <div className="relative">
                                                    <Avatar
                                                        src={chat.other_avatar}
                                                        alt={chat.other_handle}
                                                        className="size-10 rounded-full"
                                                        fallback={chat.other_handle?.charAt(0)}
                                                    />
                                                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                        <UserPresence userId={otherId} size={8} showLastSeen={false} />
                                                    </div>
                                                    {chat.unread_count > 0 && (
                                                        <div className="absolute -top-1 -left-1 size-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                            {chat.unread_count}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-text-dark'}`}>
                                                        {chat.other_handle}
                                                    </p>
                                                    <p className="text-[11px] text-text-muted truncate">
                                                        {chat.last_message || 'No messages yet'}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Connections */}
                        {connections.length > 0 && (
                            <div className="p-3 border-t border-border-subtle">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide px-2 mb-2">Your Connections</p>
                                <div className="space-y-1">
                                    {connections.filter(c => c && c.id).map((conn) => (
                                        <button
                                            key={conn.id}
                                            onClick={() => handleSwitchChat(conn.id)}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary-bg transition-all"
                                        >
                                            <div className="relative">
                                                <Avatar
                                                    src={conn.avatar_url}
                                                    alt={conn.handle}
                                                    className="size-10 rounded-full"
                                                    fallback={conn.handle?.charAt(0) || conn.full_name?.charAt(0)}
                                                />
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                    <UserPresence userId={conn.id} size={8} showLastSeen={false} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-bold text-text-dark truncate">
                                                    {conn.handle || conn.full_name}
                                                </p>
                                                <p className="text-[11px] text-text-muted truncate">
                                                    {conn.school || 'Connection'}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-text-muted text-lg">chat</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {connections.length === 0 && recentChats.length === 0 && (
                            <div className="p-6 text-center">
                                <div className="size-12 bg-secondary-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-text-muted">person_search</span>
                                </div>
                                <p className="text-sm text-text-muted">No connections yet</p>
                                <button
                                    onClick={() => navigate('/writers')}
                                    className="mt-3 text-sm text-primary font-bold hover:underline"
                                >
                                    Find Peers
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* Offer Modal */}
            <OfferModal
                isOpen={showOfferModal}
                onClose={() => setShowOfferModal(false)}
                onSubmit={handleSubmitOffer}
                recipientName={chatDetails?.other_handle}
            />
        </div>
    );
};