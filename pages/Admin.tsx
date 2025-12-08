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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Shield size={40} className="text-slate-900" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Access Code</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={accessCode}
                                    onChange={e => setAccessCode(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    placeholder="Enter code..."
                                />
                            </div>
                        </div>
                        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                            Enter Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Shield className="fill-slate-900" /> Admin Dashboard
                    </h1>
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm font-bold text-slate-500 hover:text-slate-900">
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg">Pending Verifications ({pendingUsers.length})</h2>
                        <button onClick={loadPending} className="text-slate-500 hover:text-slate-900">
                            <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Check size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">All caught up! No pending verifications.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="p-6 flex flex-col md:flex-row gap-6 items-start">
                                    {/* ID Card Image */}
                                    <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                                        <img src={user.id_card_url} className="w-full h-full object-cover" alt="ID Card" />
                                        <a href={user.id_card_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Full Size
                                        </a>
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img src={user.avatar_url} className="w-10 h-10 rounded-full bg-slate-100" />
                                            <div>
                                                <h3 className="font-bold text-slate-900">{user.handle}</h3>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
                                            <div className="bg-slate-50 p-3 rounded-lg">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">University</span>
                                                <p className="font-medium text-sm text-slate-800">{user.school}</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-lg">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Submitted</span>
                                                <p className="font-medium text-sm text-slate-800">{new Date(user.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleVerify(user.id, 'verified')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <Check size={18} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerify(user.id, 'rejected')}
                                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <X size={18} /> Reject
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
