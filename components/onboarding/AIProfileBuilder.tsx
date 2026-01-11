import React, { useState, useEffect, useRef } from 'react';
import { ai } from '../../services/ai';
import { Send, Loader2, Sparkles, User, Bot } from 'lucide-react';

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

                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText || "Profile generated!" }] }]);

                    // Construct a bio summary
                    const bio = `I am interested in ${profileData.interests?.join(', ') || 'various subjects'}. My strengths include ${profileData.strengths?.join(', ') || 'learning new things'}.`;

                    // Delay slightly then complete
                    setTimeout(() => {
                        onComplete(profileData, bio);
                    }, 2000);
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
        <div className="flex flex-col h-full bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <Sparkles size={24} className="text-yellow-300" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">AI Profile Assistant</h2>
                        <p className="text-white/80 text-xs">Building your academic persona...</p>
                    </div>
                </div>
                <button onClick={onSkip} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                    Skip to Form
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50" ref={scrollRef}>
                {messages.length === 0 && loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 size={16} className="animate-spin" /> initializing assistant...
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                                }`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && messages.length > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <form
                    onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSend(input); }}
                    className="relative"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full pl-4 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm font-medium transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
