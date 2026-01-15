import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from '../components/layout/Footer';

export const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogin = () => navigate('/auth');
    const handleSignup = () => navigate('/auth?tab=signup');
    const handleSearch = () => navigate('/feed');

    return (
        <div className="min-h-screen w-full font-body antialiased bg-[#0d0b09] text-[#F5F5F4] selection:bg-primary selection:text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,107,0,0.15)]">
                                <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-white">AssignMate</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a className="text-sm font-medium text-[#E6D5B8]/80 hover:text-primary transition-colors" href="#how-it-works">How it Works</a>
                            <a className="text-sm font-medium text-[#E6D5B8]/80 hover:text-primary transition-colors" href="#safety">Trust & Safety</a>
                            <a className="text-sm font-medium text-[#E6D5B8]/80 hover:text-primary transition-colors" href="#contributors">For Contributors</a>
                            <div className="h-4 w-px bg-white/10 mx-2"></div>
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => navigate('/feed')}
                                        className="text-sm font-medium text-white hover:text-primary transition-colors"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="block w-10 h-10 rounded-full border border-white/10 p-0.5 hover:border-primary transition-colors cursor-pointer overflow-hidden group"
                                    >
                                        <img
                                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=random`}
                                            alt={user.full_name}
                                            className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={handleLogin} className="text-sm font-medium text-white hover:text-primary transition-colors">Login</button>
                                    <button onClick={handleSignup} className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] transform hover:-translate-y-0.5">
                                        Join Now
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="md:hidden flex items-center">
                            <button className="text-gray-300 hover:text-white focus:outline-none" onClick={() => setMobileMenuOpen(true)}>
                                <span className="material-symbols-outlined text-2xl">menu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-8 p-8">
                    <button className="absolute top-6 right-6 text-white" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white">How it Works</a>
                    <a href="#safety" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white">Trust & Safety</a>
                    {user ? (
                        <>
                            <button onClick={() => navigate('/feed')} className="text-xl font-bold text-primary">Dashboard</button>
                            <button onClick={() => navigate('/profile')} className="text-xl font-bold text-white">My Profile</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleLogin} className="text-xl font-bold text-primary">Login</button>
                            <button onClick={handleSignup} className="px-8 py-3 rounded-full bg-primary text-white font-bold text-lg w-full max-w-xs">Join Now</button>
                        </>
                    )}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-black">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#2c2219] opacity-40 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#2c2219] opacity-30 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2c2219] border border-[#3d3025] text-[#E6D5B8] text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                                100% Free & Campus Verified
                            </div>
                            <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-8">
                                Learn Together. <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">Grow Together.</span>
                            </h1>
                            <p className="text-lg text-[#E6D5B8]/80 mb-10 leading-relaxed max-w-lg font-light">
                                Join a free, ID-verified community where students explain concepts, share knowledge, and build understanding together in a secure environment.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button onClick={handleSignup} className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] hover:bg-orange-600 transition-all transform hover:-translate-y-1">
                                    Explore Topics
                                </button>
                                <button onClick={handleSignup} className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all">
                                    Become a Contributor
                                </button>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#2c2219]/30 border border-white/5 w-fit backdrop-blur-sm">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <img key={i} alt="Student" className="w-10 h-10 rounded-full border-2 border-[#2c2219] object-cover" src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#2c2219] bg-black flex items-center justify-center text-xs font-bold text-[#E6D5B8]">+2k</div>
                                </div>
                                <p className="text-sm text-[#E6D5B8]/80">Trusted by <strong className="text-white">10,000+ students</strong> across IITs & DU</p>
                            </div>
                        </div>

                        {/* Hero Card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary rounded-3xl blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#2c2219]">
                                <img alt="Students Collaborating" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600" />
                                <div className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-[#2c2219]" src="https://i.pravatar.cc/150?img=12" />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-black"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-white">Sai Tej</h4>
                                            <p className="text-xs text-[#E6D5B8]/70">CMR INSTITUTE OF TECHNOLOGY</p>
                                            <p className="text-[10px] text-[#E6D5B8]/50 uppercase tracking-widest mt-0.5">Hyderabad</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#E6D5B8]/50 uppercase tracking-widest font-semibold mb-1">Contribution Score</p>
                                        <div className="flex items-center justify-end gap-1.5 text-primary font-bold">
                                            <span className="material-symbols-outlined text-lg">local_fire_department</span>
                                            <span className="text-xl">4.9</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs font-medium text-white/90">Status: Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges Section */}
            <div className="border-y border-white/5 bg-[#2c2219]/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <p className="text-center text-xs font-bold text-[#E6D5B8]/40 uppercase tracking-[0.2em] mb-8">Campus Verified & Trusted By</p>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {[
                            { icon: 'verified', title: 'UniVerify' },
                            { icon: 'badge', title: 'ID Check' },
                            { icon: 'menu_book', title: 'Open Learning' },
                            { icon: 'diversity_3', title: 'Peer Support' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[#E6D5B8]">
                                <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                                <span className="font-semibold text-base">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why AssignMate Section */}
            <section className="py-32 relative bg-black" id="safety">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Why AssignMate is a Community</h2>
                        <p className="text-[#E6D5B8]/60 text-lg font-light leading-relaxed">We serve the isolated professional with open-sourced networking and support, transforming how students connect.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: 'verified_user', title: 'Community Trust', desc: "Every peer is ID-verified. Look for the blue tick before you connect. No fake profiles, just real students." },
                            { icon: 'hub', title: 'Campus Matching', desc: "Find seniors from your specific university (e.g., DU, IIT) who know exactly what your curriculum demands." },
                            { icon: 'school', title: 'Collaborative Learning', desc: "It's not just about the work—it's about learning. Connect, discuss, and grow your network together." },
                        ].map((card, i) => (
                            <div key={i} className="group p-10 rounded-3xl bg-[#2c2219] border border-[#3d3025] hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0"></div>
                                <div className="w-16 h-16 rounded-2xl bg-[#3A2E24] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <span className="material-symbols-outlined text-3xl text-primary">{card.icon}</span>
                                </div>
                                <h3 className="font-display text-xl font-bold text-white mb-4">{card.title}</h3>
                                <p className="text-[#E6D5B8]/60 leading-relaxed text-sm">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="py-24 bg-[#2c2219] relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="bg-black rounded-[2rem] p-10 md:p-14 text-center shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
                        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 relative z-10">Search your campus now</h3>
                        <div className="relative max-w-xl mx-auto mb-8 z-10">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#E6D5B8]/40">search</span>
                            </div>
                            <input
                                className="block w-full pl-14 pr-32 py-5 bg-[#2c2219] border border-white/10 rounded-xl text-white placeholder-[#E6D5B8]/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                                placeholder="Search for subjects (e.g. Economics, CS)"
                                type="text"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="absolute right-2.5 top-2.5 bottom-2.5 bg-primary hover:bg-orange-600 text-white font-medium px-6 rounded-lg transition-colors shadow-lg">
                                Search
                            </button>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 text-xs z-10 relative">
                            <span className="text-[#E6D5B8]/40 font-bold tracking-wider py-1">POPULAR:</span>
                            {['Economics @ DU', 'CS @ IIT', 'Law @ NLU', 'BBA @ NMIMS'].map(tag => (
                                <button key={tag} onClick={handleSearch} className="px-4 py-1.5 rounded-full bg-[#2c2219] text-[#E6D5B8]/80 hover:bg-[#3A2E24] hover:text-white transition-colors border border-white/5">{tag}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-32 bg-black overflow-hidden" id="how-it-works">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-20">
                        <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit">
                            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-8">How it works</h2>
                            <p className="text-lg text-[#E6D5B8]/60 mb-10 leading-relaxed font-light">
                                Five steps to secure, collaborative learning with your verified campus community. Simplicity meets security.
                            </p>
                            <a className="inline-flex items-center text-primary font-semibold hover:text-orange-400 transition-colors gap-2 group text-lg" href="#">
                                Learn more about safety
                                <span className="material-symbols-outlined text-xl transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                        <div className="lg:w-2/3 relative">
                            <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-gradient-to-b from-primary via-white/10 to-transparent"></div>
                            <div className="space-y-16">
                                {[
                                    { num: 1, icon: 'help_outline', title: 'Ask or explore questions', desc: "Post your doubts or browse existing discussions on topics you're studying within your university curriculum." },
                                    { num: 2, icon: 'person_search', title: 'Find contributors in your area', desc: "Connect with verified peers who excel in subjects you need help understanding using our smart matching." },
                                    { num: 3, icon: 'forum', title: 'Collaborate openly', desc: "Discuss concepts, share explanations, and work through problems together via secure escrow and chat." },
                                    { num: 4, icon: 'construction', title: 'Build understanding', desc: "Improve explanations together until clarity is achieved. Quality is our standard, not just an afterthought." },
                                    { num: 5, icon: 'military_tech', title: 'Earn contribution credibility', desc: "Build your reputation as a top contributor and strengthen your campus network for future opportunities." },
                                ].map((step, i) => (
                                    <div key={i} className="relative flex gap-10 group">
                                        <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold relative z-10 transition-colors shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] ${step.num === 1 ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,0,0.15)] group-hover:scale-105' : 'bg-[#2c2219] border border-white/10 text-white group-hover:border-primary group-hover:text-primary'}`}>
                                            {step.num}
                                        </div>
                                        <div className="pt-3">
                                            <h4 className="font-display text-2xl font-bold text-white mb-3 flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary text-xl">{step.icon}</span>
                                                {step.title}
                                            </h4>
                                            <p className="text-[#E6D5B8]/60 leading-relaxed max-w-lg">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-32 bg-[#2c2219] relative" id="contributors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="font-display text-4xl font-bold text-white mb-6">Success Stories from Students</h2>
                        <div className="flex items-center justify-center gap-2 text-primary">
                            {[1, 2, 3, 4].map(i => (
                                <span key={i} className="material-symbols-outlined text-2xl">star</span>
                            ))}
                            <span className="material-symbols-outlined text-2xl">star_half</span>
                            <span className="text-white font-bold ml-3 text-lg">4.9/5 Average Rating</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Priya S.', school: 'Delhi University', quote: "The pressure is real, but AssignMate helped me tackle it. Found a senior from my own college who guided me through the complex topics of Microeconomics." },
                            { name: 'Arjun M.', school: 'BITS Pilani', quote: "Finding verified peers from my own college was a game-changer. The explanations I got helped me truly understand the concepts for my finals." },
                            { name: 'Vikram R.', school: 'IIT Madras', quote: "As a contributor, I love helping juniors understand complex topics. Teaching others has deepened my own understanding while earning extra." },
                        ].map((t, i) => (
                            <div key={i} className="bg-black p-10 rounded-3xl border border-white/5 relative hover:border-primary/20 transition-colors shadow-lg">
                                <span className="material-symbols-outlined text-6xl text-[#2c2219] absolute top-6 right-6 opacity-50">format_quote</span>
                                <p className="text-[#E6D5B8]/80 italic font-serif leading-relaxed text-lg mb-10 relative z-10">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                                    <img alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary" src={`https://i.pravatar.cc/150?img=${i + 25}`} />
                                    <div>
                                        <h5 className="text-base font-bold text-white">{t.name}</h5>
                                        <p className="text-[11px] uppercase font-bold tracking-widest text-primary">{t.school}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-black">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-[#2c2219] relative overflow-hidden text-center py-24 px-8 shadow-2xl border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a130e] to-transparent opacity-90"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-900 opacity-20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to learn together?</h2>
                        <p className="text-[#E6D5B8]/70 text-lg mb-12 font-light max-w-xl mx-auto">Join India's free, student learning community. Share knowledge, build understanding, and grow together today.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-5">
                            <button onClick={handleSignup} className="px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.15)] hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] hover:bg-orange-600 transition-all transform hover:-translate-y-1">
                                Join Your Campus
                            </button>
                            <button onClick={handleLogin} className="px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                Start Contributing
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* Footer */}
            <Footer />
        </div>
    );
};

