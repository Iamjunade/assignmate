import React, { useState, useRef, useEffect } from 'react';
import { db } from '../services/mockSupabase';
import { Loader2, Camera, MapPin, Briefcase, Link as LinkIcon, Github, Twitter, Linkedin, Mail, Edit2, Plus, X, Trash2, AlertTriangle, Check, Shield, Globe, Lock, Upload, Zap, Share2, Star, Award, Calendar, Grid, Users, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Connection } from '../types';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { ai } from '../services/ai';

const MotionDiv = motion.div as any;
import { UPIPaymentModal } from '../components/UPIPaymentModal';

export const Profile = ({ user }: { user: any }) => {
    const { refreshProfile, deleteAccount } = useAuth();
    const { success, error } = useToast();

    const [activeTab, setActiveTab] = useState('portfolio');

    // Upload Loading States
    const [uploading, setUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

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

    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Verification State
    const [idUploading, setIdUploading] = useState(false);
    const idInputRef = useRef<HTMLInputElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Load Network Data
    useEffect(() => {
        const loadNetwork = async () => {
            if (!user?.id) return;
            const reqs = await db.getIncomingRequests(user.id);
            setRequests(reqs);
            const conns = await db.getMyConnections(user.id);
            setConnections(conns);
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
                // 1. Upload File
                const url = await db.uploadFile(file);

                // 2. AI Verification
                success("AI is analyzing your ID card...");
                const analysis = await ai.verifyIdCard(file);

                let status: 'verified' | 'pending' = 'pending';

                if (analysis.verified) {
                    status = 'verified';
                    success("AI Verified! You are now a Verified Student.");
                } else {
                    success("AI couldn't auto-verify. Sent for Admin Review.");
                }

                // 3. Update Profile
                await db.updateProfile(user.id, {
                    id_card_url: url,
                    is_verified: status
                });

                window.location.reload(); // Refresh to show badge
            } catch (err: any) {
                error("Failed to upload ID or AI verification failed.");
            } finally {
                setIdUploading(false);
                if (idInputRef.current) idInputRef.current.value = '';
            }
        }
    };

    const handleAddMoney = async (amount: number) => {
        const newBalance = (user.balance || 0) + amount;
        await db.updateProfile(user.id, { balance: newBalance });
        await refreshProfile();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await db.uploadFile(file);
            await db.addToPortfolio(user.id, url);
            await refreshProfile();
            success("Sample uploaded successfully!");
            if (activeTab !== 'portfolio') setActiveTab('portfolio');
        } catch (err: any) {
            error(err.message || "Failed to upload image.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCoverUploading(true);
        try {
            const url = await db.uploadFile(file);
            await db.updateProfile(user.id, { cover_url: url });
            await refreshProfile();
            success("Cover photo updated!");
        } catch (err: any) {
            error("Failed to upload cover.");
        } finally {
            setCoverUploading(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarUploading(true);
        try {
            const url = await db.uploadFile(file);
            await db.updateProfile(user.id, { avatar_url: url });
            await refreshProfile();
            success("Profile picture updated!");
        } catch (err: any) {
            error("Failed to upload avatar.");
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleDeleteSample = async (url: string) => {
        if (!window.confirm("Are you sure you want to delete this sample?")) return;

        try {
            await db.deleteFromPortfolio(user.id, url);
            await refreshProfile();
            success("Sample deleted.");
        } catch (err: any) {
            error("Failed to delete sample.");
        }
    };

    const toggleWriterMode = async () => {
        const newState = !user.is_writer;
        await db.updateProfile(user.id, { is_writer: newState });
        await refreshProfile();
        if (newState) success("You are now Open for Assignments! 🚀");
        else success("You are now in Study Mode.");
    };

    const saveProfile = async () => {
        await db.updateProfile(user.id, { bio: bio, school: school });
        setEditingProfile(false);
        await refreshProfile();
        success("Profile updated!");
    };

    const addTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const currentTags = user.tags || [];
            if (currentTags.length >= 8) {
                error("Max 8 skills allowed.");
                return;
            }
            if (!currentTags.includes(newTag.trim())) {
                const updatedTags = [...currentTags, newTag.trim()];
                await db.updateProfile(user.id, { tags: updatedTags });
                await refreshProfile();
                success(`Skill "${newTag.trim()}" added.`);
            }
            setNewTag('');
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const updatedTags = (user.tags || []).filter((t: string) => t !== tagToRemove);
        await db.updateProfile(user.id, { tags: updatedTags });
        await refreshProfile();
        success("Skill removed.");
    };

    const handleConnectionResponse = async (id: string, action: 'accepted' | 'rejected') => {
        await db.respondToConnectionRequest(id, action);
        setRequests(prev => prev.filter(r => r.id !== id));
        if (action === 'accepted') {
            success("Connection Accepted!");
            const conns = await db.getMyConnections(user.id);
            setConnections(conns);
        } else {
            success("Request Ignored.");
        }
    };

    const handleFinalDelete = async () => {
        if (deleteConfirmInput !== 'DELETE') return;
        try {
            await deleteAccount();
            setShowDeleteModal(false);
        } catch (e: any) {
            if (e.code === 'auth/requires-recent-login') {
                error("Security: Please log out and log in again to delete your account.");
            } else {
                error("Failed to delete account. Please try again.");
            }
        }
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen relative">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            <input type="file" ref={coverInputRef} onChange={handleCoverSelect} className="hidden" accept="image/*" />
            <input type="file" ref={avatarInputRef} onChange={handleAvatarSelect} className="hidden" accept="image/*" />
            <input type="file" ref={idInputRef} onChange={handleIdSelect} className="hidden" accept="image/*" />

            <UPIPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handleAddMoney}
            />

            {/* 1. Cover Banner */}
            <div className="h-48 relative overflow-hidden group">
                {user.cover_url ? (
                    <img src={user.cover_url} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Camera size={14} /> {coverUploading ? 'Uploading...' : 'Edit Cover'}
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* 2. Header Section */}
                <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group mx-auto md:mx-0">
                        <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white relative">
                            <img
                                src={user.avatar_url}
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={avatarUploading}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                            >
                                {avatarUploading ? '...' : <Camera size={24} />}
                            </button>
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-white shadow-sm flex items-center gap-1">
                            <Award size={12} className="text-yellow-400" /> Lvl {level}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold text-slate-900">{user.handle}</h1>
                            {user.is_writer && (
                                <span className="mx-auto md:mx-0 bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Available
                                </span>
                            )}
                            {user.is_verified === 'verified' && (
                                <span className="mx-auto md:mx-0 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <Check size={10} strokeWidth={4} /> Verified Student
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-slate-600 text-sm font-medium flex-wrap">
                            {user.email && (
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Mail size={14} className="text-slate-400" />
                                    {user.email}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-orange-500" />
                                {user.school}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" />
                                <span>Joined 2024</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-2 w-full md:w-auto justify-center">
                        <button
                            onClick={() => { navigator.clipboard.writeText(window.location.href); success("Profile Link Copied!"); }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                        >
                            <Share2 size={16} /> Share
                        </button>
                        <button
                            onClick={() => setEditingProfile(!editingProfile)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                        >
                            <Edit2 size={16} /> {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Stats & Info */}
                    <div className="space-y-6">

                        {/* Writer Mode Toggle */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Briefcase size={18} className="text-orange-600" /> Writer Mode
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Enable to appear in search results and get hired.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={user.is_writer} onChange={toggleWriterMode} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            {user.is_writer && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-700 mb-3">Visibility Settings</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                db.updateProfile(user.id, { visibility: 'global' });
                                                refreshProfile();
                                            }}
                                            className={`p-3 rounded-xl border text-left transition-all ${(!user.visibility || user.visibility === 'global') ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-200'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Globe size={16} className={(!user.visibility || user.visibility === 'global') ? 'text-orange-600' : 'text-slate-400'} />
                                                <span className={`text-xs font-bold ${(!user.visibility || user.visibility === 'global') ? 'text-orange-700' : 'text-slate-600'}`}>Global</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight">Visible to everyone in the main feed.</p>
                                        </button>

                                        <button
                                            onClick={() => {
                                                db.updateProfile(user.id, { visibility: 'college' });
                                                refreshProfile();
                                            }}
                                            className={`p-3 rounded-xl border text-left transition-all ${user.visibility === 'college' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-200'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Lock size={16} className={user.visibility === 'college' ? 'text-orange-600' : 'text-slate-400'} />
                                                <span className={`text-xs font-bold ${user.visibility === 'college' ? 'text-orange-700' : 'text-slate-600'}`}>College Only</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight">Only visible to {user.school || 'your college'} peers.</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Gamified Stats */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Student Stats</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Award size={18} /></div>
                                        <span className="text-sm font-medium text-slate-600">Total XP</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{user.xp.toLocaleString()}</span>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Briefcase size={18} /></div>
                                        <span className="text-sm font-medium text-slate-600">Projects</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{projectsCompleted}</span>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={18} /></div>
                                        <span className="text-sm font-medium text-slate-600">Rating</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{rating}/5.0</span>
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50 mt-1">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-bold text-orange-700">Wallet Balance</span>
                                    <span className="text-xl font-bold text-slate-900">₹{user.balance.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="w-full bg-orange-200 h-1.5 rounded-full overflow-hidden mb-3">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Zap size={14} className="fill-white" /> Add Money
                                </button>
                            </div>
                        </div>

                        {/* Verification Box */}
                        {!user.is_verified && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">Get Verified Badge</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Upload your College ID Card to get the <span className="text-blue-600 font-bold">Blue Tick</span>. Verified students get 3x more assignments.
                                        </p>
                                        {user.is_verified === 'pending' ? (
                                            <div className="mt-3 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-2 rounded-lg border border-yellow-100 text-center">
                                                Verification Pending...
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => idInputRef.current?.click()}
                                                disabled={idUploading}
                                                className="mt-3 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                {idUploading ? 'Uploading...' : 'Upload ID Card'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* About / Bio */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 text-sm mb-3">About Me</h3>
                            {editingProfile ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500 min-h-[100px] resize-none mt-1"
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
                                            inputClassName="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <button onClick={() => setEditingProfile(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                        <button onClick={saveProfile} className="px-3 py-1.5 text-xs font-bold bg-orange-600 text-white rounded-lg hover:bg-orange-700">Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {user.bio || "No bio added yet."}
                                </p>
                            )}

                            <div className="mt-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills & Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(user.tags || []).map((tag: string) => (
                                        <span key={tag} className="bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-2 group">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={12} /></button>
                                        </span>
                                    ))}
                                    {(user.tags?.length || 0) < 8 && (
                                        <input
                                            className="bg-transparent border border-dashed border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500 text-slate-500 focus:text-orange-600 w-24 text-center font-medium placeholder-slate-400"
                                            placeholder="+ Add Skill"
                                            value={newTag}
                                            onChange={e => setNewTag(e.target.value)}
                                            onKeyDown={addTag}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Tabs & Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar">
                            {['portfolio', 'reviews', 'network'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-bold capitalize transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab
                                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
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
                            ))}
                        </div>

                        <AnimatePresence mode='wait'>
                            {/* PORTFOLIO TAB */}
                            {activeTab === 'portfolio' && (
                                <MotionDiv
                                    key="portfolio"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h3 className="font-bold text-lg text-slate-800">My Work Samples</h3>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="text-xs bg-slate-900 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                                        >
                                            {uploading ? "Uploading..." : <><Upload size={14} /> Add New</>}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {(user.portfolio || []).map((url: string, i: number) => (
                                            <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
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
                                            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Camera className="text-slate-400" size={24} />
                                                </div>
                                                <p className="font-bold text-slate-700">No samples yet</p>
                                                <p className="text-xs text-slate-500 mt-1">Upload photos of your notes or assignments</p>
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
                                        <h3 className="font-bold text-lg text-slate-800">Peer Reviews</h3>
                                        <div className="text-sm font-bold text-slate-600 flex items-center gap-1">
                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                            4.9 <span className="text-slate-400 font-normal">(12 reviews)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[1, 2, 3].map((r) => (
                                            <div key={r} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                                                            AK
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-slate-900">Arjun K.</h4>
                                                            <p className="text-[10px] text-slate-500">2 days ago</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    "Super fast delivery and the handwriting was extremely neat. Helped me submit my record on time! Will definitely hire again."
                                                </p>
                                                <div className="mt-3 flex gap-2">
                                                    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded border border-slate-100">Physics Record</span>
                                                </div>
                                            </div>
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
                                            <h3 className="font-bold text-lg text-slate-800 mb-4 px-1 flex items-center gap-2">
                                                Requests <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {requests.map(req => (
                                                    <div key={req.id} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4">
                                                        <img
                                                            src={req.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester_id}`}
                                                            className="w-12 h-12 rounded-full bg-slate-100"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 truncate">{req.requester?.handle}</h4>
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
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* My Connections */}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-4 px-1">My Connections</h3>
                                        {connections.length === 0 ? (
                                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                                <Users className="mx-auto text-slate-300 mb-3" size={32} />
                                                <p className="text-slate-500 text-sm font-medium">You haven't connected with anyone yet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {connections.map(conn => (
                                                    <div key={conn.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-200 transition-colors text-center">
                                                        <img
                                                            src={conn.avatar_url}
                                                            className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-3 object-cover"
                                                        />
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">{conn.handle}</h4>
                                                        <p className="text-xs text-slate-500 truncate mb-3">{conn.school}</p>
                                                        <button className="w-full bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold py-2 rounded-lg transition-colors">
                                                            View Profile
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </MotionDiv>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Delete Account</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Permanently remove your profile, wallet balance, and chat history. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowDeleteModal(true); setDeleteConfirmInput(''); }}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>

            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-200">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Account?</h3>
                            <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
                                This will permanently delete your profile, <b>{user.handle}</b>, and all associated data. You cannot recover your account.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type "DELETE" to confirm</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-center font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all uppercase placeholder-slate-300"
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
                                    className="w-full text-slate-500 hover:text-slate-800 font-bold py-2 text-sm"
                                >
                                    Cancel, keep my account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};