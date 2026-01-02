import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    ShieldCheck,
    Zap,
    Users,
    Code,
    TrendingUp,
    DollarSign,
    Globe
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 'hero',
        title: "AssignMate",
        subtitle: "Empowering Academic Success",
        icon: GraduationCap,
        content: "The secure, gamified marketplace connecting students with verified academic talent.",
        details: "Bridging the gap between academic pressure and reliable assistance with trust and technology.",
        color: "text-blue-400"
    },
    {
        id: 'problem',
        title: "The Problem",
        subtitle: "Academic Pressure meets Unreliable Markets",
        icon: Zap,
        content: "Students face immense deadlines, while existing solutions are plagued by scams and low quality.",
        points: [
            "High Stress & Tight Deadlines",
            "Risk of Scam & Plagiarism",
            "Lack of Verified Talent",
            "Unsafe Payment Methods"
        ],
        color: "text-red-400"
    },
    {
        id: 'solution',
        title: "The Solution",
        subtitle: "A Trust-First Ecosystem",
        icon: ShieldCheck,
        content: "We provide a secure platform with escrow payments, verified writers, and dispute resolution.",
        points: [
            "Verified Profiles (ID & Samples)",
            "Secure Escrow Payments",
            "Real-time Chat & Updates",
            "Gamified Reputation System"
        ],
        color: "text-green-400"
    },
    {
        id: 'market',
        title: "Target Market",
        subtitle: "Engineering Students in India",
        icon: Users,
        content: "Focusing on the massive demographic of engineering students requiring high-quality notes and assignments.",
        details: "Initial dataset includes thousands of engineering colleges across India, creating a precise target audience.",
        color: "text-purple-400"
    },
    {
        id: 'business',
        title: "Business Model",
        subtitle: "Sustainable Revenue",
        icon: DollarSign,
        content: "A fair commission model that scales with volume.",
        points: [
            "Commission on every completed order",
            "Premium 'Pro' profiles for visibility for writers",
            "Urgent delivery fees"
        ],
        color: "text-yellow-400"
    },
    {
        id: 'tech',
        title: "Tech Stack",
        subtitle: "Built for Performance & Scale",
        icon: Code,
        content: "Modern, reactive architecture ensuring speed and reliability.",
        points: [
            "Frontend: React + Vite + Tailwind CSS",
            "Backend: Firebase (Auth, Firestore, Storage)",
            "Design: Glassmorphism + Framer Motion",
            "Analysis: AI-driven content verification (Planned)"
        ],
        color: "text-cyan-400"
    },
    {
        id: 'roadmap',
        title: "Roadmap",
        subtitle: "The Future of EdTech",
        icon: TrendingUp,
        content: "From marketplace to full-scale academic assistant.",
        points: [
            "Q1: Beta Launch & User Onboarding",
            "Q2: Mobile App Development",
            "Q3: AI Tutoring Integration",
            "Q4: Global Expansion"
        ],
        color: "text-pink-400"
    },
    {
        id: 'team',
        title: "Meta Minds",
        subtitle: "The Team",
        icon: Globe,
        content: "Developed by a passionate team dedicated to solving real student problems through innovative technology.",
        details: "Visit our website for more information.",
        color: "text-orange-400"
    }
];

export function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'Escape') {
                navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    return (
        <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none">
                <GlassButton onClick={prevSlide} className="pointer-events-auto p-4 rounded-full">
                    <ChevronLeft className="w-8 h-8" />
                </GlassButton>
                <GlassButton onClick={nextSlide} className="pointer-events-auto p-4 rounded-full">
                    <ChevronRight className="w-8 h-8" />
                </GlassButton>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-5xl px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full"
                    >
                        <GlassCard className="p-12 md:p-16 min-h-[60vh] flex flex-col items-center justify-center text-center relative overflow-hidden border-white/10">
                            {/* Background Glow */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br ${slide.color.replace('text-', 'from-').replace('-400', '-500')} to-transparent opacity-20 blur-3xl rounded-full pointer-events-none`} />

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className={`mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 ${slide.color}`}
                            >
                                <Icon className="w-24 h-24" />
                            </motion.div>

                            <motion.h1
                                className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                            >
                                {slide.title}
                            </motion.h1>

                            <motion.h2 className={`text-2xl md:text-3xl font-light mb-8 ${slide.color}`}>
                                {slide.subtitle}
                            </motion.h2>

                            <motion.p className="text-xl text-gray-300 max-w-3xl leading-relaxed mb-8">
                                {slide.content}
                            </motion.p>

                            {slide.points && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-3xl">
                                    {slide.points.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${slide.color.replace('text-', 'bg-')}`} />
                                            <span className="text-lg text-gray-200">{point}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {slide.details && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-400 mt-8 italic"
                                >
                                    {slide.details}
                                </motion.p>
                            )}
                        </GlassCard>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center space-x-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-10' : 'bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>

            {/* Escape Hint */}
            <div className="absolute top-6 right-6 text-white/30 text-sm z-20">
                Press ESC to exit
            </div>
        </div>
    );
}
