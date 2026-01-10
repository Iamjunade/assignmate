import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogin = () => navigate('/auth');
    const handleSignup = () => navigate('/auth?tab=signup');
    const handleSearch = () => navigate('/feed');

    return (
        <div className="min-h-screen w-full font-sans bg-landing-bg text-landing-text selection:bg-primary/30">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-landing-bg/80 backdrop-blur-md border-b border-landing-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AssignMate</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8">
                        <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it Works</a>
                        <a href="#safety" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Trust & Safety</a>
                        <a href="#contributors" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">For Contributors</a>
                        <div className="h-4 w-px bg-landing-border"></div>
                        <button onClick={handleLogin} className="text-sm font-bold text-white hover:text-primary transition-colors">Login</button>
                        <button onClick={handleSignup} className="h-10 px-6 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-lg shadow-primary/20">
                            Join Now
                        </button>
                    </div>

                    <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-landing-bg flex flex-col items-center justify-center gap-8 p-8">
                    <button className="absolute top-6 right-6 text-white" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white">How it Works</a>
                    <a href="#safety" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white">Trust & Safety</a>
                    <button onClick={handleLogin} className="text-xl font-bold text-primary">Login</button>
                    <button onClick={handleSignup} className="px-8 py-3 rounded-full bg-primary text-white font-bold text-lg w-full max-w-xs">Join Now</button>
                </div>
            )}

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Block */}
                        <div className="flex flex-col items-start gap-8 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-landing-pill border border-landing-border">
                                <span className="material-symbols-outlined text-primary text-xs">shield_lock</span>
                                <span className="text-[11px] font-bold tracking-wider text-orange-400 uppercase">100% Free & Campus Verified</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-display">
                                Learn Together.<br />
                                <span className="text-primary">Grow Together.</span>
                            </h1>

                            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                                Join a free, campus-verified community where students explain concepts, share knowledge, and build understanding together.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 w-full">
                                <button onClick={handleSignup} className="h-14 px-8 rounded-full bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20">
                                    Explore Topics
                                </button>
                                <button onClick={handleSignup} className="h-14 px-8 rounded-full bg-landing-pill border border-landing-border text-white font-bold hover:bg-landing-border transition-all">
                                    Become a Contributor
                                </button>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="size-10 rounded-full border-2 border-landing-bg bg-gray-700 flex items-center justify-center text-xs text-white bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10})` }}></div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <p className="text-white font-bold">Trusted by 10,000+ students</p>
                                    <p className="text-gray-500">across IITs & DU</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image / Card */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-landing-border group">
                                <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-white">Live Session</span>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600"
                                    alt="Students learning"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 block filter brightness-[0.85]"
                                />
                                {/* Overlay Card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-landing-bg/90 backdrop-blur-md p-4 rounded-xl border border-landing-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gray-700 bg-cover" style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=33)' }}></div>
                                        <div>
                                            <p className="text-white font-bold text-sm flex items-center gap-1">Sai Tej <span className="material-symbols-outlined text-blue-500 text-[14px] filled">verified</span></p>
                                            <p className="text-gray-500 text-xs">CMRIT Hyd</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] uppercase tracking-wide font-bold">Contribution Score</p>
                                        <p className="text-orange-400 font-bold text-sm">🔥 4.9</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-10 border-y border-landing-border bg-landing-pill/30">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">CAMPUS VERIFIED & TRUSTED BY</p>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            {['UniVerify', 'ID Check', 'Open Learning', 'Peer Support'].map((brand, i) => (
                                <div key={i} className="flex items-center gap-2 text-white font-bold text-lg">
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                    {brand}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* "Why AssignMate" Section */}
                <section className="py-24 px-6 bg-landing-bg">
                    <div className="max-w-7xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">Why AssignMate is a Community</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">We serve the isolated professional. Open-sourced networking and support.</p>
                    </div>

                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
                        {[
                            { icon: 'verified', color: 'text-blue-500', title: 'Community Trust', desc: 'Every peer is ID-verified. Look for the blue tick before you connect. No fake profiles, just real students.' },
                            { icon: 'location_on', color: 'text-orange-500', title: 'Campus Matching', desc: 'Find seniors from your specific university (e.g., DU, IIT) who know exactly what your curriculum demands.' },
                            { icon: 'group', color: 'text-green-500', title: 'Collaborative Learning', desc: "It's not just about the work—it's about learning. Connect, discuss, and grow your network together." }
                        ].map((card, i) => (
                            <div key={i} className="bg-landing-card p-8 rounded-2xl border border-landing-border hover:border-landing-border/80 hover:bg-[#252525] transition-all duration-300 flex flex-col items-start text-left group">
                                <div className={`size-12 rounded-xl bg-landing-bg border border-landing-border flex items-center justify-center mb-6 ${card.color} group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined">{card.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Search Section */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto bg-landing-card border border-landing-border rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                        <h2 className="text-3xl font-bold text-white mb-8 font-display">Search your campus now</h2>

                        <div className="flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto bg-landing-bg p-2 rounded-full border border-landing-border focus-within:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 ml-4">search</span>
                            <input
                                type="text"
                                placeholder="Search by subjects (e.g., economics, CS)"
                                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 h-10"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="h-10 px-8 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors w-full md:w-auto">
                                Search
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
                            <span>Popular:</span>
                            {['Economics @ DU', 'CS @ IIT', 'Law @ NLU'].map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-landing-bg border border-landing-border hover:text-white cursor-pointer transition-colors" onClick={handleSearch}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-20 px-6 bg-landing-bg" id="how-it-works">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
                        <div className="lg:sticky lg:top-32">
                            <h2 className="text-4xl font-extrabold text-white mb-6 font-display">How it works</h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-md">Five steps to collaborative learning with your campus community.</p>
                            <a href="#" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">Learn more about safety <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
                        </div>

                        <div className="space-y-4">
                            {[
                                { num: 1, title: 'Ask or explore questions', desc: 'Post your doubts or browse existing questions in focused hubs.' },
                                { num: 2, title: 'Find contributors in your area', desc: 'Connect with peers closest in subjects you need help understanding.' },
                                { num: 3, title: 'Collaborate openly', desc: 'Discuss concepts, share explanations, and work through problems.' },
                                { num: 4, title: 'Build understanding', desc: 'Improve explanations together until clarity is achieved. Quality matters.' },
                                { num: 5, title: 'Earn contribution credibility', desc: 'Build your reputation as a helpful contributor and strengthen your campus network.' }
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-6 p-6 rounded-2xl bg-landing-pill/20 hover:bg-landing-pill/40 border border-transparent hover:border-landing-border transition-all cursor-default">
                                    <div className="size-8 rounded-full bg-white text-landing-bg font-bold flex items-center justify-center flex-shrink-0 mt-1">
                                        {step.num}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-2">{step.title}</h4>
                                        <p className="text-gray-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 px-6 bg-landing-bg">
                    <div className="max-w-7xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-bold text-white font-display">Success Stories from Students</h2>
                    </div>

                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'Priya S.', school: 'Delhi University', quote: "The pressure is real, but AssignMate helped me tackle it. Found a senior from my own college who guided me through the complex topics." },
                            { name: 'Arjun M.', school: 'IIT Madras', quote: "Finding verified peers from my own college was a game-changer. The explanations got helped me truly understand the concepts." },
                            { name: 'Vikram R.', school: 'VIT Vellore', quote: "As a contributor, I love helping juniors understand complex topics. Teaching others has deepened my own understanding." }
                        ].map((t, i) => (
                            <div key={i} className="bg-[#18181b] p-8 rounded-2xl border border-landing-border relative">
                                <span className="text-primary text-4xl font-serif absolute top-6 right-6 opacity-30">"</span>
                                <div className="flex text-orange-400 mb-4 text-xs">★★★★★</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-8 relative z-10">"{t.quote}"</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="size-10 rounded-full bg-gray-700 bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 25})` }}></div>
                                    <div className="text-left">
                                        <p className="text-white font-bold text-sm">{t.name}</p>
                                        <p className="text-gray-500 text-xs">{t.school}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-[#252525] p-12 md:p-24 text-center border border-landing-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to learn together?</h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">Join India's free student learning community. Share knowledge, build understanding, and grow together.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button onClick={handleSignup} className="h-14 px-10 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-105 transform duration-300">
                                    Join Your Campus
                                </button>
                                <button onClick={handleLogin} className="h-14 px-10 rounded-full bg-landing-border text-white font-bold text-lg hover:bg-gray-700 transition-all border border-gray-600">
                                    Start Contributing
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-16 px-6 bg-[#0f0f10] border-t border-landing-border">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-orange-500 font-bold text-2xl">⚡</span>
                                <span className="text-xl font-bold text-white">AssignMate</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                India's new, open student learning network. We connect students with verified peers for collaborative understanding.
                            </p>
                        </div>

                        {[
                            { title: 'Platform', links: ['How it Works', 'Browse Peers', 'Safety & Trust', 'Community'] },
                            { title: 'Support', links: ['Help Center', 'Contact Us', 'Dispute Resolution'] },
                            { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Community Guidelines', 'Academic Integrity'] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="text-white font-bold mb-6">{col.title}</h4>
                                <ul className="space-y-4 text-sm text-gray-500">
                                    {col.links.map(link => (
                                        <li key={link}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-landing-border flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
                        <p>© 2026 AssignMate. All rights reserved.</p>
                        <div className="flex gap-6">
                            <span className="material-symbols-outlined text-lg">language</span>
                            <span className="material-symbols-outlined text-lg">computer</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};
