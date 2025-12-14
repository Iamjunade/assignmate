import React from 'react';
import { GlassButton } from '../components/ui/GlassButton';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import Hero from '../components/ui/neural-network-hero';
import { ArrowRight, Shield, Zap, Users, Star, CheckCircle2, TrendingUp, Award, Clock } from 'lucide-react';

interface LandingProps {
    onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    return (
        <div className="relative z-10 space-y-32 pb-32 overflow-hidden">
            {/* Illustration Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left space-y-8 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                                <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px]">NEW</span>
                                India's #1 Student Marketplace
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                                Get Work Done <br className="hidden lg:block" />
                                <span className="text-slate-900">Faster & Better.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Connect with top-tier students from IITs & NITs. Outsource assignments, projects, and records with guaranteed quality.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                                <button
                                    onClick={onGetStarted}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300"
                                >
                                    Start Hiring Now
                                </button>
                                <button
                                    onClick={onGetStarted}
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300"
                                >
                                    Become a Writer
                                </button>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Verified Writers
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Secure Payments
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Fast Delivery
                                </div>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                            <div className="relative z-10">
                                <img
                                    src="https://cdni.iconscout.com/illustration/premium/thumb/student-studying-online-2974936-2477363.png"
                                    alt="Student studying"
                                    className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Decorative Blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-orange-200/30 blur-3xl rounded-full -z-10 animate-pulse-slow"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/40 blur-2xl rounded-full -z-10"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/20 blur-2xl rounded-full -z-10"></div>
                        </div>
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
