import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Users } from 'lucide-react';

export const CommunityGuidelines: React.FC = () => {
    return (
        <GlassLayout>
            <div className="max-w-4xl mx-auto py-20 px-6 sm:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <Users size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Community Guidelines</h1>
                    <p className="mt-4 text-slate-500 text-lg">Help us maintain a positive environment</p>
                </div>

                <div className="prose prose-slate prose-lg max-w-none bg-white/50 backdrop-blur-xl border border-white/40 p-8 sm:p-12 rounded-[2.5rem] shadow-glass">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Be Respectful</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Treat all members with kindness and respect. Harassment, hate speech, or bullying of any kind will not be tolerated and will result in immediate suspension.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Academic Integrity</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Collaborate responsibly. Do not use the platform to cheat, plagiarize, or violate your institution's academic honesty policy. AssignMate is for learning and networking.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Keep it Professional</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Maintain a professional tone in your interactions. Your profile and posts should be appropriate for a student networking community.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. No Spam or Promotion</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Avoid excessive promotion, spamming, or commercial solicitations that aren't related to the platform's core purpose of academic collaboration.
                        </p>
                    </section>
                </div>
            </div>
        </GlassLayout>
    );
};
