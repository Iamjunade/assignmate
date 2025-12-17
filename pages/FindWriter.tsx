import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { INDIAN_COLLEGES } from '../data/colleges';
import { dbService, userApi } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export const FindWriter = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [collegeQuery, setCollegeQuery] = useState(searchParams.get('college') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [isFocused, setIsFocused] = useState(false);

    // Sync URL search param to state
    useEffect(() => {
        const queryFromUrl = searchParams.get('search');
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
        }
    }, [searchParams]);

    const [writers, setWriters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredColleges, setFilteredColleges] = useState<typeof INDIAN_COLLEGES>([]);
    const [nearbyColleges, setNearbyColleges] = useState<typeof INDIAN_COLLEGES>([]);

    const searchRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Colleges for Autocomplete
    useEffect(() => {
        if (!collegeQuery.trim()) {
            setFilteredColleges([]);
            return;
        }
        const query = collegeQuery.toLowerCase();
        const results = INDIAN_COLLEGES.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.state.toLowerCase().includes(query) ||
            (c.district && c.district.toLowerCase().includes(query))
        ).slice(0, 20);
        setFilteredColleges(results);
    }, [collegeQuery]);

    // ✅ ADD THIS: Fetch users from Firestore
    useEffect(() => {
        const loadWriters = async () => {
            setLoading(true);
            try {
                // Ensure dbService.getAllUsers() exists in your backend service
                const allUsers = await dbService.getAllUsers();

                // Filter: Exclude yourself, incomplete profiles, and apply search
                const validUsers = allUsers.filter((u: any) => {
                    const isNotMe = u.id !== user?.id;
                    const isComplete = !u.is_incomplete;
                    const matchesSearch = searchQuery
                        ? u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.school?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true;

                    return isNotMe && isComplete && matchesSearch;
                });

                setWriters(validUsers);
            } catch (err) {
                console.error("Failed to load writers", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadWriters();
        }
    }, [user, searchQuery]); // Re-run when user or search changes

    const handleCollegeSelect = (collegeName: string) => {
        setCollegeQuery(collegeName);
        setSearchParams({ college: collegeName });
        setIsFocused(false);
    };

    const handleSearch = () => {
        // Triggered by useEffect when searchQuery changes, but button can force refresh or UI feedback
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-display antialiased selection:bg-primary/30 min-h-screen flex flex-col">

            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#fcfaf8]/90 border-b border-[#f3ede7]">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/feed')}>
                        <div className="size-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-[#1b140d] text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <button onClick={() => navigate('/feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Home</button>
                        <button onClick={() => navigate('/writers')} className="text-primary text-sm font-bold">Find a Writer</button>
                        <button onClick={() => navigate('/feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Post a Job</button>
                        <button onClick={() => navigate('/feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">My Assignments</button>
                    </nav>
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/auth')} className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full border border-[#e7dbcf] text-sm font-bold text-[#1b140d] hover:bg-[#f3ede7] transition-all">
                                    Log In
                                </button>
                                <button onClick={() => navigate('/auth?tab=signup')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary text-[#1b140d] text-sm font-bold hover:brightness-105 transition-all shadow-md shadow-primary/20">
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/feed')} className="h-10 px-5 flex items-center justify-center rounded-full bg-[#f3ede7] text-[#1b140d] text-sm font-bold hover:bg-[#e7dbcf] transition-all">
                                    Dashboard
                                </button>
                                <div className="size-10 rounded-full overflow-hidden border border-[#e7dbcf] cursor-pointer" onClick={() => navigate('/profile')}>
                                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full">
                <div className="w-full max-w-[1400px] mx-auto">
                    {/* Hero Section with Search */}
                    <section className="relative w-full py-12 md:py-20 overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 text-center px-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <span className="text-xs font-bold text-text-main uppercase tracking-wider">Hyper-Local Search</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#1b140d] tracking-tight leading-tight">
                                Find a Verified Peer at <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#d67e26]">Your College</span>
                            </h1>
                            <p className="text-lg text-[#5a4633] max-w-xl font-medium">
                                Connect with top-tier students who understand your specific curriculum and grading standards.
                            </p>
                            {/* Search Pill */}
                            <div className="w-full max-w-2xl p-2 bg-white rounded-full shadow-lg shadow-primary/10 flex flex-col md:flex-row items-center gap-2 border border-[#f3ede7] relative z-50">
                                <div className="flex-1 flex items-center px-4 h-12 w-full">
                                    <span className="material-symbols-outlined text-text-muted">search</span>
                                    <input
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base ml-2 outline-none"
                                        placeholder="Search by name..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="h-8 w-px bg-[#e7dbcf] hidden md:block"></div>
                                <div className="flex-1 flex items-center px-4 h-12 w-full relative" ref={searchRef}>
                                    <span className="material-symbols-outlined text-text-muted">school</span>
                                    <input
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base ml-2 outline-none"
                                        placeholder="College (e.g. IIT Delhi)"
                                        type="text"
                                        value={collegeQuery}
                                        onChange={(e) => {
                                            setCollegeQuery(e.target.value);
                                            setIsFocused(true);
                                        }}
                                        onFocus={() => setIsFocused(true)}
                                    />
                                    {/* Dropdown Results */}
                                    {isFocused && filteredColleges.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-subtle max-h-80 overflow-y-auto z-[100]">
                                            {filteredColleges.map((college) => (
                                                <div
                                                    key={college.id}
                                                    className="px-4 py-3 hover:bg-background-light cursor-pointer border-b border-border-subtle last:border-none flex items-center gap-3"
                                                    onClick={() => handleCollegeSelect(college.name)}
                                                >
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-primary text-sm">school</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-text-dark">{college.name}</div>
                                                        <div className="text-xs text-text-muted">
                                                            {college.district ? `${college.district}, ` : ''}{college.state}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="w-full md:w-auto h-12 px-8 rounded-full bg-primary text-[#1b140d] font-bold text-base shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Sticky Filter Bar */}
                    <section className="sticky top-[73px] z-40 w-full bg-[#fcfaf8]/95 backdrop-blur-md border-b border-[#f3ede7] py-3 px-6">
                        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                            <button className="shrink-0 h-9 px-4 rounded-full bg-text-main text-white text-sm font-medium flex items-center gap-2 shadow-md">
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                All Filters
                            </button>
                            <div className="w-px h-6 bg-[#e7dbcf] mx-1 shrink-0"></div>
                            <button className="shrink-0 h-9 px-4 rounded-full bg-[#f3ede7] hover:bg-[#e7dbcf] text-text-main text-sm font-medium transition-colors border border-transparent hover:border-[#d6c7b9]">
                                Engineering
                            </button>
                            <button className="shrink-0 h-9 px-4 rounded-full bg-[#f3ede7] hover:bg-[#e7dbcf] text-text-main text-sm font-medium transition-colors border border-transparent hover:border-[#d6c7b9]">
                                Management
                            </button>
                            <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                                Price: Low to High
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                            <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                                <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                                Verified Only
                            </button>
                            <button className="shrink-0 h-9 px-4 rounded-full bg-white border border-[#e7dbcf] text-text-main text-sm font-medium flex items-center gap-2 hover:border-primary transition-colors">
                                <span className="material-symbols-outlined text-[18px] text-yellow-600">bolt</span>
                                Fast Responder
                            </button>
                        </div>
                    </section>

                    {/* Main Content Container */}
                    <div className="flex flex-col w-full px-6 py-8 gap-12">

                        {/* All Writers Grid */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-main mb-1">
                                        {searchParams.get('college') ? `Writers in ${searchParams.get('college')}` : 'Recommended Writers'}
                                    </h2>
                                    <p className="text-text-muted text-sm">
                                        {loading ? 'Searching...' : `${writers.length} writers found`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-main">Sort by:</span>
                                    <select className="form-select bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer pr-8 pl-0 py-0 outline-none">
                                        <option>Relevance</option>
                                        <option>Price: Low to High</option>
                                        <option>Rating: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Replace your Grid with this: */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {loading ? (
                                    <p>Loading...</p>
                                ) : writers.length > 0 ? (
                                    writers.map((writer) => (
                                        <div key={writer.id} className="bg-white p-5 rounded-2xl border border-[#f3ede7] shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4 mb-3">
                                                <img src={writer.avatar_url || 'https://via.placeholder.com/150'} alt={writer.full_name} className="w-14 h-14 rounded-full object-cover" />
                                                <div>
                                                    <h3 className="font-bold text-lg">{writer.full_name}</h3>
                                                    <p className="text-xs text-gray-500">{writer.school}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profile/${writer.id}`)}
                                                className="w-full py-2 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">group_off</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-700">No students found</h3>
                                        <p className="text-gray-500 text-sm">Try adjusting your search or check back later.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-[#f3ede7] py-12 px-6">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined text-2xl leading-none">school</span>
                            </div>
                            <h2 className="text-[#1b140d] text-lg font-bold">AssignMate</h2>
                        </div>
                        <p className="text-sm text-text-muted">India's #1 hyper-local student marketplace. Connect with verified peers for assignment help today.</p>
                    </div>
                    <div className="flex gap-12 flex-wrap">
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Platform</h4>
                            <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                <li><a className="hover:text-primary" href="#">Browse Writers</a></li>
                                <li><a className="hover:text-primary" href="#">How it Works</a></li>
                                <li><a className="hover:text-primary" href="#">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1b140d] mb-4">Support</h4>
                            <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                <li><a className="hover:text-primary" href="#">Help Center</a></li>
                                <li><a className="hover:text-primary" href="#">Safety Guidelines</a></li>
                                <li><a className="hover:text-primary" href="#">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#e7dbcf] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                    <p>© 2026 AssignMate Inc. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
