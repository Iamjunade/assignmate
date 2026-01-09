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

    // Unified Search State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('college') || '');
    const [isFocused, setIsFocused] = useState(false);

    // Filter States
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [writersOnly, setWritersOnly] = useState(false);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    // Data States
    const [writers, setWriters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<{ type: 'college' | 'place', value: string, subtext?: string }[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);

    // Sync URL search param to state
    useEffect(() => {
        const queryFromUrl = searchParams.get('search') || searchParams.get('college');
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
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

    // Generate Suggestions for Autocomplete (colleges and places)
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        const query = searchQuery.toLowerCase();

        // Get unique suggestions from colleges
        const collegeMatches: { type: 'college' | 'place', value: string, subtext?: string }[] = [];
        const placeMatches = new Set<string>();

        INDIAN_COLLEGES.forEach(c => {
            // Match by college name
            if (c.name.toLowerCase().includes(query)) {
                collegeMatches.push({
                    type: 'college',
                    value: c.name,
                    subtext: c.district ? `${c.district}, ${c.state}` : c.state
                });
            }
            // Match by state
            if (c.state.toLowerCase().includes(query)) {
                placeMatches.add(c.state);
            }
            // Match by district
            if (c.district && c.district.toLowerCase().includes(query)) {
                placeMatches.add(`${c.district}, ${c.state}`);
            }
        });

        // Combine and limit results
        const placeSuggestions: { type: 'college' | 'place', value: string }[] =
            Array.from(placeMatches).slice(0, 5).map(p => ({ type: 'place', value: p }));

        setSuggestions([
            ...placeSuggestions,
            ...collegeMatches.slice(0, 10)
        ].slice(0, 12));
    }, [searchQuery]);

    // Fetch and Filter Users
    useEffect(() => {
        const loadWriters = async () => {
            setLoading(true);
            try {
                const allUsers = await dbService.getAllUsers();

                const validUsers = allUsers.filter((u: any) => {
                    const isNotMe = u.id !== user?.id;
                    const isComplete = !u.is_incomplete;

                    // Unified Search Filter - searches name, handle, school, bio
                    const matchesSearch = searchQuery
                        ? (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.bio?.toLowerCase().includes(searchQuery.toLowerCase()))
                        : true;

                    // Writer Mode Filter
                    const matchesWriter = writersOnly ? u.is_writer === true : true;

                    // Verified Filter
                    const matchesVerified = verifiedOnly ? u.is_verified === 'verified' : true;

                    // Availability Filter
                    const matchesAvailability = availableOnly ? u.is_online : true;

                    return isNotMe && isComplete && matchesSearch && matchesWriter && matchesVerified && matchesAvailability;
                });

                // Sorting
                let sortedUsers = [...validUsers];
                if (sortBy === 'price_low') {
                    sortedUsers.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
                } else if (sortBy === 'rating_high') {
                    sortedUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                } else if (sortBy === 'newest') {
                    sortedUsers.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
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
    }, [user, searchQuery, verifiedOnly, writersOnly, availableOnly, sortBy]);

    const handleSuggestionSelect = (suggestion: string) => {
        setSearchQuery(suggestion);
        setSearchParams(prev => {
            prev.set('search', suggestion);
            return prev;
        });
        setIsFocused(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsFocused(true);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchParams(prev => {
            prev.delete('search');
            prev.delete('college');
            return prev;
        });
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setVerifiedOnly(false);
        setWritersOnly(false);
        setAvailableOnly(false);
        setSortBy('relevance');
        setSearchParams({});
    };

    const activeFiltersCount = [verifiedOnly, writersOnly, availableOnly, searchQuery].filter(Boolean).length;

    return (
        <div className="bg-background text-text-main font-display antialiased selection:bg-primary/30 min-h-screen flex flex-col">

            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border-subtle">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between max-w-[1400px] mx-auto w-full">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/feed')}>
                        <div className="size-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-text-main text-xl font-bold tracking-tight hidden sm:block">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <button onClick={() => navigate('/feed')} className="text-text-main text-sm font-medium hover:text-primary transition-colors">Home</button>
                        <button className="text-primary text-sm font-bold">Find Peers</button>
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
                                <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/profile')}>
                                    <Avatar src={user.avatar_url} alt={user.full_name} className="w-full h-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full">
                <div className="w-full max-w-[1400px] mx-auto">
                    {/* Hero Section with Unified Search */}
                    <section className="relative w-full py-10 md:py-16 overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-80 h-80 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-5 text-center px-4 mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Trusted by 10,000+ Students</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-text-main tracking-tight leading-tight">
                                Find Your Perfect
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-red-500">Study Partner</span>
                            </h1>
                            <p className="text-base md:text-lg text-text-muted max-w-xl font-medium">
                                Search by name, college, city, or state to connect with verified peers who can help you succeed.
                            </p>

                            {/* Unified Search Bar */}
                            <div className="w-full max-w-2xl relative z-50" ref={searchRef}>
                                <div className="relative">
                                    <div className="flex items-center bg-card rounded-2xl shadow-xl shadow-primary/5 border border-border-subtle overflow-hidden transition-all focus-within:border-primary focus-within:shadow-primary/10">
                                        <span className="material-symbols-outlined text-text-muted text-xl ml-5">search</span>
                                        <input
                                            className="flex-1 h-14 md:h-16 bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-muted font-medium text-base md:text-lg px-4 outline-none"
                                            placeholder="Search by name, college, city..."
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            onFocus={() => setIsFocused(true)}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={clearSearch}
                                                className="p-2 mr-2 hover:bg-secondary-bg rounded-full transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-text-muted text-xl">close</span>
                                            </button>
                                        )}
                                        <button className="h-10 md:h-12 px-6 md:px-8 mr-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm md:text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">search</span>
                                            <span className="hidden sm:inline">Search</span>
                                        </button>
                                    </div>

                                    {/* Autocomplete Dropdown */}
                                    {isFocused && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-2xl border border-border-subtle max-h-80 overflow-y-auto z-[100]">
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-3 hover:bg-secondary-bg cursor-pointer border-b border-border-subtle last:border-none flex items-center gap-3 transition-colors"
                                                    onClick={() => handleSuggestionSelect(suggestion.value)}
                                                >
                                                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${suggestion.type === 'college'
                                                        ? 'bg-primary/10'
                                                        : 'bg-green-500/10'
                                                        }`}>
                                                        <span className={`material-symbols-outlined text-lg ${suggestion.type === 'college'
                                                            ? 'text-primary'
                                                            : 'text-green-600'
                                                            }`}>
                                                            {suggestion.type === 'college' ? 'school' : 'location_on'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-text-main">{suggestion.value}</div>
                                                        {suggestion.subtext && (
                                                            <div className="text-xs text-text-muted">{suggestion.subtext}</div>
                                                        )}
                                                        <div className="text-[10px] text-text-muted uppercase tracking-wide mt-0.5">
                                                            {suggestion.type === 'college' ? 'College' : 'Location'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Filters */}
                                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                                    <span className="text-xs text-text-muted font-medium">Popular:</span>
                                    {['IIT Delhi', 'Mumbai', 'Bangalore', 'CMR Institute'].map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => handleSuggestionSelect(term)}
                                            className="px-3 py-1.5 rounded-full bg-secondary-bg hover:bg-primary/10 text-text-main hover:text-primary text-xs font-medium transition-all"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sticky Filter Bar */}
                    <section className="sticky top-[57px] md:top-[65px] z-40 w-full bg-background/95 backdrop-blur-md border-b border-border-subtle py-3 px-4 md:px-6">
                        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto hide-scrollbar pb-1 max-w-[1400px] mx-auto">
                            <button
                                onClick={clearAllFilters}
                                className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${activeFiltersCount > 0
                                    ? 'bg-primary text-white'
                                    : 'bg-text-main text-background'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </button>
                            <div className="w-px h-6 bg-border-subtle mx-1 shrink-0"></div>

                            <button
                                onClick={() => setWritersOnly(!writersOnly)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${writersOnly
                                    ? 'bg-gradient-to-r from-primary/10 to-orange-500/10 border-primary text-primary shadow-sm'
                                    : 'bg-card border-border-subtle text-text-main hover:border-primary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                                Mentors Only
                            </button>

                            <button
                                onClick={() => setVerifiedOnly(!verifiedOnly)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${verifiedOnly
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                    : 'bg-card border-border-subtle text-text-main hover:border-blue-500'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                Verified
                            </button>

                            <button
                                onClick={() => setAvailableOnly(!availableOnly)}
                                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${availableOnly
                                    ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                    : 'bg-card border-border-subtle text-text-main hover:border-green-500'
                                    }`}
                            >
                                <span className={`size-2.5 rounded-full ${availableOnly ? 'bg-green-600 animate-pulse' : 'bg-green-500'}`}></span>
                                Online Now
                            </button>

                            <div className="ml-auto shrink-0 flex items-center gap-2 pl-2">
                                <span className="text-xs font-medium text-text-muted hidden sm:inline">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="form-select bg-card border border-border-subtle rounded-lg text-sm font-medium text-text-main focus:ring-primary focus:border-primary cursor-pointer pr-8 pl-3 py-1.5"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="newest">Newest</option>
                                    <option value="rating_high">Top Rated</option>
                                    <option value="price_low">Price: Low</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Main Content Container */}
                    <div className="flex flex-col w-full px-4 md:px-6 py-6 md:py-8 gap-8">

                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-text-main">
                                    {searchQuery ? (
                                        <>Results for "<span className="text-primary">{searchQuery}</span>"</>
                                    ) : (
                                        'All Students'
                                    )}
                                </h2>
                                <p className="text-text-muted text-sm mt-1">
                                    {loading ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                                            Searching...
                                        </span>
                                    ) : (
                                        `${writers.length} ${writers.length === 1 ? 'student' : 'students'} found`
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Writers Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {loading ? (
                                // Enhanced Loading Skeletons
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-card p-5 rounded-2xl border border-border-subtle shadow-sm animate-pulse">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="size-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                        </div>
                                        <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                    </div>
                                ))
                            ) : writers.length > 0 ? (
                                writers.map((writer) => (
                                    <div
                                        key={writer.id}
                                        className="bg-card p-5 rounded-2xl border border-border-subtle shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer"
                                        onClick={() => navigate(`/profile/${writer.id}`)}
                                    >
                                        {/* Writer Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative">
                                                <Avatar
                                                    src={writer.avatar_url}
                                                    alt={writer.full_name}
                                                    className="size-16 rounded-full border-2 border-white shadow-md group-hover:border-primary/30 transition-colors"
                                                />
                                                {writer.is_online && (
                                                    <div className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-white" title="Online"></div>
                                                )}
                                                {writer.is_verified === 'verified' && (
                                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="Verified">
                                                        <span className="material-symbols-outlined text-blue-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base text-text-main truncate group-hover:text-primary transition-colors">
                                                    {writer.full_name}
                                                </h3>
                                                <p className="text-xs text-text-muted truncate flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px]">school</span>
                                                    {writer.school || 'University Student'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="text-xs font-bold text-text-main">{writer.rating || '5.0'}</span>
                                                    </div>
                                                    {writer.is_writer && (
                                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">MENTOR</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bio Preview */}
                                        {writer.bio && (
                                            <p className="text-xs text-text-muted line-clamp-2 mb-3">
                                                {writer.bio}
                                            </p>
                                        )}

                                        {/* Skills/Tags */}
                                        <div className="flex gap-1.5 mb-4 flex-wrap">
                                            {writer.skills?.slice(0, 3).map((skill: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded-lg bg-secondary-bg text-text-muted text-[10px] font-semibold uppercase tracking-wide">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(!writer.skills || writer.skills.length === 0) && (
                                                <span className="px-2 py-1 rounded-lg bg-secondary-bg text-text-muted text-[10px] font-semibold uppercase tracking-wide">
                                                    General
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/profile/${writer.id}`);
                                            }}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/10 to-orange-500/10 text-primary font-bold text-sm hover:from-primary hover:to-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <span>View Profile</span>
                                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <div className="size-24 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-full flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-primary text-5xl">search_off</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main mb-2">No students found</h3>
                                    <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
                                        We couldn't find anyone matching "{searchQuery}". Try adjusting your search or filters.
                                    </p>
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-105 transition-all shadow-md shadow-primary/20"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Compact Footer */}
            <footer className="w-full bg-secondary-bg py-8 px-6 border-t border-border-subtle mt-auto">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg overflow-hidden">
                                <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-text-main">AssignMate</span>
                            <span className="hidden sm:inline">• India's #1 student community</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Help</a>
                            <span className="text-text-muted/60">© 2026</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
