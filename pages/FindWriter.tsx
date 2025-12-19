import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { INDIAN_COLLEGES } from '../data/colleges';
import { dbService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';

export const FindWriter = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Search States
    const [collegeQuery, setCollegeQuery] = useState(searchParams.get('college') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [isFocused, setIsFocused] = useState(false);

    // Filter States
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [fastResponder, setFastResponder] = useState(false);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    // Data States
    const [writers, setWriters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredColleges, setFilteredColleges] = useState<typeof INDIAN_COLLEGES>([]);

    const searchRef = useRef<HTMLDivElement>(null);

    // Sync URL search param to state
    useEffect(() => {
        const queryFromUrl = searchParams.get('search');
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
        }
        const collegeFromUrl = searchParams.get('college');
        if (collegeFromUrl) {
            setCollegeQuery(collegeFromUrl);
        }
    }, [searchParams]);

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

    // Fetch and Filter Users
    useEffect(() => {
        const loadWriters = async () => {
            setLoading(true);
            try {
                const allUsers = await dbService.getAllUsers();

                const validUsers = allUsers.filter((u: any) => {
                    const isNotMe = u.id !== user?.id;
                    const isComplete = !u.is_incomplete;

                    // Search Filter
                    const matchesSearch = searchQuery
                        ? u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.school?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true;

                    // College Filter
                    const matchesCollege = collegeQuery
                        ? u.school?.toLowerCase().includes(collegeQuery.toLowerCase())
                        : true;

                    // Verified Filter
                    const matchesVerified = verifiedOnly ? u.is_verified === 'verified' : true;

                    // Fast Responder Filter
                    const matchesFast = fastResponder ? true : true;

                    // Availability Filter
                    const matchesAvailability = availableOnly ? u.is_online : true;

                    return isNotMe && isComplete && matchesSearch && matchesCollege && matchesVerified && matchesFast && matchesAvailability;
                });

                // Sorting
                let sortedUsers = [...validUsers];
                if (sortBy === 'price_low') {
                    sortedUsers.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
                } else if (sortBy === 'rating_high') {
                    sortedUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                }

                setWriters(sortedUsers);
            } catch (err) {
                console.error("Failed to load writers", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search slightly to avoid too many reads
        const timeoutId = setTimeout(() => {
            if (user) {
                loadWriters();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [user, searchQuery, collegeQuery, verifiedOnly, fastResponder, availableOnly, sortBy]);

    const handleCollegeSelect = (collegeName: string) => {
        setCollegeQuery(collegeName);
        setSearchParams(prev => {
            prev.set('college', collegeName);
            return prev;
        });
        setIsFocused(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="bg-background text-text-main font-display antialiased selection:bg-primary/30 min-h-screen flex flex-col">

            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border-subtle">
                <div className="px-6 py-3 flex items-center justify-between max-w-[1400px] mx-auto w-full">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/feed')}>
                        <div className="size-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-text-main text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <button onClick={() => navigate('/feed')} className="text-text-main text-sm font-medium hover:text-primary transition-colors">Home</button>
                        <button onClick={() => navigate('/writers')} className="text-primary text-sm font-bold">Find a Writer</button>
                        <button onClick={() => navigate('/feed')} className="text-text-main text-sm font-medium hover:text-primary transition-colors">Post a Job</button>
                        <button onClick={() => navigate('/feed')} className="text-text-main text-sm font-medium hover:text-primary transition-colors">My Assignments</button>
                    </nav>
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/auth')} className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full border border-border-subtle text-sm font-bold text-text-main hover:bg-secondary-bg transition-all">
                                    Log In
                                </button>
                                <button onClick={() => navigate('/auth?tab=signup')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary text-white text-sm font-bold hover:brightness-105 transition-all shadow-md shadow-primary/20">
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/feed')} className="h-10 px-5 flex items-center justify-center rounded-full bg-secondary-bg text-text-main text-sm font-bold hover:bg-border-subtle transition-all">
                                    Dashboard
                                </button>
                                <div className="size-10 rounded-full overflow-hidden border border-border-subtle cursor-pointer" onClick={() => navigate('/profile')}>
                                    <Avatar src={user.avatar_url} alt={user.full_name} className="w-full h-full" />
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

                        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 text-center px-4 mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border-subtle shadow-sm">
                                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                                <span className="text-xs font-bold text-text-main uppercase tracking-wider">Hyper-Local Search</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight leading-tight">
                                Find a Verified Peer at <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Your College</span>
                            </h1>
                            <p className="text-lg text-text-muted max-w-xl font-medium">
                                Connect with top-tier students who understand your specific curriculum and grading standards.
                            </p>

                            {/* Search Pill */}
                            <div className="w-full max-w-2xl p-2 bg-card dark:bg-card-dark rounded-full shadow-lg shadow-primary/5 flex flex-col md:flex-row items-center gap-2 border border-border-subtle relative z-50">
                                <div className="flex-1 flex items-center px-4 h-12 w-full">
                                    <span className="material-symbols-outlined text-text-muted">search</span>
                                    <input
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base ml-2 outline-none"
                                        placeholder="Search by name..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <div className="h-8 w-px bg-border-subtle hidden md:block"></div>
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
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-card dark:bg-card-dark rounded-xl shadow-xl border border-border-subtle max-h-80 overflow-y-auto z-[100]">
                                            {filteredColleges.map((college) => (
                                                <div
                                                    key={college.id}
                                                    className="px-4 py-3 hover:bg-secondary-bg cursor-pointer border-b border-border-subtle last:border-none flex items-center gap-3"
                                                    onClick={() => handleCollegeSelect(college.name)}
                                                >
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-primary text-sm">school</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-text-main">{college.name}</div>
                                                        <div className="text-xs text-text-muted">
                                                            {college.district ? `${college.district}, ` : ''}{college.state}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="w-full md:w-auto h-12 px-8 rounded-full bg-primary text-white font-bold text-base shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Sticky Filter Bar */}
                    <section className="sticky top-[73px] z-40 w-full bg-background/95 backdrop-blur-md border-b border-border-subtle py-3 px-6">
                        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1 max-w-[1400px] mx-auto">
                            <button className="shrink-0 h-9 px-4 rounded-full bg-text-main text-background text-sm font-medium flex items-center gap-2 shadow-md">
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                All Filters
                            </button>
                            <div className="w-px h-6 bg-border-subtle mx-1 shrink-0"></div>

                            <button
                                onClick={() => setVerifiedOnly(!verifiedOnly)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-colors ${verifiedOnly
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-card border-border-subtle text-text-main hover:border-primary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                Verified Only
                            </button>

                            <button
                                onClick={() => setAvailableOnly(!availableOnly)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-colors ${availableOnly
                                    ? 'bg-green-50 border-green-500 text-green-700'
                                    : 'bg-card border-border-subtle text-text-main hover:border-green-500'
                                    }`}
                            >
                                <span className={`size-2 rounded-full ${availableOnly ? 'bg-green-600 animate-pulse' : 'bg-green-500'}`}></span>
                                Available Now
                            </button>

                            <button
                                onClick={() => setFastResponder(!fastResponder)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-colors ${fastResponder
                                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                    : 'bg-card border-border-subtle text-text-main hover:border-yellow-500'
                                    }`}
                            >
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
                                        {collegeQuery ? `Writers in ${collegeQuery}` : 'Recommended Writers'}
                                    </h2>
                                    <p className="text-text-muted text-sm">
                                        {loading ? 'Searching...' : `${writers.length} writers found`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-main">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="form-select bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer pr-8 pl-0 py-0 outline-none"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="rating_high">Rating: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Writers Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {loading ? (
                                    // Loading Skeletons
                                    [...Array(8)].map((_, i) => (
                                        <div key={i} className="bg-card-bg p-5 rounded-2xl border border-border-subtle shadow-sm animate-pulse">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="size-14 rounded-full bg-gray-200"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
                                        </div>
                                    ))
                                ) : writers.length > 0 ? (
                                    writers.map((writer) => (
                                        <div key={writer.id} className="bg-card-bg p-5 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="relative">
                                                    <Avatar src={writer.avatar_url} alt={writer.full_name} className="size-14 rounded-full border-2 border-white shadow-sm" />
                                                    {writer.is_verified && (
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" title="Verified Writer">
                                                            <span className="material-symbols-outlined text-blue-500 text-[16px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-lg text-text-main truncate">{writer.full_name}</h3>
                                                    <p className="text-xs text-text-muted truncate">{writer.school || 'University Student'}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-amber-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="text-xs font-bold text-text-main">{writer.rating || 'New'}</span>
                                                        <span className="text-xs text-text-muted">({writer.reviews_count || 0})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mb-4 flex-wrap">
                                                {writer.skills?.slice(0, 2).map((skill: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded-md bg-secondary-bg text-text-muted text-[10px] font-bold uppercase tracking-wide border border-border-subtle">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(!writer.skills || writer.skills.length === 0) && (
                                                    <span className="px-2 py-1 rounded-md bg-secondary-bg text-text-muted text-[10px] font-bold uppercase tracking-wide border border-border-subtle">
                                                        General
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => navigate(`/profile/${writer.id}`)}
                                                className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all active:scale-95"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                        <div className="size-20 bg-secondary-bg rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-text-muted text-4xl">group_off</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-text-main">No students found</h3>
                                        <p className="text-text-muted text-sm mt-1 max-w-xs mx-auto">
                                            We couldn't find any writers matching your criteria. Try adjusting your filters or search terms.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setCollegeQuery('');
                                                setVerifiedOnly(false);
                                                setFastResponder(false);
                                            }}
                                            className="mt-6 text-primary font-bold text-sm hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-secondary-bg py-12 px-6 border-t border-border-subtle">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="size-6 text-primary">
                                    <span className="material-symbols-outlined text-2xl leading-none">school</span>
                                </div>
                                <h2 className="text-text-main text-lg font-bold">AssignMate</h2>
                            </div>
                            <p className="text-sm text-text-muted">India's #1 hyper-local student marketplace. Connect with verified peers for assignment help today.</p>
                        </div>
                        <div className="flex gap-12 flex-wrap">
                            <div>
                                <h4 className="font-bold text-text-main mb-4">Platform</h4>
                                <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                    <li><a className="hover:text-primary transition-colors" href="#">Browse Writers</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">How it Works</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main mb-4">Support</h4>
                                <ul className="flex flex-col gap-2 text-sm text-text-muted">
                                    <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">Safety Guidelines</a></li>
                                    <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                        <p>© 2026 AssignMate Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-text-main transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-text-main transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
