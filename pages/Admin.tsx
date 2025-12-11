import React, { useState, useEffect } from 'react';
import { db } from '../services/mockSupabase';
import { useToast } from '../contexts/ToastContext';
import { Shield, Check, X, Loader2, Lock } from 'lucide-react';

export const Admin = () => {
    const { success, error } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Simple Admin Protection
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessCode === 'admin123') {
            setIsAuthenticated(true);
            loadPending();
        } else {
            error("Invalid Access Code");
        }
    };

    const loadPending = async () => {
        setLoading(true);
        const users = await db.getPendingVerifications();
        setPendingUsers(users);
        setLoading(false);
    };

    const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
        try {
            await db.verifyUser(userId, status);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            success(`User ${status === 'verified' ? 'Verified' : 'Rejected'} Successfully`);
        } catch (e) {
            error("Action Failed");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-center mb-8">
                        <div className="p-5 bg-orange-50 dark:bg-orange-500/10 rounded-2xl">
                            <Shield size={48} className="text-orange-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Access Code</label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={accessCode}
                                    onChange={e => setAccessCode(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
                                    placeholder="Enter code..."
                                />
                            </div>
                        </div>
                        <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg">
                            Enter Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-orange-600" size={32} /> Admin Dashboard
                    </h1>
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
                        Logout
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Pending Verifications ({pendingUsers.length})</h2>
                        <button onClick={loadPending} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Loader2 size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <Check size={64} className="mx-auto mb-6 opacity-20" />
                            <p className="font-medium text-lg">All caught up! No pending verifications.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="p-8 flex flex-col md:flex-row gap-8 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    {/* ID Card Image */}
                                    <div className="w-full md:w-1/3 aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group shadow-sm">
                                        <img src={user.id_card_url} className="w-full h-full object-cover" alt="ID Card" />
                                        <a href={user.id_card_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            View Full Size
                                        </a>
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src={user.avatar_url} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{user.handle}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">University</span>
                                                <p className="font-semibold text-slate-900 dark:text-white mt-1">{user.school}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Submitted</span>
                                                <p className="font-semibold text-slate-900 dark:text-white mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleVerify(user.id, 'verified')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-green-500/20"
                                            >
                                                <Check size={20} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerify(user.id, 'rejected')}
                                                className="flex-1 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                                            >
                                                <X size={20} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
