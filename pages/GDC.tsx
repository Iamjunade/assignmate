
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GDC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Reliable GDG Logo URL (Official Google Developers logo) or we can use an SVG directly if needed. 
    // Using a clean SVG from a reliable source or direct SVG to ensure visibility.
    const gdgLogoUrl = "https://www.gstatic.com/devrel-devsite/prod/v2210075a8/developers/images/touchicon-180.png"; // Fallback/Icon
    // Better approach: Use the Google Developer Group logo text/icon style manually if image fails, or a known stable URL.
    // Let's use a standard Google colors SVG for the icon part.

    const slides = [
        // Slide 1: Title
        {
            id: 1,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
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
                            {/* Simplified GDG Icon placeholder using Google Colors if SVG above is too complex or specific */}
                            <div className="flex items-center gap-1">
                                <span className="text-blue-500 font-bold text-2xl">&lt;</span>
                                <span className="text-red-500 font-bold text-2xl">GDG</span>
                                <span className="text-yellow-500 font-bold text-2xl">/&gt;</span>
                            </div>
                        </div>
                        <div className="text-left border-l-2 border-gray-300 pl-4">
                            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300">Google Developer Group</h2>
                            <p className="text-sm text-gray-400">On Campus</p>
                        </div>
                    </div>

                    <div className="py-12">
                        <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent p-4 tracking-tight">
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
                <div className="flex flex-col h-full p-16 text-left bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
                    {/* Header Logo */}
                    <div className="absolute top-8 left-8 flex items-center space-x-4">
                        <div className="flex items-center gap-1">
                            <span className="text-blue-500 font-bold text-xl">&lt;</span>
                            <span className="text-red-500 font-bold text-xl">GDG</span>
                            <span className="text-green-500 font-bold text-xl">/&gt;</span>
                        </div>
                        <div className="border-l border-gray-300 pl-3">
                            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 leading-tight">Google Developer Group</h2>
                            <p className="text-xs text-gray-400 leading-tight">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-12 flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight mb-16">
                            Brief about your solution and <br /> problem statement addressing
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-bold text-red-500 flex items-center gap-3">
                                    <span className="w-1.5 h-10 bg-red-500 rounded-full"></span>
                                    The Problem
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                                    Students often struggle with managing complex assignments, facing tight deadlines and a lack of reliable, unified platforms to find qualified assistance. The fragmentation of communication and payment channels leads to scams and poor quality work.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-3xl font-bold text-green-500 flex items-center gap-3">
                                    <span className="w-1.5 h-10 bg-green-500 rounded-full"></span>
                                    The Solution
                                </h3>
                                <div className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                                    <strong className="text-primary font-bold">AssignMate</strong> provides a secure, seamless ecosystem connecting students with verified writers. We offer real-time chat, milestone-based project tracking, and secure payments to ensure transparency, trust, and academic success for every user.
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
        <div className="h-screen w-full bg-white dark:bg-background-dark overflow-hidden relative font-sans selection:bg-primary/20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="h-full w-full"
                >
                    {slides[currentSlide].content}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex space-x-4">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                >
                    <ChevronRight className="w-6 h-6 text-gray-600 dark:text-white" />
                </button>
            </div>

            {/* Page Indicator */}
            <div className="absolute bottom-8 left-8 text-gray-400 font-medium font-mono text-sm">
                {currentSlide + 1} / {slides.length}
            </div>
        </div>
    );
};

export default GDC;
