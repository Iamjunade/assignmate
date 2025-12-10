import React from 'react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowRight, Shield, Zap, Users, Star } from 'lucide-react';

interface LandingProps {
    onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <div className="relative z-10 space-y-24 pb-24">
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 font-medium text-sm animate-slide-down">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        India's #1 Student Marketplace
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                        Get Your Assignments Done <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                            Faster & Better
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Connect with top-tier students and experts to outsource your workload.
                        Secure payments, verified profiles, and premium quality guaranteed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <GlassButton size="lg" onClick={onGetStarted} icon={<Zap size={20} />}>
                            Start Hiring Now
                        </GlassButton>
                        <GlassButton variant="secondary" size="lg" onClick={onGetStarted}>
                            Become a Writer
                        </GlassButton>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-200/50 dark:border-white/10 mt-12">
                        {[
                            { label: 'Active Students', value: '10k+' },
                            { label: 'Assignments Done', value: '50k+' },
                            { label: 'Success Rate', value: '99%' },
                            { label: 'Avg. Rating', value: '4.9/5' },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Why Choose AssignMate?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Experience the premium standard in student freelancing.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <GlassCard className="p-8 space-y-4" hoverEffect>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Secure Payments</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Your money is held safely in escrow until you're 100% satisfied with the work delivered.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 space-y-4" hoverEffect>
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lightning Fast</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Get matched with available writers in minutes. Most assignments are completed within 24 hours.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-8 space-y-4" hoverEffect>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <Star size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Quality</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We verify every writer's credentials. Rate and review system ensures consistent high quality.
                        </p>
                    </GlassCard>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <GlassCard variant="neon" className="p-12 text-center space-y-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Boost Your Grades?
                        </h2>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg mb-8">
                            Join thousands of students who are already using AssignMate to succeed.
                        </p>
                        <GlassButton size="lg" onClick={onGetStarted} className="bg-white text-orange-600 hover:bg-slate-100 shadow-none">
                            Get Started for Free <ArrowRight className="ml-2" size={20} />
                        </GlassButton>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 pointer-events-none" />
                </GlassCard>
            </section>
        </div>
    );
};
