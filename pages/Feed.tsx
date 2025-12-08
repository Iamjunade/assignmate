import React, { useState, useEffect } from 'react';
import { db } from '../services/mockSupabase';
import { Loader2, Filter, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import WriterCard from '../components/WriterCard';
import { useAuth } from '../contexts/AuthContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { useToast } from '../contexts/ToastContext';

const CATEGORIES = ['All', 'Practical Records', 'Assignments', 'Blue Books', 'Viva Prep', 'Final Year Project', 'Coding', 'Design'];

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
        const data = await db.getWriters();
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
        <div className="min-h-full bg-slate-50">
            {/* Hero Section for Visitors */}
            {!user && (
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-wide mb-6 border border-white/30 shadow-sm">
                            🚀 #1 Student Marketplace in India
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                            Assignments done, <br /> <span className="text-orange-100">Stress gone.</span>
                        </h1>
                        <p className="text-orange-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
                            Connect with top peers from universities across India for help with assignments, records, and projects.
                        </p>
                    </div>
                </div>
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
                    <motion.div>
                        {filteredWriters.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                                <Sparkles className="mx-auto text-amber-400 mb-4" size={40} />
                                <p className="font-bold text-slate-700 text-lg">No students found.</p>
                                <p className="text-sm text-slate-500 mt-1">Try searching for a different college or skill.</p>
                                <button onClick={() => { setFilter('All'); setSearchTerm('') }} className="mt-6 text-orange-600 hover:text-orange-700 text-sm font-bold underline decoration-2 underline-offset-4">View All Students</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredWriters.map((writer, i) => (
                                    <WriterCard
                                        key={writer.id}
                                        writer={writer}
                                        onChat={onChat}
                                        index={i}
                                        onToggleSave={user ? handleToggleSave : undefined}
                                        isSaved={user?.saved_writers?.includes(writer.id)}
                                        connectionStatus={networkMap[writer.id] as any || 'none'}
                                        onConnect={handleConnect}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};