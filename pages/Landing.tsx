import React from 'react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowRight, Shield, Zap, Users, Star, CheckCircle2 } from 'lucide-react';

interface LandingProps {
    onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <div className="relative z-10 space-y-32 pb-32">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wide shadow-sm animate-scale-in">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                        </span>
                        India's #1 Student Marketplace
                    </div>

                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance leading-[1.1]">
                        Get Your Work Done <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                            Faster & Better.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                        Connect with top-tier students and experts from IITs & NITs to outsource your assignments, projects, and records.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button
                            onClick={onGetStarted}
                            className="btn-primary px-8 py-4 text-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            Start Hiring Now <ArrowRight className="ml-2" size={20} />
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="btn-secondary px-8 py-4 text-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            Become a Writer
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-slate-200 dark:border-slate-800 mt-16">
                        {[
                            { label: 'Active Students', value: '10k+' },
                            { label: 'Assignments Done', value: '50k+' },
                            { label: 'Success Rate', value: '99%' },
                            { label: 'Avg. Rating', value: '4.9/5' },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                        Why Choose AssignMate?
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Experience the premium standard in student freelancing.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <GlassCard className="p-10 space-y-6" hoverEffect>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Payments</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Your money is held safely in escrow until you're 100% satisfied with the work delivered. No scams, no worries.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-10 space-y-6" hoverEffect>
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 shadow-sm">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Lightning Fast</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Get matched with available writers in minutes. Most assignments are completed within 24 hours.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-10 space-y-6" hoverEffect>
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                            <Star size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Top Quality</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            We verify every writer's credentials. Rate and review system ensures consistent high quality work.
                        </p>
                    </GlassCard>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-orange-600 shadow-2xl shadow-orange-500/40">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 opacity-90"></div>

                    <div className="relative z-10 p-12 md:p-20 text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Boost Your Grades?
                        </h2>
                        <p className="text-orange-50 max-w-2xl mx-auto text-xl font-medium mb-8">
                            Join thousands of students who are already using AssignMate to succeed.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-orange-600 hover:bg-slate-50 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
                        >
                            Get Started for Free <ArrowRight className="ml-2" size={22} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
