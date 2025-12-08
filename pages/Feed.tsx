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
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {user ? `Namaste, ${user.handle} 🙏` : 'Explore Talent'}
                        </h2>
                        <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                            <Filter size={20} />
                        </button>
                    </div >

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
                </div >
            </div >

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
        </div >
    );
};