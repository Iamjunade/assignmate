import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INDIAN_COLLEGES } from '../data/colleges';
import { dbService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

interface FindWriterProps {
    onNavigate: (page: string) => void;
}

export const FindWriter: React.FC<FindWriterProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [collegeQuery, setCollegeQuery] = useState(searchParams.get('college') || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

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

    // Fetch Writers based on filters
    useEffect(() => {
        const fetchWriters = async () => {
            setLoading(true);
            try {
                const collegeParam = searchParams.get('college');
                const filters: any = {};

                if (collegeParam) filters.college = collegeParam;
                if (searchQuery) filters.searchQuery = searchQuery;

                const data = await dbService.getWriters(user, filters);
                setWriters(data);

                // Handle Nearby Colleges if no writers found for a specific college
                if (data.length === 0 && collegeParam) {
                    const currentCollege = INDIAN_COLLEGES.find(c => c.name.toLowerCase() === collegeParam.toLowerCase());
                    if (currentCollege) {
                        const nearby = INDIAN_COLLEGES.filter(c =>
                            c.id !== currentCollege.id &&
                            (
                                (currentCollege.district && c.district === currentCollege.district) ||
                                c.state === currentCollege.state
                            )
                        ).slice(0, 8);
                        setNearbyColleges(nearby);
                    } else {
                        setNearbyColleges([]);
                    }
                } else {
                    setNearbyColleges([]);
                }
            } catch (error) {
                console.error("Error fetching writers:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchWriters();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchParams, searchQuery, user]);

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
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('feed')}>
                        <div className="size-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-[#1b140d] text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <button onClick={() => onNavigate('feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Home</button>
                        <button onClick={() => onNavigate('find-writer')} className="text-primary text-sm font-bold">Find a Writer</button>
                        <button onClick={() => onNavigate('feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">Post a Job</button>
                        <button onClick={() => onNavigate('feed')} className="text-[#1b140d] text-sm font-medium hover:text-primary transition-colors">My Assignments</button>
                    </nav>
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <button onClick={() => onNavigate('auth')} className="hidden sm:flex h-10 px-5 items-center justify-center rounded-full border border-[#e7dbcf] text-sm font-bold text-[#1b140d] hover:bg-[#f3ede7] transition-all">
                                    Log In
                                </button>
                                <button onClick={() => onNavigate('auth')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary text-[#1b140d] text-sm font-bold hover:brightness-105 transition-all shadow-md shadow-primary/20">
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <button onClick={() => onNavigate('profile')} className="h-10 px-5 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
                                {user.handle}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex flex-col w-full pb-20">
                {/* Hero Section with Map Concept */}
                <section className="w-full px-0 py-0">
                    <div className="relative w-full rounded-none overflow-hidden bg-[#e8e3de] min-h-[360px] flex items-center justify-center">
                        {/* Abstract Map Background */}
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ2-Lqo5AkwRX0FPz5t8hHaw5zVigPSdbaqkLnzAmWh2vkHSP7J2FKNAG014van5cXsBy7za4dBDtVmMfsZNUa2o3PmcfVm7gqQOIamUs8TTefvqS_1SMDkgHuECaUr60ehZpDbIgcbndTc-SJMuIHw8l8hiwm0U9XUYsdYvmH3M4-JwTNBkgOnAgKz0r2a98b1y2kvMVsmCiZ_W6RDsp_JLytVvb9pnziYu04HmdA1_Qir0R06aRqDOMr4EWNS0HckYDi2Y4NcJeo')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf8]/90 via-[#fcfaf8]/40 to-transparent z-0"></div>

                        {/* Breadcrumbs - Moved inside Hero */}
                        <div className="absolute top-4 left-6 z-20 hidden md:block">
                            <div className="flex flex-wrap gap-2 text-sm">
                                <a className="text-text-muted/80 hover:text-primary cursor-pointer" onClick={() => onNavigate('feed')}>Home</a>
                                <span className="text-text-muted/60">/</span>
                                <span className="text-text-main/80 font-medium">Find a Writer</span>
                            </div>
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

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : writers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {writers.map((writer) => (
                                    <div key={writer.id} className="group bg-white rounded-2xl border border-[#f3ede7] hover:border-primary/40 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col h-full overflow-hidden">
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative">
                                                    <img alt="Writer Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#f3ede7]" src={writer.avatar_url || 'https://via.placeholder.com/150'} />
                                                    <div className={`absolute -bottom-1 -right-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white ${writer.xp > 1000 ? 'bg-orange-600' : 'bg-primary'}`}>
                                                        Lvl {Math.floor(writer.xp / 100) + 1}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {writer.is_online && (
                                                        <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Active Now
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                                                        <span className="material-symbols-outlined text-[12px]">school</span> Student
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <h3 className="text-lg font-bold text-text-main">{writer.full_name || writer.handle}</h3>
                                                    {writer.is_verified === 'verified' && (
                                                        <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-muted font-medium mb-3 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span> {writer.school}
                                                </p>
                                            </div>
                                            {/* Chips */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {writer.tags?.slice(0, 3).map((skill: string, idx: number) => (
                                                    <span key={idx} className="bg-[#f3ede7] text-[#5a4633] text-[10px] font-semibold px-2 py-1 rounded-md">{skill}</span>
                                                ))}
                                            </div>
                                            <div className="mt-auto grid grid-cols-2 gap-2 text-center bg-background-light rounded-lg p-2">
                                                <div>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase">Rating</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-sm font-bold text-text-main">{writer.rating || 'New'}</span>
                                                        <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    </div>
                                                </div>
                                                <div className="border-l border-[#e7dbcf]">
                                                    <p className="text-[10px] text-text-muted font-bold uppercase">Jobs</p>
                                                    <p className="text-sm font-bold text-text-main">{writer.projects_completed || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-5 py-4 border-t border-[#f3ede7] bg-[#faf8f6] flex items-center justify-between group-hover:bg-white transition-colors">
                                            <div>
                                                <p className="text-xs text-text-muted font-medium">Starting from</p>
                                                <p className="text-lg font-bold text-text-main">₹{writer.price_per_page || 300}<span className="text-xs font-normal text-text-muted">/pg</span></p>
                                            </div>
                                            <button
                                                onClick={() => onNavigate(`profile/${writer.id}`)}
                                                className="bg-primary text-[#1b140d] text-sm font-bold px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4">school</span>
                                <h3 className="text-xl font-bold text-text-main mb-2">No writers found</h3>
                                <p className="text-text-muted max-w-md mb-8">
                                    {searchParams.get('college')
                                        ? `We couldn't find any writers registered under "${searchParams.get('college')}".`
                                        : "We couldn't find any writers matching your criteria."}
                                    {nearbyColleges.length > 0 ? " Try these nearby colleges:" : " Try searching for a different college or browse all writers."}
                                </p>

                                {nearbyColleges.length > 0 && (
                                    <div className="w-full max-w-4xl mb-8">
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {nearbyColleges.map((college) => (
                                                <button
                                                    key={college.id}
                                                    onClick={() => handleCollegeSelect(college.name)}
                                                    className="px-4 py-2 rounded-full bg-white border border-[#e7dbcf] hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-text-main flex items-center gap-2 group"
                                                >
                                                    <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                                                    {college.name}
                                                    <span className="text-xs text-text-muted group-hover:text-primary/70">({college.district || college.state})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setSearchParams({});
                                        setCollegeQuery('');
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-2 rounded-full bg-primary text-[#1b140d] font-bold hover:brightness-105 transition-all"
                                >
                                    View All Writers
                                </button>
                            </div>
                        )}

                        {writers.length > 0 && (
                            <div className="w-full flex justify-center mt-12">
                                <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-[#1b140d] transition-colors">
                                    Load More Writers
                                </button>
                            </div>
                        )}
                    </section>
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
