import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { format } from 'date-fns';

export const Connections = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'network' | 'pending'>('network');
    const [connections, setConnections] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [myConns, myReqs] = await Promise.all([
                db.getMyConnections(user.id),
                db.getIncomingRequests(user.id)
            ]);
            setConnections(myConns);
            setRequests(myReqs);
        } catch (error) {
            console.error("Failed to load connections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async (targetUserId: string) => {
        try {
            const chat = await db.createChat(null, user.id, targetUserId);
            navigate(`/chats/${chat.id}`);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const handleAccept = async (req: any) => {
        setActionLoading(req.id);
        try {
            await db.respondToConnectionRequest(req.id, 'accepted');
            setRequests(prev => prev.filter(r => r.id !== req.id));
            // Reload connections after accepting
            const newConns = await db.getMyConnections(user.id);
            setConnections(newConns);
        } catch (error) {
            console.error("Failed to accept request", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (req: any) => {
        setActionLoading(req.id);
        try {
            await db.respondToConnectionRequest(req.id, 'rejected');
            setRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (error) {
            console.error("Failed to reject request", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-2xl">group</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark tracking-tight">My Network</h1>
                                    <p className="text-text-muted text-sm">Connect and collaborate with fellow students</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined">people</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-dark">{connections.length}</p>
                                        <p className="text-xs text-text-muted">Connections</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">person_add</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-dark">{requests.length}</p>
                                        <p className="text-xs text-text-muted">Pending</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-text-dark">{connections.filter(c => c.participants?.some((p: any) => p.is_verified === 'verified')).length}</p>
                                        <p className="text-xs text-text-muted">Verified</p>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => navigate('/writers')}
                                className="bg-gradient-to-r from-primary to-orange-500 p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                                        <span className="material-symbols-outlined">search</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white">Find More</p>
                                        <p className="text-xs text-white/80">Discover peers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 bg-secondary-bg p-1.5 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab('network')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'network'
                                        ? 'bg-white text-text-dark shadow-sm'
                                        : 'text-text-muted hover:text-text-dark'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">people</span>
                                    Connections ({connections.length})
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending'
                                        ? 'bg-white text-text-dark shadow-sm'
                                        : 'text-text-muted hover:text-text-dark'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Requests
                                    {requests.length > 0 && (
                                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="grid gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="size-14 rounded-full bg-gray-200"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Connections Tab */}
                                {activeTab === 'network' && (
                                    <div className="grid gap-4">
                                        {connections.length > 0 ? (
                                            connections.map(conn => {
                                                const otherUser = Array.isArray(conn.participants)
                                                    ? conn.participants.find((p: any) => p.id !== user.id) || conn.participants[0]
                                                    : null;

                                                if (!otherUser) return null;

                                                return (
                                                    <div key={conn.id} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            {/* Avatar & Info */}
                                                            <div
                                                                className="flex items-center gap-4 flex-1 cursor-pointer"
                                                                onClick={() => navigate(`/profile/${otherUser.id}`)}
                                                            >
                                                                <div className="relative">
                                                                    <Avatar
                                                                        src={otherUser.avatar_url}
                                                                        alt={otherUser.full_name}
                                                                        className="size-14 rounded-full border-2 border-white shadow-md group-hover:border-primary/30 transition-colors"
                                                                        fallback={otherUser.full_name?.charAt(0)}
                                                                    />
                                                                    {otherUser.is_online && (
                                                                        <div className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-2 border-white" title="Online"></div>
                                                                    )}
                                                                    {otherUser.is_verified === 'verified' && (
                                                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                                            <span className="material-symbols-outlined text-blue-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-bold text-lg text-text-dark truncate group-hover:text-primary transition-colors">{otherUser.full_name}</h3>
                                                                        {otherUser.is_writer && (
                                                                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">WRITER</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-text-muted truncate flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-sm">school</span>
                                                                        {otherUser.school || 'University'}
                                                                    </p>
                                                                    {otherUser.bio && (
                                                                        <p className="text-xs text-text-muted truncate mt-1">{otherUser.bio}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => navigate(`/profile/${otherUser.id}`)}
                                                                    className="h-10 px-4 rounded-xl bg-secondary-bg text-text-muted text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">person</span>
                                                                    <span className="hidden sm:inline">Profile</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMessage(otherUser.id)}
                                                                    className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-105 transition-all flex items-center gap-2 shadow-sm"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">chat</span>
                                                                    <span className="hidden sm:inline">Message</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-white p-12 rounded-2xl border border-border-subtle text-center">
                                                <div className="size-20 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                                    <span className="material-symbols-outlined text-primary text-4xl">group_add</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-text-dark mb-2">No connections yet</h3>
                                                <p className="text-text-muted mb-6 max-w-sm mx-auto">Start building your network by connecting with fellow students and writers!</p>
                                                <button
                                                    onClick={() => navigate('/writers')}
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                                                >
                                                    Find Students & Writers
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pending Requests Tab */}
                                {activeTab === 'pending' && (
                                    <div className="grid gap-4">
                                        {requests.length > 0 ? (
                                            requests.map(req => (
                                                <div key={req.id} className="bg-white p-5 rounded-2xl border border-border-subtle shadow-card hover:shadow-soft transition-all">
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar & Info */}
                                                        <div
                                                            className="flex items-center gap-4 flex-1 cursor-pointer"
                                                            onClick={() => navigate(`/profile/${req.fromUser?.id}`)}
                                                        >
                                                            <div className="relative">
                                                                <Avatar
                                                                    src={req.fromUser?.avatar_url}
                                                                    alt={req.fromUser?.full_name}
                                                                    className="size-14 rounded-full border-2 border-white shadow-md"
                                                                    fallback={req.fromUser?.full_name?.charAt(0)}
                                                                />
                                                                {req.fromUser?.is_verified === 'verified' && (
                                                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                                                        <span className="material-symbols-outlined text-blue-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-bold text-lg text-text-dark truncate">{req.fromUser?.full_name || 'Unknown'}</h3>
                                                                    {req.fromUser?.is_writer && (
                                                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">WRITER</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-text-muted truncate">{req.fromUser?.school || 'University'}</p>
                                                                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                                    Request sent {req.created_at ? format(new Date(req.created_at), 'MMM d') : 'recently'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleReject(req)}
                                                                disabled={actionLoading === req.id}
                                                                className="h-10 px-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">close</span>
                                                                <span className="hidden sm:inline">Decline</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleAccept(req)}
                                                                disabled={actionLoading === req.id}
                                                                className="h-10 px-4 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                                                            >
                                                                {actionLoading === req.id ? (
                                                                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-lg">check</span>
                                                                )}
                                                                <span className="hidden sm:inline">Accept</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-white p-12 rounded-2xl border border-border-subtle text-center">
                                                <div className="size-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                                    <span className="material-symbols-outlined text-blue-500 text-4xl">inbox</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-text-dark mb-2">No pending requests</h3>
                                                <p className="text-text-muted max-w-sm mx-auto">When someone wants to connect with you, their request will appear here.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
