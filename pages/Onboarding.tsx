import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { Search, PenTool } from 'lucide-react';

export const Onboarding = () => {
    const navigate = useNavigate();
    const { user, completeGoogleSignup } = useAuth();
    const { error, success } = useToast();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ handle: '', school: '', bio: '' });
    const [isWriter, setIsWriter] = useState(false);

    // Redirect if user is already complete or not logged in
    useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (!user.is_incomplete) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            await completeGoogleSignup(form.handle, form.school, isWriter, form.bio);
            success("Profile setup complete! Welcome.");
            // Navigation handled by useEffect when user state updates
        } catch (err: any) {
            console.error("Profile completion error:", err);
            error(err.message || "Failed to complete profile setup.");
            setLoading(false);
        }
    };

    if (!user) return null;

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

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Bio (Optional)</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">edit_note</span>
                            <textarea
                                className="w-full h-24 pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none resize-none"
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
                </form>
            </div>
        </div>
    );
};
