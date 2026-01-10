import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { format } from 'date-fns';
import { Avatar } from '../components/ui/Avatar';
import { MobileNav } from '../components/dashboard/MobileNav';

interface FeedProps {
    user: User | null;
    onChat?: (peer: User) => void;
}

interface Connection {
    id: string;
    name: string;
    school: string;
    avatar_url?: string | null;
    isVerified: boolean;
    isOnline: boolean;
    subjects?: string[];
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string | null;
    preview: string;
    timestamp: Date;
    unread: boolean;
}

export const Feed: React.FC<FeedProps> = ({ user, onChat }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({
        activeCount: 0,
        connectionsCount: 0,
        unreadMessages: 0,
        communityPosts: 0
    });
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [peers, setPeers] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // Fetch dashboard stats and peers in parallel
                const [statsData, peersData] = await Promise.all([
                    db.getDashboardStats(user.id).catch(err => {
                        console.error("Failed to fetch dashboard stats:", err);
                        return { activeCount: 0, escrowBalance: 0, nextDeadline: null, nextDeadlineProject: null, activeOrders: [] };
                    }),
                    db.getDashboardWriters(user.school, 6, user.id).catch(err => {
                        console.error("Failed to fetch peers:", err);
                        return [];
                    })
                ]);

                if (isMounted) {
                    setStats({
                        ...statsData,
                        connectionsCount: peersData.length,
                        unreadMessages: Math.floor(Math.random() * 5),
                        communityPosts: 12
                    });

                    // Transform peers to connections format
                    const connectionsData: Connection[] = peersData.map((p: any) => ({
                        id: p.id,
                        name: p.full_name || p.handle || 'Anonymous',
                        school: p.school || 'Unknown',
                        avatar_url: p.avatar_url,
                        isVerified: p.is_verified === 'verified',
                        isOnline: Math.random() > 0.5,
                        subjects: p.subjects || p.tags || []
                    }));
                    setConnections(connectionsData);
                    setPeers(peersData);

                    // Mock recent messages
                    const mockMessages: Message[] = connectionsData.slice(0, 3).map((c, i) => ({
                        id: `msg-${i}`,
                        senderId: c.id,
                        senderName: c.name,
                        senderAvatar: c.avatar_url,
                        preview: ['Hey, can you help me with...', 'Thanks for the explanation!', 'Let me know when you\'re free'][i] || 'New message',
                        timestamp: new Date(Date.now() - Math.random() * 3600000 * 24),
                        unread: i === 0
                    }));
                    setRecentMessages(mockMessages);
                }
            } catch (err) {
                console.error("Dashboard data fetching critical error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleQuickPost = () => {
        navigate('/community');
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full flex flex-col gap-8">

                            {/* Welcome Section with Quick Post */}
                            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                                <div>
                                    <div className="text-sm font-bold text-primary mb-1 tracking-wide uppercase">
                                        {format(new Date(), 'MMM d')} • Student Dashboard
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight leading-tight">
                                        {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Student'}.
                                    </h1>
                                    <p className="text-text-muted mt-2 text-lg">Stay connected with your academic community.</p>
                                </div>
                                <button
                                    onClick={handleQuickPost}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Post in Community
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Active Projects */}
                                <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={() => navigate('/projects')}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className="text-text-muted font-bold text-sm">Active Projects</h3>
                                        <div className="size-10 rounded-full bg-orange-50 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">assignment</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark tracking-tight">{stats.activeCount}</span>
                                </div>

                                {/* Connections */}
                                <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={() => navigate('/writers')}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className="text-text-muted font-bold text-sm">My Connections</h3>
                                        <div className="size-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">group</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark tracking-tight">{connections.length}</span>
                                </div>

                                {/* Unread Messages */}
                                <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={() => navigate('/messages')}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className="text-text-muted font-bold text-sm">Unread Messages</h3>
                                        <div className="size-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">mail</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark tracking-tight">{stats.unreadMessages}</span>
                                    {stats.unreadMessages > 0 && (
                                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                                    )}
                                </div>

                                {/* Community Posts */}
                                <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300 cursor-pointer" onClick={() => navigate('/community')}>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className="text-text-muted font-bold text-sm">Community Activity</h3>
                                        <div className="size-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">forum</span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-text-dark tracking-tight">{stats.communityPosts}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Main Content Column */}
                                <div className="xl:col-span-2 flex flex-col gap-8">

                                    {/* Recent Messages Section */}
                                    <section className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">chat</span>
                                                Recent Messages
                                            </h2>
                                            <button onClick={() => navigate('/messages')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All</button>
                                        </div>

                                        {loading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-border-subtle animate-pulse flex gap-4">
                                                        <div className="size-12 rounded-full bg-gray-200"></div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                            <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : recentMessages.length === 0 ? (
                                            <div className="bg-white p-8 rounded-2xl border border-border-subtle text-center">
                                                <div className="size-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-text-dark mb-2">No messages yet</h3>
                                                <p className="text-text-muted mb-4">Connect with peers to start conversations.</p>
                                                <button onClick={() => navigate('/writers')} className="bg-primary text-white px-6 py-2 rounded-full font-bold">
                                                    Find Peers
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {recentMessages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        onClick={() => navigate('/messages')}
                                                        className={`bg-white p-4 rounded-xl border ${msg.unread ? 'border-primary/30 bg-orange-50/30' : 'border-border-subtle'} hover:shadow-soft transition-all cursor-pointer flex items-center gap-4`}
                                                    >
                                                        <div className="relative">
                                                            <Avatar src={msg.senderAvatar} name={msg.senderName} className="size-12 rounded-full" />
                                                            {msg.unread && (
                                                                <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-white"></span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className={`font-bold ${msg.unread ? 'text-text-dark' : 'text-text-muted'}`}>{msg.senderName}</h4>
                                                                <span className="text-xs text-text-muted">{format(msg.timestamp, 'h:mm a')}</span>
                                                            </div>
                                                            <p className={`text-sm truncate ${msg.unread ? 'text-text-dark font-medium' : 'text-text-muted'}`}>{msg.preview}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Active Projects Section */}
                                    <section className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">folder_open</span>
                                                Active Projects
                                                <span className="bg-gray-100 text-text-muted text-xs font-bold px-2 py-1 rounded-full">{stats.activeCount}</span>
                                            </h2>
                                            <button onClick={() => navigate('/projects')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All</button>
                                        </div>

                                        {loading ? (
                                            <div className="bg-white p-6 rounded-2xl border border-border-subtle animate-pulse">
                                                <div className="h-20 bg-gray-100 rounded-xl"></div>
                                            </div>
                                        ) : stats.activeCount === 0 ? (
                                            <div className="bg-white p-8 rounded-2xl border border-border-subtle text-center">
                                                <div className="size-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-3xl">post_add</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-text-dark mb-2">No active projects</h3>
                                                <p className="text-text-muted mb-6">Start a new project or collaborate with peers.</p>
                                                <button onClick={() => navigate('/writers')} className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                                                    Start a Project
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {stats.activeOrders?.slice(0, 3).map((order: any) => (
                                                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex gap-3">
                                                                <div className="size-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                                    <span className="material-symbols-outlined">article</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-text-dark">{order.title}</h3>
                                                                    <p className="text-xs text-text-muted">Due: {format(new Date(order.deadline), 'MMM d, yyyy')}</p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase">In Progress</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1 uppercase">
                                                                    <span>Progress</span>
                                                                    <span>{order.completion_percentage || 0}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${order.completion_percentage || 0}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Right Sidebar Column - Connections */}
                                <div className="flex flex-col gap-6">
                                    {/* Connections Section */}
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-500">diversity_3</span>
                                                Peers at {user?.school?.split(' ').slice(0, 2).join(' ') || 'Your College'}
                                            </h2>
                                            <button onClick={() => navigate('/writers')} className="text-xs font-bold text-primary">See All</button>
                                        </div>

                                        {loading ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="bg-white p-4 rounded-xl border border-border-subtle animate-pulse">
                                                        <div className="flex gap-3">
                                                            <div className="size-12 rounded-xl bg-gray-200"></div>
                                                            <div className="space-y-2 flex-1">
                                                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : connections.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {connections.slice(0, 5).map((conn) => (
                                                    <div
                                                        key={conn.id}
                                                        onClick={() => navigate(`/profile/${conn.id}`)}
                                                        className="bg-white p-4 rounded-xl border border-border-subtle shadow-card hover:shadow-soft hover:border-primary/30 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <Avatar src={conn.avatar_url} name={conn.name} className="size-12 rounded-xl shadow-sm" />
                                                                {conn.isOnline && (
                                                                    <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-white"></span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <h3 className="font-bold text-text-dark truncate">{conn.name}</h3>
                                                                    {conn.isVerified && (
                                                                        <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-text-muted truncate">{conn.school}</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate('/messages'); }}
                                                                className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">chat</span>
                                                            </button>
                                                        </div>
                                                        {conn.subjects && conn.subjects.length > 0 && (
                                                            <div className="flex gap-1.5 mt-3 flex-wrap">
                                                                {conn.subjects.slice(0, 3).map((subject, i) => (
                                                                    <span key={i} className="bg-gray-50 text-text-muted text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100">{subject}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-6 rounded-2xl border border-border-subtle text-center">
                                                <div className="bg-blue-50 size-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined text-blue-500">person_add</span>
                                                </div>
                                                <p className="text-text-dark font-bold text-sm">No peers yet</p>
                                                <p className="text-xs text-text-muted mt-1">Find and connect with peers at your college!</p>
                                                <button onClick={() => navigate('/writers')} className="mt-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                                                    Find Peers
                                                </button>
                                            </div>
                                        )}
                                    </section>

                                    {/* Quick Actions */}
                                    <section className="bg-gradient-to-br from-primary to-orange-600 p-5 rounded-2xl text-white">
                                        <h3 className="font-bold mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined">bolt</span>
                                            Quick Actions
                                        </h3>
                                        <div className="space-y-2">
                                            <button onClick={() => navigate('/community')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl text-left font-medium text-sm flex items-center gap-3 transition-colors">
                                                <span className="material-symbols-outlined">edit_note</span>
                                                Post a Question
                                            </button>
                                            <button onClick={() => navigate('/writers')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl text-left font-medium text-sm flex items-center gap-3 transition-colors">
                                                <span className="material-symbols-outlined">person_search</span>
                                                Find Study Partner
                                            </button>
                                            <button onClick={() => navigate('/projects')} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl text-left font-medium text-sm flex items-center gap-3 transition-colors">
                                                <span className="material-symbols-outlined">assignment_add</span>
                                                Start New Project
                                            </button>
                                        </div>
                                    </section>
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
