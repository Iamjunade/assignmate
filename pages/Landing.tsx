import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Shield, MapPin, Users, Lightbulb, TrendingUp, Menu, X, CheckCircle } from 'lucide-react';

export const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchSubject, setSearchSubject] = useState('');
    const [placeholderText, setPlaceholderText] = useState('Search for subjects...');

    // College list for animation
    const colleges = [
        "CMR Institute of Technology", "BV Raju Institute of Technology", "IIT Bombay",
        "Delhi University", "BITS Pilani", "NIT Trichy", "Anna University",
        "VIT Vellore", "SRM University"
    ];

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % colleges.length;
            setPlaceholderText(`Search in ${colleges[currentIndex]}`);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = () => navigate('/auth');
    const handleSignup = () => navigate('/auth?tab=signup');
    const handleSearch = (subject?: string) => {
        const searchTerm = subject || searchSubject;
        const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
        user ? navigate(`/mentors${searchQuery}`) : navigate(`/auth?redirect=${encodeURIComponent(`/mentors${searchQuery}`)}`);
    };

    const handleScrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen w-full font-display bg-background text-slate-900 transition-colors duration-300">
            {/* Navbar */}
            <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/80 bg-white/90 backdrop-blur-md border-b border-white/20 ">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="size-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {['How it Works', 'Trust & Safety'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleScrollTo(item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))}
                                className="text-sm font-semibold text-slate-600 text-slate-600 hover:text-primary transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                        <button onClick={handleSignup} className="text-sm font-semibold text-slate-600 text-slate-600 hover:text-primary transition-colors">
                            For Contributors
                        </button>
                    </nav>

                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <>
                                <button onClick={() => navigate('/feed')} className="text-sm font-bold hover:text-primary transition-colors">Dashboard</button>
                                <div onClick={() => navigate('/profile')} className="size-10 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                                    <Avatar src={user.avatar_url} alt={user.full_name} className="w-full h-full" />
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLogin} className="text-sm font-bold hover:text-primary transition-colors px-4">Login</button>
                                <button onClick={handleSignup} className="btn-primary px-6 h-10 text-sm">Join Now</button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden p-2 text-slate-600 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white/95 bg-white/95 backdrop-blur-xl lg:hidden pt-24 px-6 flex flex-col items-center gap-8"
                    >
                        {['How it Works', 'Trust & Safety'].map((item) => (
                            <button
                                key={item}
                                onClick={() => { handleScrollTo(item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')); setMobileMenuOpen(false); }}
                                className="text-xl font-bold text-slate-800 text-slate-900"
                            >
                                {item}
                            </button>
                        ))}
                        <button onClick={() => { handleSignup(); setMobileMenuOpen(false); }} className="text-xl font-bold text-primary">Join Now</button>
                        <button onClick={() => { handleLogin(); setMobileMenuOpen(false); }} className="text-lg font-medium text-slate-500">Login</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col gap-8 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full bg-orange-50 bg-orange-50 border border-orange-100  px-4 py-1.5 backdrop-blur-sm">
                            <span className="text-xs font-bold text-primary tracking-wider uppercase">🎉 100% Free & Campus Verified</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                            Learn Together.<br />
                            <span className="text-gradient relative">Grow Together.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Join India's largest campus-verified community. Connect with seniors, share knowledge, and ace your exams together.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button onClick={handleLogin} className="btn-primary h-14 px-8 text-lg hover:-translate-y-1">
                                Explore Topics
                            </button>
                            <button onClick={handleSignup} className="btn-secondary h-14 px-8 text-lg hover:-translate-y-1">
                                Become a Contributor
                            </button>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 text-slate-900 font-bold">10,000+ students</span></p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 bg-white/80 bg-white/80 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/40  transform hover:rotate-0 transition-all duration-500">
                            {/* Floating Status Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-8 -right-8 bg-white bg-slate-100 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                            >
                                <div className="bg-green-100 bg-green-100 p-2 rounded-full">
                                    <CheckCircle size={20} className="text-green-600 " />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500">Status</p>
                                    <p className="text-sm font-bold text-slate-900 text-slate-900">Concept Clarified!</p>
                                </div>
                            </motion.div>

                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative mb-6">
                                <img src="/home-hero.png" alt="Dashboard Preview" className="object-cover w-full h-full" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img src="/logo.png" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-slate-900">Sai Tej</h3>
                                        <p className="text-xs text-slate-500">CMRIT Hyd</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Contribution Score</p>
                                    <div className="flex items-center gap-1 text-primary font-bold">
                                        <Users size={16} /> 4.9
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Search Section */}
            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto -mt-10 lg:-mt-20 relative z-20">
                    <div className="glass-strong rounded-3xl p-3 shadow-2xl shadow-orange-500/10 flex flex-col md:flex-row items-center gap-2">
                        <div className="flex-1 flex items-center px-4 h-14 w-full">
                            <Search className="text-slate-400 mr-3" size={24} />
                            <input
                                className="bg-transparent border-none w-full text-lg text-slate-900 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                                placeholder={placeholderText}
                                type="text"
                                value={searchSubject}
                                onChange={(e) => setSearchSubject(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button onClick={() => handleSearch()} className="w-full md:w-auto btn-primary h-14 px-10 rounded-2xl text-lg hover:scale-105">
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 bg-white bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">How it works</h2>
                        <p className="text-lg text-slate-600 text-slate-500 max-w-2xl mx-auto">Five simple steps to collaborative learning with your campus community.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <MapPin className="text-orange-500" size={32} />, title: "Find Contributors", desc: "Locate peers in your area." },
                            { icon: <Users className="text-blue-500" size={32} />, title: "Collaborate Openly", desc: "Work through problems together." },
                            { icon: <Lightbulb className="text-purple-500" size={32} />, title: "Build Understanding", desc: "Master concepts with peer help." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="card-clean p-8 group"
                            >
                                <div className="size-16 rounded-2xl bg-slate-50 bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-500 text-slate-500">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto rounded-[3rem] bg-slate-900 bg-slate-100 p-12 md:p-24 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to start?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleLogin} className="btn-primary h-14 px-10 text-lg">Join Your Campus</button>
                            <button onClick={handleSignup} className="h-14 px-10 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-all">Start Contributing</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
