import React, { useState, useRef, useEffect } from 'react';
import { dbService as db, userApi } from '../services/firestoreService';
import { Loader2, Camera, MapPin, Briefcase, Link as LinkIcon, Github, Twitter, Linkedin, Mail, Edit2, Plus, X, Trash2, AlertTriangle, Check, Shield, Globe, Lock, Upload, Zap, Share2, Star, Award, Calendar, Grid, Users, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Connection } from '../types';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { ai } from '../services/ai';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

const MotionDiv = motion.div as any;

export const Profile = ({ user }: { user: any }) => {
    const { refreshProfile, deleteAccount } = useAuth();
    const { success, error } = useToast();

    const [activeTab, setActiveTab] = useState('portfolio');

    // Upload Loading States
    const [uploading, setUploading] = useState(false);

    // Edit Mode States
    const [editingProfile, setEditingProfile] = useState(false);
    const [bio, setBio] = useState(user.bio || '');
    const [school, setSchool] = useState(user.school || '');
    const [newTag, setNewTag] = useState('');

    // Network Data
    const [requests, setRequests] = useState<Connection[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

    // Verification State
    const [idUploading, setIdUploading] = useState(false);
    const idInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load Network Data
    useEffect(() => {
        const loadNetwork = async () => {
            if (!user?.id) return;
            if (activeTab === 'network' && connections.length === 0) {
                const reqs = await db.getIncomingRequests(user.id);
                setRequests(reqs);
                const conns = await db.getMyConnections(user.id);
                setConnections(conns);
            }
        };
        loadNetwork();
    }, [user.id, activeTab]);

    // Derived Stats
    const level = Math.floor((user.xp || 0) / 100) + 1;
    const projectsCompleted = Math.floor((user.xp || 0) / 50);
    const rating = "4.9";

    // --- Handlers ---
    const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIdUploading(true);
            try {
                const url = await db.uploadFile(file);
                success("AI is analyzing your ID card...");
                const analysis = await ai.verifyIdCard(file);
                let status: 'verified' | 'pending' = 'pending';
                if (analysis.verified) {
                    status = 'verified';
                    success("AI Verified! You are now a Verified Student.");
                } else {
                    success("AI couldn't auto-verify. Sent for Admin Review.");
                }
                await db.updateProfile(user.id, { id_card_url: url, is_verified: status });
                await refreshProfile();
            } catch (err: any) {
                error("Failed to upload ID or AI verification failed.");
            } finally {
                setIdUploading(false);
                if (idInputRef.current) idInputRef.current.value = '';
            }
        }
    };

    const saveProfile = async () => {
        await db.updateProfile(user.id, { bio, school, tags: user.tags });
        setEditingProfile(false);
        await refreshProfile();
        success("Profile updated successfully!");
    };

    const addTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const updatedTags = [...(user.tags || []), newTag.trim()];
            await db.updateProfile(user.id, { tags: updatedTags });
            setNewTag('');
            await refreshProfile();
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const updatedTags = (user.tags || []).filter((t: string) => t !== tagToRemove);
        await db.updateProfile(user.id, { tags: updatedTags });
        await refreshProfile();
    };

    const handleDeleteSample = async (url: string) => {
        await db.deleteFromPortfolio(user.id, url);
        await refreshProfile();
        success("Sample removed");
    };

    const handleConnectionResponse = async (id: string, status: 'accepted' | 'rejected') => {
        await db.respondToConnectionRequest(id, status);
        const reqs = await db.getIncomingRequests(user.id);
        setRequests(reqs);
        const conns = await db.getMyConnections(user.id);
        setConnections(conns);
        success(`Connection ${status}`);
    };

    const handleFinalDelete = async () => {
        try {
            await deleteAccount();
            success("Account deleted successfully");
        } catch (e: any) {
            console.error(e);
            if (e.code === 'auth/requires-recent-login' || e.message?.includes('requires-recent-login')) {
                error("Security Check: Please log out and log back in to verify your identity before deleting.");
            } else {
                error(e.message || "Failed to delete account");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
                {/* Profile Card */}
                <GlassCard className="overflow-hidden p-0">
                    <div className="h-32 bg-gradient-to-r from-orange-400 to-amber-500 relative">
                        {user.cover_url && <img src={user.cover_url} className="w-full h-full object-cover" alt="Cover" />}
                        <button className="absolute top-2 right-2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="relative -mt-12 mb-3 flex justify-between items-end">
                            <div className="relative">
                                <img
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-white object-cover"
                                    alt="Avatar"
                                />
                                <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full border-2 border-white dark:border-slate-900 hover:bg-orange-600 transition-colors">
                                    <Camera size={12} />
                                </button>
                            </div>
                            <GlassButton
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingProfile(!editingProfile)}
                                icon={<Edit2 size={14} />}
                            >
                                Edit
                            </GlassButton>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {user.handle}
                                {user.is_verified === 'verified' && <Shield size={16} className="text-blue-500 fill-blue-500/10" />}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user.school || 'University Student'}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-200/50 dark:border-white/10">
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{level}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level</div>
                            </div>
                            <div className="text-center border-l border-slate-200/50 dark:border-white/10">
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{projectsCompleted}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projects</div>
                            </div>
                            <div className="text-center border-l border-slate-200/50 dark:border-white/10">
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{rating}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Verification Badge Section */}
                <GlassCard className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Award size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Get Verified Badge</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Upload your College ID Card to get the <span className="text-blue-500 font-bold">Blue Tick</span>. Verified students get 3x more assignments.
                            </p>
                            {user.is_verified === 'pending' ? (
                                <div className="mt-3 bg-yellow-500/10 text-yellow-600 text-xs font-bold px-3 py-2 rounded-lg border border-yellow-500/20 text-center">
                                    Verification Pending...
                                </div>
                            ) : (
                                <button
                                    onClick={() => idInputRef.current?.click()}
                                    disabled={idUploading}
                                    className="mt-3 w-full py-2 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    {idUploading ? 'Uploading...' : 'Upload ID Card'}
                                </button>
                            )}
                        </div>
                    </div>
                    <input type="file" ref={idInputRef} onChange={handleIdSelect} className="hidden" accept="image/*" />
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                </GlassCard>

                {/* About Me */}
                <GlassCard className="p-5">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">About Me</h3>
                    {editingProfile ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500 min-h-[100px] resize-none mt-1 text-slate-900 dark:text-white"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell your peers about your skills..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">University</label>
                                <CollegeAutocomplete
                                    value={school}
                                    onChange={setSchool}
                                    className="mt-1"
                                    inputClassName="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <GlassButton size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</GlassButton>
                                <GlassButton size="sm" onClick={saveProfile}>Save Changes</GlassButton>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {user.bio || "No bio added yet."}
                        </p>
                    )}

                    <div className="mt-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills & Tags</h4>
                        <div className="flex flex-wrap gap-2">
                            {(user.tags || []).map((tag: string) => (
                                <span key={tag} className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 flex items-center gap-2 group">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                                </span>
                            ))}
                            {(user.tags?.length || 0) < 8 && (
                                <input
                                    className="bg-transparent border border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500 text-slate-500 dark:text-slate-400 focus:text-orange-600 w-24 text-center font-medium placeholder-slate-400"
                                    placeholder="+ Add Skill"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={addTag}
                                />
                            )}
                        </div>
                    </div>
                </GlassCard>

            </div>

            {/* RIGHT COLUMN: Tabs & Content */}
            <div className="lg:col-span-2 space-y-6">

                {/* Tabs */}
                <div className="bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar backdrop-blur-sm">
                    {
                        ['portfolio', 'reviews', 'network'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-bold capitalize transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab
                                    ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {tab === 'portfolio' && <Grid size={16} />}
                                {tab === 'reviews' && <Star size={16} />}
                                {tab === 'network' && (
                                    <>
                                        <Users size={16} />
                                        {requests.length > 0 && (
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        )}
                                    </>
                                )}
                                {tab}
                            </button>
                        ))
                    }
                </div>

                <AnimatePresence mode='wait'>
                    {/* PORTFOLIO TAB */}
                    {activeTab === 'portfolio' && (
                        <MotionDiv
                            key="portfolio"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">My Work Samples</h3>
                                <GlassButton
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    icon={<Upload size={14} />}
                                >
                                    {uploading ? "Uploading..." : "Add New"}
                                </GlassButton>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(user.portfolio || []).map((url: string, i: number) => (
                                    <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                                        <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Portfolio" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSample(url); }}
                                                className="p-2 bg-white/90 text-red-500 rounded-lg hover:bg-red-50 shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!user.portfolio || user.portfolio.length === 0) && (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Camera className="text-slate-400" size={24} />
                                        </div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">No samples yet</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload photos of your notes or assignments</p>
                                    </div>
                                )}
                            </div>
                        </MotionDiv>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                        <MotionDiv
                            key="reviews"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Peer Reviews</h3>
                                <div className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    4.9 <span className="text-slate-400 font-normal">(12 reviews)</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((r) => (
                                    <GlassCard key={r} className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                                                    AK
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Arjun K.</h4>
                                                    <p className="text-[10px] text-slate-500">2 days ago</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            "Super fast delivery and the handwriting was extremely neat. Helped me submit my record on time! Will definitely hire again."
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-2 py-1 bg-slate-50 dark:bg-white/10 text-slate-500 dark:text-slate-300 text-[10px] font-bold rounded border border-slate-100 dark:border-white/10">Physics Record</span>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </MotionDiv>
                    )}

                    {/* NETWORK TAB */}
                    {activeTab === 'network' && (
                        <MotionDiv
                            key="network"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Connection Requests */}
                            {requests.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-1 flex items-center gap-2">
                                        Requests <span className="bg-red-500/10 text-red-600 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {requests.map(req => (
                                            <GlassCard key={req.id} className="p-4 flex items-center gap-4">
                                                <img
                                                    src={req.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester_id}`}
                                                    className="w-12 h-12 rounded-full bg-slate-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{req.requester?.handle}</h4>
                                                    <p className="text-xs text-slate-500 truncate">{req.requester?.school}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleConnectionResponse(req.id, 'accepted')}
                                                            className="flex-1 bg-slate-900 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-1"
                                                        >
                                                            <Check size={12} /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleConnectionResponse(req.id, 'rejected')}
                                                            className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-200"
                                                        >
                                                            Ignore
                                                        </button>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* My Connections */}
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-1">My Connections</h3>
                                {connections.length === 0 ? (
                                    <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
                                        <Users className="mx-auto text-slate-300 mb-3" size={32} />
                                        <p className="text-slate-500 text-sm font-medium">You haven't connected with anyone yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {connections.map(conn => (
                                            <GlassCard key={conn.id} className="p-4 text-center hover:border-orange-500/50">
                                                <img
                                                    src={conn.avatar_url}
                                                    className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-3 object-cover"
                                                />
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{conn.handle}</h4>
                                                <p className="text-xs text-slate-500 truncate mb-3">{conn.school}</p>
                                                <button className="w-full bg-slate-50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/20 text-xs font-bold py-2 rounded-lg transition-colors">
                                                    View Profile
                                                </button>
                                            </GlassCard>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </MotionDiv>
                    )}
                </AnimatePresence>

            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 col-span-full">
                <h3 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Danger Zone</h3>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">Delete Account</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Permanently remove your profile and chat history. This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowDeleteModal(true); setDeleteConfirmInput(''); }}
                        className="whitespace-nowrap px-4 py-2 bg-white dark:bg-transparent border border-red-200 dark:border-red-500/30 text-red-600 font-bold rounded-lg text-sm hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <GlassCard className="max-w-sm w-full p-6 shadow-2xl bg-white dark:bg-slate-900">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-200">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Delete Account?</h3>
                            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                This will permanently delete your profile, <b>{user.handle}</b>, and all associated data. You cannot recover your account.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type "DELETE" to confirm</label>
                                    <input
                                        className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-xl px-4 py-3 text-center font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all uppercase placeholder-slate-300 dark:text-white"
                                        placeholder="DELETE"
                                        value={deleteConfirmInput}
                                        onChange={(e) => setDeleteConfirmInput(e.target.value.toUpperCase())}
                                    />
                                </div>

                                <button
                                    disabled={deleteConfirmInput !== 'DELETE'}
                                    onClick={handleFinalDelete}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-200"
                                >
                                    Permanently Delete
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold py-2 text-sm"
                                >
                                    Cancel, keep my account
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};