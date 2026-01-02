import React, { useState, useEffect, useCallback } from 'react';
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
    Globe,
    CheckCircle2,
    Lock,
    Search,
    Maximize,
    Minimize,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Data Structure ---
type SlideType = 'hero' | 'problem' | 'solution' | 'market' | 'business' | 'tech' | 'roadmap' | 'team';

interface SlideData {
    id: string;
    type: SlideType;
    title: string;
    subtitle: string;
    icon: any;
    content?: string;
    stats?: { label: string; value: string; desc?: string }[];
    points?: { title: string; desc: string; icon: any }[];
    techStack?: { category: string; items: string[] }[];
    timeline?: { quarter: string; title: string; desc: string }[];
    color: string;
    gradient: string;
}

const slides: SlideData[] = [
    {
        id: 'hero',
        type: 'hero',
        title: "AssignMate",
        subtitle: "The Future of Academic Assistance",
        icon: GraduationCap,
        content: "India's first hyper-local, gamified marketplace connecting students with verified academic talent.",
        color: "text-primary",
        gradient: "from-orange-500/20 via-transparent to-transparent"
    },
    {
        id: 'problem',
        type: 'problem',
        title: "The Crisis",
        subtitle: "Why Students Are Struggling",
        icon: Zap,
        stats: [
            { label: "Burnout Rate", value: "86%", desc: "Engineering students reporting severe academic stress" },
            { label: "Scam Risk", value: "40%", desc: "Prevalance of fraud in unverified Telegram groups" },
            { label: "Trust Level", value: "0", desc: "Current solutions lack identity verification" }
        ],
        color: "text-red-500",
        gradient: "from-red-500/20 via-transparent to-transparent"
    },
    {
        id: 'solution',
        type: 'solution',
        title: "The Solution",
        subtitle: "Trust Through Technology",
        icon: ShieldCheck,
        content: "We replace shady Telegram groups with a secure, transparent platform.",
        points: [
            { title: "ID Verification", desc: "Every writer is verified via College ID.", icon: CheckCircle2 },
            { title: "Escrow Payments", desc: "Funds held safely until work is approved.", icon: Lock },
            { title: "Hyper-Local Match", desc: "Connect with seniors from YOUR college.", icon: Search }
        ],
        color: "text-emerald-500",
        gradient: "from-emerald-500/20 via-transparent to-transparent"
    },
    {
        id: 'market',
        type: 'market',
        title: "Market Opportunity",
        subtitle: "Untapped Potential",
        icon: Users,
        stats: [
            { label: "TAM", value: "$3.5B", desc: "Indian EdTech Market (2025)" },
            { label: "SAM", value: "1.5M", desc: "Engineering Graduates / Year" },
            { label: "SOM", value: "50k", desc: "Initial Target: Tier-1 Cities" }
        ],
        color: "text-blue-500",
        gradient: "from-blue-500/20 via-transparent to-transparent"
    },
    {
        id: 'business',
        type: 'business',
        title: "Business Model",
        subtitle: "Sustainable Unit Economics",
        icon: DollarSign,
        stats: [
            { label: "Commission", value: "10-20%", desc: "On every completed assignment" },
            { label: "Pro Plan", value: "₹499", desc: "Monthly subscription for writers" },
            { label: "Urgent Fee", value: "₹99", desc: "For <24hr delivery requests" }
        ],
        color: "text-yellow-500",
        gradient: "from-yellow-500/20 via-transparent to-transparent"
    },
    {
        id: 'tech',
        type: 'tech',
        title: "Tech Stack",
        subtitle: "Built for Scale & Speed",
        icon: Code,
        techStack: [
            { category: "Frontend", items: ["React", "Vite", "Tailwind CSS", "Framer Motion"] },
            { category: "Backend", items: ["Firebase Auth", "Firestore", "Cloud Functions"] },
            { category: "Future AI", items: ["Gemini API", "Auto-Grading", "Plagiarism Check"] }
        ],
        color: "text-cyan-500",
        gradient: "from-cyan-500/20 via-transparent to-transparent"
    },
    {
        id: 'roadmap',
        type: 'roadmap',
        title: "Roadmap",
        subtitle: "Our Path Forward",
        icon: TrendingUp,
        timeline: [
            { quarter: "Q1 '26", title: "Launch", desc: "Beta release in 5 Colleges" },
            { quarter: "Q2 '26", title: "Mobile App", desc: "iOS & Android Native Apps" },
            { quarter: "Q3 '26", title: "AI Tutor", desc: "Gemini-powered study assistant" },
            { quarter: "Q4 '26", title: "Scale", desc: "Expansion to 50+ Cities" }
        ],
        color: "text-purple-500",
        gradient: "from-purple-500/20 via-transparent to-transparent"
    },
    {
        id: 'team',
        type: 'team',
        title: "Meta Minds",
        subtitle: "Builders & Dreamers",
        icon: Globe,
        content: "A passionate team of engineers and designers committed to solving the student crisis.",
        stats: [
            { label: "Design", value: "World Class", desc: "Award-winning UI/UX" },
            { label: "Code", value: "Full Stack", desc: "Scalable Architecture" },
            { label: "Vision", value: "Long Term", desc: "Sustainable Growth" }
        ],
        color: "text-orange-400",
        gradient: "from-orange-400/20 via-transparent to-transparent"
    }
];

export function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [mouseIdle, setMouseIdle] = useState(true);
    const navigate = useNavigate();

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    navigate('/');
                }
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, nextSlide, prevSlide]);

    // Mouse movement detection for hiding controls
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setMouseIdle(false);
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setMouseIdle(true);
                setShowControls(false);
            }, 2500);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    // --- Sub-Components ---
    const StatsGrid = ({ stats, color }: { stats: any[], color: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4 + (i * 0.15), type: 'spring', damping: 20 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                    <div className={`text-5xl md:text-7xl font-black mb-3 ${color}`}>{stat.value}</div>
                    <div className="text-xl font-bold text-white mb-2">{stat.label}</div>
                    <div className="text-sm text-gray-400 text-center">{stat.desc}</div>
                </motion.div>
            ))}
        </div>
    );

    const PointsList = ({ points, color }: { points: any[], color: string }) => (
        <div className="flex flex-col gap-5 w-full max-w-3xl mt-10">
            {points.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.15), type: 'spring', damping: 20 }}
                    className="flex items-center gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                    <div className={`p-4 rounded-2xl bg-white/10 ${color}`}>
                        <p.icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl text-white mb-1">{p.title}</h3>
                        <p className="text-gray-400">{p.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const TechGrid = ({ stack, color }: { stack: any[], color: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
            {stack.map((cat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (i * 0.15), type: 'spring', damping: 20 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-left hover:bg-white/10 transition-all duration-300"
                >
                    <div className={`text-2xl font-bold mb-6 ${color} border-b border-white/10 pb-4`}>{cat.category}</div>
                    <div className="flex flex-wrap gap-3">
                        {cat.items.map((item: string, j: number) => (
                            <span key={j} className="px-4 py-2 rounded-xl bg-white/10 text-sm font-medium text-gray-200 border border-white/5">
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const Timeline = ({ events, color }: { events: any[], color: string }) => (
        <div className="relative w-full max-w-5xl mt-16">
            {/* Connector Line */}
            <div className="absolute top-8 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                {events.map((e, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.15), type: 'spring', damping: 20 }}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <div className={`w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center ${color.replace('text-', 'bg-')} text-black font-black text-2xl mb-6 shadow-2xl`}>
                            {i + 1}
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2">{e.quarter}</h3>
                        <div className={`text-sm font-bold uppercase tracking-wider mb-3 ${color}`}>{e.title}</div>
                        <p className="text-sm text-gray-400">{e.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden flex items-center justify-center font-display selection:bg-primary/30 cursor-none"
            style={{ cursor: showControls ? 'default' : 'none' }}
        >
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-50 transition-all duration-1000`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Navigation Arrows - Hidden until hover */}
            <AnimatePresence>
                {showControls && (
                    <>
                        {/* Left Arrow */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </motion.button>

                        {/* Right Arrow */}
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </motion.button>
                    </>
                )}
            </AnimatePresence>

            {/* Top Bar - Hidden until hover */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 bg-gradient-to-b from-black/50 to-transparent"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" className="w-8 h-8" alt="AssignMate" />
                            <span className="font-bold text-white/80 tracking-tight">AssignMate Pitch</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10"
                                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                            >
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10"
                                title="Exit (Esc)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Slide Content */}
            <div className="relative z-20 w-full h-full flex items-center justify-center p-8 md:p-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 1.1, rotateX: -10 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-6xl flex flex-col items-center text-center"
                    >
                        {/* Slide Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                            className={`p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 mb-8 ${slide.color}`}
                        >
                            {slide.type === 'hero' ? (
                                <img src="/logo.png" alt="AssignMate Logo" className="w-40 h-40 object-contain drop-shadow-2xl" />
                            ) : (
                                <Icon className="w-16 h-16" />
                            )}
                        </motion.div>

                        {/* Subtitle */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`text-lg md:text-xl font-bold tracking-[0.3em] uppercase mb-4 ${slide.color}`}
                        >
                            {slide.subtitle}
                        </motion.h2>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8"
                        >
                            {slide.title}
                        </motion.h1>

                        {/* Content */}
                        {slide.content && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed"
                            >
                                {slide.content}
                            </motion.p>
                        )}

                        {/* Dynamic Content */}
                        {slide.stats && <StatsGrid stats={slide.stats} color={slide.color} />}
                        {slide.points && <PointsList points={slide.points} color={slide.color} />}
                        {slide.techStack && <TechGrid stack={slide.techStack} color={slide.color} />}
                        {slide.timeline && <Timeline events={slide.timeline} color={slide.color} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Progress Bar - Hidden until hover */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 h-20 flex flex-col items-center justify-center z-50 bg-gradient-to-t from-black/50 to-transparent"
                    >
                        {/* Slide Dots */}
                        <div className="flex gap-3 mb-3">
                            {slides.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`transition-all duration-300 rounded-full ${idx === currentSlide
                                        ? 'w-10 h-2 bg-primary'
                                        : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-white/40 text-xs font-mono uppercase tracking-widest">
                            {currentSlide + 1} / {slides.length} • Press Space or → to continue
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click zones for navigation (invisible) */}
            <div
                className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-w-resize"
                onClick={prevSlide}
            />
            <div
                className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-e-resize"
                onClick={nextSlide}
            />
        </div>
    );
}
