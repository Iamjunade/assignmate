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
        color: "text-primary"
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
        color: "text-orange-400"
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
        color: "text-blue-400"
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
        color: "text-primary-light"
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
        color: "text-purple-400"
    },
    {
        id: 'team',
        title: "Meta Minds",
        subtitle: "The Team",
        icon: Globe,
        content: "Developed by a passionate team dedicated to solving real student problems through innovative technology.",
        details: "Visit our website for more information.",
        color: "text-orange-300"
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
        // Branded Dark Background
        <div className="fixed inset-0 bg-[#1b140d] text-white overflow-hidden flex items-center justify-center font-display">
            {/* Premium Noise & Gradients */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
            }}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12 z-20 pointer-events-none">
                <GlassButton onClick={prevSlide} className="pointer-events-auto p-4 rounded-full border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-8 h-8" />
                </GlassButton>
                <GlassButton onClick={nextSlide} className="pointer-events-auto p-4 rounded-full border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <ChevronRight className="w-8 h-8" />
                </GlassButton>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 w-full max-w-5xl px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // smooth easeOutQuint
                        className="w-full"
                    >
                        <GlassCard className="p-12 md:p-20 min-h-[60vh] flex flex-col items-center justify-center text-center relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl shadow-black/50">

                            {/* Slide Specific Glow */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br ${slide.color.replace('text-', 'from-')} to-transparent opacity-20 blur-3xl rounded-full pointer-events-none`} />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                                className={`mb-8 p-6 rounded-3xl bg-white/5 border border-white/10 ${slide.color} shadow-lg`}
                            >
                                <Icon className="w-20 h-20" />
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                    {slide.title}
                                </span>
                            </motion.h1>

                            <motion.h2 className={`text-xl md:text-2xl font-medium mb-8 ${slide.color} tracking-wide uppercase opacity-90`}>
                                {slide.subtitle}
                            </motion.h2>

                            <motion.p className="text-xl md:text-2xl text-gray-400 max-w-3xl leading-relaxed mb-10 font-light">
                                {slide.content}
                            </motion.p>

                            {slide.points && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-3xl">
                                    {slide.points.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${slide.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
                                            <span className="text-lg text-gray-300 font-medium">{point}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {slide.details && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-gray-500 mt-10 text-sm italic"
                                >
                                    {slide.details}
                                </motion.p>
                            )}
                        </GlassCard>

                        {/* Meta Minds Branding Footer */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30 text-xs tracking-widest uppercase">
                            AssignMate Pitch Deck • 2026
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-2 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-12' : 'bg-white/20 w-4 hover:bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {/* Escape Hint */}
            <div className="absolute top-8 right-8 text-white/20 text-xs font-bold tracking-widest z-20 uppercase border border-white/10 px-3 py-1 rounded-full">
                ESC to Exit
            </div>

            {/* Logo Watermark */}
            <div className="absolute top-8 left-8 flex items-center gap-3 opacity-80 z-20">
                <div className="size-8 rounded-lg overflow-hidden bg-white/10 p-1">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <span className="text-white font-bold tracking-tight">AssignMate</span>
            </div>
        </div>
    );
}
