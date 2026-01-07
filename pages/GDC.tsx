
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GDC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        // Slide 1: Title
        {
            id: 1,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 z-10 relative">
                    <div className="flex items-center space-x-4 mb-4">
                        {/* GDG Logo Construction */}
                        <div className="flex items-center gap-2">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4V12L19 16.2C17.44 19.19 14.07 20.65 11 19.34C7.93 18.03 6.47 14.66 7.78 11.59C9.09 8.52 12.46 7.06 15.53 8.37C16.92 8.96 18.03 10.04 18.66 11.38L20.44 10.33C18.61 6.55 14.16 5 10.38 6.83C6.6 8.66 5.05 13.11 6.88 16.89C8.71 20.67 13.16 22.22 16.94 20.39C19.32 19.24 20.98 17.06 21.49 14.5H12V4Z" fill="#5F6368" />
                                <path d="M22.5 12.5L18 16.5L16.5 13.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
                                <path d="M7 6L5 9L9 9" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                                <path d="M18 6L20 9L16 9" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
                                <path d="M7 18L5 15L9 15" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="text-left border-l-2 border-gray-300 pl-4">
                            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 font-display">Google Developer Group</h2>
                            <p className="text-sm text-gray-400 font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="py-12">
                        <h1 className="text-7xl font-black bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent p-4 tracking-tight font-display">
                            AssignMate
                        </h1>
                        <p className="text-3xl text-gray-600 dark:text-gray-400 font-light mt-4 font-sans">
                            Empowering Academic Success
                        </p>
                    </div>
                </div>
            )
        },
        // Slide 2: Problem & Solution
        {
            id: 2,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    {/* Header Logo */}
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-16 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-stretch">
                            {/* Problem Card */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-red-500 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative h-full bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-red-100 dark:border-red-900/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="text-3xl">🧩</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#1b140d] dark:text-white mb-4 font-display">
                                        The Problem
                                    </h3>
                                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-sans font-medium">
                                        Students are overwhelmed. <br /><span className="text-red-500/80 font-bold">Tight deadlines</span>, <span className="text-red-500/80 font-bold">complex assignments</span>, and no safe way to find help. The current market is fragmented, full of scams, and stressful.
                                    </p>
                                </div>
                            </div>

                            {/* Solution Card */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-bl from-green-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative h-full bg-white/80 dark:bg-[#1b140d]/40 backdrop-blur-xl border border-green-100 dark:border-green-900/30 p-8 rounded-3xl shadow-2xl transform md:-translate-y-4 hover:-translate-y-6 transition-transform duration-500">
                                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-6">
                                        <span className="text-3xl">🚀</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-[#1b140d] dark:text-white mb-4 font-display">
                                        The Solution
                                    </h3>
                                    <div className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                                        <strong className="text-green-600 dark:text-green-400 font-bold block mb-2 text-2xl">AssignMate Ecosystem</strong>
                                        A secure, verified marketplace connecting students with top-tier peers. <br />
                                        <ul className="mt-4 space-y-2 text-lg">
                                            <li className="flex items-center gap-2"><span className="text-green-500 material-symbols-outlined">check_circle</span> <span>Bank-grade secure payments</span></li>
                                            <li className="flex items-center gap-2"><span className="text-green-500 material-symbols-outlined">check_circle</span> <span>Verified campus seniors</span></li>
                                            <li className="flex items-center gap-2"><span className="text-green-500 material-symbols-outlined">check_circle</span> <span>Milestone-based tracking</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        // Slide 3: Opportunities (Differentiation)
        {
            id: 3,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-12 font-display text-center">
                            Market Opportunities & Edge
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

                            {/* Differentiation */}
                            <div className="relative group h-full">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative h-full bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-blue-100 dark:border-blue-900/30 p-8 rounded-3xl shadow-lg hover:transform hover:scale-[1.01] transition-all duration-300 flex flex-col">
                                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 font-display flex items-center gap-3">
                                        <span className="material-symbols-outlined text-3xl">difference</span>
                                        How are we different?
                                    </h3>
                                    <div className="space-y-6 flex-1">
                                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-blue-50 dark:border-blue-900/20">
                                            <h4 className="font-bold text-[#1b140d] dark:text-white text-lg mb-2">Vs. Global Freelancing Sites (Fiverr/Upwork)</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Global sites are too generic. A freelancer in another country doesn't know your specific <span className="font-bold text-blue-600 dark:text-blue-400">college professor's requirements</span>. We connect you with seniors from <strong>your own campus</strong>.</p>
                                        </div>

                                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-blue-50 dark:border-blue-900/20">
                                            <h4 className="font-bold text-[#1b140d] dark:text-white text-lg mb-2">Vs. WhatsApp/Telegram Groups</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Informal groups are rife with scams. If you pay upfront, there is <strong>zero guarantee</strong> of work. We replace this chaos with structured, verified trust.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Solving */}
                            <div className="relative group h-full">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative h-full bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-purple-100 dark:border-purple-900/30 p-8 rounded-3xl shadow-lg hover:transform hover:scale-[1.01] transition-all duration-300 flex flex-col">
                                    <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 font-display flex items-center gap-3">
                                        <span className="material-symbols-outlined text-3xl">psychology</span>
                                        How does it solve the problem?
                                    </h3>
                                    <ul className="space-y-5 flex-1">
                                        <li className="flex gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
                                            <div>
                                                <h4 className="font-bold text-[#1b140d] dark:text-white text-lg">Trust by Design (Escrow)</h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">We solve the "Trust Deficit". Payments are held in neutral escrow. The writer knows the money is there, but the student only releases it when the work is done correctly.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
                                            <div>
                                                <h4 className="font-bold text-[#1b140d] dark:text-white text-lg">Contextual Relevance</h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">By matching juniors with seniors who have <span className="text-purple-600 dark:text-purple-400 font-bold">aced the same course</span>, we ensure the assignment isn't just "done", but done to the specific standards required.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        // Slide 4: Features
        {
            id: 4,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-16 font-display text-center">
                            Core Features
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

                            {/* Feature 1 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-orange-100 dark:border-orange-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">🛡️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Secure Escrow</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Payments are held safely. Funds are only released when you are 100% satisfied.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-blue-100 dark:border-blue-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Verified Profiles</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Strict college ID verification ensures you are dealing with real seniors.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-green-100 dark:border-green-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Real-time Chat</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Negotiate terms and give feedback instantly without sharing details.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">📍</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Milestone Tracking</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Break large projects into chunks. Pay as you go, tracking progress.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 5 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-red-100 dark:border-red-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Plagiarism Checks</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Originality reports and strict guidelines ensure you never face academic issues.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 6 */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-yellow-100 dark:border-yellow-900/30 p-6 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Community Ratings</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Merit-based system. Writers earn reputation scores from verified reviews.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        // Slide 5: Google Technologies
        {
            id: 5,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-16 font-display text-center">
                            Google Technologies Used
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                            {/* Tech 1 (Gemini) */}
                            <div className="md:col-span-2 group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-sky-100 dark:border-sky-900/30 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-200/20 rounded-full blur-3xl"></div>
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                                    <div className="shrink-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-3xl flex items-center justify-center shadow-lg">
                                        <span className="text-5xl">✨</span>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-3xl font-black text-[#1b140d] dark:text-white mb-2 font-display flex items-center justify-center md:justify-start gap-3">
                                            Gemini AI <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full border border-sky-200 uppercase tracking-wide">Star Feature</span>
                                        </h3>
                                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                            The brain of our support system.
                                        </p>
                                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                            <div className="px-4 py-2 bg-white/50 dark:bg-black/40 rounded-xl border border-sky-100 text-sm font-semibold text-gray-700 dark:text-gray-300">🤖 AI Chat Assistance for Students</div>
                                            <div className="px-4 py-2 bg-white/50 dark:bg-black/40 rounded-xl border border-sky-100 text-sm font-semibold text-gray-700 dark:text-gray-300">🛠️ Automated Help Support</div>
                                            <div className="px-4 py-2 bg-white/50 dark:bg-black/40 rounded-xl border border-sky-100 text-sm font-semibold text-gray-700 dark:text-gray-300">🎫 Smart Ticket Raising</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tech 2 (Firebase Auth) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-orange-100 dark:border-orange-900/30 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl">🔐</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Firebase Authentication</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Secure, seamless identity management across google accounts.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech 3 (Firestore) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-yellow-100 dark:border-yellow-900/30 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl">🔥</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Cloud Firestore</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Real-time, scalable NoSQL database syncing data instantly.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech 4 (Storage) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/30 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl">💾</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Firebase Storage</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Robust storage for student assignments and resources.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech 5 (Google Fonts) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-red-100 dark:border-red-900/30 p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-center gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl">🎨</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Google Fonts</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Beautiful typography using Inter & Manrope for optimal readability.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        // Slide 6: Process Flow
        {
            id: 6,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-16 font-display text-left">
                            How it works
                            <span className="block text-lg font-sans font-normal text-primary mt-2">Five simple steps to connect with talented writers from your college.</span>
                        </h2>

                        <div className="space-y-6 relative ml-6 md:ml-0">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-orange-400 to-green-500/20 -z-10 hidden md:block"></div>

                            {/* Step 1 */}
                            <div className="flex items-center md:items-start group">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-orange-500/30 z-10 mr-6">1</div>
                                <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-orange-100 dark:border-orange-900/30 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-2 flex items-center gap-6">
                                    <div className="shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-2xl">💼</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Writers showcase their work</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Talented writers create profiles with their skills, samples, and ratings from past work.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-center md:items-start group">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-800 text-white font-bold text-xl flex items-center justify-center shadow-lg z-10 mr-6 group-hover:bg-blue-600 transition-colors">2</div>
                                <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-2 flex items-center gap-6">
                                    <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">📍</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Find writers from your college</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Search for verified writers from your college or nearby universities who understand your curriculum.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-center md:items-start group">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-800 text-white font-bold text-xl flex items-center justify-center shadow-lg z-10 mr-6 group-hover:bg-purple-600 transition-colors">3</div>
                                <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-purple-100 dark:border-purple-900/30 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-2 flex items-center gap-6">
                                    <div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">💬</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Connect with them</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Chat directly with writers, discuss your requirements, and find the perfect match for your project.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex items-center md:items-start group">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-800 text-white font-bold text-xl flex items-center justify-center shadow-lg z-10 mr-6 group-hover:bg-green-600 transition-colors">4</div>
                                <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-green-100 dark:border-green-900/30 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-2 flex items-center gap-6">
                                    <div className="shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">🤝</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Make a deal</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Agree on price, deadline, and terms. Your payment is held securely until you approve the work.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex items-center md:items-start group">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-800 text-white font-bold text-xl flex items-center justify-center shadow-lg z-10 mr-6 group-hover:bg-teal-600 transition-colors">5</div>
                                <div className="flex-1 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-teal-100 dark:border-teal-900/30 p-6 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-all duration-300 hover:translate-x-2 flex items-center gap-6">
                                    <div className="shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-2xl">🍃</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1b140d] dark:text-white mb-1 font-display">Relax</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Sit back while your writer works. Get updates, review the final work, and release payment when satisfied.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        },
        // Slide 7: Architecture Design
        {
            id: 7,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-16 font-display text-center">
                            System Architecture
                        </h2>

                        <div className="relative">
                            {/* Connecting Lines */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 -z-10 -translate-y-1/2 rounded-full"></div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                                {/* Layer 1: Client */}
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-full shadow-xl border-4 border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center z-10 relative group hover:scale-105 transition-transform">
                                        <span className="text-5xl mb-2">📱</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Client</span>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg inline-block text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                            Student / Writer
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Web & Mobile Access</p>
                                    </div>
                                </div>

                                {/* Layer 2: Frontend */}
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-full shadow-xl border-4 border-cyan-100 dark:border-cyan-900/50 flex flex-col items-center justify-center z-10 relative group hover:scale-105 transition-transform">
                                        <span className="text-5xl mb-2">⚛️</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Frontend</span>
                                    </div>
                                    <div className="mt-6 text-center space-y-2">
                                        <div className="bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-lg inline-block text-cyan-600 dark:text-cyan-300 font-semibold text-sm">
                                            React + Vite
                                        </div>
                                        <p className="text-xs text-gray-500">Tailwind CSS for UI</p>
                                    </div>
                                </div>

                                {/* Layer 3: Backend Services */}
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-full shadow-xl border-4 border-orange-100 dark:border-orange-900/50 flex flex-col items-center justify-center z-10 relative group hover:scale-105 transition-transform">
                                        <span className="text-5xl mb-2">🔥</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Backend</span>
                                    </div>
                                    <div className="mt-6 text-center space-y-2">
                                        <div className="flex flex-wrap justify-center gap-2 max-w-[150px]">
                                            <span className="bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded text-orange-600 dark:text-orange-300 font-semibold text-xs">Auth</span>
                                            <span className="bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-yellow-600 dark:text-yellow-300 font-semibold text-xs">Firestore</span>
                                            <span className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded text-indigo-600 dark:text-indigo-300 font-semibold text-xs">Storage</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Layer 4: AI Layer */}
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-full shadow-xl border-4 border-purple-100 dark:border-purple-900/50 flex flex-col items-center justify-center z-10 relative group hover:scale-105 transition-transform">
                                        <span className="text-5xl mb-2">✨</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Intelligence</span>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg inline-block text-purple-600 dark:text-purple-300 font-semibold text-sm">
                                            Gemini AI
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Contextual Assistance</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            )
        },
        // Slide 8: Future Roadmap
        {
            id: 8,
            content: (
                <div className="flex flex-col h-full p-8 md:p-16 text-left z-10 relative">
                    <div className="absolute top-8 left-8 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 dark:border-white/20 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight font-display">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight font-sans">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-8 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1b140d] dark:text-white leading-tight mb-16 font-display text-center">
                            Additional Details / Future Development
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">

                            {/* Feature 1 (Mobile App) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-8 rounded-3xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl">
                                        📱
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Mobile Application</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Native iOS and Android apps for on-the-go management, push notifications for bids, and quicker chats.</p>
                                        <span className="text-xs border border-blue-200 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Q3 2026</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 (AI Tutor) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-purple-200 dark:border-purple-800 p-8 rounded-3xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-3xl">
                                        🎓
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">AI Personal Tutor</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Evolving Gemini usage from support to active learning, reviewing drafts, and suggesting academic improvements.</p>
                                        <span className="text-xs border border-purple-200 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Q4 2026</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 (Voice/Video) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-green-200 dark:border-green-800 p-8 rounded-3xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl">
                                        📞
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">Voice & Video Connect</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Secure, in-app voice and video calling to discuss complex project requirements without sharing phone numbers.</p>
                                        <span className="text-xs border border-green-200 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Q1 2027</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 (Partnerships) */}
                            <div className="group bg-white/60 dark:bg-black/20 backdrop-blur-md border border-orange-200 dark:border-orange-800 p-8 rounded-3xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl">
                                <div className="flex items-start gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-3xl">
                                        🏛️
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b140d] dark:text-white mb-2 font-display">University Partnerships</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Official APIs with universities for instant student verification and course integration.</p>
                                        <span className="text-xs border border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Q2 2027</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    return (
        <div className="h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative font-display text-[#1b140d] dark:text-white selection:bg-primary/20 transition-colors duration-200">

            {/* Background Blobs (From Landing Page) */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full w-full relative z-10"
                >
                    {slides[currentSlide].content}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex space-x-4 z-20">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 transition-all ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className={`p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 transition-all ${currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105'}`}
                >
                    <ChevronRight className="w-5 h-6 text-gray-700 dark:text-gray-200" />
                </button>
            </div>

            {/* Page Indicator */}
            <div className="absolute bottom-8 left-8 text-gray-400 font-bold font-display text-sm z-20 tracking-wider">
                SLIDE {currentSlide + 1} <span className="text-gray-300 mx-2">/</span> {slides.length}
            </div>
        </div>
    );
};

export default GDC;
