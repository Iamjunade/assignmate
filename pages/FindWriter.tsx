import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { INDIAN_COLLEGES } from '../data/colleges';
import { dbService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import type { User } from '../types';

interface WriterCardData {
    id: string;
    name: string;
    school: string;
    avatar_url?: string | null;
    rating: number;
    jobs: number;
    price: number;
    subjects: string[];
    level: number;
    isVerified: boolean;
    isActive?: boolean;
    isPeerMatch?: boolean;
    isTrending?: boolean;
    trendingRank?: number;
    badge?: string;
}

export const FindWriter = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [collegeQuery, setCollegeQuery] = useState('');
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const [writers, setWriters] = useState<WriterCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');

    const collegeDropdownRef = useRef<HTMLDivElement>(null);

    // Filter colleges based on query
    const filteredColleges = INDIAN_COLLEGES.filter(college =>
        college.name.toLowerCase().includes(collegeQuery.toLowerCase())
    ).slice(0, 8);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
                setShowCollegeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load writers
    useEffect(() => {
        const loadWriters = async () => {
            setLoading(true);
            try {
                const allUsers = await dbService.getAllProfiles();
                const writerData: WriterCardData[] = allUsers
                    .filter((u: User) => u.is_writer && u.id !== user?.id)
                    .map((u: User, index: number) => ({
                        id: u.id,
                        name: u.full_name || u.handle || 'Anonymous',
                        school: u.school || 'Unknown College',
                        avatar_url: u.avatar_url,
                        rating: 4.5 + Math.random() * 0.5,
                        jobs: Math.floor(Math.random() * 150) + 10,
                        price: Math.floor(Math.random() * 500) + 200,
                        subjects: u.subjects || ['General'],
                        level: Math.floor(Math.random() * 20) + 1,
                        isVerified: u.is_verified === 'verified',
                        isActive: Math.random() > 0.5,
                        isPeerMatch: u.school === user?.school,
                        isTrending: index < 4,
                        trendingRank: index < 4 ? index + 1 : undefined,
                    }));
                setWriters(writerData);
            } catch (error) {
                console.error('Failed to load writers:', error);
            } finally {
                setLoading(false);
            }
        };
        loadWriters();
    }, [user]);

    const handleCollegeSelect = (collegeName: string) => {
        setCollegeQuery(collegeName);
        setShowCollegeDropdown(false);
    };

    const handleSearch = () => {
        // Filter logic would go here
        console.log('Searching:', searchQuery, collegeQuery);
    };

    const handleHire = (writerId: string) => {
        if (!user) {
            navigate('/auth');
            return;
        }
        navigate(`/profile/${writerId}`);
    };

    const trendingWriters = writers.filter(w => w.isTrending).slice(0, 4);
    const recommendedWriters = writers.filter(w => !w.isTrending);

    const filters = [
        { id: 'all', label: 'All Filters', icon: 'tune' },
        { id: 'engineering', label: 'Engineering' },
        { id: 'management', label: 'Management' },
    ];

    return (
        <div className="min-h-screen bg-[#fcfaf8] text-[#1b140d] font-display antialiased">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#fcfaf8]/90 border-b border-[#f3ede7]">
                <div className="px-6 md:px-10 lg:px-40 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined text-4xl leading-none">school</span>
                        </div>
                        <h2 className="text-[#1b140d] text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <a className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</a>
                        <span className="text-primary text-sm font-bold">Find a Writer</span>
                        <a className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/feed')}>Dashboard</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
                                <Avatar src={user.avatar_url} name={user.full_name || user.handle} size="sm" />
                                <span className="hidden sm:block text-sm font-medium">{user.full_name || user.handle}</span>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => navigate('/auth')} className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full border border-[#e7dbcf] text-sm font-bold text-[#1b140d] hover:bg-[#f3ede7] transition-all">
                                    Log In
                                </button>
                                <button onClick={() => navigate('/auth?tab=signup')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary text-[#1b140d] text-sm font-bold hover:brightness-105 transition-all shadow-md shadow-primary/20">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex flex-col w-full min-h-screen pb-20">
                {/* Breadcrumbs */}
                <div className="w-full px-6 md:px-10 lg:px-40 pt-6">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <a className="text-[#9a734c] hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</a>
                        <span className="text-[#9a734c]">/</span>
                        <span className="text-[#1b140d] font-medium">Find a Writer</span>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="w-full px-6 md:px-10 lg:px-40 py-8">
                    <div className="relative w-full rounded-3xl overflow-hidden bg-[#e8e3de] min-h-[360px] flex items-center justify-center">
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply bg-gradient-to-br from-primary/20 to-orange-200/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8]/90 via-[#fcfaf8]/40 to-transparent z-0"></div>
                        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 text-center px-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <span className="text-xs font-bold text-[#1b140d] uppercase tracking-wider">Hyper-Local Search</span>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-black text-[#1b140d] tracking-tight leading-tight">
                                Find a Verified Peer at <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#d67e26]">Your College</span>
                            </h1>
                            <p className="text-lg text-[#5a4633] max-w-xl font-medium">
                                Connect with top-tier students who understand your specific curriculum and grading standards.
                            </p>

                            {/* Search Pill */}
                            <div className="w-full max-w-2xl p-2 bg-white rounded-full shadow-lg shadow-primary/10 flex flex-col md:flex-row items-center gap-2 border border-[#f3ede7]">
                                <div className="flex-1 flex items-center px-4 h-12 w-full">
                                    <span className="material-symbols-outlined text-[#9a734c]">search</span>
                                    <input
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-[#1b140d] placeholder:text-[#9a734c] font-medium text-base ml-2 outline-none"
                                        placeholder="Search by subject, writer, or course code..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <div className="h-8 w-px bg-[#e7dbcf] hidden md:block"></div>
                                <div className="flex-1 flex items-center px-4 h-12 w-full relative" ref={collegeDropdownRef}>
                                    <span className="material-symbols-outlined text-[#9a734c]">school</span>
                                    <input
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-[#1b140d] placeholder:text-[#9a734c] font-medium text-base ml-2 outline-none"
                                        placeholder="College (e.g. IIT Delhi)"
                                        type="text"
                                        value={collegeQuery}
                                        onChange={(e) => {
                                            setCollegeQuery(e.target.value);
                                            setShowCollegeDropdown(true);
                                        }}
                                        onFocus={() => setShowCollegeDropdown(true)}
                                    />
                                    {showCollegeDropdown && filteredColleges.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#f3ede7] max-h-60 overflow-y-auto z-50">
                                            {filteredColleges.map((college) => (
                                                <div
                                                    key={college.name}
                                                    className="px-4 py-3 hover:bg-[#f3ede7] cursor-pointer text-sm"
                                                    onClick={() => handleCollegeSelect(college.name)}
                                                >
                                                    {college.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleSearch} className="w-full md:w-auto h-12 px-8 rounded-full bg-primary text-[#1b140d] font-bold text-base shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sticky Filter Bar */}
                <section className="sticky top-[73px] z-40 w-full bg-[#fcfaf8]/95 backdrop-blur-md border-b border-[#f3ede7] py-3 px-6 md:px-10 lg:px-40">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                        <button className="shrink-0 h-9 px-4 rounded-full bg-[#1b140d] text-white text-sm font-medium flex items-center gap-2 shadow-md">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            All Filters
                        </button>
                        <div className="w-px h-6 bg-[#e7dbcf] mx-1 shrink-0"></div>
                        {['Engineering', 'Management'].map(filter => (
                            <button key={filter} className="shrink-0 h-9 px-4 rounded-full bg-[#f3ede7] hover:bg-[#e7dbcf] text-[#1b140d] text-sm font-medium transition-colors border border-transparent hover:border-[#d6c7b9]">
                                {filter}
                            </button>
                        ))}
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-[#1b140d] text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            Price: Low to High
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-[#1b140d] text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                            Verified Only
                        </button>
                        <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-[#1b140d] text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px] text-yellow-600">bolt</span>
                            Fast Responder
                        </button>
                    </div>
                </section>

                {/* Main Content Container */}
                <div className="flex flex-col w-full px-6 md:px-10 lg:px-40 py-8 gap-12">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Trending Section */}
                            {trendingWriters.length > 0 && (
                                <section>
                                    <div className="flex items-end justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-primary">trending_up</span>
                                                <span className="text-primary font-bold text-sm uppercase tracking-wide">Hot Right Now</span>
                                            </div>
                                            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1b140d]">Trending in Your College</h2>
                                        </div>
                                        <button className="hidden sm:flex items-center gap-1 text-[#9a734c] font-medium hover:text-primary transition-colors">
                                            View All <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {trendingWriters.map((writer, index) => (
                                            <TrendingCard key={writer.id} writer={writer} rank={index + 1} onHire={() => handleHire(writer.id)} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* All Writers Grid */}
                            <section>
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="font-display text-2xl font-bold text-[#1b140d] mb-1">Recommended Writers</h2>
                                        <p className="text-[#9a734c] text-sm">Based on your search criteria</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#1b140d]">Sort by:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer pr-8 pl-0 py-0"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="price_low">Price: Low to High</option>
                                            <option value="rating_high">Rating: High to Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {recommendedWriters.map((writer) => (
                                        <WriterCard key={writer.id} writer={writer} onHire={() => handleHire(writer.id)} />
                                    ))}
                                </div>

                                {recommendedWriters.length > 0 && (
                                    <div className="w-full flex justify-center mt-12">
                                        <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-[#1b140d] transition-colors">
                                            Load More Writers
                                        </button>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-[#f3ede7] py-12 px-6 md:px-10 lg:px-40">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined text-2xl leading-none">school</span>
                            </div>
                            <h2 className="text-[#1b140d] text-lg font-bold">AssignMate</h2>
                        </div>
                        <p className="text-sm text-[#9a734c]">India's #1 hyper-local student marketplace. Connect with verified peers for assignment help today.</p>
                    </div>
                    <div className="flex gap-12 flex-wrap">
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Platform</h4>
                            <ul className="flex flex-col gap-2 text-sm text-[#9a734c]">
                                <li><a className="hover:text-primary cursor-pointer">Browse Writers</a></li>
                                <li><a className="hover:text-primary cursor-pointer">How it Works</a></li>
                                <li><a className="hover:text-primary cursor-pointer">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Support</h4>
                            <ul className="flex flex-col gap-2 text-sm text-[#9a734c]">
                                <li><a className="hover:text-primary cursor-pointer">Help Center</a></li>
                                <li><a className="hover:text-primary cursor-pointer">Safety Guidelines</a></li>
                                <li><a className="hover:text-primary cursor-pointer">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#e7dbcf] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#9a734c]">
                    <p>© 2026 AssignMate Inc. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a className="hover:text-primary cursor-pointer">Privacy Policy</a>
                        <a className="hover:text-primary cursor-pointer">Terms of Service</a>
                    </div>
                </div>
            </footer>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

// Trending Card Component
const TrendingCard = ({ writer, rank, onHire }: { writer: WriterCardData; rank: number; onHire: () => void }) => {
    const getBadgeStyle = () => {
        if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
        if (writer.isPeerMatch) return 'bg-primary text-[#1b140d]';
        return 'bg-blue-100 text-blue-700';
    };

    const getBadgeText = () => {
        if (rank === 1) return '#1 Trending';
        if (writer.isPeerMatch) return 'Peer Match';
        return 'Fast Reply';
    };

    return (
        <div className={`group relative bg-white rounded-2xl p-4 border ${writer.isPeerMatch ? 'border-2 border-primary/20 hover:border-primary' : 'border-[#f3ede7] hover:border-primary/30'} shadow-[0_4px_20px_-2px_rgba(27,20,13,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(240,153,66,0.15)] transition-all duration-300`}>
            {writer.isPeerMatch && <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-2xl"></div>}
            <div className={`absolute top-3 ${writer.isPeerMatch ? 'left-3' : 'right-3'} ${getBadgeStyle()} text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10 flex items-center gap-1`}>
                {writer.isPeerMatch && <span className="material-symbols-outlined text-[12px]">school</span>}
                {getBadgeText()}
            </div>
            <div className={`flex flex-col items-center text-center ${writer.isPeerMatch ? 'mt-2' : ''}`}>
                <div className="relative mb-3">
                    <div className={`w-20 h-20 rounded-full p-[3px] ${rank === 1 ? 'bg-gradient-to-br from-primary to-yellow-400' : writer.isPeerMatch ? 'bg-gradient-to-br from-primary to-pink-500' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
                        <Avatar src={writer.avatar_url} name={writer.name} size="lg" className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                    {writer.isVerified && (
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                            <span className="material-symbols-outlined text-blue-500 text-[20px]">verified</span>
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-[#1b140d] group-hover:text-primary transition-colors">{writer.name}</h3>
                <p className="text-xs font-semibold text-[#9a734c] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    {writer.school}
                </p>
                <div className="flex items-center gap-1 my-3 bg-[#fcfaf8] px-3 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                    <span className="text-sm font-bold text-[#1b140d]">{writer.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#9a734c]">({writer.jobs} jobs)</span>
                </div>
                <div className="w-full pt-3 border-t border-[#f3ede7] flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[10px] text-[#9a734c] font-bold uppercase">Starting at</p>
                        <p className="text-sm font-bold text-[#1b140d]">₹{writer.price}/page</p>
                    </div>
                    <button onClick={onHire} className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Writer Card Component
const WriterCard = ({ writer, onHire }: { writer: WriterCardData; onHire: () => void }) => {
    const getLevelColor = () => {
        if (writer.level >= 20) return 'bg-orange-600';
        if (writer.level >= 10) return 'bg-primary';
        return 'bg-gray-600';
    };

    return (
        <div className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-[0_4px_20px_-2px_rgba(27,20,13,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(240,153,66,0.15)] transition-all duration-300 flex flex-col h-full overflow-hidden">
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                        <Avatar src={writer.avatar_url} name={writer.name} size="md" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" />
                        <div className={`absolute -bottom-1 -right-1 ${getLevelColor()} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white`}>
                            Lvl {writer.level}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {writer.isActive && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                <span className="material-symbols-outlined text-[12px]">bolt</span> Active Now
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-0.5">
                        <h3 className="text-lg font-bold text-[#1b140d]">{writer.name}</h3>
                        {writer.isVerified && <span className="material-symbols-outlined text-blue-500 text-[18px]">verified</span>}
                    </div>
                    <p className="text-xs text-[#9a734c] font-medium mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> {writer.school}
                    </p>
                </div>
                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {writer.subjects.slice(0, 3).map((subject, i) => (
                        <span key={i} className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">{subject}</span>
                    ))}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-[#fcfaf8] rounded-lg p-2">
                    <div>
                        <p className="text-[10px] text-[#9a734c] font-bold uppercase">Rating</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-bold text-[#1b140d]">{writer.rating.toFixed(1)}</span>
                            <span className="material-symbols-outlined text-yellow-500 text-[14px]">star</span>
                        </div>
                    </div>
                    <div className="border-l border-[#e7dbcf]">
                        <p className="text-[10px] text-[#9a734c] font-bold uppercase">Jobs</p>
                        <p className="text-sm font-bold text-[#1b140d]">{writer.jobs}</p>
                    </div>
                </div>
            </div>
            <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                <div>
                    <p className="text-xs text-[#9a734c] font-medium">Starting from</p>
                    <p className="text-lg font-bold text-[#1b140d]">₹{writer.price}<span className="text-xs font-normal text-[#9a734c]">/pg</span></p>
                </div>
                <button onClick={onHire} className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    Hire Now
                </button>
            </div>
        </div>
    );
};
