import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Loader2, Filter, Sparkles, GraduationCap, Award, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WriterCard from '../components/WriterCard';
import { useAuth } from '../contexts/AuthContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { useToast } from '../contexts/ToastContext';

const CATEGORIES = ['All', 'Practical Records', 'Assignments', 'Blue Books', 'Viva Prep', 'Final Year Project', 'Coding', 'Design'];

// Animation variants for stagger effect
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    }
};

export const Feed = ({ user, onChat }) => {
    const { refreshProfile } = useAuth();
    const { success } = useToast();
    const [writers, setWriters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Map of userId -> status ('connected', 'pending_sent', etc)
    const [networkMap, setNetworkMap] = useState<Record<string, string>>({});

    const load = async () => {
        const data = await db.getWriters(user);
        const others = user ? (data.filter(w => w.id !== user.id) || []) : data;
        setWriters(others);

        if (user) {
            const map = await db.getNetworkMap(user.id);
            setNetworkMap(map);
        }

        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    const handleToggleSave = async (writerId) => {
        if (!user) return; // Prevent action if visitor
        await db.toggleSaveWriter(user.id, writerId);
        await refreshProfile(); // Refresh my saved list
    };

    const handleConnect = async (writerId) => {
        if (!user) return;
        await db.sendConnectionRequest(user.id, writerId);
        setNetworkMap(prev => ({ ...prev, [writerId]: 'pending_sent' }));
        success("Connection request sent!");
    };

    const filteredWriters = writers.filter(w => {
        const matchesSearch = w.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.school.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filter === 'All' ||
            w.tags?.some(t => t.toLowerCase().includes(filter.toLowerCase())) ||
            w.bio?.toLowerCase().includes(filter.toLowerCase());

        // Visibility Logic
        const isVisible = (!w.visibility || w.visibility === 'global') ||
            (w.visibility === 'college' && (
                (user && user.school && w.school && user.school.trim().toLowerCase() === w.school.trim().toLowerCase()) ||
                (searchTerm.length > 2 && w.school.toLowerCase().includes(searchTerm.toLowerCase()))
            ));

        return matchesSearch && matchesCategory && isVisible;
    });

    return (
        <div className="min-h-full bg-slate-50 relative">
            {/* Floating India's #1 Badge */}
            <motion.div
                className="fixed top-20 right-4 z-50 hidden md:block"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
                transition={{
                    opacity: { duration: 0.5 },
                    x: { duration: 0.5 },
                    y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
            >
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full shadow-xl border border-orange-300/50 backdrop-blur-sm flex items-center gap-2">
                    <Award size={16} className="animate-pulse" />
                    <span className="text-xs font-bold">India's #1 Marketplace</span>
                </div>
            </motion.div>

            {/* Hero Section for Visitors */}
            {!user && (
                <motion.div
                    className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-20 text-center relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    {/* Animated Floating Elements */}
                    <motion.div
                        className="absolute top-20 left-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full"
                        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-10 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full"
                        animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                    />

                    <div className="relative z-10">
                        <motion.span
                            className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-wide mb-6 border border-white/30 shadow-sm"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        >
                            🚀 #1 Student Marketplace in India
                        </motion.span>

                        <motion.h1
                            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            Assignments done, <br /> <span className="text-orange-100">Stress gone.</span>
                        </motion.h1>

                        <motion.p
                            className="text-orange-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed opacity-90"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            Connect with top peers from universities across India for help with assignments, records, and projects.
                        </motion.p>

                        {/* Trust Indicators */}
                        <motion.div
                            className="flex flex-wrap justify-center gap-6 md:gap-8 mt-8"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <Users size={18} className="text-orange-100" />
                                <span className="text-white font-bold text-sm">10,000+ Students</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <GraduationCap size={18} className="text-orange-100" />
                                <span className="text-white font-bold text-sm">500+ Universities</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <CheckCircle size={18} className="text-orange-100" />
                                <span className="text-white font-bold text-sm">50K+ Assignments</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* Search Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 border-b border-orange-100 shadow-sm">
                <div className="p-4 md:p-6 max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {user ? `Namaste, ${user.handle} 🙏` : 'Explore Talent'}
                        </h2>
                        <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="mb-5">
                        <CollegeAutocomplete
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search by college (e.g., IIT Bombay, Osmania)..."
                            className="w-full shadow-sm"
                        />
                    </div>

                    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${filter === cat
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-200'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredWriters.length === 0 ? (
                            <motion.div
                                className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Sparkles className="mx-auto text-amber-400 mb-4" size={40} />
                                <p className="font-bold text-slate-700 text-lg">No students found.</p>
                                <p className="text-sm text-slate-500 mt-1">Try searching for a different college or skill.</p>
                                <button onClick={() => { setFilter('All'); setSearchTerm('') }} className="mt-6 text-orange-600 hover:text-orange-700 text-sm font-bold underline decoration-2 underline-offset-4">View All Students</button>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredWriters.map((writer, i) => (
                                    <motion.div key={writer.id} variants={itemVariants}>
                                        <WriterCard
                                            writer={writer}
                                            onChat={onChat}
                                            index={i}
                                            onToggleSave={user ? handleToggleSave : undefined}
                                            isSaved={user?.saved_writers?.includes(writer.id)}
                                            connectionStatus={networkMap[writer.id] as any || 'none'}
                                            onConnect={handleConnect}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};