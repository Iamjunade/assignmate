
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
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                    <div className="flex items-center space-x-4 mb-4">
                        {/* Using a public GDG logo URL or fallback to text */}
                        <img
                            src="https://developers.google.com/static/community/images/gdg-logo.svg"
                            alt="Google Developer Groups"
                            className="h-16"
                        />
                        <div className="text-left">
                            <h2 className="text-2xl font-medium text-gray-600">Google Developer Group</h2>
                            <p className="text-sm text-gray-500">On Campus</p>
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent p-2">
                        AssignMate
                    </h1>
                    <p className="text-2xl text-gray-600 font-light">
                        Empowering Academic Success
                    </p>
                </div>
            )
        },
        // Slide 2: Problem & Solution
        {
            id: 2,
            content: (
                <div className="flex flex-col h-full p-16 text-left">
                    {/* Header Logo */}
                    <div className="absolute top-8 left-8 flex items-center space-x-2">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Google_Developers_logo.svg/1200px-Google_Developers_logo.svg.png"
                            alt="GDG Logo"
                            className="h-8 w-auto" // Adjusted sizing
                        />
                        <div>
                            <h2 className="text-lg font-medium text-gray-700 leading-tight">Google Developer Group</h2>
                            <p className="text-xs text-gray-500 leading-tight">On Campus</p>
                        </div>
                    </div>

                    <div className="mt-16 space-y-12">
                        <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                            Brief about your solution and problem statement addressing
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold text-red-500 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                                    The Problem
                                </h3>
                                <p className="text-xl text-gray-600 leading-relaxed text-justify">
                                    Students often struggle with managing complex assignments, facing tight deadlines and a lack of reliable, unified platforms to find qualified assistance. The fragmentation of communication and payment channels leads to scams and poor quality work.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold text-green-500 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                                    The Solution
                                </h3>
                                <p className="text-xl text-gray-600 leading-relaxed text-justify">
                                    <strong>AssignMate</strong> provides a secure, seamless ecosystem connecting students with verified writers. We offer real-time chat, milestone-based project tracking, and secure payments to ensure transparency, trust, and academic success for every user.
                                </p>
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
        <div className="h-screen w-full bg-white overflow-hidden relative font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full"
                >
                    {slides[currentSlide].content}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls (Hidden in presentation mode usually, but helpful for web) */}
            <div className="absolute bottom-8 right-8 flex space-x-4">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* Page Indicator */}
            <div className="absolute bottom-8 left-8 text-gray-400 font-medium">
                {currentSlide + 1} / {slides.length}
            </div>
        </div>
    );
};

export default GDC;
