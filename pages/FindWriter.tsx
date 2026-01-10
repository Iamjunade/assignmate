import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/firestoreService';
import { User } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Search, Filter, CheckCircle2, Circle, GraduationCap, MapPin, Star, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog'; // Assuming we might need this later, or standard HTML dialog

export const FindWriter = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filterType, setFilterType] = useState<'all' | 'contributors' | 'verified' | 'online'>('all');
    const [sortBy, setSortBy] = useState<'relevance' | 'rating'>('relevance');

    // Initial Fetch
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const users = await dbService.getAllUsers();
                // Filter out current user
                const others = users.filter(u => u.id !== user?.id);
                setAllUsers(others);
                setFilteredUsers(others);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user?.id]);

    // Filtering Logic
    useEffect(() => {
        let result = [...allUsers];

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.full_name?.toLowerCase() || '').includes(lowerQuery) ||
                (u.handle?.toLowerCase() || '').includes(lowerQuery) ||
                (u.school?.toLowerCase() || '').includes(lowerQuery) ||
                (u.bio?.toLowerCase() || '').includes(lowerQuery)
            );
        }

        // 2. Tab/Filter Type
        const paramTab = searchParams.get('tab');
        const activeFilter = paramTab === 'network' ? 'network' : filterType;

        if (activeFilter === 'contributors') {
            result = result.filter(u => u.is_writer);
        } else if (activeFilter === 'verified') {
            result = result.filter(u => u.is_verified === 'verified');
        } else if (activeFilter === 'online') {
            result = result.filter(u => u.is_online);
        }
        // 'network' logic could be added here if we had a list of connections ID
        // For now, we'll leave it as 'all' or filtered by search if 'network' is selected without specific ID list logic here
        // (Ideally we'd fetch connections and filter by that, but for this step we focus on the main search)

        setFilteredUsers(result);

    }, [searchQuery, filterType, allUsers, searchParams]);


    return (
        <div className="min-h-screen bg-[#FDFBF9] font-display text-slate-900">
            {/* Navbar Placeholder - You might have a Layout wrapper, but adding margin for clarity */}
            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider shadow-sm mb-4">
                        <span className="material-symbols-outlined text-sm filled">verified_user</span>
                        Trusted by 10,000+ Students
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                        Find Your Perfect <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF5E62]">Study Partner</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Search by name, college, city, or state to connect with verified peers who can help you succeed.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-16 relative z-10">
                    <div className="bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center">
                        <div className="pl-6 text-slate-400">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none h-14 px-4 text-lg outline-none placeholder:text-slate-400 font-medium text-slate-700"
                            placeholder="Search by name, college, city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-[#FF6B4A] hover:bg-[#ff5530] text-white px-8 h-12 rounded-full font-bold text-lg shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2">
                            Search
                        </button>
                    </div>
                    {/* Popular Tags */}
                    <div className="flex items-center justify-center gap-3 mt-4 text-xs font-medium text-slate-400">
                        <span>Popular:</span>
                        {['IIT Delhi', 'Mumbai', 'Bangalore', 'CMR Institute'].map(tag => (
                            <button key={tag} onClick={() => setSearchQuery(tag)} className="hover:text-[#FF6B4A] transition-colors bg-white border border-slate-100 px-3 py-1 rounded-full cursor-pointer">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                            <Filter size={16} /> Filters
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => setFilterType('contributors')}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'contributors' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            Contributors Only
                        </button>
                        <button
                            onClick={() => setFilterType('verified')}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'verified' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <CheckCircle2 size={16} className={filterType === 'verified' ? 'text-blue-500' : 'text-slate-400'} /> Verified
                        </button>
                        <button
                            onClick={() => setFilterType('online')}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'online' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <Circle size={10} fill="currentColor" className={filterType === 'online' ? 'text-green-500' : 'text-slate-300'} /> Online Now
                        </button>
                        {/* Clear Filter */}
                        {filterType !== 'all' && (
                            <button onClick={() => setFilterType('all')} className="text-slate-400 hover:text-slate-600 text-xs font-bold underline px-2">Clear</button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        Sort:
                        <select className="bg-transparent font-bold text-slate-900 border-none outline-none cursor-pointer">
                            <option>Relevance</option>
                            <option>Newest</option>
                            <option>Rating</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">All Students</h2>
                    <p className="text-slate-500 text-sm mb-6">{filteredUsers.length} students found</p>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white rounded-[1.5rem] p-6 h-80 animate-pulse border border-slate-100"></div>
                            ))}
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredUsers.map((peer) => (
                                <PeerCard key={peer.id} peer={peer} onNavigate={() => navigate(`/profile/${peer.id}`)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-slate-50 size-24 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query.</p>
                            <button onClick={() => { setSearchQuery(''); setFilterType('all'); }} className="mt-4 text-[#FF6B4A] font-bold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// Peer Card Component
const PeerCard = ({ peer, onNavigate }: { peer: User, onNavigate: () => void }) => {
    return (
        <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-orange-100 hover:shadow-[0_8px_25px_-4px_rgba(255,107,74,0.1)] transition-all duration-300 group flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                    <Avatar src={peer.avatar_url} alt={peer.full_name || peer.handle} className="size-14 rounded-full ring-2 ring-white shadow-sm" />
                    {peer.is_online ?
                        <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white rounded-full"></div> :
                        <div className="absolute bottom-0 right-0 size-3.5 bg-slate-300 border-2 border-white rounded-full"></div>
                    }
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 truncate" title={peer.full_name || peer.handle}>
                            {peer.full_name?.split(' ')[0] || peer.handle}
                        </h3>
                        {peer.is_verified === 'verified' && (
                            <span className="material-symbols-outlined text-blue-500 text-[18px] filled">verified</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1" title={peer.school}>
                        <GraduationCap size={12} />
                        {peer.school || 'College Student'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                            <Star size={10} fill="currentColor" /> {peer.rating?.toFixed(1) || '5.0'}
                        </div>
                        {peer.is_writer && (
                            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Contributor</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 flex-1">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed h-10">
                    {peer.bio || "Student at " + (peer.school || "University") + ". Open to connecting for study collaborations."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General</span>
                </div>
            </div>

            <button onClick={onNavigate} className="w-full py-3 rounded-xl bg-[#FFF6F4] text-[#FF6B4A] font-bold text-sm hover:bg-[#FF6B4A] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                View Profile <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
        </div>
    );
};
