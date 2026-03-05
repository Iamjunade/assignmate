import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────
    const [notifyEmail, setNotifyEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // ── Countdown Timer – April 1, 2026 ───────────────────
    useEffect(() => {
        const launchDate = new Date('2026-04-01T00:00:00').getTime();
        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, launchDate - now);
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    // ── Email Submit ──────────────────────────────────────
    const handleNotifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (notifyEmail.trim()) {
            // TODO: Wire to Firebase / backend
            setEmailSubmitted(true);
            setNotifyEmail('');
            setTimeout(() => setEmailSubmitted(false), 6000);
        }
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div className="min-h-screen w-full font-body antialiased bg-[#0a0908] text-[#F5F5F4] selection:bg-primary selection:text-white overflow-hidden relative">

            {/* ── Ambient Background Blobs ── */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/[0.06] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-900/[0.08] blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/[0.02] blur-[200px] rounded-full" />
            </div>

            {/* ── Minimal Navbar ── */}
            <nav className="relative z-20 w-full">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,107,0,0.15)]">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white">AssignMate</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm text-[#E6D5B8]/50">
                        <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                        <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative z-10 pt-10 sm:pt-16 lg:pt-20 pb-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.15em] mb-10 animate-pulse">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        Launching April 2026
                    </div>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
                        The Future of{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-amber-300">
                            Campus Learning
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-[#E6D5B8]/60 max-w-2xl mx-auto font-light leading-relaxed mb-16">
                        India's first ID-verified, hyper-local student collaboration platform.
                        Connect with campus peers, share knowledge, and grow together — all for free.
                    </p>
                </div>
            </section>

            {/* ── Countdown Timer ── */}
            <section className="relative z-10 pb-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6D5B8]/30 mb-8">Countdown to Launch</p>
                    <div className="flex justify-center gap-3 sm:gap-5 mb-6">
                        {[
                            { value: countdown.days, label: 'Days' },
                            { value: countdown.hours, label: 'Hours' },
                            { value: countdown.minutes, label: 'Min' },
                            { value: countdown.seconds, label: 'Sec' },
                        ].map((unit) => (
                            <div key={unit.label} className="flex flex-col items-center">
                                <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-2xl bg-[#161310] border border-white/[0.06] flex items-center justify-center mb-2 relative overflow-hidden group hover:border-primary/20 transition-all duration-300 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-display text-3xl sm:text-4xl font-bold text-white relative z-10 tabular-nums">
                                        {String(unit.value).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E6D5B8]/30">{unit.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Get Notified First ── */}
            <section className="relative z-10 pb-24">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="bg-[#141110] rounded-3xl border border-white/[0.06] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.06] rounded-full blur-[60px]" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-900/[0.08] rounded-full blur-[60px]" />

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
                            </div>

                            <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">Get Notified First</h3>
                            <p className="text-sm text-[#E6D5B8]/50 mb-8">Be among the first to experience AssignMate when we launch.</p>

                            {emailSubmitted ? (
                                <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    You're on the list! We'll notify you at launch.
                                </div>
                            ) : (
                                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        value={notifyEmail}
                                        onChange={(e) => setNotifyEmail(e.target.value)}
                                        className="flex-1 px-5 py-3.5 bg-[#0a0908] border border-white/[0.08] rounded-xl text-white placeholder-[#E6D5B8]/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="px-7 py-3.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_50px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap text-sm"
                                    >
                                        Notify Me
                                    </button>
                                </form>
                            )}
                            <p className="text-[10px] text-[#E6D5B8]/25 mt-5">No spam — just a single notification on launch day.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature Teasers ── */}
            <section className="relative z-10 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#E6D5B8]/30 mb-12">What to Expect</p>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            {
                                icon: 'verified_user',
                                title: 'Campus Verified',
                                desc: 'Every student is ID-verified with their college credentials. No fake profiles — just real peers.',
                            },
                            {
                                icon: 'hub',
                                title: 'Smart Matching',
                                desc: 'Find seniors and peers from your exact university who know your curriculum inside out.',
                            },
                            {
                                icon: 'shield',
                                title: 'Secure & Free',
                                desc: '100% free for students. End-to-end encrypted chats with built-in trust & safety systems.',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-7 sm:p-8 rounded-2xl bg-[#141110] border border-white/[0.05] hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.06)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-xl text-primary">{feature.icon}</span>
                                </div>
                                <h4 className="font-display text-base font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-[#E6D5B8]/45 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="relative z-10 pb-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="py-12 px-6 rounded-3xl bg-gradient-to-b from-[#161310] to-[#0e0c0a] border border-white/[0.04] relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <p className="text-[#E6D5B8]/40 text-sm font-light mb-3">Trusted by students across</p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#E6D5B8]/60">
                            <span>IITs</span>
                            <span className="text-primary/40">•</span>
                            <span>NITs</span>
                            <span className="text-primary/40">•</span>
                            <span>Delhi University</span>
                            <span className="text-primary/40">•</span>
                            <span>BITS</span>
                            <span className="text-primary/40">•</span>
                            <span>NLUs</span>
                            <span className="text-primary/40">•</span>
                            <span>500+ colleges</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Minimal Footer ── */}
            <footer className="relative z-10 border-t border-white/[0.04] py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-[#E6D5B8]/30">© 2026 AssignMate Private Limited</span>
                    </div>
                    <div className="flex items-center gap-5 text-xs text-[#E6D5B8]/30">
                        <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                        <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="/community-guidelines" className="hover:text-primary transition-colors">Guidelines</a>
                        <a href="mailto:support@assignmate.com" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">mail</span>
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
