import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Loader2, GraduationCap, User, AtSign, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

// Common tags for students
const SUGGESTED_TAGS = [
    'Programming', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Engineering', 'Business', 'Economics', 'Psychology',
    'Data Science', 'Machine Learning', 'Web Development', 'Mobile Apps',
    'Design', 'Writing', 'Research', 'Statistics', 'Finance', 'Marketing'
];

export const Onboarding = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();

    const [formData, setFormData] = useState({
        full_name: '',
        handle: '',
        school: '',
        bio: '',
        tags: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Pre-fill form with existing user data
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                handle: user.handle || '',
                school: user.school || '',
                bio: user.bio || '',
                tags: user.tags || []
            });
        }
    }, [user]);

    // Redirect if profile is already complete
    useEffect(() => {
        if (user && !user.is_incomplete) {
            navigate('/feed', { replace: true });
        }
    }, [user, navigate]);

    const handleTagToggle = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : prev.tags.length < 5 ? [...prev.tags, tag] : prev.tags
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
            toastError("Please enter your full name (at least 2 characters)");
            return;
        }
        if (!formData.handle.trim() || formData.handle.trim().length < 3) {
            toastError("Please enter a username (at least 3 characters)");
            return;
        }
        if (!formData.school.trim()) {
            toastError("Please enter your school/university");
            return;
        }

        setLoading(true);
        try {
            // Save profile data
            await db.updateProfile(user!.id, {
                full_name: formData.full_name.trim(),
                handle: formData.handle.trim().toLowerCase().replace(/\s+/g, '_'),
                school: formData.school.trim(),
                bio: formData.bio.trim(),
                tags: formData.tags,
                is_incomplete: false,
                onboarded_at: new Date().toISOString()
            });

            success("Profile completed! Welcome to AssignMate 🎉");

            // Refresh profile and navigate
            if (refreshProfile) await refreshProfile();
            navigate('/feed', { replace: true });

        } catch (err: any) {
            console.error("Onboarding error:", err);
            toastError(err.message || "Failed to save profile. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="size-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <Sparkles className="size-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-text-dark mb-2">Complete Your Profile</h1>
                    <p className="text-text-muted">Let's set up your profile to connect with peers</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all ${s <= step ? 'w-12 bg-primary' : 'w-8 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
                    {step === 1 && (
                        <>
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2 flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="e.g., Rahul Kumar"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-text-dark font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2 flex items-center gap-2">
                                    <AtSign className="size-4 text-primary" />
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.handle}
                                    onChange={(e) => setFormData({ ...formData, handle: e.target.value.replace(/\s+/g, '_') })}
                                    placeholder="e.g., rahul_kumar"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-text-dark font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1">This will be your unique identifier on AssignMate</p>
                            </div>

                            {/* School */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2 flex items-center gap-2">
                                    <GraduationCap className="size-4 text-primary" />
                                    School / University <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                    placeholder="e.g., IIT Bombay, Delhi University"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-text-dark font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!formData.full_name.trim() || !formData.handle.trim() || !formData.school.trim()}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="size-5" />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2 flex items-center gap-2">
                                    <BookOpen className="size-4 text-primary" />
                                    Bio (Optional)
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell others about yourself, your interests, what you're studying..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-text-dark font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Your Interests (Select up to 5)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.tags.includes(tag)
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                {formData.tags.length > 0 && (
                                    <p className="text-xs text-text-muted mt-2">
                                        Selected: {formData.tags.join(', ')}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3.5 rounded-xl bg-gray-100 text-text-muted font-bold hover:bg-gray-200 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Complete Setup
                                            <Sparkles className="size-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {/* Skip Option */}
                <p className="text-center text-sm text-text-muted mt-6">
                    Want to skip for now?{' '}
                    <button
                        onClick={async () => {
                            if (!user) return;
                            setLoading(true);
                            await db.updateProfile(user.id, { is_incomplete: false });
                            if (refreshProfile) await refreshProfile();
                            navigate('/feed', { replace: true });
                        }}
                        className="text-primary font-bold hover:underline"
                    >
                        Continue to Dashboard
                    </button>
                </p>
            </div>
        </div>
    );
};
