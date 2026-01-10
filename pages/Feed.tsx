import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { format } from 'date-fns';
import { Avatar } from '../components/ui/Avatar';
import { MobileNav } from '../components/dashboard/MobileNav';
import { SpotlightCard } from '../components/ui/SpotlightCard';

interface FeedProps {
    user: User | null;
    onChat?: (writer: User) => void;
}

export const Feed: React.FC<FeedProps> = ({ user, onChat }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({
        activeCount: 0,
        escrowBalance: 0,
        nextDeadline: null,
        nextDeadlineProject: null,
        activeOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [dashboardMentors, setDashboardMentors] = useState<any[]>([]);
    const [topMentors, setTopMentors] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            // Load common data
            db.getDashboardStats(user.id)
                .then(data => {
                    if (data) setStats(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Stats load failed", err);
                    setLoading(false);
                });

            // Real-time listener for active orders (updates immediately when offer accepted)
            const unsubOrders = db.listenToActiveOrders(user.id, (orders) => {
                setStats((prev: any) => ({
                    ...prev,
                    activeOrders: orders,
                    activeCount: orders.length,
                    // Recalculate next deadline
                    nextDeadline: orders.length > 0 && orders[0].deadline
                        ? Math.max(0, Math.ceil((new Date(orders[0].deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : null,
                    nextDeadlineProject: orders.length > 0 ? orders[0].title : null
                }));
                setLoading(false);
            });

            // Load chats
            db.getChats(user.id)
                .then(chats => {
                    setRecentChats(chats.slice(0, 5));
                })
                .catch(err => console.error("Chats load failed", err));

            // Load connections
            db.getMyConnections(user.id)
                .then(setConnections)
                .catch(err => console.error("Connections load failed", err));

            // Load available peers from same college
            db.getDashboardMentors(user.school, 8, user.id).then(setDashboardMentors);
            // Also get top users globally
            db.getAllUsers().then(users => {
                const peers = users.filter((u: any) => u.id !== user.id);
                setTopMentors(peers.slice(0, 4));
            });

            // Cleanup listener
            return () => {
                unsubOrders();
            };
        }
    }, [user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleStartChat = async (targetUserId: string) => {
        try {
            const chat = await db.createChat(null, user!.id, targetUserId);
            navigate(`/chats/${chat.id}`);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    // Extract connected users for display
    const connectedUsers = connections.map(conn => {
        if (Array.isArray(conn.participants)) {
            return conn.participants.find((p: any) => p.id !== user?.id) || conn.participants[0];
        }
        return null;
    }).filter(Boolean).slice(0, 6);

    // Quick action categories
    const quickCategories = [
        { icon: 'code', label: 'Programming', color: 'bg-blue-500' },
        { icon: 'calculate', label: 'Mathematics', color: 'bg-green-500' },
        { icon: 'science', label: 'Science', color: 'bg-purple-500' },
        { icon: 'article', label: 'Essays', color: 'bg-orange-500' },
        { icon: 'psychology', label: 'Psychology', color: 'bg-pink-500' },
        { icon: 'trending_up', label: 'Business', color: 'bg-cyan-500' },
    ];

    // ==========================================
    // UNIFIED DASHBOARD
    // ==========================================

    // Guard: Show loading if user is null
    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full flex flex-col gap-6">

                            {/* Hero Welcome Section */}
                            <div className="relative bg-gradient-to-r from-primary via-orange-500 to-red-500 p-6 md:p-8 rounded-3xl text-white overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                </div>

                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">school</span>
                                                    Dashboard
                                                </span>
                                            </div>
                                            <span className="text-sm text-white/80">• {format(new Date(), 'EEEE, MMM d')}</span>
                                        </div>
                                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
                                            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
                                        </h1>
                                        <p className="text-white/90 text-base md:text-lg max-w-xl">
                                            Connect with verified peers from top universities across India.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => navigate('/mentors')}
                                            className="h-12 px-6 rounded-xl bg-white text-primary font-bold shadow-lg hover:shadow-xl btn-hover-lift hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group btn-ripple"
                                        >
                                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">person_search</span>
                                            Find Peers
                                        </button>
                                        <button
                                            onClick={() => navigate('/community')}
                                            className="h-12 px-6 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group btn-ripple"
                                        >
                                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">forum</span>
                                            Community
                                        </button>
                                        <button
                                            onClick={() => navigate('/connections')}
                                            className="h-12 px-6 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group btn-ripple"
                                        >
                                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">group</span>
                                            My Network
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SpotlightCard className="p-6 h-full flex flex-col justify-between group" spotlightColor="rgba(249, 115, 22, 0.1)">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Active Projects</h3>
                                        <div className="size-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-xl">assignment</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark">{stats.activeCount}</span>
                                    <p className="text-xs text-text-muted mt-1">In progress</p>
                                </SpotlightCard>

                                <SpotlightCard
                                    className="p-6 h-full flex flex-col justify-between cursor-pointer group hover:border-blue-300"
                                    spotlightColor="rgba(59, 130, 246, 0.1)"
                                    onClick={() => navigate('/connections')}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">My Network</h3>
                                        <div className="size-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-xl">group</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark">{connections.length}</span>
                                    <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                                        View all <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </p>
                                </SpotlightCard>

                                <SpotlightCard
                                    className="p-6 h-full flex flex-col justify-between cursor-pointer group hover:border-green-300"
                                    spotlightColor="rgba(34, 197, 94, 0.1)"
                                    onClick={() => navigate('/chats')}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Messages</h3>
                                        <div className="size-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-xl">chat</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark">{recentChats.length}</span>
                                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                        Open chats <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </p>
                                </SpotlightCard>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Left Column - Main Content */}
                                <div className="xl:col-span-2 flex flex-col gap-6">

                                    {/* Your Connections - with Message Buttons */}
                                    {connectedUsers.length > 0 && (
                                        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-500">people</span>
                                                    Your Connections
                                                </h2>
                                                <button onClick={() => navigate('/connections')} className="text-sm font-bold text-primary flex items-center gap-1">
                                                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">

                                                {connectedUsers.map((connUser: any, index: number) => (
                                                    <div key={connUser.id} className="flex flex-col items-center p-3 rounded-xl bg-secondary-bg hover:bg-primary/5 transition-all group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                                                        <div className="relative mb-2 cursor-pointer" onClick={() => navigate(`/profile/${connUser.id}`)}>
                                                            <Avatar
                                                                src={connUser.avatar_url}
                                                                alt={connUser.full_name}
                                                                className="size-12 rounded-full border-2 border-white shadow-md group-hover:border-primary/30 transition-colors"
                                                                fallback={connUser.full_name?.charAt(0)}
                                                            />
                                                            {connUser.is_online && (
                                                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-text-dark text-center truncate w-full cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${connUser.id}`)}>
                                                            {connUser.full_name?.split(' ')[0]}
                                                        </p>
                                                        <button
                                                            onClick={() => handleStartChat(connUser.id)}
                                                            className="mt-2 w-full py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">chat</span>
                                                            Chat
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )
                                    }

                                    {/* Active Projects */}
                                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-orange-500">folder_open</span>
                                                Active Projects
                                                {stats.activeCount > 0 && (
                                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.activeCount}</span>
                                                )}
                                            </h2>
                                            <button className="text-sm font-bold text-primary">View All</button>
                                        </div>

                                        {loading ? (
                                            <div className="space-y-4">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-secondary-bg animate-pulse">
                                                        <div className="flex gap-4">
                                                            <div className="size-12 rounded-xl bg-gray-200"></div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : stats.activeOrders.length === 0 ? (
                                            <div className="text-center py-10">
                                                <div className="size-20 bg-gradient-to-br from-orange-50 to-amber-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-4xl">post_add</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-text-dark mb-2">No Active Projects Yet</h3>
                                                <p className="text-text-muted mb-6 max-w-sm mx-auto">Find a mentor to help you with your assignments and track your projects here.</p>
                                                <button
                                                    onClick={() => navigate('/mentors')}
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                                >
                                                    Find a Contributor
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {stats.activeOrders.map((order: any) => (
                                                    <div key={order.id} className="p-4 rounded-xl bg-secondary-bg hover:bg-primary/5 transition-all">
                                                        <div className="flex items-start gap-4">
                                                            <div className="size-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined">article</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-bold text-text-dark truncate">{order.title}</h3>
                                                                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold shrink-0">In Progress</span>
                                                                </div>
                                                                <p className="text-xs text-text-muted mb-3">Due: {order.deadline ? format(new Date(order.deadline), 'MMM d, yyyy') : 'No deadline set'}</p>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar src={order.writer_avatar} alt={order.writer_handle} className="size-6 rounded-full" fallback={order.writer_handle?.charAt(0)} />
                                                                        <span className="text-xs font-medium text-text-muted">{order.writer_handle}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${order.completion_percentage || 0}%` }}></div>
                                                                        </div>
                                                                        <span className="text-xs font-bold text-primary">{order.completion_percentage || 0}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Right Sidebar */}
                                <div className="flex flex-col gap-6">
                                    {/* Recent Messages */}
                                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-500 text-xl">chat</span>
                                                Messages
                                            </h2>
                                            <button onClick={() => navigate('/chats')} className="text-sm font-bold text-primary">View All</button>
                                        </div>

                                        {recentChats.length > 0 ? (
                                            <div className="space-y-2">
                                                {recentChats.slice(0, 4).map((chat: any) => (
                                                    <div
                                                        key={chat.id}
                                                        onClick={() => navigate(`/chats/${chat.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all"
                                                    >
                                                        <div className="relative">
                                                            <Avatar src={chat.other_avatar} alt={chat.other_handle} className="size-10 rounded-full" fallback={chat.other_handle?.charAt(0)} />
                                                            {chat.unread_count > 0 && (
                                                                <div className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                                    {chat.unread_count}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate">{chat.other_handle}</h4>
                                                            <p className="text-xs text-text-muted truncate">{chat.last_message || 'Start chatting'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="size-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                </div>
                                                <p className="text-text-muted text-xs">No conversations yet</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Top Mentors - Featured */}
                                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                                Top Contributors
                                            </h2>
                                            <button onClick={() => navigate('/mentors')} className="text-sm font-bold text-primary">See All</button>
                                        </div>

                                        {topMentors.length > 0 ? (
                                            <div className="space-y-3">
                                                {topMentors.map((mentor: any) => (
                                                    <div
                                                        key={mentor.id}
                                                        onClick={() => navigate(`/profile/${mentor.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all group"
                                                    >
                                                        <div className="relative">
                                                            <Avatar src={mentor.avatar_url} alt={mentor.full_name} className="size-11 rounded-full" fallback={mentor.full_name?.charAt(0)} />
                                                            {mentor.is_verified === 'verified' && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                                    <span className="material-symbols-outlined text-blue-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate group-hover:text-primary transition-colors">{mentor.full_name}</h4>
                                                            <p className="text-[11px] text-text-muted truncate">{mentor.school || 'University'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            <span className="text-xs font-bold">{mentor.rating || '5.0'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="size-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <span className="material-symbols-outlined">person_search</span>
                                                </div>
                                                <p className="text-text-muted text-xs">Loading contributors...</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* College Mentors */}
                                    {dashboardMentors.length > 0 && (
                                        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                                                    Your College
                                                </h2>
                                            </div>

                                            <div className="space-y-3">
                                                {dashboardMentors.slice(0, 3).map((mentor: any) => (
                                                    <div
                                                        key={mentor.id}
                                                        onClick={() => navigate(`/profile/${mentor.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all group"
                                                    >
                                                        <Avatar src={mentor.avatar_url} alt={mentor.handle} className="size-10 rounded-full" fallback={mentor.handle?.charAt(0)} />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate group-hover:text-primary">{mentor.handle || mentor.full_name}</h4>
                                                            <p className="text-[11px] text-text-muted truncate">{mentor.bio || 'Student'}</p>
                                                        </div>
                                                        {mentor.is_mentor && (
                                                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">CONTRIBUTOR</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => navigate(`/mentors?search=${user?.school}`)}
                                                className="w-full mt-4 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
                                            >
                                                View All from {user?.school?.split(' ')[0] || 'College'}
                                            </button>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
