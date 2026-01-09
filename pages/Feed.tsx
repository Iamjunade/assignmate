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
    const [dashboardWriters, setDashboardWriters] = useState<any[]>([]);
    const [topWriters, setTopWriters] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    // Determine if user is in Writer Mode
    const isWriterMode = user?.is_writer === true;

    useEffect(() => {
        if (user) {
            // Load common data
            db.getDashboardStats(user.id).then(data => {
                setStats(data);
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
            db.getChats(user.id).then(chats => {
                setRecentChats(chats.slice(0, 5));
            });

            // Load connections
            db.getMyConnections(user.id).then(setConnections);

            if (isWriterMode) {
                // Writer-specific data: incoming requests
                db.getIncomingRequests(user.id).then(setIncomingRequests);
            } else {
                // Student-specific data: available writers
                db.getDashboardWriters(user.school, 8, user.id).then(setDashboardWriters);
                // Also get top writers globally
                db.getAllUsers().then(users => {
                    const writers = users.filter((u: any) => u.is_writer === true && u.id !== user.id);
                    setTopWriters(writers.slice(0, 4));
                });
            }

            // Cleanup listener
            return () => {
                unsubOrders();
            };
        }
    }, [user, isWriterMode]);

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

    // If Writer Mode, show writer dashboard
    if (isWriterMode) {
        return (
            <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
                <Sidebar user={user} />
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <DashboardHeader />
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                        <div className="max-w-7xl mx-auto">
                            <div className="w-full flex flex-col gap-8">
                                {/* Writer Welcome Section */}
                                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary/10 to-orange-500/10 text-primary border border-primary/20">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                                    Writer Dashboard
                                                </span>
                                            </div>
                                            <span className="text-sm text-text-muted">• {format(new Date(), 'MMM d, yyyy')}</span>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight leading-tight">
                                            {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">{user?.full_name?.split(' ')[0] || 'Writer'}</span>.
                                        </h1>
                                        <p className="text-text-muted mt-2 text-lg">Ready to help fellow students with their assignments.</p>
                                    </div>
                                    <button onClick={() => navigate('/profile')} className="btn-ripple h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 group">
                                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">visibility</span>
                                        View My Profile
                                    </button>
                                </div>

                                {/* Writer Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                    <SpotlightCard className="p-6 h-full flex flex-col justify-between group" spotlightColor="rgba(34, 197, 94, 0.1)">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-text-muted font-bold text-sm">Total Earned</h3>
                                            <div className="size-11 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-symbols-outlined">payments</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{formatCurrency(user?.total_earned || 0)}</span>
                                        <p className="text-xs text-green-600 font-medium mt-1">Lifetime earnings</p>
                                    </SpotlightCard>

                                    <SpotlightCard className="p-6 h-full flex flex-col justify-between group" spotlightColor="rgba(249, 115, 22, 0.1)">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-text-muted font-bold text-sm">Active Orders</h3>
                                            <div className="size-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-symbols-outlined">assignment</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.activeCount}</span>
                                        <p className="text-xs text-text-muted font-medium mt-1">In progress</p>
                                    </SpotlightCard>

                                    <SpotlightCard
                                        className="p-6 h-full flex flex-col justify-between cursor-pointer group hover:border-blue-300"
                                        spotlightColor="rgba(59, 130, 246, 0.1)"
                                        onClick={() => navigate('/connections')}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-text-muted font-bold text-sm">Pending Requests</h3>
                                            <div className="size-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-symbols-outlined">person_add</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{incomingRequests.length}</span>
                                        <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">Tap to review <span className="material-symbols-outlined text-sm">arrow_forward</span></p>
                                    </SpotlightCard>

                                    <SpotlightCard className="p-6 h-full flex flex-col justify-between group" spotlightColor="rgba(168, 85, 247, 0.1)">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-text-muted font-bold text-sm">On-Time Rate</h3>
                                            <div className="size-11 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="material-symbols-outlined">timer</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{user?.on_time_rate || 100}%</span>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${user?.on_time_rate || 100}%` }}></div>
                                        </div>
                                    </SpotlightCard>
                                </div>

                                {/* Incoming Requests */}
                                {incomingRequests.length > 0 && (
                                    <SpotlightCard className="p-6 mb-6" spotlightColor="rgba(34, 197, 94, 0.1)">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">person_add</span>
                                                Connection Requests
                                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{incomingRequests.length}</span>
                                            </h2>
                                            <button onClick={() => navigate('/connections')} className="text-sm font-bold text-primary">View All</button>
                                        </div>
                                        <div className="space-y-3">
                                            {incomingRequests.slice(0, 3).map((request: any) => (
                                                <div key={request.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary-bg hover:bg-primary/5 transition-all">
                                                    <Avatar src={request.fromUser?.avatar_url} alt={request.fromUser?.full_name} className="size-12 rounded-full" fallback={request.fromUser?.full_name?.charAt(0)} />
                                                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${request.fromUser?.id}`)}>
                                                        <h4 className="font-bold text-text-dark hover:text-primary transition-colors">{request.fromUser?.full_name}</h4>
                                                        <p className="text-xs text-text-muted">{request.fromUser?.school}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => db.respondToConnectionRequest(request.id, 'accepted').then(() => setIncomingRequests(prev => prev.filter(r => r.id !== request.id)))} className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-bold">Accept</button>
                                                        <button onClick={() => db.respondToConnectionRequest(request.id, 'rejected').then(() => setIncomingRequests(prev => prev.filter(r => r.id !== request.id)))} className="h-9 px-4 rounded-lg bg-gray-200 text-text-muted text-sm font-bold">Decline</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </SpotlightCard>
                                )}

                                {/* Recent Messages & Profile Stats */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <section className="bg-white p-6 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">chat</span>
                                                Recent Messages
                                            </h2>
                                            <button onClick={() => navigate('/chats')} className="text-sm font-bold text-primary">View All</button>
                                        </div>
                                        {recentChats.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentChats.slice(0, 4).map((chat: any) => (
                                                    <div key={chat.id} onClick={() => navigate(`/chats/${chat.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all">
                                                        <Avatar src={chat.other_avatar} alt={chat.other_handle} className="size-10 rounded-full" fallback={chat.other_handle?.charAt(0)} />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate">{chat.other_handle}</h4>
                                                            <p className="text-xs text-text-muted truncate">{chat.last_message || 'No messages'}</p>
                                                        </div>
                                                        {chat.unread_count > 0 && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{chat.unread_count}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="size-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                </div>
                                                <p className="text-text-muted text-sm">No messages yet</p>
                                            </div>
                                        )}
                                    </section>

                                    <section className="bg-white p-6 rounded-2xl shadow-card border border-border-subtle">
                                        <h2 className="text-lg font-bold text-text-dark mb-5">Your Profile Stats</h2>
                                        <div className="flex items-center gap-4 mb-5">
                                            <Avatar src={user?.avatar_url} alt={user?.full_name} className="size-16 rounded-xl" fallback={user?.full_name?.charAt(0)} />
                                            <div>
                                                <h3 className="font-bold text-text-dark text-lg">{user?.full_name}</h3>
                                                <p className="text-sm text-text-muted">{user?.school}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    <span className="text-sm font-bold text-text-dark">{user?.rating || '5.0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-secondary-bg p-4 rounded-xl text-center">
                                                <p className="text-2xl font-bold text-text-dark">{connections.length}</p>
                                                <p className="text-xs text-text-muted">Connections</p>
                                            </div>
                                            <div className="bg-secondary-bg p-4 rounded-xl text-center">
                                                <p className="text-2xl font-bold text-text-dark">{user?.portfolio?.length || 0}</p>
                                                <p className="text-xs text-text-muted">Portfolio Items</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/profile')} className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">Edit Profile</button>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </main >
                <MobileNav />
            </div >
        );
    }

    // ==========================================
    // STUDENT DASHBOARD (Looking for Help)
    // ==========================================
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
                                                    Student Dashboard
                                                </span>
                                            </div>
                                            <span className="text-sm text-white/80">• {format(new Date(), 'EEEE, MMM d')}</span>
                                        </div>
                                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
                                            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
                                        </h1>
                                        <p className="text-white/90 text-base md:text-lg max-w-xl">
                                            Need help with your assignments? Connect with verified writers from top universities across India.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => navigate('/writers')}
                                            className="h-12 px-6 rounded-xl bg-white text-primary font-bold shadow-lg hover:shadow-xl btn-hover-lift hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group btn-ripple"
                                        >
                                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">person_search</span>
                                            Find Writers
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
                                                <p className="text-text-muted mb-6 max-w-sm mx-auto">Find a writer to help you with your assignments and track your projects here.</p>
                                                <button
                                                    onClick={() => navigate('/writers')}
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                                >
                                                    Find a Writer Now
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
                                                                <p className="text-xs text-text-muted mb-3">Due: {format(new Date(order.deadline), 'MMM d, yyyy')}</p>
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

                                    {/* Top Writers - Featured */}
                                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                Top Writers
                                            </h2>
                                            <button onClick={() => navigate('/writers')} className="text-sm font-bold text-primary">See All</button>
                                        </div>

                                        {topWriters.length > 0 ? (
                                            <div className="space-y-3">
                                                {topWriters.map((writer: any) => (
                                                    <div
                                                        key={writer.id}
                                                        onClick={() => navigate(`/profile/${writer.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all group"
                                                    >
                                                        <div className="relative">
                                                            <Avatar src={writer.avatar_url} alt={writer.full_name} className="size-11 rounded-full" fallback={writer.full_name?.charAt(0)} />
                                                            {writer.is_verified === 'verified' && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                                                    <span className="material-symbols-outlined text-blue-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate group-hover:text-primary transition-colors">{writer.full_name}</h4>
                                                            <p className="text-[11px] text-text-muted truncate">{writer.school || 'University'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            <span className="text-xs font-bold">{writer.rating || '5.0'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="size-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <span className="material-symbols-outlined">person_search</span>
                                                </div>
                                                <p className="text-text-muted text-xs">Loading writers...</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* College Writers */}
                                    {dashboardWriters.length > 0 && (
                                        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                                                    Your College
                                                </h2>
                                            </div>

                                            <div className="space-y-3">
                                                {dashboardWriters.slice(0, 3).map((writer: any) => (
                                                    <div
                                                        key={writer.id}
                                                        onClick={() => navigate(`/profile/${writer.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg cursor-pointer transition-all group"
                                                    >
                                                        <Avatar src={writer.avatar_url} alt={writer.handle} className="size-10 rounded-full" fallback={writer.handle?.charAt(0)} />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-text-dark text-sm truncate group-hover:text-primary">{writer.handle || writer.full_name}</h4>
                                                            <p className="text-[11px] text-text-muted truncate">{writer.bio || 'Writer'}</p>
                                                        </div>
                                                        {writer.is_writer && (
                                                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">WRITER</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => navigate(`/writers?search=${user?.school}`)}
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
