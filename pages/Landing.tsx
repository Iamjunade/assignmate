import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';

export const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchSubject, setSearchSubject] = useState('');
    const [searchUniversity, setSearchUniversity] = useState('');

    const handleLogin = () => navigate('/auth');
    const handleSignup = () => navigate('/auth?tab=signup');

    const handleSearch = (subject?: string, university?: string) => {
        const searchTerm = subject || searchSubject || university || searchUniversity;
        const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';

        if (user) {
            // User is logged in - go directly to writers page with search
            navigate(`/writers${searchQuery}`);
        } else {
            // User not logged in - redirect to auth with return URL
            const returnUrl = `/writers${searchQuery}`;
            navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
        }
    };

    const handleScrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-[#1b140d] dark:text-white transition-colors duration-200">
            {/* Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#f3ede7] dark:border-[#3a2e24] bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-4 w-full">
                <div className="flex items-center gap-2 text-[#1b140d] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                    <div className="size-10 rounded-xl overflow-hidden">
                        <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight">AssignMate</h2>
                </div>
                <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                    <nav className="flex items-center gap-8">
                        <button onClick={() => handleScrollTo('how-it-works')} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">How it Works</button>
                        <button onClick={() => handleScrollTo('trust-safety')} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Trust & Safety</button>
                        <button onClick={handleSignup} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">For Writers</button>
                    </nav>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <button onClick={() => navigate('/feed')} className="text-sm font-bold hover:text-primary transition-colors">Dashboard</button>
                                <div
                                    className="size-10 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => navigate('/profile')}
                                >
                                    <Avatar src={user.avatar_url} alt={user.full_name} className="w-full h-full" />
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLogin} className="text-sm font-bold hover:text-primary transition-colors">Login</button>
                                <button onClick={handleSignup} className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-[#1b140d] text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                    <span className="truncate">Join Now</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* Mobile Menu Icon */}
                <button className="lg:hidden text-[#1b140d] dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-background-light dark:bg-background-dark flex flex-col items-center justify-center gap-8 lg:hidden">
                    <button className="absolute top-6 right-6" onClick={() => setMobileMenuOpen(false)}>
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <button onClick={() => { handleScrollTo('how-it-works'); setMobileMenuOpen(false); }} className="text-xl font-bold">How it Works</button>
                    <button onClick={() => { handleScrollTo('trust-safety'); setMobileMenuOpen(false); }} className="text-xl font-bold">Trust & Safety</button>
                    <button onClick={() => { handleSignup(); setMobileMenuOpen(false); }} className="text-xl font-bold">For Writers</button>
                    <button onClick={() => { handleLogin(); setMobileMenuOpen(false); }} className="text-xl font-bold text-primary">Login</button>
                    <button onClick={() => { handleSignup(); setMobileMenuOpen(false); }} className="px-8 py-3 bg-primary text-[#1b140d] font-bold rounded-full">Join Now</button>
                </div>
            )}

            {/* Hero Section - Full Screen Height */}
            <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 md:px-10 lg:px-20 overflow-hidden">
                {/* Abstract Background Blob */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                <div className="w-full max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 w-fit">
                                <span className="material-symbols-outlined text-primary text-sm">security</span>
                                <span className="text-xs font-bold text-primary tracking-wide uppercase">100% Secure & Verified</span>
                            </div>
                            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl text-[#1b140d] dark:text-white">
                                Beat the <span className="text-primary relative inline-block">Last-Minute Panic<svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-40" preserveAspectRatio="none" viewBox="0 0 100 10"><path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path></svg></span>. India's #1 Student Marketplace.
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 md:text-xl leading-relaxed max-w-lg">
                                Connect with verified top-tier peers from your own college. Assignments done fast, payments held safe.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button onClick={handleLogin} className="flex items-center justify-center rounded-full h-14 px-8 bg-primary text-[#1b140d] text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                    Find Help Now
                                </button>
                                <button onClick={handleSignup} className="flex items-center justify-center rounded-full h-14 px-8 bg-white dark:bg-white/10 border border-[#e7dbcf] dark:border-white/10 text-[#1b140d] dark:text-white text-base font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                    Become a Writer
                                </button>
                            </div>
                            <div className="flex items-center gap-4 pt-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex -space-x-2">
                                    <img alt="Student portrait" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#221910]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJY7INpqcQQsp-lWIu_rci1_QHqrnpb0EAo-biaiC6wl7kwVrHi2tXL_SgRPHg3B6QlVAZZoHglXZskrcdpi-4n0Wm7YynjXmZeHxKcAzdh9QhdLZDKtKGCFBQ_8jhcoZp6hIGw-BNWHmAWYFBhwdLJZWAcY9VNbEsSDoZcF0aT3Gy3KBUkqodRXB9gYJIcLKPrhwPmgHdZ3Xo_ZGylB9o72htjvtUMgJYyCJBru4khkMPJ4xswsqbk07QogKRO4RAWmdaPtl7TJNG" />
                                    <img alt="Student portrait" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#221910]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-jY8uTRSj0jzNyAuK_fVtGOW52ewKIMCiXqrcikERLZ79kKUShUiJAzBUueFpHXKY8BsbTwYHwJsbsFw8Y5_sAIEhr1JW_H8QD_P3vKfmqDhbyHBFLiUHMkw122s6BTIW5wjzOQi-_8uaZh6rsFpTz82HukK8qK3hn81qi2exs7i6x6ooZOS9j_GDxBQYrXJTXpkzlwybdYQBuD1TffZrHwsYzSU12gIDYjpZSj23CnOzqdl_F7-SnUljmP6WgPODuDrKCHXCTYhN" />
                                    <img alt="Student portrait" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#221910]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5nDla7pl3lCAa5jCjVuqd40bQpArguK2JAqCAQOuNaDNBCT7pKwx3g6h9UnJMnS4TaobXA7DPbLtM0VDmJqFx_HqmR8FQ8gsKv-B1Lcd-LoLkz5mw67CZHFX9diJD-esSIC5GenqziHoXkErE-hAWtawuEWfEpL1GmOneW47CKR0HsjnpB_99Nr7zeYkgXSZzh_Day9X3zSd6D8lqCQ3lu6tj2WqBKJLX631ffiPRwMVcVtCvW5FTBlfgF9VXYuEEM5VggzTa6Fm7" />
                                </div>
                                <p>Trusted by <span className="font-bold text-[#1b140d] dark:text-white">10,000+ students</span> across IITs & DU</p>
                            </div>
                        </div>
                        <div className="relative">
                            {/* Hero Image Card */}
                            <div className="relative z-10 bg-white dark:bg-[#2c2219] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 transform rotate-2 lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute -top-6 -right-6 bg-white dark:bg-[#3a2e24] p-4 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</p>
                                            <p className="text-sm font-bold text-[#1b140d] dark:text-white">Assignment Done!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative mb-4">
                                    <img alt="AssignMate Hero" className="object-cover w-full h-full" src="/home-hero.png" />
                                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Available Now
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                            <img alt="Writer Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzzbdotfsSDrT80cZ5DBSQsRJv4cYg4iaxSLeaX0Ql1XpW8_dezsSpeiVCrz0KZ7S4k7AUHzO3oA_1Ik28xuK7HGUoAHi_SXZxwTzPQvq8VKj_56nWwj0JMpQYmlMnKbOJZ9SiA_5BB4_bQMyxqJhzmKHB1zDUdW-3cTKaIpTKigS8bMV55-ZEm04uCTT_wLnH3cJ4NUB-fFFaiost9VaJS1KWL0k-P-NwAgAQRE8KaEh8ci5nJBI_SNRxm2alNDXvbLmMcMtskh8s" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h3 className="font-bold text-[#1b140d] dark:text-white">Sai Tej</h3>
                                                <span className="material-symbols-outlined text-blue-500 text-[18px] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">CMRIT Hyd</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                                        <div className="flex items-center text-primary text-sm font-bold">
                                            <span className="material-symbols-outlined text-sm">star</span> 4.9
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Background Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-dashed border-gray-300 dark:border-gray-700 rounded-full -z-10 animate-[spin_60s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Logos Strip */}
            <div className="bg-white dark:bg-[#2c2219] py-8 border-y border-[#f3ede7] dark:border-[#3a2e24] w-full">
                <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-20">
                    <p className="text-center text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">Secure payments & Verified by</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-xl font-black text-gray-600 dark:text-gray-400 flex items-center gap-2"><span className="material-symbols-outlined">lock</span> SafePay</span>
                        <span className="text-xl font-black text-gray-600 dark:text-gray-400 flex items-center gap-2"><span className="material-symbols-outlined">school</span> UniVerify</span>
                        <span className="text-xl font-black text-gray-600 dark:text-gray-400 flex items-center gap-2"><span className="material-symbols-outlined">shield</span> BankGuard</span>
                        <span className="text-xl font-black text-gray-600 dark:text-gray-400 flex items-center gap-2"><span className="material-symbols-outlined">verified_user</span> ID Check</span>
                    </div>
                </div>
            </div>

            {/* Features / Value Props */}
            <section id="trust-safety" className="w-full px-6 py-16 md:px-10 lg:px-20 bg-background-light dark:bg-background-dark">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-[#1b140d] dark:text-white mb-4">Why AssignMate is Safer & Faster</h2>
                        <p className="text-gray-600 dark:text-gray-300">We solve the trust problem with bank-grade verification and local matching.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white dark:bg-[#2c2219] p-8 rounded-2xl border border-[#e7dbcf] dark:border-[#3a2e24] hover:shadow-lg transition-shadow group">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-blue-500 text-3xl">verified</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#1b140d] dark:text-white">Bank-Grade Trust</h3>
                            <p className="text-gray-600 dark:text-gray-400">Every writer is ID-verified. Look for the Blue Tick before you hire. No fake profiles, no scams.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-white dark:bg-[#2c2219] p-8 rounded-2xl border border-[#e7dbcf] dark:border-[#3a2e24] hover:shadow-lg transition-shadow group">
                            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#1b140d] dark:text-white">Hyper-Local Matching</h3>
                            <p className="text-gray-600 dark:text-gray-400">Find seniors from your specific university (e.g., DU, IIT) who know exactly what your professor wants.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-white dark:bg-[#2c2219] p-8 rounded-2xl border border-[#e7dbcf] dark:border-[#3a2e24] hover:shadow-lg transition-shadow group">
                            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-green-500 text-3xl">savings</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-[#1b140d] dark:text-white">Secure Payments</h3>
                            <p className="text-gray-600 dark:text-gray-400">We hold your money safely. The writer only gets paid when you approve the work.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Search Mockup */}
            <section className="w-full px-6 py-12 md:px-10 lg:px-20 bg-white dark:bg-[#2c2219]">
                <div className="mx-auto max-w-5xl bg-primary/5 dark:bg-white/5 rounded-3xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1b140d] dark:text-white mb-8">Find a verified senior from your college</h2>
                    <div className="bg-white dark:bg-[#221910] p-2 rounded-full shadow-lg flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto border border-gray-100 dark:border-white/10">
                        <div className="flex-1 flex items-center px-4 h-12 w-full">
                            <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 w-full text-sm text-[#1b140d] dark:text-white placeholder-gray-400 focus:outline-none"
                                placeholder="Subject (e.g. Economics)"
                                type="text"
                                value={searchSubject}
                                onChange={(e) => setSearchSubject(e.target.value)}
                            />
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
                        <div className="flex-1 flex items-center px-4 h-12 w-full border-t md:border-t-0 border-gray-100 dark:border-white/5">
                            <span className="material-symbols-outlined text-gray-400 mr-2">school</span>
                            <select
                                className="bg-transparent border-none focus:ring-0 w-full text-sm text-[#1b140d] dark:text-white cursor-pointer focus:outline-none"
                                value={searchUniversity}
                                onChange={(e) => setSearchUniversity(e.target.value)}
                            >
                                <option value="">Select University</option>
                                <option value="Delhi University">Delhi University</option>
                                <option value="IIT Bombay">IIT Bombay</option>
                                <option value="Mumbai University">Mumbai University</option>
                                <option value="BITS Pilani">BITS Pilani</option>
                            </select>
                        </div>
                        <button onClick={() => handleSearch()} className="bg-primary hover:bg-primary/90 text-[#1b140d] font-bold rounded-full px-8 h-12 w-full md:w-auto shadow-md transition-all">
                            Search
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Popular:</span>
                        <button onClick={() => handleSearch('Economics')} className="bg-white dark:bg-[#3a2e24] px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-primary transition-colors">Economics @ DU</button>
                        <button onClick={() => handleSearch('Computer Science')} className="bg-white dark:bg-[#3a2e24] px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-primary transition-colors">CS @ IIT</button>
                        <button onClick={() => handleSearch('Law')} className="bg-white dark:bg-[#3a2e24] px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5 cursor-pointer hover:border-primary transition-colors">Law @ NLU</button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="w-full px-6 py-16 md:px-10 lg:px-20 bg-background-light dark:bg-background-dark">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        {/* Left: Text */}
                        <div className="lg:w-1/3">
                            <div className="lg:sticky lg:top-24">
                                <h2 className="text-3xl font-black text-[#1b140d] dark:text-white mb-4">How it works</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">Five simple steps to connect with talented writers from your college.</p>
                                <button onClick={() => handleScrollTo('trust-safety')} className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors">
                                    Learn more about safety <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        {/* Right: Steps */}
                        <div className="lg:w-2/3 space-y-4">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">1</span>
                                <div className="flex-1 bg-[#2c2219] dark:bg-[#2c2219] p-5 rounded-2xl flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">work</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">Writers showcase their work</h3>
                                        <p className="text-sm text-gray-400">Talented writers create profiles with their skills, samples, and ratings from past work.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2e24] text-gray-400 text-sm font-bold">2</span>
                                <div className="flex-1 bg-[#2c2219] dark:bg-[#2c2219] p-5 rounded-2xl flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-400">location_on</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">Find writers from your college</h3>
                                        <p className="text-sm text-gray-400">Search for verified writers from your college or nearby universities who understand your curriculum.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Step 3 */}
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2e24] text-gray-400 text-sm font-bold">3</span>
                                <div className="flex-1 bg-[#2c2219] dark:bg-[#2c2219] p-5 rounded-2xl flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-400">chat</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">Connect with them</h3>
                                        <p className="text-sm text-gray-400">Chat directly with writers, discuss your requirements, and find the perfect match for your project.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Step 4 */}
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2e24] text-gray-400 text-sm font-bold">4</span>
                                <div className="flex-1 bg-[#2c2219] dark:bg-[#2c2219] p-5 rounded-2xl flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-400">handshake</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">Make a deal</h3>
                                        <p className="text-sm text-gray-400">Agree on price, deadline, and terms. Your payment is held securely until you approve the work.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Step 5 */}
                            <div className="flex items-start gap-4">
                                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2e24] text-gray-400 text-sm font-bold">5</span>
                                <div className="flex-1 bg-[#2c2219] dark:bg-[#2c2219] p-5 rounded-2xl flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-400">spa</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">Relax</h3>
                                        <p className="text-sm text-gray-400">Sit back while your writer works. Get updates, review the final work, and release payment when satisfied.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="w-full px-6 py-16 md:px-10 lg:px-20 bg-white dark:bg-[#2c2219] border-t border-[#f3ede7] dark:border-[#3a2e24]">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl font-black text-center text-[#1b140d] dark:text-white mb-12">Success Stories from Students</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-background-light dark:bg-[#221910] p-6 rounded-2xl relative">
                            <span className="material-symbols-outlined absolute top-6 right-6 text-gray-200 dark:text-gray-700 text-5xl z-0">format_quote</span>
                            <div className="relative z-10">
                                <div className="flex items-center gap-1 text-primary mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">"The 'Last-Minute Panic' is real. AssignMate saved my semester. Found a senior from my own college who knew exactly how the professor grades."</p>
                                <div className="flex items-center gap-3">
                                    <img alt="Student Portrait" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVTtiaoX3kyC_tqnin6dPXXfN_q5ipqsqE0VM66zxwfnjfNOlGhht3h2N03bgvLnPhnUKmVeRhhAIIrfz0TOKf_unmFbRD3rBDVUkCqdf8L6uxQWm4MKsPvHvKyp_XtK60QNmTZPpXbB8UvG0OsFcpb2zjuYDRVuJ-WYpiCjkDG7GFKz7GQqERF2wxk9FxPL7UQoQ6zQf5e8JPOH-EGajMN2iIa2Fa_dxlNZk2x8RYNQ3xUOrHDMA4jdHcJy0PsOF2ER44z4VP7w8s" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1b140d] dark:text-white">Priya S.</p>
                                        <p className="text-xs text-gray-500">Delhi University</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-background-light dark:bg-[#221910] p-6 rounded-2xl relative">
                            <span className="material-symbols-outlined absolute top-6 right-6 text-gray-200 dark:text-gray-700 text-5xl z-0">format_quote</span>
                            <div className="relative z-10">
                                <div className="flex items-center gap-1 text-primary mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">"Security was my main concern. Seeing the verified tick and knowing my money was safe made me feel safe trying this out."</p>
                                <div className="flex items-center gap-3">
                                    <img alt="Student Portrait" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2yNIYgHyb_Jn7XF-GDsKJvdtb6FVytPUB4W8FydVYGvhJC70cfuEXL6vHEtdiG3Gy-UtnvjyxUaTTw3Cn-SXPXdPf9SWf_aFOGP2ei0MYyRb-ENiUlJP-aze9BjRzHsVqV3ezMbDY0LpbVqnMCer8qVDMyATODoJELtAoIEPPnEUTeiTtDoCQLrc-mTuqP6eAweXl7QDTduNxEmccBqlUlcWOtXG4Y0RrgRujypk64PbzW2R_-YUL-Drnw_Lg5G8fAb37b9HQZ4s0" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1b140d] dark:text-white">Arjun M.</p>
                                        <p className="text-xs text-gray-500">BITS Pilani</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="bg-background-light dark:bg-[#221910] p-6 rounded-2xl relative">
                            <span className="material-symbols-outlined absolute top-6 right-6 text-gray-200 dark:text-gray-700 text-5xl z-0">format_quote</span>
                            <div className="relative z-10">
                                <div className="flex items-center gap-1 text-primary mb-4">
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                                    <span className="material-symbols-outlined text-sm fill-current">star_half</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">"As a writer, I love earning extra pocket money here. The payment system is reliable and I only take projects I'm good at."</p>
                                <div className="flex items-center gap-3">
                                    <img alt="Student Portrait" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0PtwXpp3_rbAL1YpVWceMA4OiLGByXEbDrPs6sBUl3CNet35GyW4d8cXG1Rilcruu8bf3IEoOzWoeRfnWSRx3Uq6FPcJ2n2Ti3slBL5ZyZHslyuLXuYp7ONyR3GCK6FYxsziiPJ9bJ-Nsn1wIucE9egEurKemN7MFPrXKDOx4KeAnuYKmBCQXgSCM8f47_K90La_l-3IhTYUptJkEYE5zUdp_BZKYn7BHnBQlalcFDkvbvxjVrTpNnB_dUj-uZcGHtHptTsDiqHW" />
                                    <div>
                                        <p className="text-sm font-bold text-[#1b140d] dark:text-white">Vikram R.</p>
                                        <p className="text-xs text-gray-500">IIT Madras</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full px-6 py-20 md:px-10 lg:px-20 bg-background-light dark:bg-background-dark">
                <div className="mx-auto max-w-6xl bg-[#1b140d] dark:bg-white/5 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to beat the deadline?</h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl">Join India's most secure student community today. Whether you need help or want to earn, start with trust.</p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button onClick={handleLogin} className="flex items-center justify-center rounded-full h-14 px-10 bg-primary text-[#1b140d] text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 transition-all">
                                Start Hiring Now
                            </button>
                            <button onClick={handleSignup} className="flex items-center justify-center rounded-full h-14 px-10 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-base font-bold hover:bg-white/20 transition-all">
                                Become a Writer
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-background-light dark:bg-[#221910] border-t border-[#f3ede7] dark:border-[#3a2e24] px-6 py-12 md:px-10 lg:px-20">
                <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 pr-8">
                        <div className="flex items-center gap-2 text-[#1b140d] dark:text-white mb-2">
                            <div className="size-8 rounded-lg overflow-hidden">
                                <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-lg font-bold">AssignMate</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                            India's #1 Secure Student Marketplace. We connect students with verified peers for academic help, safely and securely.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-[#1b140d] dark:text-white">Platform</h3>
                        <button onClick={() => handleScrollTo('how-it-works')} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">How it works</button>
                        <button onClick={() => handleSearch()} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Browse Writers</button>
                        <button onClick={() => handleScrollTo('trust-safety')} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Safety & Trust</button>
                        <button onClick={handleSignup} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Pricing</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-[#1b140d] dark:text-white">Support</h3>
                        <button className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Help Center</button>
                        <button className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Contact Us</button>
                        <button className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Dispute Resolution</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-[#1b140d] dark:text-white">Legal</h3>
                        <button onClick={() => navigate('/terms')} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
                        <button onClick={() => navigate('/privacy')} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
                        <button onClick={() => navigate('/community-guidelines')} className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Community Guidelines</button>
                        <button className="text-sm text-left text-gray-500 hover:text-primary transition-colors cursor-pointer">Academic Integrity</button>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">© 2024 AssignMate. All rights reserved.</p>
                    <div className="flex gap-4">
                        <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined">public</span></button>
                        <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined">chat_bubble</span></button>
                    </div>
                </div>
            </footer>
        </div>
    );
};
