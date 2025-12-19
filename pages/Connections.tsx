import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Loader2, UserPlus, MessageSquare, Users, X, Check } from 'lucide-react'; // Added icons

const MotionDiv = motion.div as any;

export const Connections = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'network' | 'pending'>('network');
    const [connections, setConnections] = useState<any[]>([]);
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
                setConnections(myConns);
                setRequests(myReqs);
            } catch (error) {
                console.error("Failed to load connections:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    // ✅ NEW: Function to handle starting a chat
    const handleMessage = async (targetUserId: string) => {
        try {
            // Create chat (or get existing) -> Navigate to room
            const chat = await db.createChat(null, user.id, targetUserId);
            navigate(`/chats/${chat.id}`);
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const handleAccept = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'accepted');
        // Refresh list logic here (simplified)
        window.location.reload();
    };

    const handleReject = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'rejected');
        window.location.reload();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main h-screen flex overflow-hidden">
            <Sidebar user={user} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">My Network</h1>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-1">
                            <button
                                onClick={() => setActiveTab('network')}
                                className={`pb-2 px-1 text-sm font-bold ${activeTab === 'network' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                            >
                                Connections ({connections.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`pb-2 px-1 text-sm font-bold ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                            >
                                Requests ({requests.length})
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
                        ) : (
                            <div className="grid gap-4">
                                {activeTab === 'network' && (
                                    connections.length > 0 ? (
                                        connections.map(conn => {
                                            // Find the "other" user in the participants list
                                            // Assuming conn.participants is hydrated with objects. 
                                            // If it's IDs, you need to fetch user details.
                                            // Using safe navigation assuming your service returns hydrated objects:
                                            const otherUser = Array.isArray(conn.participants)
                                                ? conn.participants.find((p: any) => p.id !== user.id) || conn.participants[0]
                                                : null;

                                            if (!otherUser) return null;

                                            return (
                                                <div key={conn.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={otherUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.full_name}`}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                            alt=""
                                                        />
                                                        <div>
                                                            <h3 className="font-bold text-lg">{otherUser.full_name}</h3>
                                                            <p className="text-xs text-gray-500">{otherUser.school}</p>
                                                        </div>
                                                    </div>
                                                    {/* ✅ FIX: Added onClick handler */}
                                                    <button
                                                        onClick={() => handleMessage(otherUser.id)}
                                                        className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                                    >
                                                        <MessageSquare size={20} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : <p className="text-gray-500 text-center py-10">No connections yet. Go find some peers!</p>
                                )}

                                {activeTab === 'pending' && (
                                    requests.length > 0 ? (
                                        requests.map(req => (
                                            <div key={req.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <img src={req.fromUser?.avatar_url} className="w-12 h-12 rounded-full bg-gray-200" alt="" />
                                                    <div>
                                                        <h3 className="font-bold">{req.fromUser?.full_name}</h3>
                                                        <p className="text-xs text-gray-500">Wants to connect</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleReject(req)} className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100"><X size={20} /></button>
                                                    <button onClick={() => handleAccept(req)} className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100"><Check size={20} /></button>
                                                </div>
                                            </div>
                                        ))
                                    ) : <p className="text-gray-500 text-center py-10">No pending requests.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
