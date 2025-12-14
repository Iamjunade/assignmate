import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WriterCard from '../components/WriterCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatsRow } from '../components/dashboard/StatsRow';

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

export const Feed = ({ user, onChat }: { user: any, onChat: any }) => {
    const { refreshProfile } = useAuth();
    const { success } = useToast();
    const [writers, setWriters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    // Map of userId -> status ('connected', 'pending_sent', etc)
    const [networkMap, setNetworkMap] = useState<Record<string, string>>({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        // Pass the current filter (tag) to the server
        const data = await db.getWriters(user, filter);
        const others = user ? (data.filter((w: any) => w.id !== user.id) || []) : data;
        setWriters(others);

        if (user) {
            const map = await db.getNetworkMap(user.id);
            setNetworkMap(map);
        }

        setLoading(false);
    };

    // Reload when user OR filter changes
    useEffect(() => { load(); }, [user, filter]);

    const handleToggleSave = async (writerId: string) => {
        if (!user) return; // Prevent action if visitor
        await db.toggleSaveWriter(user.id, writerId);
        await refreshProfile(); // Refresh my saved list
    };

    const handleConnect = async (writerId: string) => {
        if (!user) return;
        await db.sendConnectionRequest(user.id, writerId);
        setNetworkMap(prev => ({ ...prev, [writerId]: 'pending_sent' }));
        success("Connection request sent!");
    };

    const filteredWriters = writers.filter((w: any) => {
        const matchesSearch = w.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.school.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filtering is now done on server.
        // We only client-side filter for search term now.

        // Visibility Logic (Double check client side just in case)
        const isVisible = (!w.visibility || w.visibility === 'global') ||
            (w.visibility === 'college' && (
                (user && user.school && w.school && user.school.trim().toLowerCase() === w.school.trim().toLowerCase()) ||
                (searchTerm.length > 2 && w.school.toLowerCase().includes(searchTerm.toLowerCase()))
            ));

        return matchesSearch && isVisible;
    });

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/30">
            <Sidebar user={user} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader
                    user={user}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-6xl mx-auto flex flex-col gap-8">
                        {/* Welcome Section */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight mb-2">
                                Good Morning, {user?.handle || 'Student'}. <span className="text-text-muted font-medium">No panic today.</span>
                            </h1>
                            <p className="text-text-muted">You have 2 active projects and 1 deadline approaching.</p>
                        </div>

                        {/* Stats Row */}
                        <StatsRow />

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Left Column: Active Projects & Messages (Wider) */}
                            <div className="xl:col-span-2 flex flex-col gap-8">
                                {/* Active Projects Section (Repurposed as Recommended Writers for now) */}
                                <section className="flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-text-dark">Recommended Writers</h2>
                                        <button className="text-sm font-bold text-primary hover:underline">View All</button>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="animate-spin text-primary w-8 h-8" />
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
                                                    <p className="font-bold text-slate-700 text-lg">No writers found.</p>
                                                    <p className="text-sm text-text-muted mt-1">Try searching for a different college or skill.</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                                                    variants={containerVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    {filteredWriters.map((writer: any, i: number) => (
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
                                </section>
                            </div>

                            {/* Right Column: Suggestions & Utils */}
                            <div className="flex flex-col gap-8">
                                {/* Trust Banner */}
                                <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-text-dark">
                                        <span className="material-symbols-outlined text-3xl">shield_person</span>
                                        <h3 className="text-lg font-bold leading-tight">Escrow Protected</h3>
                                    </div>
                                    <p className="text-sm text-text-muted">Payments are released to writers only after you approve the final submission.</p>
                                    <button className="w-full py-2.5 rounded-full bg-white text-text-dark text-sm font-bold shadow-sm hover:bg-gray-50 border border-transparent transition-colors">Learn More</button>
                                </div>

                                {/* Quick Tip */}
                                <div className="bg-gradient-to-r from-background-light to-white p-5 rounded-xl border border-dashed border-border-color text-center">
                                    <p className="text-xs text-text-muted mb-3 font-medium">Need help fast?</p>
                                    <p className="text-sm font-bold text-text-dark mb-3">Premium writers respond in &lt; 15 mins</p>
                                    <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">Browse Premium</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};