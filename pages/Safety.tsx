import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';

export const Safety = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0b09] text-[#F5F5F4] font-body selection:bg-primary selection:text-white pt-20">
            {/* Hero */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2c2219] border border-[#3d3025] text-[#E6D5B8] text-xs font-semibold uppercase tracking-wider mb-8">
                        <Shield size={14} className="text-green-500" />
                        Safety Center
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                        Trust is our<br />
                        <span className="text-primary">Foundation.</span>
                    </h1>
                    <p className="text-[#E6D5B8]/70 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                        AssignMate is built on verified identities and mutual respect. We've designed every feature to ensure your academic journey is safe, secure, and supportive.
                    </p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: UserCheck,
                            title: "Verified Identities",
                            desc: "Every member in our community undergoes identity verification. Look for the blue tick to know you're talking to a real student from a real university.",
                            color: "text-blue-500"
                        },
                        {
                            icon: Lock,
                            title: "Data Privacy",
                            desc: "Your academic data and personal information are encrypted. We never share your details without your explicit consent.",
                            color: "text-green-500"
                        },
                        {
                            icon: Eye,
                            title: "Proactive Moderation",
                            desc: "Our automated systems and community moderators work 24/7 to detect and remove spam, scams, and harassment.",
                            color: "text-orange-500"
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-[#1a130e] p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group">
                            <div className={`w-14 h-14 rounded-2xl bg-[#0d0b09] flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform ${item.color}`}>
                                <item.icon size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-[#E6D5B8]/60 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Reporting Section */}
            <section className="py-20 bg-[#15100d]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">See something? Say something.</h2>
                            <p className="text-[#E6D5B8]/70 text-lg leading-relaxed mb-8">
                                We have zero tolerance for harassment, hate speech, or academic dishonesty. If you encounter any behavior that violates our community guidelines, report it immediately.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-[#E6D5B8]/80">
                                    <CheckCircle size={20} className="text-primary" />
                                    <span>Anonymous reporting available</span>
                                </li>
                                <li className="flex items-center gap-3 text-[#E6D5B8]/80">
                                    <CheckCircle size={20} className="text-primary" />
                                    <span>Typically reviewed within 24 hours</span>
                                </li>
                                <li className="flex items-center gap-3 text-[#E6D5B8]/80">
                                    <CheckCircle size={20} className="text-primary" />
                                    <span>Fair resolution process</span>
                                </li>
                            </ul>
                            <button onClick={() => navigate('/community-guidelines')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors">
                                View Community Guidelines
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-[80px] rounded-full"></div>
                            <div className="bg-[#0d0b09] p-8 rounded-3xl border border-white/10 relative shadow-2xl">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-red-500/10 rounded-xl">
                                        <AlertTriangle size={24} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">Report an Issue</h4>
                                        <p className="text-sm text-[#E6D5B8]/50">Help us keep the community safe</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {['Harassment or Bullying', 'Spam or Scam', 'False Information', 'Academic Dishonesty'].map((reason) => (
                                        <div key={reason} className="p-3 rounded-lg bg-white/5 border border-white/5 text-[#E6D5B8]/80 text-sm flex justify-between items-center cursor-not-allowed opacity-70">
                                            {reason}
                                            <span className="w-4 h-4 rounded-full border border-white/20"></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 text-center">
                <h2 className="font-display text-3xl font-bold mb-6">Still have questions?</h2>
                <div className="flex justify-center gap-4">
                    <button className="px-6 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
                        Visit Help Center
                    </button>
                    <button className="px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-xl transition-colors">
                        Contact Support
                    </button>
                </div>
            </section>
        </div>
    );
};
