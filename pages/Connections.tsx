import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Loader2, UserPlus, MessageSquare, Users } from 'lucide-react';

const MotionDiv = motion.div as any;

export const Connections = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'network' | 'pending'>('network');
    const [connections, setConnections] = useState<User[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const [myConns, myReqs] = await Promise.all([
                    db.getMyConnections(user.id),
                    db.getIncomingRequests(user.id)
                ]);
                setConnections(myConns as User[]);
                setRequests(myReqs);
            } catch (error) {
                console.error("Failed to load connections:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Realtime listener for raw connections to trigger reload
        const unsub = db.listenToConnections(user.id, () => {
            loadData();
        });

        return () => unsub();
    }, [user.id]);

    const handleAccept = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'accepted');
    };

    const handleReject = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'rejected');
    };

    const handleMessage = async (otherId: string) => {
        const chat = await db.createChat(null, user.id, otherId);
        navigate(`/chats/${chat.id}`);
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-5xl mx-auto h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold tracking-tight text-text-main">Connections</h1>
                            <div className="flex bg-white rounded-full p-1 shadow-sm border border-border-light">
                                <button
                                    onClick={() => setActiveTab('network')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'network' ? 'bg-primary text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
                                >
                                    My Network
                                </button>
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-primary text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
                                >
                                    Requests
                                    {requests.length > 0 && (
                                        <span className={`flex items-center justify-center size-5 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                            {requests.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'network' ? (
                                        <MotionDiv
                                            key="network"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                        >
                                            {connections.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                                    <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                        <Users className="text-gray-300" size={40} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-text-main">No connections yet</h3>
                                                    <p className="text-secondary max-w-xs mx-auto mt-2">Search for students or writers to grow your network.</p>
                                                </div>
                                            ) : (
                                                connections.map((conn) => (
                                                    <div key={conn.id} className="bg-white p-4 rounded-2xl border border-border-light shadow-sm flex items-center gap-4">
                                                        <img
                                                            src={conn.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.handle}`}
                                                            alt={conn.handle}
                                                            className="size-14 rounded-full bg-gray-50 object-cover border border-gray-100"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-text-main truncate">{conn.full_name || conn.handle}</h3>
                                                            <p className="text-xs text-secondary truncate">@{conn.handle}</p>
                                                            <p className="text-xs text-secondary truncate mt-0.5">{conn.school}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMessage(conn.id)}
                                                            className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                            title="Message"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </MotionDiv>
                                    ) : (
                                        <MotionDiv
                                            key="pending"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-3"
                                        >
                                            {requests.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                                    <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                        <UserPlus className="text-gray-300" size={40} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-text-main">No pending requests</h3>
                                                </div>
                                            ) : (
                                                requests.map((req) => (
                                                    <div key={req.id} className="bg-white p-4 rounded-2xl border border-border-light shadow-sm flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={req.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester?.handle}`}
                                                                alt={req.requester?.handle}
                                                                className="size-12 rounded-full bg-gray-50 object-cover border border-gray-100"
                                                            />
                                                            <div>
                                                                <h3 className="font-bold text-text-main">{req.requester?.full_name || req.requester?.handle}</h3>
                                                                <p className="text-xs text-secondary">@{req.requester?.handle} • {req.requester?.school}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleReject(req)}
                                                                className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleAccept(req)}
                                                                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </MotionDiv>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
