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
    Globe,
    CheckCircle2,
    Lock,
    Search,
    BrainCircuit,
    Smartphone,
    Server,
    Database
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';

// --- Data Structure ---
type SlideType = 'hero' | 'problem' | 'solution' | 'market' | 'business' | 'tech' | 'roadmap' | 'team';

interface SlideData {
    id: string;
    type: SlideType;
    title: string;
    subtitle: string;
    icon: any; // Lucide Icon
    content?: string;
    stats?: { label: string; value: string; desc?: string }[];
    points?: { title: string; desc: string; icon: any }[];
    techStack?: { category: string; items: string[] }[];
    timeline?: { quarter: string; title: string; desc: string }[];
    color: string;
}

const slides: SlideData[] = [
    {
        id: 'hero',
        type: 'hero',
        title: "AssignMate",
        subtitle: "The Future of Academic Assistance",
        icon: GraduationCap,
        content: "India's first hyper-local, gamified marketplace connecting students with verified academic talent.",
        color: "text-primary"
    },
    {
        id: 'problem',
        type: 'problem',
        title: "The Crisis",
        subtitle: "Why Students Are Struggling",
        icon: Zap,
        stats: [
            { label: "86%", value: "Burnout Rate", desc: "Engineering students reporting severe academic stress" },
            { label: "40%", value: "Scam Risk", desc: "Prevalance of fraud in unverified Telegram groups" },
            { label: "0", value: "Trust", desc: "Current solutions lack identity verification" }
        ],
        color: "text-orange-500"
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
        color: "text-green-500"
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
        color: "text-blue-500"
    },
    {
        id: 'business',
        type: 'business',
        title: "Business Model",
        subtitle: "Sustainable Unit Economics",
        icon: DollarSign,
        stats: [
            { label: "10-20%", value: "Commission", desc: "On every completed assignment" },
            { label: "₹499", value: "Pro Plan", desc: "Monthly subscription for writers" },
            { label: "₹99", value: "Urgent Fee", desc: "For <24hr delivery requests" }
        ],
        color: "text-yellow-500"
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
        color: "text-cyan-500"
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
        color: "text-purple-500"
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
        color: "text-orange-400"
    }
];

export function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
            else if (e.key === 'ArrowLeft') prevSlide();
            else if (e.key === 'Escape') navigate('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    // --- Sub-Components for Slide Types ---

    const StatsGrid = ({ stats, color }: { stats: any[], color: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <div className={`text-4xl md:text-5xl font-black mb-2 ${color}`}>{stat.value}</div>
                    <div className="text-lg font-bold text-white mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-400">{stat.desc}</div>
                </motion.div>
            ))}
        </div>
    );

    const PointsList = ({ points, color }: { points: any[], color: string }) => (
        <div className="flex flex-col gap-4 w-full max-w-2xl mt-8">
            {points.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 text-left"
                >
                    <div className={`p-3 rounded-full bg-white/5 ${color}`}>
                        <p.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{p.title}</h3>
                        <p className="text-sm text-gray-400">{p.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const TechGrid = ({ stack, color }: { stack: any[], color: string }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            {stack.map((cat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left"
                >
                    <div className={`text-xl font-bold mb-4 ${color} border-b border-white/10 pb-2`}>{cat.category}</div>
                    <div className="flex flex-wrap gap-2">
                        {cat.items.map((item: string, j: number) => (
                            <span key={j} className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300 border border-white/5">
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const Timeline = ({ events, color }: { events: any[], color: string }) => (
        <div className="relative w-full max-w-4xl mt-12">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {events.map((e, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <div className={`w-12 h-12 rounded-full border-4 border-[#1b140d] flex items-center justify-center ${color.replace('text-', 'bg-')} text-[#1b140d] font-black mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                            {i + 1}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-1">{e.quarter}</h3>
                        <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${color}`}>{e.title}</div>
                        <p className="text-xs text-gray-400">{e.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-[#1b140d] text-white overflow-hidden flex items-center justify-center font-display selection:bg-primary/30">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Nav */}
            <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none z-50 flex items-center justify-between px-4 md:px-8">
                <GlassButton onClick={prevSlide} className="pointer-events-auto p-3 rounded-full border-white/10 hover:bg-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all hover:scale-110">
                    <ChevronLeft className="w-8 h-8" />
                </GlassButton>
                <GlassButton onClick={nextSlide} className="pointer-events-auto p-3 rounded-full border-white/10 hover:bg-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all hover:scale-110">
                    <ChevronRight className="w-8 h-8" />
                </GlassButton>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 w-full max-w-6xl px-4 md:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Slide Card */}
                        <GlassCard className="w-full min-h-[70vh] p-8 md:p-16 flex flex-col items-center text-center relative overflow-hidden bg-[#1b140d]/40 backdrop-blur-2xl border-white/10 shadow-2xl">

                            {/* Slide Header */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center mb-8"
                            >
                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 ${slide.color}`}>
                                    {slide.type === 'hero' ? (
                                        <img src="/logo.png" alt="AssignMate Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
                                    ) : (
                                        <Icon className="w-12 h-12" />
                                    )}
                                </div>
                                <h2 className={`text-lg font-bold tracking-widest uppercase mb-2 ${slide.color}`}>{slide.subtitle}</h2>
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">{slide.title}</h1>
                            </motion.div>

                            {/* Dynamic Content Rendering */}
                            <div className="w-full flex-1 flex flex-col items-center justify-center">
                                {slide.content && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-8"
                                    >
                                        {slide.content}
                                    </motion.p>
                                )}

                                {/* Render Sub-Components Based on Data Availability */}
                                {slide.stats && <StatsGrid stats={slide.stats} color={slide.color} />}
                                {slide.points && <PointsList points={slide.points} color={slide.color} />}
                                {slide.techStack && <TechGrid stack={slide.techStack} color={slide.color} />}
                                {slide.timeline && <Timeline events={slide.timeline} color={slide.color} />}
                            </div>

                        </GlassCard>

                        {/* Footer / Progress */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-12 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="text-white/20 text-xs font-mono uppercase tracking-widest">
                                Slide {currentSlide + 1} / {slides.length} • AssignMate Pitch Deck
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-8 left-8 flex items-center gap-3 opacity-50 z-30">
                <img src="/logo.png" className="w-8 h-8 brightness-0 invert" alt="AssignMate" />
                <span className="font-bold text-white tracking-tight">AssignMate</span>
            </div>

            <div className="absolute top-8 right-8 z-30">
                <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                    Exit Presentation
                </button>
            </div>
        </div>
    );
}
