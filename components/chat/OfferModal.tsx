import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (offer: OfferData) => void;
    recipientName?: string;
}

export interface OfferData {
    subject: string;
    title: string;
    description: string;
    pages: number;
    deadline: string;
    budget: number;
    currency: string;
}

export const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onSubmit, recipientName }) => {
    const [formData, setFormData] = useState<OfferData>({
        subject: '',
        title: '',
        description: '',
        pages: 1,
        deadline: '',
        budget: 500,
        currency: 'INR'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subjects = [
        'Programming',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Economics',
        'Business Studies',
        'English',
        'Psychology',
        'Engineering',
        'Computer Science',
        'Data Science',
        'Other'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject || !formData.title || !formData.deadline) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                subject: '',
                title: '',
                description: '',
                pages: 1,
                deadline: '',
                budget: 500,
                currency: 'INR'
            });
            onClose();
        } catch (error) {
            console.error('Failed to submit offer', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum date (today)
    const minDate = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-border-subtle px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold text-text-dark">Create Offer</h2>
                                <p className="text-sm text-text-muted">
                                    Send a project proposal to {recipientName || 'this writer'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-full hover:bg-secondary-bg flex items-center justify-center text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Assignment Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Research paper on Climate Change"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your assignment requirements, special instructions, formatting preferences, etc."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Pages & Deadline Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Pages */}
                                <div>
                                    <label className="block text-sm font-bold text-text-dark mb-2">
                                        Number of Pages
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, pages: Math.max(1, formData.pages - 1) })}
                                            className="size-10 rounded-xl bg-secondary-bg border border-border-subtle text-text-dark font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.pages}
                                            onChange={(e) => setFormData({ ...formData, pages: Math.max(1, parseInt(e.target.value) || 1) })}
                                            className="flex-1 px-3 py-2.5 rounded-xl border border-border-subtle bg-secondary-bg text-center text-text-dark font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, pages: formData.pages + 1 })}
                                            className="size-10 rounded-xl bg-secondary-bg border border-border-subtle text-text-dark font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="block text-sm font-bold text-text-dark mb-2">
                                        Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        min={minDate}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Your Budget (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                                    <input
                                        type="number"
                                        min="100"
                                        step="50"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: Math.max(100, parseInt(e.target.value) || 100) })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1.5">
                                    💡 This is negotiable. The writer may counter-offer.
                                </p>
                            </div>

                            {/* Summary Card */}
                            {formData.title && formData.subject && (
                                <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/20 rounded-2xl p-4">
                                    <h4 className="text-sm font-bold text-text-dark mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">preview</span>
                                        Offer Preview
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Subject</span>
                                            <span className="font-bold text-text-dark">{formData.subject}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Title</span>
                                            <span className="font-bold text-text-dark truncate max-w-[200px]">{formData.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Pages</span>
                                            <span className="font-bold text-text-dark">{formData.pages}</span>
                                        </div>
                                        {formData.deadline && (
                                            <div className="flex justify-between">
                                                <span className="text-text-muted">Deadline</span>
                                                <span className="font-bold text-text-dark">{new Date(formData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-primary/20">
                                            <span className="text-text-muted">Budget</span>
                                            <span className="font-bold text-primary text-lg">₹{formData.budget.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-border-subtle px-6 py-4 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-secondary-bg text-text-muted font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.subject || !formData.title || !formData.deadline}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        Send Offer
                                    </>
                                )}
                            </button>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};
