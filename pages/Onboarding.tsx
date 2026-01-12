import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { Search, PenTool } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';

import { AIProfileBuilder } from '../components/onboarding/AIProfileBuilder';

export const Onboarding = () => {
    const navigate = useNavigate();
    const { user, completeGoogleSignup } = useAuth();
    const { error, success } = useToast();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ fullName: '', handle: '', school: '', bio: '' });
    const [isWriter, setIsWriter] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [aiData, setAiData] = useState<any>(null); // Store AI JSON

    // Initialize form with user's existing data
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullName: user.full_name || '',
                handle: prev.handle || user.handle || ''
            }));
        }
    }, [user]);

    // Redirect if user is already complete or not logged in
    useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (isProfileComplete(user)) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleAIComplete = async (data: any, bioSummary: string) => {
        setAiData(data);
        const autoBio = bioSummary || form.bio;

        // Auto-submit with available data or defaults
        setLoading(true);
        setShowAI(false);
        try {
            // Use existing form data or defaults (backend handles empty school/handle gracefully if needed, 
            // but we passing what we have. If completely empty, backend generates defaults)
            await completeGoogleSignup(
                form.handle,
                form.school,
                isWriter,
                autoBio,
                form.fullName,
                data
            );
            success("Profile created! Redirecting...");
            // Navigation handled by useEffect
        } catch (err: any) {
            console.error("Auto-creation failed", err);
            // If failed (e.g. missing critical fields), fall back to form view
            setForm(prev => ({ ...prev, bio: autoBio }));
            error("Please complete the remaining fields.");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fullName || form.fullName.trim().length < 2) {
            error("Full name must be at least 2 characters.");
            return;
        }
        if (!form.school) {
            error("Please select your college.");
            return;
        }
        if (!form.handle || form.handle.length < 3) {
            error("Handle must be at least 3 characters.");
            return;
        }

        setLoading(true);
        try {
            await completeGoogleSignup(form.handle, form.school, isWriter, form.bio, form.fullName, aiData);
            success("Profile setup complete! Welcome.");
        } catch (err: any) {
            console.error("Profile completion error:", err);
            error(err.message || "Failed to complete profile setup.");
            setLoading(false);
        }
    };

    if (!user) return null;

    if (showAI) {
        return (
            <div className="h-screen p-4 md:p-8 bg-background-light dark:bg-[#1a120b] font-display flex items-center justify-center">
                <div className="w-full max-w-2xl h-[600px] md:h-[700px]">
                    <AIProfileBuilder onComplete={handleAIComplete} onSkip={() => setShowAI(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-[#1a120b] p-6 font-display">
            <div className="w-full max-w-md bg-white dark:bg-white/5 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 p-8 md:p-10">
                <div className="text-center mb-8">
                    <div className="size-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
                        <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1b140d] dark:text-white mb-2">Welcome!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Let's finish setting up your profile.</p>
                </div>

                {!aiData && (
                    <button
                        type="button"
                        onClick={() => setShowAI(true)}
                        className="w-full mb-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Build with AI Assistant
                    </button>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Full Name</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">person</span>
                            <input
                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                placeholder="John Doe"
                                type="text"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Choose a Handle</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                            <input
                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                placeholder="username"
                                type="text"
                                value={form.handle}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                    setForm({ ...form, handle: val });
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 relative z-50">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">University</label>
                        <CollegeAutocomplete
                            value={form.school}
                            onChange={(val) => setForm({ ...form, school: val })}
                            placeholder="Select your college"
                            className="w-full"
                            inputClassName="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                            icon={<span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">school</span>}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Bio {aiData ? '(AI Generated)' : '(Optional)'}</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">edit_note</span>
                            <textarea
                                className={`w-full h-24 pl-12 pr-4 py-3 rounded-2xl border bg-white dark:bg-white/5 focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none resize-none ${aiData ? 'border-indigo-200 ring-2 ring-indigo-50 dark:border-indigo-900' : 'border-gray-200 dark:border-white/10 focus:border-primary'}`}
                                placeholder="Tell us a bit about yourself..."
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">
                            What is your goal?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => setIsWriter(false)}
                                className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${!isWriter
                                    ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <Search className={!isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                <span className={`text-xs font-bold mt-2 ${!isWriter ? 'text-orange-600' : 'text-slate-500'}`}>
                                    Find Help
                                </span>
                            </div>
                            <div
                                onClick={() => setIsWriter(true)}
                                className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${isWriter
                                    ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <PenTool className={isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                <span className={`text-xs font-bold mt-2 ${isWriter ? 'text-orange-600' : 'text-slate-500'}`}>
                                    Earn Money
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-[#1b140d] text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Setting up...' : 'Complete Profile'} <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
                    </button>

                    {aiData && (
                        <p className="text-xs text-center text-indigo-600 font-medium">
                            ✨ AI Profile Data will be saved!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};
