import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Footer } from '../components/layout/Footer';
import { Lock, Eye, Server, ShieldCheck, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <GlassLayout>
            <div className="min-h-screen flex flex-col">
                <div className="flex-grow max-w-5xl mx-auto py-20 px-6 sm:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center size-20 bg-primary/10 text-primary rounded-3xl mb-8 shadow-inner shadow-primary/20">
                            <Lock size={40} />
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-6">Privacy Policy</h1>
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <ShieldCheck size={16} />
                            <p className="text-lg">Last updated: January 1, 2026</p>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 sm:p-16 shadow-xl">
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                            <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-12">
                                Your privacy is paramount. AssignMate is designed to protect your identity while enabling transparent collaboration. This policy outlines how we handle your data.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">1</span>
                                Information We Collect
                            </h3>
                            <p>To provide our services, we collect:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                                <li><strong>Identity Data:</strong> Name, university email (.edu), and profile picture (via Google Auth or upload).</li>
                                <li><strong>Academic Verification:</strong> Student ID cards or transcripts used for verification (encrypted and stored strictly for verification purposes).</li>
                                <li><strong>Usage Data:</strong> Chats, posts, and interaction history on the platform.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">2</span>
                                How We Use Your Data
                            </h3>
                            <p>We use your data strictly to:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                                <li>Verify your student status (Campus Verified badge).</li>
                                <li>Match you with relevant peers and mentors.</li>
                                <li>Process secure payments and escrow.</li>
                                <li>Maintain platform safety and prevent fraud.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">3</span>
                                Data Protection & Sharing
                            </h3>
                            <p>
                                <strong>We do not sell your personal data.</strong> We share data only with:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                                <li><strong>Service Providers:</strong> Cloud hosting (Firebase), payment processors (Razorpay/Stripe).</li>
                                <li><strong>Legal Obligations:</strong> Compliance with law enforcement if required.</li>
                            </ul>
                            <p className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm">
                                <Server className="inline-block w-4 h-4 mr-2 text-primary" />
                                Your data is encrypted in transit (TLS) and at rest. Verification documents are isolated with restricted access.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">4</span>
                                Your Rights
                            </h3>
                            <p>
                                You have the right to access, correct, or delete your personal data. You can export your data or request account deletion directly from your Profile settings.
                            </p>

                            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10">
                                <h4 className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white">
                                    <Mail className="text-primary" size={20} />
                                    Privacy Contact
                                </h4>
                                <p className="text-sm">
                                    For data requests or privacy concerns, contact our Data Protection Officer at <a href="mailto:privacy@assignmate.com" className="text-primary hover:underline">privacy@assignmate.com</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </GlassLayout>
    );
};
