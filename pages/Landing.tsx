import React from 'react';
import { GlassButton } from '../components/ui/GlassButton';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { ArrowRight, Shield, Zap, Users, Star, CheckCircle2, TrendingUp, Award, Clock } from 'lucide-react';

interface LandingProps {
    onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <div className="relative z-10 space-y-32 pb-32 overflow-hidden">
            {/* Premium Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Content */}
                    <div className="space-y-10 animate-fade-in-up relative z-20 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest shadow-sm animate-scale-in backdrop-blur-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            India's #1 Student Marketplace
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-[1.05]">
                            Get Work Done <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 animate-shimmer bg-[length:200%_auto]">
                                Faster & Better.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Connect with top-tier students from IITs & NITs. Outsource assignments, projects, and records with <span className="text-slate-900 dark:text-white font-bold decoration-orange-500/30 underline decoration-4 underline-offset-4">guaranteed quality</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
                            <button
                                onClick={onGetStarted}
                                className="btn-primary px-10 py-5 text-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                            >
                                Start Hiring Now <ArrowRight className="ml-2" size={22} />
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="btn-secondary px-10 py-5 text-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
                            >
                                Become a Writer
                            </button>
                        </div>

                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" size={18} /> Verified Writers
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" size={18} /> Secure Payments
                            </div>
                        </div>
                    </div>

                    {/* Right: 3D Elements / Bento Grid Preview */}
                    <div className="relative lg:h-[600px] hidden lg:block perspective-1000">
                        {/* Floating Card 1 */}
                        <div className="absolute top-10 right-10 w-72 z-20 animate-float" style={{ animationDelay: '0s' }}>
                            <SpotlightCard className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/40">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                                    <div>
                                        <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    <div className="h-2 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-bold">Completed</div>
                                    <div className="text-orange-500 font-bold">₹ 1,500</div>
                                </div>
                            </SpotlightCard>
                        </div>

                        {/* Floating Card 2 */}
                        <div className="absolute top-40 left-10 w-64 z-10 animate-float" style={{ animationDelay: '2s' }}>
                            <SpotlightCard className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/30">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><TrendingUp size={20} /></div>
                                    <span className="text-xs font-bold text-slate-400">Trending</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">98%</div>
                                <div className="text-xs text-slate-500">Success Rate</div>
                            </SpotlightCard>
                        </div>

                        {/* Floating Card 3 */}
                        <div className="absolute bottom-20 right-20 w-80 z-30 animate-float" style={{ animationDelay: '4s' }}>
                            <SpotlightCard className="p-6 bg-white dark:bg-slate-900 shadow-2xl border-orange-500/20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600"><Award size={24} /></div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Top Rated Writer</div>
                                        <div className="text-xs text-slate-500">5.0 ★★★★★</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">Fast</span>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">Reliable</span>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">Expert</span>
                                </div>
                            </SpotlightCard>
                        </div>

                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Why Choose AssignMate?
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Experience the premium standard in student freelancing.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Large Card */}
                    <SpotlightCard className="md:col-span-2 p-10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                        <div className="h-full flex flex-col justify-between relative z-10">
                            <div className="space-y-4 max-w-lg">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                                    <Shield size={28} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Bank-Grade Security</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                                    Your money is held safely in escrow until you're 100% satisfied. We use industry-standard encryption to protect your data and payments.
                                </p>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">Escrow Protection</div>
                                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">Dispute Resolution</div>
                            </div>
                        </div>
                        {/* Decorative background pattern */}
                        <div className="absolute right-0 bottom-0 opacity-5">
                            <Shield size={300} />
                        </div>
                    </SpotlightCard>

                    {/* Tall Card */}
                    <SpotlightCard className="md:row-span-2 p-10 bg-slate-900 text-white overflow-hidden relative">
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/40">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Lightning Fast</h3>
                            <p className="text-slate-300 leading-relaxed text-lg mb-8">
                                Get matched with available writers in minutes. Most assignments are completed within 24 hours.
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-orange-400" />
                                        <span className="font-bold">Avg. Match Time</span>
                                    </div>
                                    <span className="font-mono text-orange-400">2m 30s</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-green-400" />
                                        <span className="font-bold">Completion Rate</span>
                                    </div>
                                    <span className="font-mono text-green-400">99.8%</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
                    </SpotlightCard>

                    {/* Standard Card */}
                    <SpotlightCard className="p-10">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                            <Star size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Top Quality</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We verify every writer's credentials. Rate and review system ensures consistent high quality work.
                        </p>
                    </SpotlightCard>

                    {/* Standard Card */}
                    <SpotlightCard className="p-10">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6 shadow-sm">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Vast Network</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Access thousands of students from top universities across India. Find the perfect match for your subject.
                        </p>
                    </SpotlightCard>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl shadow-orange-500/20 group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10 p-12 md:p-24 text-center space-y-10">
                        <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                            Ready to Boost Your Grades?
                        </h2>
                        <p className="text-slate-300 max-w-2xl mx-auto text-xl font-medium">
                            Join thousands of students who are already using AssignMate to succeed.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-orange-500 hover:bg-orange-400 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
                        >
                            Get Started for Free <ArrowRight className="ml-3" size={24} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
