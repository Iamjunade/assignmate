import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { Sparkles, ArrowRight, Mail, Send, CheckCircle2, BookOpen, Users, Globe } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';
import { AIProfileBuilder } from '../components/onboarding/AIProfileBuilder';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';

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
                    <GlassCard className="p-8 md:p-10 text-center border-white/40 shadow-xl">
                        <div className="size-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Mail className="text-orange-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-text-main mb-3">Verify Your Email</h1>
                        <p className="text-secondary mb-8 leading-relaxed">
                            We've sent a link to <span className="font-bold text-text-dark">{user.email}</span>. <br />
                            Please verify to continue.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleCheckVerification}
                                disabled={verifying}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-[#1b140d] font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <div className="size-5 border-2 border-[#1b140d] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                I've Verified It
                            </button>

                            <button
                                onClick={handleResendEmail}
                                className="w-full py-4 bg-white/50 hover:bg-white/80 border border-border-light text-secondary font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Resend Email
                            </button>
                        </div>

                        <p className="mt-8 text-xs text-secondary/60">
                            Check your spam folder just in case.
                        </p>
                    </GlassCard>
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-8 font-display relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <GlassCard className="p-8 md:p-10 shadow-2xl border-white/50 backdrop-blur-xl">
                    <div className="text-center mb-10">
                        {/* Logo or graphical element */}
                        <div className="mx-auto mb-6 size-16 bg-gradient-to-tr from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 transform hover:rotate-6 transition-transform">
                            <span className="material-symbols-outlined text-white text-4xl">school</span>
                        </div>
                        <h1 className="text-3xl font-black text-text-main mb-2 tracking-tight">Welcome to AssignMate</h1>
                        <p className="text-secondary font-medium">Let's personalize your learning experience.</p>
                    </div>

                    {!aiData && (
                        <button
                            type="button"
                            onClick={() => setShowAI(true)}
                            className="w-full mb-8 group relative overflow-hidden p-[2px] rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Sparkles className="text-indigo-600" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                        Build your learning profile with AI
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium">Auto-generate bio & tags</p>
                                </div>
                                <ArrowRight className="ml-auto text-indigo-400 group-hover:translate-x-1 transition-transform" size={18} />
                            </div>
                        </button>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                <GlassInput
                                    placeholder="John Doe"
                                    value={form.fullName}
                                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    required
                                    icon="person"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 ml-1">Handle</label>
                                <GlassInput
                                    placeholder="username"
                                    value={form.handle}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                        setForm({ ...form, handle: val });
                                    }}
                                    required
                                    icon="alternate_email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 ml-1">University</label>
                            <CollegeAutocomplete
                                value={form.school}
                                onChange={(val) => setForm({ ...form, school: val })}
                                placeholder="Search your college..."
                                className="w-full"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Bio</label>
                                {aiData && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">✨ AI Generated</span>}
                            </div>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">edit_note</span>
                                <textarea
                                    className={`w-full h-28 pl-12 pr-4 py-3 rounded-2xl border bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 text-sm font-medium text-text-main placeholder-gray-400 transition-all outline-none resize-none ${aiData
                                        ? 'border-indigo-200 ring-4 ring-indigo-500/5'
                                        : 'border-border-light focus:border-primary'
                                        }`}
                                    placeholder="What subjects are you interested in learning or discussing? How do you usually collaborate with peers?"
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-3 ml-1">How do you want to participate?</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Option 1: Learn */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('learn')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'learn'
                                        ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.02]'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    {selectedGoal === 'learn' && (
                                        <div className="absolute top-2 right-2 text-orange-500">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'learn' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'learn' ? 'text-orange-900' : 'text-gray-500'}`}>
                                        Learn & Discuss Topics
                                    </span>
                                </button>

                                {/* Option 2: Collaborate */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('collaborate')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'collaborate'
                                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    {selectedGoal === 'collaborate' && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'collaborate' ? 'bg-primary text-[#1b140d]' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'collaborate' ? 'text-[#1b140d]' : 'text-gray-500'}`}>
                                        Collaborate on Projects
                                    </span>
                                </button>

                                {/* Option 3: Communities */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedGoal('community')}
                                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 ${selectedGoal === 'community'
                                        ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    {selectedGoal === 'community' && (
                                        <div className="absolute top-2 right-2 text-blue-500">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-full ${selectedGoal === 'community' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Globe size={20} />
                                    </div>
                                    <span className={`text-xs font-bold text-center ${selectedGoal === 'community' ? 'text-blue-900' : 'text-gray-500'}`}>
                                        Join Study Communities
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-4 bg-primary hover:bg-primary/90 text-[#1b140d] text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <div className="size-5 border-2 border-[#1b140d] border-t-transparent rounded-full animate-spin"></div> : 'Complete Profile'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};
