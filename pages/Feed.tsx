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
                db.getDashboardWriters(user.school, 5, user.id).then(setDashboardWriters);
            }
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

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full flex flex-col gap-8">

                            {/* Welcome Section */}
                            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isWriterMode
                                                ? 'bg-gradient-to-r from-primary/10 to-orange-500/10 text-primary border border-primary/20'
                                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {isWriterMode ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                                    Writer Dashboard
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">school</span>
                                                    Student Dashboard
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-text-muted">• {format(new Date(), 'MMM d, yyyy')}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight leading-tight">
                                        {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Student'}.
                                    </h1>
                                    <p className="text-text-muted mt-2 text-lg">
                                        {isWriterMode
                                            ? "Ready to help fellow students with their assignments."
                                            : "Your academic tasks are under control."
                                        }
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-3">
                                    {isWriterMode ? (
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                            View My Profile
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/writers')}
                                            className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">person_search</span>
                                            Find a Writer
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className={`grid gap-4 md:gap-6 ${isWriterMode ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                                {isWriterMode ? (
                                    // Writer Stats
                                    <>
                                        {/* Total Earnings */}
                                        <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">Total Earned</h3>
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">payments</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-3xl font-extrabold text-text-dark tracking-tight">{formatCurrency(user?.total_earned || 0)}</span>
                                                <p className="text-xs text-green-600 font-medium mt-1">Lifetime earnings</p>
                                            </div>
                                        </div>

                                        {/* Active Orders */}
                                        <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">Active Orders</h3>
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">assignment</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-3xl font-extrabold text-text-dark tracking-tight">{stats.activeCount}</span>
                                                <p className="text-xs text-text-muted font-medium mt-1">In progress</p>
                                            </div>
                                        </div>

                                        {/* Pending Requests */}
                                        <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">Pending Requests</h3>
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">person_add</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-3xl font-extrabold text-text-dark tracking-tight">{incomingRequests.length}</span>
                                                <p className="text-xs text-blue-600 font-medium mt-1">Awaiting response</p>
                                            </div>
                                        </div>

                                        {/* On-Time Rate */}
                                        <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">On-Time Rate</h3>
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">timer</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-3xl font-extrabold text-text-dark tracking-tight">{user?.on_time_rate || 100}%</span>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${user?.on_time_rate || 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Student Stats
                                    <>
                                        {/* Active Projects */}
                                        <div className="bg-white p-6 rounded-[2rem] shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">Active Projects</h3>
                                                <div className="size-10 rounded-full bg-orange-50 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">assignment</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-4xl font-extrabold text-text-dark tracking-tight">{stats.activeCount}</span>
                                                {stats.activeCount > 0 && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <div className="flex -space-x-2">
                                                            {stats.activeOrders.slice(0, 3).map((order: any, i: number) => (
                                                                <Avatar
                                                                    key={i}
                                                                    src={order.writer_avatar}
                                                                    alt="Writer"
                                                                    className="size-6 rounded-full border-2 border-white"
                                                                    fallback={order.writer_handle?.charAt(0)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold text-text-muted">In Progress</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Next Deadline */}
                                        <div className="bg-white p-6 rounded-[2rem] shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">Next Deadline</h3>
                                                <div className="size-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">timer</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                {stats.nextDeadline !== null ? (
                                                    <>
                                                        <span className="text-4xl font-extrabold text-text-dark tracking-tight">{stats.nextDeadline} <span className="text-lg font-bold text-text-muted">Days</span></span>
                                                        <div className="mt-3">
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }}></div>
                                                            </div>
                                                            <p className="text-xs font-bold text-red-500 mt-1.5 truncate">{stats.nextDeadlineProject}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-2xl font-bold text-text-muted">No deadlines</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Connections */}
                                        <div className="bg-white p-6 rounded-[2rem] shadow-card border border-border-subtle relative overflow-hidden group hover:shadow-soft transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <h3 className="text-text-muted font-bold text-sm">My Network</h3>
                                                <div className="size-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined">group</span>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <span className="text-4xl font-extrabold text-text-dark tracking-tight">{connections.length}</span>
                                                <p className="text-xs text-text-muted mt-2">Connected writers & students</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Main Content Column */}
                                <div className="xl:col-span-2 flex flex-col gap-8">

                                    {/* Incoming Requests (Writer Mode) */}
                                    {isWriterMode && (
                                        <section className="flex flex-col gap-5">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">person_add</span>
                                                    Connection Requests
                                                    {incomingRequests.length > 0 && (
                                                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{incomingRequests.length}</span>
                                                    )}
                                                </h2>
                                                <button onClick={() => navigate('/connections')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All</button>
                                            </div>

                                            {loading ? (
                                                <div className="space-y-4">
                                                    {[1, 2].map((i) => (
                                                        <div key={i} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card animate-pulse">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-12 rounded-full bg-gray-200"></div>
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                                                                    <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : incomingRequests.length === 0 ? (
                                                <div className="bg-white p-8 rounded-2xl border border-border-subtle text-center">
                                                    <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <span className="material-symbols-outlined text-3xl">inbox</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-text-dark mb-2">No pending requests</h3>
                                                    <p className="text-text-muted text-sm">When students want to connect with you, their requests will appear here.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {incomingRequests.slice(0, 5).map((request: any) => (
                                                        <div key={request.id} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar
                                                                    src={request.fromUser?.avatar_url}
                                                                    alt={request.fromUser?.full_name}
                                                                    className="size-12 rounded-full"
                                                                    fallback={request.fromUser?.full_name?.charAt(0)}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-text-dark truncate">{request.fromUser?.full_name || 'Unknown'}</h4>
                                                                    <p className="text-xs text-text-muted truncate">{request.fromUser?.school || 'University'}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => db.respondToConnectionRequest(request.id, 'accepted').then(() => setIncomingRequests(prev => prev.filter(r => r.id !== request.id)))}
                                                                        className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-105 transition-all"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => db.respondToConnectionRequest(request.id, 'rejected').then(() => setIncomingRequests(prev => prev.filter(r => r.id !== request.id)))}
                                                                        className="h-9 px-4 rounded-lg bg-gray-100 text-text-muted text-sm font-bold hover:bg-gray-200 transition-all"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {/* Active Projects Section */}
                                    <section className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                                {isWriterMode ? 'Current Assignments' : 'Active Projects'}
                                                <span className="bg-gray-100 text-text-muted text-xs font-bold px-2 py-1 rounded-full">{stats.activeCount}</span>
                                            </h2>
                                            <a href="#" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All</a>
                                        </div>

                                        {loading ? (
                                            <div className="space-y-6">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-border-subtle shadow-card animate-pulse">
                                                        <div className="flex justify-between items-center mb-5">
                                                            <div className="flex gap-4">
                                                                <div className="size-12 rounded-2xl bg-gray-200 shrink-0"></div>
                                                                <div className="space-y-2">
                                                                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                                                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                                                </div>
                                                            </div>
                                                            <div className="size-8 rounded-full bg-gray-200"></div>
                                                        </div>
                                                        <div className="bg-secondary-bg rounded-xl p-4 flex items-center justify-between gap-4 border border-border-subtle">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-gray-200"></div>
                                                                <div className="space-y-2">
                                                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                                    <div className="h-2 w-16 bg-gray-200 rounded"></div>
                                                                </div>
                                                            </div>
                                                            <div className="w-32 space-y-2">
                                                                <div className="flex justify-between">
                                                                    <div className="h-2 w-12 bg-gray-200 rounded"></div>
                                                                    <div className="h-2 w-8 bg-gray-200 rounded"></div>
                                                                </div>
                                                                <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : stats.activeOrders.length === 0 ? (
                                            <div className="bg-white p-8 rounded-[1.5rem] border border-border-subtle text-center">
                                                <div className="size-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-3xl">{isWriterMode ? 'work_off' : 'post_add'}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-text-dark mb-2">
                                                    {isWriterMode ? 'No active assignments' : 'No active projects'}
                                                </h3>
                                                <p className="text-text-muted mb-6">
                                                    {isWriterMode
                                                        ? 'When students hire you for assignments, they will appear here.'
                                                        : 'Post a new assignment to get started.'
                                                    }
                                                </p>
                                                {!isWriterMode && (
                                                    <button onClick={() => navigate('/writers')} className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                                                        Find a Writer
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            stats.activeOrders.map((order: any) => (
                                                <div key={order.id} className="bg-white p-6 rounded-[1.5rem] border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                                                        <div className="flex gap-4">
                                                            <div className="size-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined">article</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-bold text-text-dark">{order.title}</h3>
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-100">Work In Progress</span>
                                                                </div>
                                                                <p className="text-sm text-text-muted">ID: #{order.id.substring(0, 6).toUpperCase()} • Due: {format(new Date(order.deadline), 'MMM d')}</p>
                                                            </div>
                                                        </div>
                                                        <button className="size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-muted transition-colors">
                                                            <span className="material-symbols-outlined">more_horiz</span>
                                                        </button>
                                                    </div>

                                                    <div className="bg-secondary-bg rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-subtle mb-5">
                                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                                            <div className="relative">
                                                                <Avatar
                                                                    src={order.writer_avatar}
                                                                    alt={order.writer_handle}
                                                                    className="size-10 rounded-full border border-white shadow-sm"
                                                                    fallback={order.writer_handle?.charAt(0)}
                                                                />
                                                                {order.writer_verified && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" title="Verified Writer">
                                                                        <span className="material-symbols-outlined text-blue-500 text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-text-dark">{order.writer_handle || 'Unknown Writer'}</p>
                                                                <p className="text-xs text-text-muted">{order.writer_school || 'University'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full sm:w-48">
                                                            <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                                                <span>Completion</span>
                                                                <span>{order.completion_percentage || 0}%</span>
                                                            </div>
                                                            <div className="w-full bg-white border border-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${order.completion_percentage || 0}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </section>
                                </div>

                                {/* Right Sidebar Column */}
                                <div className="flex flex-col gap-8">
                                    {/* Recent Messages */}
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-xl">chat</span>
                                                Recent Messages
                                            </h2>
                                            <button onClick={() => navigate('/chats')} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">View All</button>
                                        </div>

                                        {recentChats.length > 0 ? (
                                            <div className="space-y-3">
                                                {recentChats.map((chat: any) => (
                                                    <div
                                                        key={chat.id}
                                                        onClick={() => navigate(`/chats/${chat.id}`)}
                                                        className="bg-white p-4 rounded-xl border border-border-subtle shadow-card hover:shadow-soft transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <Avatar
                                                                    src={chat.other_avatar}
                                                                    alt={chat.other_handle}
                                                                    className="size-10 rounded-full"
                                                                    fallback={chat.other_handle?.charAt(0)}
                                                                />
                                                                {chat.unread_count > 0 && (
                                                                    <div className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                                        {chat.unread_count}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-bold text-text-dark text-sm truncate group-hover:text-primary transition-colors">{chat.other_handle}</h4>
                                                                    <span className="text-[10px] text-text-muted">{format(new Date(chat.updated_at), 'MMM d')}</span>
                                                                </div>
                                                                <p className="text-xs text-text-muted truncate mt-0.5">{chat.last_message || 'No messages yet'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white p-6 rounded-xl border border-border-subtle text-center">
                                                <div className="size-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                </div>
                                                <p className="text-text-muted text-sm">No messages yet</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Writers Section (Student Mode) / Profile Stats (Writer Mode) */}
                                    {isWriterMode ? (
                                        <section>
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-lg font-bold text-text-dark">Your Profile Stats</h2>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Avatar
                                                        src={user?.avatar_url}
                                                        alt={user?.full_name}
                                                        className="size-14 rounded-xl"
                                                        fallback={user?.full_name?.charAt(0)}
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-text-dark">{user?.full_name}</h3>
                                                        <p className="text-xs text-text-muted">{user?.school}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            <span className="text-xs font-bold text-text-dark">{user?.rating || '5.0'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-secondary-bg p-3 rounded-xl text-center">
                                                        <p className="text-lg font-bold text-text-dark">{connections.length}</p>
                                                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Connections</p>
                                                    </div>
                                                    <div className="bg-secondary-bg p-3 rounded-xl text-center">
                                                        <p className="text-lg font-bold text-text-dark">{user?.portfolio?.length || 0}</p>
                                                        <p className="text-[10px] text-text-muted uppercase tracking-wide">Portfolio</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className="w-full mt-4 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
                                                >
                                                    Edit Profile
                                                </button>
                                            </div>
                                        </section>
                                    ) : (
                                        <section>
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-lg font-bold text-text-dark">Writers at {user?.school || 'Your University'}</h2>
                                            </div>
                                            {dashboardWriters.length > 0 ? (
                                                <div className="space-y-4">
                                                    {dashboardWriters.map((writer) => (
                                                        <div key={writer.id} onClick={() => navigate(`/profile/${writer.id}`)} className="bg-white p-5 rounded-[1.5rem] border border-border-subtle shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex gap-3">
                                                                    <Avatar
                                                                        src={writer.avatar_url}
                                                                        alt={writer.handle}
                                                                        className="size-12 rounded-xl shadow-sm"
                                                                        fallback={writer.handle?.charAt(0)}
                                                                    />
                                                                    <div>
                                                                        <div className="flex items-center gap-1">
                                                                            <h3 className="font-bold text-text-dark">{writer.handle}</h3>
                                                                            {writer.is_verified === 'verified' && (
                                                                                <span className="material-symbols-outlined text-blue-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-text-muted line-clamp-1">{writer.bio || writer.school}</p>
                                                                        <div className="flex items-center gap-1 mt-1 text-xs font-bold text-text-dark">
                                                                            <span className="material-symbols-outlined text-amber-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                            4.9 <span className="text-text-muted font-medium">({writer.reviews_count || 0})</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {writer.total_earned > 1000 && (
                                                                    <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100">Top Rated</span>
                                                                )}
                                                            </div>
                                                            {writer.tags && writer.tags.length > 0 && (
                                                                <div className="flex gap-2 mt-4 flex-wrap">
                                                                    {writer.tags.slice(0, 3).map((tag: string, i: number) => (
                                                                        <span key={i} className="bg-gray-50 text-text-muted text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-100">{tag}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white p-8 rounded-[1.5rem] border border-border-subtle text-center">
                                                    <div className="bg-gray-50 size-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <span className="material-symbols-outlined text-gray-400">school</span>
                                                    </div>
                                                    <p className="text-text-dark font-bold text-sm">No writers yet</p>
                                                    <p className="text-xs text-text-muted mt-1">Be the first writer at {user?.school || 'your university'}!</p>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => navigate('/writers')}
                                                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-orange-500/10 text-primary font-bold text-sm hover:from-primary hover:to-orange-500 hover:text-white transition-all"
                                            >
                                                Browse All Writers
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
