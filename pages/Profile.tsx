import React, { useState, useRef } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Camera, Edit2, X, Trash2, AlertTriangle, Check, Shield, Globe, Lock, Upload, Star, Grid, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
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
    const [connections, setConnections] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [newTag, setNewTag] = useState('');
    const [uploading, setUploading] = useState(false);
    const [idUploading, setIdUploading] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    // Form State
    const [bio, setBio] = useState(user.bio || '');
    const [school, setSchool] = useState(user.school || '');
    const [fullName, setFullName] = useState(user.full_name || '');
    const [visibility, setVisibility] = useState(user.visibility || 'global');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);

    const level = Math.floor((user.xp || 0) / 100) + 1;
    const rating = user.rating || 5.0;
    const projectsCompleted = user.projects_completed || 0;

    // Load connections and requests on mount
    React.useEffect(() => {
        const loadNetwork = async () => {
            const reqs = await db.getIncomingRequests(user.id);
            setRequests(reqs);
            const conns = await db.getMyConnections(user.id);
            setConnections(conns);
        };
        loadNetwork();
    }, [user.id]);

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
        success('Connection ' + status);
    };

    const saveProfile = async () => {
        try {
            await db.updateProfile(user.id, {
                bio,
                school,
                visibility,
                full_name: fullName
            });
            setEditingProfile(false);
            await refreshProfile();
            success("Profile updated!");
        } catch (e) {
            error("Failed to update profile");
        }
    };

    const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIdUploading(true);
            try {
                const url = await db.uploadFile(e.target.files[0]);
                await db.updateProfile(user.id, { is_verified: 'pending', id_card_url: url });
                await refreshProfile();
                success("ID uploaded for verification");
            } catch (e) {
                error("Failed to upload ID");
            } finally {
                setIdUploading(false);
            }
        }
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const url = await db.uploadFile(e.target.files[0]);
                await db.addToPortfolio(user.id, url);
                await refreshProfile();
                success("Portfolio item added");
            } catch (e) {
                error("Failed to upload portfolio item");
            } finally {
                setUploading(false);
            }
        }
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
        <div className="w-full px-4 lg:px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar: Identity Card (Sticky) */}
                <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 shadow-soft border border-border-light dark:border-border-dark flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Verification Banner */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="relative mb-4 mt-2">
                            <div
                                className="size-32 rounded-full bg-cover bg-center border-4 border-background-light dark:border-background-dark shadow-md"
                                style={{ backgroundImage: `url('${user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}')` }}
                            ></div>
                            {/* Blue Tick */}
                            {user.is_verified === 'verified' && (
                                <div className="absolute bottom-1 right-1 bg-white dark:bg-card-dark rounded-full p-1 shadow-sm" title="Identity Verified">
                                    <span className="material-symbols-outlined text-blue-500 fill-current text-[28px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-text-main dark:text-white">{user.full_name}</h1>
                        <p className="text-primary font-bold text-sm">@{user.handle}</p>
                        <p className="text-secondary dark:text-gray-400 text-sm font-medium mt-1">{user.school || 'University Student'}</p>

                        <div className="flex items-center gap-1 mt-2 text-xs text-secondary/80 dark:text-gray-500">
                            <span className="material-symbols-outlined text-sm">mail</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-secondary/80 dark:text-gray-500">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span>{user.school || 'New Delhi, India (Hyper-local)'}</span>
                        </div>

                        {/* XP Level Bar */}
                        <div className="w-full mt-6 mb-2">
                            <div className="flex justify-between text-xs font-bold mb-1.5 px-1">
                                <span className="text-primary uppercase tracking-wider">Level {level} Scribe</span>
                                <span className="text-secondary">{user.xp || 0} XP</span>
                            </div>
                            <div className="w-full bg-[#f3ede7] dark:bg-border-dark rounded-full h-2.5 overflow-hidden">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min((user.xp % 100), 100)}% ` }}></div>
                            </div>
                            <p className="text-[10px] text-secondary mt-1 text-right">{100 - (user.xp % 100)} XP to Level {level + 1}</p>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
                            {user.is_verified === 'verified' && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                    <span className="material-symbols-outlined text-sm">badge</span>
                                    College ID Verified
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                                <span className="material-symbols-outlined text-sm">shield</span>
                                Payment Verified
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                onClick={() => setEditingProfile(!editingProfile)}
                                className="col-span-2 flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm shadow-primary/30"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                                {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full bg-[#f3ede7] dark:bg-border-dark hover:bg-border-light dark:hover:bg-gray-700 text-text-main dark:text-white font-bold py-2.5 px-4 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-xl">share</span>
                                Share
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full bg-[#f3ede7] dark:bg-border-dark hover:bg-border-light dark:hover:bg-gray-700 text-text-main dark:text-white font-bold py-2.5 px-4 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                                Public
                            </button>
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-light dark:border-border-dark">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">Availability</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-main dark:text-gray-300">Status</span>
                                <span className={`flex items-center gap-1.5 ${user.is_online ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-slate-500 bg-slate-100'} font-bold px-2 py-0.5 rounded-md`}>
                                    <span className={`size-2 rounded-full ${user.is_online ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                    {user.is_online ? 'Online Now' : 'Offline'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-main dark:text-gray-300">Response Time</span>
                                <span className="font-bold text-text-main dark:text-white">~ {user.response_time || 60} mins</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-main dark:text-gray-300">Languages</span>
                                <span className="font-bold text-text-main dark:text-white">{(user.languages || ['English']).join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Verification Upload (If pending or not verified) */}
                    {user.is_verified !== 'verified' && (
                        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-border-light dark:border-border-dark">
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
                            <input type="file" ref={idInputRef} onChange={handleIdSelect} className="hidden" accept="image/*" />
                        </div>
                    )}
                </aside>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-secondary text-xs font-semibold uppercase mb-1">Total Earned</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-text-main dark:text-white">₹{(user.total_earned || 0).toLocaleString()}</span>
                                <span className="text-green-500 text-xs font-bold flex items-center"><span className="material-symbols-outlined text-[10px]">arrow_upward</span> 12%</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-secondary text-xs font-semibold uppercase mb-1">Assignments</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-text-main dark:text-white">{projectsCompleted}</span>
                                <span className="text-secondary text-xs">completed</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-secondary text-xs font-semibold uppercase mb-1">Rating</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-text-main dark:text-white">{rating}</span>
                                <span className="material-symbols-outlined text-yellow-400 text-xl filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                        </div>
                        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-secondary text-xs font-semibold uppercase mb-1">On-Time</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-text-main dark:text-white">{user.on_time_rate || 100}%</span>
                                <span className="text-secondary text-xs">rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border-light dark:border-border-dark">
                        <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto no-scrollbar">
                            {['portfolio', 'about', 'reviews', 'network'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`border-b-2 font-medium text-sm py-3 whitespace-nowrap px-1 transition-colors capitalize ${activeTab === tab
                                        ? 'border-primary text-primary font-bold'
                                        : 'border-transparent text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white'
                                        }`}
                                >
                                    {tab} {tab === 'portfolio' && `(${user.portfolio?.length || 0})`} {tab === 'network' && requests.length > 0 && `(${requests.length})`}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-8 animate-fade-in">
                        <AnimatePresence mode='wait'>
                            {/* PORTFOLIO TAB */}
                            {activeTab === 'portfolio' && (
                                <MotionDiv
                                    key="portfolio"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold dark:text-white">Featured Work</h3>
                                        <input type="file" ref={fileInputRef} onChange={handlePortfolioUpload} className="hidden" accept="image/*" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {(user.portfolio || []).map((url: string, i: number) => (
                                            <div key={i} className="group cursor-pointer relative">
                                                <div className="relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark shadow-sm bg-card-light dark:bg-card-dark aspect-[4/3]">
                                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${url})` }}></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                                                    <div className="absolute bottom-3 left-4 right-4">
                                                        <h4 className="text-white font-bold text-sm line-clamp-1">Portfolio Item {i + 1}</h4>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteSample(url); }}
                                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Add New Item */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light dark:border-border-dark bg-[#fcfaf8] dark:bg-background-dark aspect-[4/3] hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                        >
                                            <div className="size-10 rounded-full bg-white dark:bg-card-dark shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                {uploading ? <span className="animate-spin material-symbols-outlined text-primary">progress_activity</span> : <span className="material-symbols-outlined text-primary">add</span>}
                                            </div>
                                            <span className="text-xs font-bold text-secondary dark:text-gray-400">{uploading ? 'Uploading...' : 'Add Project'}</span>
                                        </div>
                                    </div>
                                </MotionDiv>
                            )}

                            {/* ABOUT TAB */}
                            {activeTab === 'about' && (
                                <MotionDiv
                                    key="about"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                                        <h3 className="text-lg font-bold mb-3 dark:text-white">My Expertise</h3>
                                        {editingProfile ? (
                                            <div className="space-y-4">
                                                <div className="mb-2">
                                                    <label className="text-xs text-secondary font-bold mb-1 block">Full Name</label>
                                                    <input
                                                        className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary text-slate-900 dark:text-white"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        placeholder="Your Full Name"
                                                    />
                                                </div>
                                                <div className="mb-2">
                                                    <label className="text-xs text-secondary font-bold mb-1 block">Bio</label>
                                                    <textarea
                                                        className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary min-h-[100px] resize-none text-slate-900 dark:text-white"
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        placeholder="Tell your peers about your skills..."
                                                    />
                                                </div>
                                                <div className="mb-2">
                                                    <label className="text-xs text-secondary font-bold mb-1 block">College / University</label>
                                                    <CollegeAutocomplete
                                                        value={school}
                                                        onChange={setSchool}
                                                        className="mt-1"
                                                        inputClassName="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex gap-2 justify-end mt-4">
                                                    <button onClick={saveProfile} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Save Changes</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-secondary dark:text-gray-300 leading-relaxed text-sm mb-4">
                                                {user.bio || "No bio added yet. Click 'Edit Profile' to add one."}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {(user.tags || []).map((tag: string) => (
                                                <span key={tag} className="px-3 py-1 bg-[#f3ede7] dark:bg-border-dark text-text-main dark:text-gray-200 rounded-full text-xs font-medium border border-transparent flex items-center gap-1">
                                                    {tag}
                                                    {editingProfile && <button onClick={() => removeTag(tag)}><X size={12} /></button>}
                                                </span>
                                            ))}
                                            {editingProfile && (
                                                <input
                                                    className="bg-transparent border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs outline-none focus:border-primary w-24"
                                                    placeholder="+ Add Skill"
                                                    value={newTag}
                                                    onChange={e => setNewTag(e.target.value)}
                                                    onKeyDown={addTag}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </MotionDiv>
                            )}

                            {/* REVIEWS TAB */}
                            {activeTab === 'reviews' && (
                                <MotionDiv
                                    key="reviews"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="flex justify-between items-center mb-4 mt-8">
                                        <h3 className="text-lg font-bold dark:text-white">Recent Reviews</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Placeholder Reviews */}
                                        <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">AK</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-main dark:text-white">Anjali K.</p>
                                                        <p className="text-xs text-secondary">Student</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400 text-sm">
                                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-base filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-main dark:text-gray-300 leading-relaxed">"Great work! Saved my semester."</p>
                                        </div>
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
                                                    <div key={req.id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center gap-4">
                                                        <img
                                                            src={req.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester_id}`}
                                                            className="w-12 h-12 rounded-full bg-slate-100"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-900 dark:text-white truncate">{req.requester?.handle}</h4>
                                                            <div className="flex gap-2 mt-2">
                                                                <button onClick={() => handleConnectionResponse(req.id, 'accepted')} className="flex-1 bg-slate-900 text-white text-xs font-bold py-1.5 rounded-lg">Accept</button>
                                                                <button onClick={() => handleConnectionResponse(req.id, 'rejected')} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-1.5 rounded-lg">Ignore</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Connections */}
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-1">My Connections</h3>
                                    {connections.length === 0 ? (
                                        <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
                                            <Users className="mx-auto text-slate-300 mb-3" size={32} />
                                            <p className="text-slate-500 text-sm font-medium">No connections yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {connections.map(conn => (
                                                <div key={conn.id} className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm text-center">
                                                    <img src={conn.avatar_url} className="w-16 h-16 rounded-full bg-slate-100 mx-auto mb-3 object-cover" />
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{conn.handle}</h4>
                                                    <p className="text-xs text-slate-500 truncate mb-3">{conn.school}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 col-span-full">
                    <h3 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Danger Zone</h3>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Delete Account</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Permanently remove your profile and chat history.</p>
                        </div>
                        <button onClick={() => { setShowDeleteModal(true); setDeleteConfirmInput(''); }} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-600 hover:text-white transition-colors">Delete Account</button>
                    </div>
                </div>

                {/* Delete Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <div className="max-w-sm w-full p-6 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-200">
                                    <AlertTriangle className="text-red-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Delete Account?</h3>
                                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">Type "DELETE" to confirm.</p>
                                <input className="w-full border border-slate-300 rounded-xl px-4 py-3 text-center font-bold mb-4" placeholder="DELETE" value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value.toUpperCase())} />
                                <button disabled={deleteConfirmInput !== 'DELETE'} onClick={handleFinalDelete} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl mb-2">Permanently Delete</button>
                                <button onClick={() => setShowDeleteModal(false)} className="w-full text-slate-500 font-bold py-2 text-sm">Cancel</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};