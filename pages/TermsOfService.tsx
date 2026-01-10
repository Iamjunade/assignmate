import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Shield } from 'lucide-react';

export const TermsOfService: React.FC = () => {
    return (
        <GlassLayout>
            <div className="max-w-4xl mx-auto py-20 px-6 sm:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
                    <p className="mt-4 text-slate-500 text-lg">Last updated: January 2026</p>
                </div>

                <div className="prose prose-slate prose-lg max-w-none bg-white/50 backdrop-blur-xl border border-white/40 p-8 sm:p-12 rounded-[2.5rem] shadow-glass">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing and using AssignMate, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                        <p className="text-slate-600 leading-relaxed">
                            AssignMate is a peer-to-peer platform connecting students for collaboration, networking, and academic support. We provide the tools for students to connect, but we are not responsible for the content or quality of interactions between users.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Conduct</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Users are expected to maintain academic integrity and follow their respective institution's guidelines. Any use of the platform for academic dishonesty is strictly prohibited and will result in account termination.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            AssignMate shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                        </p>
                    </section>
                </div>
            </div>
        </GlassLayout>
    );
};
