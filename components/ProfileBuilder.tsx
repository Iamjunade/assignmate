import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { dbService as db } from '../services/firestoreService'; // Assuming dbService is the named export
import { getAuth } from 'firebase/auth'; // Import getAuth directly
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Loader2, Send, Bot, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

interface ProfileData {
    strengths: string[];
    weaknesses: string[];
    interests: string[];
    collaboration_styles: string[];
    project_experience: any[];
    experience_level: string;
    bio_summary: string;
}

export const ProfileBuilder = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        const initChat = async () => {
            if (messages.length === 0) {
                setLoading(true);
                try {
                    const auth = getAuth();
                    const token = await auth.currentUser?.getIdToken() || '';
                    const response = await fetch('/api/onboarding', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ history: [] })
                    });
                    const text = await response.text();
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error("Failed to parse init chat:", text);
                        return;
                    }
                    if (data?.reply) {
                        setMessages([{ role: 'ai', text: data.reply }]);
                    }
                } catch (error) {
                    console.error("Failed to start chat:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        if (user) initChat();
    }, [user]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading || !user) return;

        const userText = inputValue;
        setInputValue('');
        const newHistory = [...messages, { role: 'user', text: userText }];
        setMessages(prev => [...prev, { role: 'user', text: userText }]); // Optimistic update
        setLoading(true);

        try {
            const apiHistory = newHistory.map(m => ({
                role: m.role,
                text: m.text
            }));

            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken() || '';
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    history: apiHistory,
                    message: userText
                })
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse JSON response:", text.substring(0, 200));
                throw new Error(`Server Error: ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error(result.error || `Server Error: ${response.statusText}`);
            }

            const { reply, isComplete: done, profileData: data } = result;

            setMessages(prev => [...prev, { role: 'ai', text: reply }]);

            if (done && data) {
                setIsComplete(true);
                setProfileData(data);
            }

        } catch (error: any) {
            console.error("Chat error:", error);
            // Display specific error if available from the backend response
            const errorMessage = error.message || "I'm having a bit of trouble connecting to my brain. Could you try saying that again?";
            setMessages(prev => [...prev, { role: 'ai', text: `Error: ${errorMessage}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !profileData) return;
        setLoading(true);
        try {
            await db.updateProfile(user.id, {
                ...profileData,
                is_incomplete: false,
                bio: profileData.bio_summary || ''
            });
            navigate('/feed');
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (isComplete && profileData) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Profile Ready!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Here's what I gathered about you.</p>
                </div>

                <GlassCard className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Summary</h3>
                        <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                            {profileData.bio_summary}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-bold text-orange-500 mb-2">Strengths</h4>
                            <div className="flex flex-wrap gap-2">
                                {profileData.strengths.map((s, i) => (
                                    <span key={i} className="px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-100 dark:border-orange-500/20">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-500 mb-2">Interests</h4>
                            <div className="flex flex-wrap gap-2">
                                {profileData.interests.map((s, i) => (
                                    <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-500/20">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="flex justify-center pt-4">
                    <GlassButton
                        variant="primary"
                        size="lg"
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full md:w-auto min-w-[200px]"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Looks Good, Let's Go!
                    </GlassButton>
                </div>
            </div>
        );
    }

    return (
        <GlassCard className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col p-0 overflow-hidden shadow-2xl border-slate-200/50 dark:border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Profile Builder</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini AI</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                                    max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-white/5'
                                    }
                                `}
                            >
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-white/5 flex gap-1 items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative flex items-center gap-2"
                >
                    <input
                        className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="Type your answer..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || loading}
                        className="p-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Send size={20} className={loading ? 'opacity-0' : 'opacity-100'} />
                        {loading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin w-5 h-5" /></div>}
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                        AI can make mistakes. Please review your profile.
                    </p>
                </div>
            </div>
        </GlassCard>
    );
};
