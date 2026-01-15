import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { Sparkles, ArrowRight, Mail, Send, CheckCircle2, BookOpen, Users, Globe } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';
import { AIProfileBuilder } from '../components/onboarding/AIProfileBuilder';

export const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshProfile, resendVerification } = useAuth();
    const { error, success } = useToast();

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [form, setForm] = useState({ fullName: '', handle: '', school: '', bio: '' });

    // Internal state for UI selection, maps to isWriter for backend
    const [selectedGoal, setSelectedGoal] = useState('learn'); // 'learn', 'collaborate', 'community'
    const [isWriter, setIsWriter] = useState(false);

    const [showAI, setShowAI] = useState(true);
    const [aiData, setAiData] = useState<any>(null); // Store AI JSON

    // Initialize form with user's existing data
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                fullName: user.full_name || '',
                handle: prev.handle || user.handle || '',
                school: prev.school || user.school || '', // Sync school from signup
                bio: prev.bio || user.bio || ''           // Sync bio from signup
            }));
        }
    }, [user]);

    // Update isWriter based on goal selection
    useEffect(() => {
        // "Collaborate" implies active contribution/writer role in original schema
        setIsWriter(selectedGoal === 'collaborate');
    }, [selectedGoal]);

    // Redirect if user is already complete or not logged in
    useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (isProfileComplete(user) && user.emailVerified) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleCheckVerification = async () => {
        setVerifying(true);
        try {
            await refreshProfile();
            success("Profile status updated.");
        } catch (e) {
            console.error("Verification check failed", e);
            error("Could not verify status using latest data.");
        } finally {
            setVerifying(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            if (resendVerification) {
                await resendVerification();
                success("Verification email sent! Check your inbox.");
            }
        } catch (e: any) {
            error("Failed to send email: " + e.message);
        }
    };

    const handleAIComplete = (data: any, bio: string) => {
        setAiData(data);
        setForm(prev => ({ ...prev, bio }));
        setShowAI(false);
        success("Profile generated from AI!");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { dbService } = await import('../services/firestoreService');

            // 1. Update Profile
            await dbService.updateProfile(user!.id, {
                full_name: form.fullName,
                handle: form.handle,
                school: form.school,
                bio: form.bio,
                is_writer: isWriter,
                ai_profile: aiData || null, // Save structured AI data if available
                is_incomplete: false // Mark as complete
            });

            // 2. Refresh Context
            await refreshProfile();

            // 3. Navigate
            success("Welcome to the community!");
            navigate('/feed');
        } catch (e: any) {
            console.error(e);
            error("Failed to save profile: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // 🛑 EMAIL VERIFICATION GATE
    if (user.email && !user.emailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6 font-display overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="p-8 md:p-10 text-center border border-white/10 shadow-xl bg-[#2c2219] rounded-3xl">
                        <div className="size-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-orange-500/20">
                            <Mail className="text-orange-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">Verify Your Email</h1>
                        <p className="text-[#E6D5B8]/80 mb-8 leading-relaxed">
                            We've sent a link to <span className="font-bold text-white">{user.email}</span>. <br />
                            Please verify to continue.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleCheckVerification}
                                disabled={verifying}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                I've Verified It
                            </button>

                            <button
                                onClick={handleResendEmail}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#E6D5B8] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Resend Email
                            </button>
                        </div>

                        <p className="mt-8 text-xs text-[#E6D5B8]/40">
                            Check your spam folder just in case.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (showAI) {
        return (
            <div className="h-screen w-full bg-background flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-4xl h-[85vh] relative z-10">
                    <AIProfileBuilder onComplete={handleAIComplete} onSkip={() => setShowAI(false)} />
                </div>
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0b09] p-4 md:p-8 font-display relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 opacity-30"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* BROWN THEME CARD */}
                <div className="p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-xl bg-[#2c2219] rounded-3xl text-left">
                    <div className="text-center mb-10">
                        <div className="mx-auto mb-6 size-16 bg-gradient-to-tr from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 transform hover:rotate-6 transition-transform">
                            <span className="material-symbols-outlined text-white text-4xl">school</span>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to AssignMate</h1>
                        <p className="text-[#E6D5B8]/60 font-medium">Let's personalize your learning experience.</p>
                    </div>

                    {!aiData && (
                        <button
                            type="button"
                            onClick={() => setShowAI(true)}
                            className="w-full mb-8 group relative overflow-hidden p-[2px] rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                            <div className="relative bg-[#221910] rounded-2xl p-4 flex items-center justify-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Sparkles className="text-indigo-400" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                        Build your learning profile with AI
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">Auto-generate bio & tags</p>
                                </div>
                                <ArrowRight className="ml-auto text-indigo-400 group-hover:translate-x-1 transition-transform" size={18} />
                            </div>
                        </button>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        required
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1.5 ml-1">Handle</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">alternate_email</span>
                                    <input
                                        type="text"
                                        placeholder="username"
                                        value={form.handle}
                                        onChange={e => {
                                            const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                            setForm({ ...form, handle: val });
                                        }}
                                        required
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1.5 ml-1">University</label>
                            {/* Passing inputClassName to override internal styles if possible, else wrap */}
                            <div className="relative">
                                {/* Assuming CollegeAutocomplete can take class names or we structure the props to propagate styles. 
                                    If it uses GlassInput internally, we might need a prop to override. 
                                    I will manually style it based on how Auth.tsx does it. 
                                */}
                                <CollegeAutocomplete
                                    value={form.school}
                                    onChange={(val) => setForm({ ...form, school: val })}
                                    placeholder="Search your college..."
                                    className="w-full"
                                    inputClassName="w-full h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
                                    icon={<span className="material-symbols-outlined absolute left-4 top-3 text-gray-500">school</span>}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-wider">Bio</label>
                                {aiData && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">✨ AI Generated</span>}
                            </div>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-4 text-gray-500 group-focus-within:text-primary transition-colors">edit_note</span>
                                <textarea
                                    className={`w-full h-28 pl-12 pr-4 py-3 rounded-xl border bg-black/20 focus:bg-black/30 text-sm font-medium text-white placeholder-white/20 transition-all outline-none resize-none ${aiData
                                        ? 'border-indigo-500/30 ring-1 ring-indigo-500/20'
                                        : 'border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50'
                                        }`}
                                    placeholder="What subjects are you interested in learning or discussing? How do you usually collaborate with peers?"
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-3 ml-1">How do you want to participate?</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Option 1: Learn */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('learn')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'learn'
                                        ? 'bg-primary/20 border-primary shadow-lg shadow-orange-500/10 scale-[1.02]'
                                        : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                        }`}
                                >
                                    {selectedGoal === 'learn' && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'learn' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'learn' ? 'text-primary' : 'text-gray-400'}`}>
                                        Learn & Discuss Topics
                                    </span>
                                </button>

                                {/* Option 2: Collaborate */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('collaborate')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'collaborate'
                                        ? 'bg-[#E6D5B8]/20 border-[#E6D5B8] shadow-lg shadow-[#E6D5B8]/10 scale-[1.02]'
                                        : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                        }`}
                                >
                                    {selectedGoal === 'collaborate' && (
                                        <div className="absolute top-2 right-2 text-[#E6D5B8]">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-black" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'collaborate' ? 'bg-[#E6D5B8] text-black' : 'bg-white/5 text-gray-500'}`}>
                                        <Users size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'collaborate' ? 'text-[#E6D5B8]' : 'text-gray-400'}`}>
                                        Collaborate on Projects
                                    </span>
                                </button>

                                {/* Option 3: Communities */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('community')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'community'
                                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]'
                                        : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                        }`}
                                >
                                    {selectedGoal === 'community' && (
                                        <div className="absolute top-2 right-2 text-blue-500">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'community' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-gray-500'}`}>
                                        <Globe size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'community' ? 'text-blue-400' : 'text-gray-400'}`}>
                                        Join Study Communities
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-4 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Complete Profile'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
