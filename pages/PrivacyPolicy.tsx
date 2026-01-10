import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Lock } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <GlassLayout>
            <div className="max-w-4xl mx-auto py-20 px-6 sm:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
                    <p className="mt-4 text-slate-500 text-lg">Last updated: January 2026</p>
                </div>

                <div className="prose prose-slate prose-lg max-w-none bg-white/50 backdrop-blur-xl border border-white/40 p-8 sm:p-12 rounded-[2.5rem] shadow-glass">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We collect information you provide directly to us when you create an account, update your profile, or communicate with other users. This may include your name, email address, school information, and profile picture.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect AssignMate and our users.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Information Sharing</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We do not share your personal information with companies, organizations, or individuals outside of AssignMate except in the following cases: with your consent, for external processing, or for legal reasons.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We work hard to protect AssignMate and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                        </p>
                    </section>
                </div>
            </div>
        </GlassLayout>
    );
};
