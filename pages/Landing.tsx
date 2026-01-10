import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogin = () => navigate('/auth');
    const handleSignup = () => navigate('/auth?tab=signup');
    const handleSearch = () => navigate('/feed');

    return (
        <div className="min-h-screen w-full font-display bg-[#0A0A0A] text-white selection:bg-primary selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#262626]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl">school</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight">AssignMate</span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <a className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#how-it-works">How it Works</a>
                        <a className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#safety">Trust &amp; Safety</a>
                        <a className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#contributors">For Writers</a>
                        <div className="h-4 w-px bg-[#262626] mx-2"></div>
                        <button onClick={handleLogin} className="text-sm font-medium text-white hover:text-primary transition-colors">Login</button>
                        <button onClick={handleSignup} className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                            Join Marketplace
                        </button>
                    </div>
                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 p-8">
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
                <section className="relative min-h-[90vh] flex items-center px-6 py-20 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
                    </div>
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] border-primary/20">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-sm font-bold tracking-wider text-primary uppercase">100% Secure & Escrow Protected</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                Learn Better. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Excel Together.</span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                                India's premier student marketplace for verified assignment assistance. Connect with top university peers and secure your grades with bank-grade safety.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleSignup} className="px-8 py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,107,0,0.3)]">
                                    Post Assignment
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                                <button onClick={handleSignup} className="px-8 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/5 transition-all">
                                    Become a Writer
                                </button>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <img key={i} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-[#0A0A0A]" src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-400">Trusted by <span className="text-white font-bold">50,000+ Students</span> across IITs, DU & BITS</p>
                            </div>
                        </div>

                        {/* Hero Card */}
                        <div className="relative group">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 aspect-[4/5] md:aspect-[4/3]">
                                <img alt="Students Studying" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600" />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img alt="Verified Writer" className="w-12 h-12 rounded-full border-2 border-primary" src="https://i.pravatar.cc/150?img=33" />
                                                <span className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-[#161616]">
                                                    <span className="material-symbols-outlined text-[10px] text-white">verified</span>
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Ishaan Sharma</h4>
                                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">IIT DELHI • FINAL YEAR</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Success Rate</p>
                                            <p className="text-primary font-bold text-lg">98.4%</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">Mathematics</span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">Data Structures</span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">+4 More</span>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 px-4 py-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full border-emerald-500/20 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-xs font-bold text-emerald-400">Active Concept Clarified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Badges Section */}
                <section className="border-y border-[#262626] py-12 bg-[#161616]/30">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { icon: 'verified_user', title: 'UniVerify', sub: 'Campus Locked' },
                                { icon: 'payments', title: 'Escrow Pro', sub: 'Funds Secured' },
                                { icon: 'lock', title: 'ID Check', sub: 'Bank-Grade Privacy' },
                                { icon: 'groups', title: 'Peer Support', sub: '24/7 Academic Help' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-center gap-3 text-gray-400 group">
                                    <span className="material-symbols-outlined text-3xl group-hover:text-primary transition-colors">{item.icon}</span>
                                    <div className="text-left">
                                        <p className="text-white font-bold leading-none">{item.title}</p>
                                        <p className="text-[11px] uppercase tracking-tighter">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why AssignMate Section */}
                <section className="py-32 px-6" id="safety">
                    <div className="max-w-7xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Why AssignMate is a Community</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            We've built a secure environment where trust and academic integrity come first. Every member is a verified peer from your specific university ecosystem.
                        </p>
                    </div>
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { icon: 'verified_user', title: 'Community Trust', desc: 'Every peer is ID-verified. Look for the Blue Tick before you connect. No fake profiles, just real students helping students.', highlight: false },
                            { icon: 'location_on', title: 'Hyper-Local Matching', desc: 'Find experts from your specific department and university (e.g., DU, IIT, BITS) who know exactly what your curriculum demands.', highlight: true },
                            { icon: 'psychology', title: 'Collaborative Learning', desc: "It's not just about the work—it's about learning. Connect, discuss, and grow your network with fellow high-achievers.", highlight: false },
                        ].map((card, i) => (
                            <div key={i} className={`group p-10 bg-white/[0.03] backdrop-blur-xl border rounded-[32px] transition-all duration-500 ${card.highlight ? 'border-primary/10 bg-primary/5 hover:bg-primary/10' : 'border-white/5 hover:bg-white/5 hover:border-primary/20'}`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${card.highlight ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary/10 border border-primary/20'}`}>
                                    <span className={`material-symbols-outlined text-3xl ${card.highlight ? 'text-white' : 'text-primary'}`}>{card.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                                <p className={`leading-relaxed ${card.highlight ? 'text-gray-300' : 'text-gray-400'}`}>{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Search Section */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto bg-[#161616] border border-[#262626] rounded-[40px] p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10"></div>
                        <h2 className="text-3xl font-bold mb-10">Search your campus now</h2>
                        <div className="relative max-w-2xl mx-auto mb-8">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500">search</span>
                            </div>
                            <input
                                className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-2xl py-5 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg placeholder:text-gray-600"
                                placeholder="Search for subjects (e.g. Economics, CS)"
                                type="text"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="absolute right-3 top-3 bottom-3 px-8 bg-primary hover:bg-orange-600 rounded-xl font-bold transition-all">
                                Search
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mr-2">Popular:</span>
                            {['Economics @ DU', 'CS @ IIT', 'Law @ NLU', 'BBA @ NMIMS'].map(tag => (
                                <button key={tag} onClick={handleSearch} className="px-4 py-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full text-xs hover:border-primary/50 transition-colors">{tag}</button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section className="py-32 px-6" id="how-it-works">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-8">How it works</h2>
                            <p className="text-gray-400 text-lg mb-12 leading-relaxed max-w-md">
                                Five steps to secure, collaborative learning with your verified campus community.
                            </p>
                            <a className="inline-flex items-center gap-2 text-primary font-bold text-lg group" href="#">
                                Learn more about safety
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">east</span>
                            </a>
                        </div>
                        <div className="space-y-6 relative">
                            <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary to-transparent opacity-20 hidden md:block"></div>
                            {[
                                { num: 1, icon: 'help_outline', title: 'Ask or explore questions', desc: 'Post your doubts or browse existing discussions on topics you\'re studying.' },
                                { num: 2, icon: 'person_search', title: 'Find contributors in your area', desc: 'Connect with verified peers who excel in subjects you need help understanding.' },
                                { num: 3, icon: 'chat_bubble_outline', title: 'Collaborate openly', desc: 'Discuss concepts, share explanations, and work through problems together via secure escrow.' },
                                { num: 4, icon: 'insights', title: 'Build understanding', desc: 'Improve explanations together until clarity is achieved. Quality is our standard.' },
                                { num: 5, icon: 'stars', title: 'Earn contribution credibility', desc: 'Build your reputation as a top contributor and strengthen your campus network.' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className={`relative z-10 w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-xl shadow-lg ${step.num === 1 ? 'bg-primary text-white shadow-primary/20' : 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-gray-400 group-hover:text-primary'} transition-colors`}>
                                        {step.num}
                                    </div>
                                    <div className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl flex-grow group-hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3 mb-2 text-primary">
                                            <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                            <h4 className="font-bold text-lg text-white">{step.title}</h4>
                                        </div>
                                        <p className="text-gray-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-32 px-6 bg-[#161616]/20" id="contributors">
                    <div className="max-w-7xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Success Stories from Students</h2>
                        <div className="flex items-center justify-center gap-1 text-primary">
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} className="material-symbols-outlined">star</span>
                            ))}
                            <span className="ml-2 font-bold text-white">4.9/5 Average Rating</span>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Priya S.', school: 'Delhi University', quote: "The pressure is real, but AssignMate helped me tackle it. Found a senior from my own college who guided me through the complex topics of Microeconomics.", highlight: false },
                            { name: 'Arjun M.', school: 'BITS Pilani', quote: "Finding verified peers from my own college was a game-changer. The explanations I got helped me truly understand the concepts for my finals.", highlight: true },
                            { name: 'Vikram R.', school: 'IIT Madras', quote: "As a contributor, I love helping juniors understand complex topics. Teaching others has deepened my own understanding while earning extra.", highlight: false },
                        ].map((t, i) => (
                            <div key={i} className={`bg-white/[0.03] backdrop-blur-xl border p-8 rounded-[32px] relative ${t.highlight ? 'border-primary/20 bg-primary/5' : 'border-white/5'}`}>
                                <span className="material-symbols-outlined absolute top-8 right-8 text-6xl text-primary/10">format_quote</span>
                                <p className={`italic mb-8 leading-relaxed relative z-10 ${t.highlight ? 'text-gray-200' : 'text-gray-300'}`}>
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <img alt={`Student ${t.name}`} className="w-12 h-12 rounded-xl object-cover" src={`https://i.pravatar.cc/150?img=${i + 25}`} />
                                    <div>
                                        <h4 className="font-bold text-white">{t.name}</h4>
                                        <p className={`text-xs uppercase tracking-widest font-bold ${t.highlight ? 'text-primary/80' : 'text-gray-500'}`}>{t.school}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 px-6">
                    <div className="max-w-5xl mx-auto relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
                        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[48px] p-16 text-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
                            <h2 className="text-5xl font-extrabold mb-6">Ready to learn together?</h2>
                            <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-12">
                                Join India's free, student learning community. Share knowledge, build understanding, and grow together today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <button onClick={handleSignup} className="w-full sm:w-auto px-12 py-5 bg-primary text-white font-bold text-xl rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,107,0,0.3)]">
                                    Join Your Campus
                                </button>
                                <button onClick={handleLogin} className="w-full sm:w-auto px-12 py-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white font-bold text-xl rounded-2xl hover:bg-white/5 transition-all">
                                    Start Contributing
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#0A0A0A] border-t border-[#262626] pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-lg">school</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">AssignMate</span>
                            </div>
                            <p className="text-gray-500 leading-relaxed max-w-sm mb-6">
                                India's first hyper-local student learning network. Connect with verified peers for collaborative academic growth.
                            </p>
                            <div className="flex gap-4">
                                <a className="w-10 h-10 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-primary transition-colors" href="#">
                                    <span className="material-symbols-outlined text-lg">public</span>
                                </a>
                                <a className="w-10 h-10 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-primary transition-colors" href="#">
                                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                </a>
                            </div>
                        </div>
                        {[
                            { title: 'Platform', links: ['How it works', 'Browse Peers', 'Safety & Trust', 'Community'] },
                            { title: 'Support', links: ['Help Center', 'Contact Us', 'Dispute Resolution'] },
                            { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Community Guidelines', 'Academic Integrity'] },
                        ].map((col, i) => (
                            <div key={i}>
                                <h5 className="font-bold mb-6 text-sm uppercase tracking-widest text-primary">{col.title}</h5>
                                <ul className="space-y-4 text-gray-400 text-sm">
                                    {col.links.map(link => (
                                        <li key={link}><a className="hover:text-white transition-colors" href="#">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-600">© 2026 AssignMate Private Limited. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">language</span>
                                English (India)
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
