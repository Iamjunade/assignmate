import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, ArrowRight, GraduationCap, Check, PenTool, Search, Phone, MessageCircle } from 'lucide-react';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';

const MotionDiv = motion.div as any;

export const Auth = () => {
    const { user, login, register, loginWithGoogle, completeGoogleSignup, resetPassword } = useAuth();
    const { error, success, info } = useToast();
    const [isReg, setIsReg] = useState(false);
    const [load, setLoad] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', handle: '', school: '' });

    // Role State (false = Student/Hirer, true = Writer/Earner)
    const [isWriter, setIsWriter] = useState(false);

    // For incomplete google users
    const [completionForm, setCompletionForm] = useState({ handle: '', school: '' });

    // Pre-fill if we have partial data
    useEffect(() => {
        if (user?.is_incomplete) {
            setCompletionForm(prev => ({ ...prev, handle: user.handle || '' }));
        }
    }, [user]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoad(true);

        if (form.password.length < 6) {
            error("Password must be at least 6 characters long.");
            setLoad(false);
            return;
        }

        try {
            let res;
            if (isReg) {
                if (!form.school) {
                    error("Please select your college/university from the list.");
                    setLoad(false);
                    return;
                }
                if (!form.handle) {
                    error("Please choose a handle.");
                    setLoad(false);
                    return;
                }
                res = await register(form.email, form.password, form.handle, form.school, isWriter);
            } else {
                res = await login(form.email, form.password);
            }

            if (res?.error) {
                let msg = res.error.message || "Authentication failed";
                if (msg.includes('auth/email-already-in-use') || msg.includes('already registered')) {
                    msg = "This email is already associated with an account. Please login.";
                } else if (msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found') || msg.includes('invalid-credential')) {
                    msg = "Invalid email or password. Please try again.";
                } else if (msg.includes('auth/weak-password')) {
                    msg = "Password is too weak. Please use a stronger password.";
                }
    const handleGoogle = async () => {
        setLoad(true);
        const { data, error: gError } = await loginWithGoogle();
        if (gError) {
            error(gError.message || "Google Login Failed");
            setLoad(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!form.email) {
            error("Please enter your email address first.");
            return;
        }
        try {
            await resetPassword(form.email);
            info("Password reset email sent. Check your inbox.");
        } catch (e: any) {
            error(e.message || "Failed to send reset email.");
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!completionForm.school) {
            error("Please select your college.");
            return;
        }
        if (!completionForm.handle || completionForm.handle.length < 3) {
            error("Handle must be at least 3 characters.");
            return;
        }
        setLoad(true);
        try {
            await completeGoogleSignup(completionForm.handle, completionForm.school, isWriter);
            success("Profile Setup Complete! Welcome.");
        } catch (e: any) {
            console.error("Profile Setup Error:", e);
            error(e.message || "Failed to complete profile setup.");
        } finally {
            setLoad(false);
        }
    };

    // View for completing profile (Google Signups)
    if (user?.is_incomplete) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Setup your Profile</h2>
                        <p className="text-slate-500 dark:text-slate-400">Claim your unique handle to join the community.</p>
                    </div>

                    <form onSubmit={handleCompleteProfile} className="space-y-6">
                        <GlassInput
                            label="Choose a Handle"
                            placeholder="username"
                            value={completionForm.handle}
                            onChange={e => {
                                const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                setCompletionForm({ ...completionForm, handle: val });
                            }}
                            icon={<span className="font-bold text-sm">@</span>}
                        />
                        <p className="text-[10px] text-slate-400 ml-1 -mt-4">Only letters, numbers, and underscores.</p>

                        <div className="space-y-2 relative z-50">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Select your University</label>
                            <CollegeAutocomplete
                                value={completionForm.school}
                                onChange={(val) => setCompletionForm({ ...completionForm, school: val })}
                                placeholder="Search your college"
                                className="w-full"
                                inputClassName="input-clean pl-10"
                                icon={<GraduationCap className="absolute left-3.5 top-2.5 text-slate-400" size={18} />}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">What is your goal?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    onClick={() => setIsWriter(false)}
                                    className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${!isWriter ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Search className={!isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                    <span className={`text-xs font-bold mt-2 ${!isWriter ? 'text-orange-600' : 'text-slate-500'}`}>Find Help</span>
                                </div>
                                <div
                                    onClick={() => setIsWriter(true)}
                                    className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${isWriter ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <PenTool className={isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                    <span className={`text-xs font-bold mt-2 ${isWriter ? 'text-orange-600' : 'text-slate-500'}`}>Earn Money</span>
                                </div>
                            </div>
                        </div>

                        <GlassButton type="submit" isLoading={load} className="w-full">
                            Finish Setup <ArrowRight size={18} className="ml-2" />
                        </GlassButton>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full bg-white dark:bg-slate-950">
            {/* Left: Form */}
            <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-24 flex flex-col justify-center relative z-10">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="text-5xl mb-6 lg:hidden">📚</div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">{isReg ? 'Create Account' : 'Welcome Back'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{isReg ? 'Join the community of ambitious students.' : 'Please enter your details to sign in.'}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <button
                            onClick={handleGoogle}
                            disabled={load}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            Continue with Google
                        </button>

                        <button
                            onClick={() => info("Mobile Login coming soon!")}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <Phone size={20} className="text-slate-400" />
                            Continue with Mobile Number
                        </button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5 relative">
                        {isReg && (
                            <>
                                <GlassInput
                                    label="Choose a Handle"
                                    placeholder="username"
                                    value={form.handle}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                        setForm({ ...form, handle: val });
                                    }}
                                    icon={<span className="font-bold text-sm">@</span>}
                                />

                                <div className="space-y-2 relative z-50">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">University</label>
                                    <CollegeAutocomplete
                                        value={form.school}
                                        onChange={(val) => setForm({ ...form, school: val })}
                                        placeholder="Select your college"
                                        className="w-full"
                                        inputClassName="input-clean pl-10"
                                        icon={<GraduationCap className="absolute left-3.5 top-2.5 text-slate-400" size={18} />}
                                    />
                                </div>
                            </>
                        )}

                        <GlassInput
                            label="Email Address"
                            type="email"
                            placeholder="name@college.edu.in"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            icon={<Mail size={18} />}
                        />

                        <div>
                            <GlassInput
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                icon={<Lock size={18} />}
                            />
                            {!isReg && (
                                <div className="flex justify-end mt-2">
                                    <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-orange-600 hover:text-orange-700">
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        {isReg && (
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">What is your goal?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setIsWriter(false)}
                                        className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${!isWriter ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <Search className={!isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                        <span className={`text-xs font-bold mt-2 ${!isWriter ? 'text-orange-600' : 'text-slate-500'}`}>Find Help</span>
                                    </div>
                                    <div
                                        onClick={() => setIsWriter(true)}
                                        className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${isWriter ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <PenTool className={isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                        <span className={`text-xs font-bold mt-2 ${isWriter ? 'text-orange-600' : 'text-slate-500'}`}>Earn Money</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <GlassButton type="submit" isLoading={load} className="w-full mt-4 shadow-orange-500/20">
                            {isReg ? 'Create Free Account' : 'Sign In'} <ArrowRight size={18} className="ml-2" />
                        </GlassButton>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            {isReg ? "Already a member? " : "New to AssignMate? "}
                            <button onClick={() => setIsReg(!isReg)} className="text-orange-600 font-bold hover:underline">
                                {isReg ? "Sign In" : "Create Account"}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200 transition-colors">
                        <MessageCircle size={14} /> Need Help? Chat on WhatsApp
                    </a>
                </div>
            </div>


            {/* Right: Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 to-amber-600 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                {/* Floating Elements */}
                <MotionDiv
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-20 right-20 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl"
                >
                    <Check className="text-white w-8 h-8" />
                </MotionDiv>
                <MotionDiv
                    animate={{ y: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-32 left-20 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <div className="flex gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="w-32 h-2 bg-white/20 rounded mb-2"></div>
                    <div className="w-20 h-2 bg-white/20 rounded"></div>
                </MotionDiv>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="mb-8 inline-block bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm">
                        🚀 Trusted by 10,000+ Students
                    </div>
                    <h2 className="text-6xl font-extrabold mb-6 leading-tight">
                        Your Campus <br /> <span className="text-orange-100">Marketplace.</span>
                    </h2>
                    <p className="text-xl text-orange-50 leading-relaxed font-medium opacity-90">
                        Connect with peers from IITs, NITs, and top universities to get help with assignments, records, and projects.
                    </p>
                </div>
            </div>
        </div >
    );
};