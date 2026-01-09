import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../services/firestoreService';
import { notifications as notifService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const DashboardHeader: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Use a state to hold the loaded colleges
    const [colleges, setColleges] = useState<any[]>([]);
    const [results, setResults] = useState<{ colleges: any[], students: any[] }>({ colleges: [], students: [] });
    const searchRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Subscribe to notifications
    useEffect(() => {
        if (!user) return;
        const unsubscribe = notifService.subscribeToHistory(user.id, (data) => {
            setNotifications(data);
        });
        return () => unsubscribe();
    }, [user]);

    // ... (rest of search logic same as before) ...
    // Note: I will need to retain the existing logic, just showing the header part edit here.
    // I will replace only the relevant parts or I should check line numbers carefully.
    // Actually, I am replacing lines 7 to ...

    // Load colleges data dynamically
    useEffect(() => {
        let isMounted = true;
        const loadColleges = async () => {
            try {
                const module = await import('../../data/colleges');
                if (isMounted) {
                    setColleges(module.INDIAN_COLLEGES);
                }
            } catch (error) {
                console.error("Failed to load colleges data", error);
            }
        };
        loadColleges();
        return () => { isMounted = false; };
    }, []);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setResults({ colleges: [], students: [] });
            return;
        }

        const query = searchQuery.toLowerCase();
        const filteredColleges = colleges.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.state.toLowerCase().includes(query) ||
            c.district.toLowerCase().includes(query)
        ).slice(0, 20);

        if (searchQuery.length > 2) {
            dbService.searchStudents(searchQuery).then(students => {
                setResults(prev => ({ ...prev, students }));
            });
        } else {
            setResults(prev => ({ ...prev, students: [] }));
        }

        setResults(prev => ({ ...prev, colleges: filteredColleges }));
    }, [searchQuery, colleges]);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-16 md:h-24 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 transition-all duration-300 sticky top-0 md:relative">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 text-text-dark mr-4">
                <div className="size-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold tracking-tight hidden sm:block">AssignMate</span>
            </div>

            <div className="hidden md:flex flex-1 max-w-lg z-50">
                <div className="relative w-full group" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                    </div>
                    <input
                        className={`block w-full pl-11 pr-4 py-3.5 border transition-all duration-300 rounded-full leading-5 sm:text-sm shadow-sm outline-none ${isFocused
                            ? 'bg-white border-primary/30 ring-4 ring-primary/10 shadow-lg'
                            : 'bg-gray-50/80 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-md'
                            } text-text-dark placeholder-text-muted`}
                        placeholder="Find assignments, mentors, or subjects..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />

                    {/* Search Results Dropdown */}
                    {isFocused && searchQuery && (results.colleges.length > 0 || results.students.length > 0) && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto z-[100] animate-fade-in-up origin-top">
                            {/* Colleges Section */}
                            {results.colleges.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">Colleges</div>
                                    {results.colleges.map(college => (
                                        <div
                                            key={college.id}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                                            onClick={() => {
                                                navigate(`/mentors?college=${encodeURIComponent(college.name)}`);
                                                setIsFocused(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-[18px]">school</span>
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

                            {/* Divider if both exist */}
                            {results.colleges.length > 0 && results.students.length > 0 && (
                                <div className="h-px bg-border-subtle mx-2 my-1"></div>
                            )}

                            {/* Students Section */}
                            {results.students.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">People</div>
                                    {results.students.map((student: any) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                                            onClick={() => {
                                                navigate(`/profile/${student.id}`);
                                                setIsFocused(false);
                                                setSearchQuery('');
                                            }}
                                        >
                                            <img
                                                src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.handle}`}
                                                alt={student.handle}
                                                className="size-8 rounded-full bg-gray-100 object-cover border border-gray-200"
                                            />
                                            <div>
                                                <div className="text-sm font-bold text-text-dark">{student.full_name || student.handle}</div>
                                                <div className="text-xs text-text-muted">@{student.handle} • {student.school}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 md:p-2.5 rounded-full transition-colors border shadow-sm group ${showNotifications ? 'bg-primary text-white border-primary border-opacity-50' : 'bg-white text-text-dark hover:bg-primary-light border-border-subtle'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[20px] md:text-[24px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 size-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <NotificationDropdown notifications={notifications} onClose={() => setShowNotifications(false)} />
                    )}
                </div>

                <button
                    onClick={() => navigate('/mentors')}
                    className="hidden lg:flex items-center justify-center rounded-full h-11 px-6 bg-white border border-border-subtle text-text-dark text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Find Peers
                </button>

            </div>
        </header>
    );
};
