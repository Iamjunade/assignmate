import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { collegeService, College } from '../services/collegeService';

// --- Components ---

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-indigo-500/10 py-5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className={`text-sm sm:text-base font-semibold tracking-wide transition-colors ${isOpen ? 'text-indigo-400' : 'text-slate-300 group-hover:text-white'}`}>
                    {question}
                </span>
                <span className={`material-symbols-outlined transition-transform duration-500 ${isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    expand_more
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-slate-400 leading-relaxed pb-2 font-light">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export const Landing = () => {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyCollege, setNotifyCollege] = useState('');
    const [suggestions, setSuggestions] = useState<College[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [referralLink, setReferralLink] = useState('');

    // SEO and Title
    useEffect(() => {
        document.title = "AssignMate | The AssignMate Network - Students Helping Students";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Join the AssignMate Network - a movement of students helping students. Find academic support, hackathon teams, and build meaningful connections across campuses.");
        }
    }, []);

    // ── College Search Effect ─────────────────────────────
    useEffect(() => {
        if (!notifyCollege || notifyCollege.length < 2) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            const results = await collegeService.search(notifyCollege);
            setSuggestions(results);
        }, 300);
        return () => clearTimeout(timer);
    }, [notifyCollege]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Countdown Timer ───────────────────
    useEffect(() => {
        const launchDate = new Date('2026-05-20T00:00:00').getTime();
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

    // ── Referral Link Generator ───────────────────────────
    const generateRefLink = (email: string) => {
        const hash = btoa(email.split('@')[0] + Math.random().toString(36).substring(7));
        return `${window.location.origin}?ref=${hash.substring(0, 8)}`;
    };

    // ── Email Submit → Firestore ──────────────────────────
    const handleNotifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = notifyEmail.trim().toLowerCase();
        const college = notifyCollege.trim();
        if (!email || !college) return;

        setSubmitting(true);
        setEmailError('');

        try {
            await addDoc(collection(db, 'waitlist'), {
                email,
                college,
                subscribed_at: serverTimestamp(),
                source: 'metaminds_landing',
            });

            // Fire the welcome email
            fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, college }),
            }).catch(console.error);

            const link = generateRefLink(email);
            setReferralLink(link);
            setEmailSubmitted(true);
            setNotifyEmail('');
            setNotifyCollege('');
        } catch (err: any) {
            console.error('Waitlist signup error:', err);
            setEmailError('Systems overloaded. Please try connecting again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = (platform: 'whatsapp' | 'twitter') => {
        const text = `I just secured my early access to METAMINDS. The next era of intelligent dashboards and connected communities is here. Join my grid: ${referralLink}`;
        const urls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        };
        window.open(urls[platform], '_blank');
    };

    // ── Render ─────────────────────────────────────────────
    const isDevMode = localStorage.getItem('dev_mode') === 'true';

    return (
        <div className="min-h-screen w-full font-body antialiased bg-[#030108] text-slate-200 selection:bg-indigo-500/50 selection:text-white overflow-x-hidden relative">

            {/* ── Ambient Background & Grid ── */}
            <div className="fixed inset-0 z-0 pointer-events-none w-full h-full" 
                 style={{ 
                     backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }}>
                <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-indigo-600/[0.07] blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-cyan-500/[0.05] blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-blue-900/[0.04] blur-[200px] rounded-[100%]" />
            </div>

            {/* ── Minimalist Geometric Navbar ── */}
            <nav className="relative z-20 w-full border-b border-white/[0.02] bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded shrink-0 bg-gradient-to-br from-indigo-500 to-cyan-400 rotate-45 flex items-center justify-center group-hover:rotate-90 transition-all duration-700 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            <div className="w-3 h-3 bg-black transform -rotate-45" />
                        </div>
                        <span className="font-display font-black text-xl tracking-[0.15em] text-white ml-2">ASSIGNMATE</span>
                    </div>
                    <div className="flex items-center gap-8 text-xs font-semibold tracking-widest text-slate-400">
                        <div className="hidden sm:flex gap-8">
                            <a href="#values" className="hover:text-cyan-400 transition-colors uppercase">Values</a>
                            <a href="#access" className="hover:text-indigo-400 transition-colors uppercase">Join</a>
                        </div>
                        <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all text-sm">
                                <i className="fab fa-x-twitter"></i>
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all text-sm">
                                <i className="fab fa-discord"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative z-10 pt-24 pb-16 overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    
                    {/* Glowing Pill */}
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        The AssignMate Network
                    </div>

                    <h1 className="font-display text-5xl sm:text-7xl lg:text-[7rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-600 leading-[0.95] mb-8 pb-2 drop-shadow-2xl">
                        More Than Just <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500 filter drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                            Classmates.
                        </span>
                    </h1>

                    <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-16 tracking-wide">
                        We are a movement of students helping students. We believe that knowledge grows when shared, and no one should have to struggle alone.
                    </p>
                </div>
            </section>

            {/* ── Sub-level Stats ── */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="bg-[#05030d] p-6 text-center">
                        <div className="text-3xl font-black text-white font-mono flex justify-center items-baseline gap-1">
                            10,000<span className="text-indigo-400 text-lg">+</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Active Students</div>
                    </div>
                    <div className="bg-[#05030d] p-6 text-center shadow-[inset_0_0_40px_rgba(99,102,241,0.05)]">
                        <div className="text-3xl font-black text-white font-mono flex justify-center items-baseline gap-1">
                            50<span className="text-cyan-400 text-lg">+</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Campuses</div>
                    </div>
                    <div className="bg-[#05030d] p-6 text-center">
                        <div className="text-3xl font-black text-white font-mono flex justify-center items-baseline gap-1">
                            25k<span className="text-indigo-400 text-lg">+</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Queries Solved</div>
                    </div>
                    <div className="bg-[#05030d] p-6 text-center shadow-[inset_0_0_40px_rgba(6,182,212,0.05)]">
                        <div className="text-3xl font-black text-white font-mono flex justify-center items-baseline gap-1">
                            2 hrs
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Avg Response Time</div>
                    </div>
                </div>
            </div>

            {/* ── Our Values ── */}
            <section id="values" className="relative z-10 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6">Our Values</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">The principles that guide every interaction on our platform.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-[#070514]/50 backdrop-blur-xl rounded-2xl border border-indigo-500/10 p-8 text-center hover:border-indigo-500/30 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                <span className="material-symbols-outlined text-white text-2xl">favorite</span>
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-4">Empathy First</h3>
                            <p className="text-slate-400 leading-relaxed">We understand the pressure of academics. Kindness and patience are our default settings.</p>
                        </div>
                        
                        <div className="bg-[#070514]/50 backdrop-blur-xl rounded-2xl border border-cyan-500/10 p-8 text-center hover:border-cyan-500/30 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                <span className="material-symbols-outlined text-white text-2xl">group_work</span>
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-4">Active Collaboration</h3>
                            <p className="text-slate-400 leading-relaxed">Don't just copy. Understand. Explain. Discuss. True learning happens in the exchange.</p>
                        </div>
                        
                        <div className="bg-[#070514]/50 backdrop-blur-xl rounded-2xl border border-indigo-500/10 p-8 text-center hover:border-indigo-500/30 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                <span className="material-symbols-outlined text-white text-2xl">diversity_3</span>
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-4">Inclusive Growth</h3>
                            <p className="text-slate-400 leading-relaxed">From IITs to local colleges, talent is everywhere. We bridge the gap between institutions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Registration / Terminal Input ── */}
            <section id="access" className="relative z-10 pb-32">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="bg-[#070514]/80 backdrop-blur-3xl rounded-[2rem] border border-indigo-500/20 p-8 sm:p-14 shadow-[0_20px_80px_-15px_rgba(99,102,241,0.4)] relative overflow-hidden group">
                        
                        {/* Terminal Glow */}
                        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/[0.15] rounded-full blur-[80px]" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-600/[0.15] rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            {emailSubmitted ? (
                                <div className="animate-in fade-in zoom-in duration-700">
                                    <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                        <span className="material-symbols-outlined text-cyan-400 text-4xl">fingerprint</span>
                                    </div>
                                    <h3 className="font-display text-3xl font-black text-white mb-3">ACCESS GRANTED</h3>
                                    <p className="text-sm text-slate-400 mb-10 tracking-wide font-light">Welcome to the AssignMate Network. Ready to find your people?</p>

                                    <div className="bg-black/50 rounded-2xl border border-white/5 p-5 mb-8 relative font-mono text-left">
                                        <div className="text-[9px] text-indigo-400 absolute -top-2 left-4 bg-[#070514] px-2 font-bold uppercase tracking-[0.2em]">Propagation Link</div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm text-cyan-300 truncate">{referralLink}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(referralLink);
                                                }}
                                                className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded shrink-0 hover:bg-white/10"
                                            >
                                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button
                                            onClick={() => navigate('/feed')}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:from-indigo-600 hover:to-cyan-500 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                                        >
                                            Launch Dashboard
                                        </button>
                                        <button
                                            onClick={() => navigate('/community-guidelines')}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all border border-white/20"
                                        >
                                            Read Guidelines
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setEmailSubmitted(false)}
                                        className="text-[10px] text-slate-600 mt-10 font-bold uppercase tracking-[0.3em] hover:text-slate-300 transition-colors"
                                    >
                                        Join Another Friend
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-black border border-indigo-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                        <span className="material-symbols-outlined text-indigo-400 text-3xl">api</span>
                                    </div>

                                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">JOIN THE MOVEMENT</h3>
                                    <p className="text-sm text-slate-400 mb-10 font-light tracking-wide">Ready to find your people? Whether you need help with Calculus or want to find a hackathon team, your community is here.</p>

                                    <form onSubmit={handleNotifySubmit} className="flex flex-col gap-4">
                                        <input
                                            type="email"
                                            required
                                            placeholder="identity@domain.com"
                                            value={notifyEmail}
                                            onChange={(e) => setNotifyEmail(e.target.value)}
                                            disabled={submitting}
                                            className="w-full px-6 py-4 bg-black/60 border border-indigo-500/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-mono disabled:opacity-50"
                                        />
                                        <div className="relative" ref={searchRef}>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Affiliated Institution (Sector)"
                                                value={notifyCollege}
                                                onChange={(e) => {
                                                    setNotifyCollege(e.target.value);
                                                    setShowSuggestions(true);
                                                }}
                                                onFocus={() => {
                                                    if (notifyCollege.length >= 2) setShowSuggestions(true);
                                                }}
                                                disabled={submitting}
                                                className="w-full px-6 py-4 bg-black/60 border border-indigo-500/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-mono disabled:opacity-50"
                                            />
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0a0f1d] border border-indigo-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {suggestions.map((college, idx) => (
                                                        <button
                                                            type="button"
                                                            key={idx}
                                                            className="w-full text-left px-5 py-4 hover:bg-indigo-500/10 transition-colors border-b border-white/5 last:border-0 relative font-mono group"
                                                            onClick={() => {
                                                                setNotifyCollege(college.name);
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <div className="font-bold text-xs text-slate-300">{college.name}</div>
                                                            <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">
                                                                {college.state}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="group relative w-full px-8 py-4 bg-indigo-600 hover:bg-cyan-500 font-bold rounded-xl overflow-hidden transition-colors duration-500 mt-2"
                                        >
                                            <div className="absolute inset-0 bg-white/20 mix-blend-overlay w-0 group-hover:w-full transition-all duration-700 ease-out" />
                                            <div className="relative flex items-center justify-center gap-3 text-white text-xs uppercase tracking-[0.2em]">
                                                {submitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Initialize Connection
                                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                                            east
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </form>

                                    {emailError && (
                                        <p className="text-red-400 text-xs mt-4 font-mono">{emailError}</p>
                                    )}
                                    <p className="text-[9px] text-slate-500 mt-6 uppercase tracking-widest font-bold">Encrypted End-to-End • Zero Analytics</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Systems ── */}
            <section id="vision" className="relative z-10 pb-32">
                <div className="max-w-6xl mx-auto px-6">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-12 flex items-center justify-center gap-4">
                        <span className="w-12 h-px bg-indigo-500/30" />
                        Core Modules
                        <span className="w-12 h-px bg-indigo-500/30" />
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: 'dashboard',
                                title: 'The Dashboard',
                                desc: 'Advanced analytics, high-frequency synchronization, and hyper-personalized insights for every individual node in network.',
                                color: 'indigo'
                            },
                            {
                                icon: 'device_hub',
                                title: 'Community Graph',
                                desc: 'Interact with peers across sectors seamlessly. Engineered for instantaneous knowledge transfer and real-time collaboration.',
                                color: 'cyan'
                            },
                            {
                                icon: 'search_insights',
                                title: 'Deep Search',
                                desc: 'Locate resources, profiles, and critical intelligence across the global database with zero-latency querying engines.',
                                color: 'purple'
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl bg-[#090714] border border-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden flex flex-col items-start"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none
                                    ${feature.color === 'indigo' ? 'bg-indigo-500' : feature.color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500'}`} 
                                />
                                <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center mb-6 shadow-inner relative z-10">
                                    <span className={`material-symbols-outlined text-2xl text-${feature.color}-400`}>{feature.icon}</span>
                                </div>
                                <h4 className="font-display tracking-tight text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h4>
                                <p className="text-sm text-slate-400 font-light leading-relaxed relative z-10">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ Protocol ── */}
            <section className="relative z-10 py-24 bg-gradient-to-b from-transparent via-[#05030d] to-transparent">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="font-display text-3xl font-black text-white text-center mb-12 tracking-tight">SYSTEM INQUIRIES</h2>
                    <div className="bg-[#030108] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                        <FAQItem
                            question="What is the METAMINDS architecture?"
                            answer="It's a next-generation platform fusing individual productivity dashboards with massive, high-speed community networks."
                        />
                        <FAQItem
                            question="Are the branches isolated?"
                            answer="The Dashboard (Sai Tej Segment) and Community (Saif Segment) are developed independently but merge into a single, cohesive engine for the end user."
                        />
                        <FAQItem
                            question="What happens during initialization?"
                            answer="Early adopters gain immediate access to beta-level APIs, premium node status, and an unmetered connection to the foundation layer."
                        />
                    </div>
                </div>
            </section>

            {/* ── Developer Bypass Button ── */}
            {isDevMode && (
                <div className="fixed bottom-8 left-8 z-50">
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center gap-3 px-6 py-4 bg-white hover:bg-slate-200 text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
                    >
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                        Dev Overide
                    </button>
                </div>
            )}

            {/* ── Footer Terminal ── */}
            <footer className="relative z-10 border-t border-white/[0.05] py-10 bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <div className="w-1 h-1 bg-black" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">METAMINDS CORE VER 1.0.0</span>
                    </div>

                    <div className="flex gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <a href="/terms" className="hover:text-indigo-400 transition-colors">Protocols</a>
                        <a href="/privacy" className="hover:text-cyan-400 transition-colors">Telemetry Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
