import React, { useState, useEffect, useRef } from 'react';
import { ai } from '../../services/ai';
import { Send, Loader2, Sparkles, User, Bot, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface AIProfileBuilderProps {
    onComplete: (data: any, bioSummary: string) => void;
    onSkip: () => void;
}

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const AIProfileBuilder: React.FC<AIProfileBuilderProps> = ({ onComplete, onSkip }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    // Initial greeting
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Send empty message to trigger the System Prompt's first greeting
            handleSend("Hello");
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string) => {
        const newHistory = [...messages, { role: 'user' as const, parts: [{ text }] }];
        // Don't show the initial "Hello" trigger if it's the very first one
        if (messages.length > 0) {
            setMessages(newHistory);
        }
        setInput('');
        setLoading(true);

        try {
            const response = await ai.onboardingChat(newHistory);
            let aiText = response.text;

            // Check for JSON object in the response (Final Step)
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[0];
                    const profileData = JSON.parse(jsonStr);

                    // Clean the text to remove the JSON for display
                    aiText = aiText.replace(jsonStr, '').trim();

                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText || "Profile generated successfully! Getting things ready..." }] }]);

                    // Construct a bio summary
                    const bio = `I am interested in ${profileData.interests?.join(', ') || 'various subjects'}. My strengths include ${profileData.strengths?.join(', ') || 'learning new things'}.`;

                    // Delay slightly then complete
                    setTimeout(() => {
                        onComplete(profileData, bio);
                    }, 2500);
                    return;
                } catch (e) {
                    console.error("Failed to parse AI JSON", e);
                }
            }

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="flex flex-col h-full overflow-hidden shadow-2xl !p-0 border-white/50 dark:border-white/10 relative">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles size={20} className="text-white fill-white/20" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs text-gray-500 font-medium">Online</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSkip}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500"
                    title="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-[#1a120b]/50 scroll-smooth" ref={scrollRef}>
                {messages.length === 0 && loading && (
                    <div className="flex justify-center items-center h-full opacity-0 animate-fade-in">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                            <p className="text-sm font-medium">Initializing Profile AI...</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`flex items-end gap-2.5 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            {msg.role !== 'user' && (
                                <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
                                    <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700'
                                }`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && messages.length > 0 && (
                    <div className="flex justify-start w-full animate-fade-in">
                        <div className="flex items-end gap-2.5">
                            <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
                                <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <form
                    onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSend(input); }}
                    className="relative max-w-3xl mx-auto"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full pl-5 pr-14 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                    >
                        <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
                    </button>
                </form>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-gray-400 font-medium">Powered by Gemini AI • Responses may vary</p>
                </div>
            </div>
        </GlassCard>
    );
};
