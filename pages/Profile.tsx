import React, { useState, useRef, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import {
    Camera, Edit2, X, Trash2, AlertTriangle, Check, Shield, Globe, Lock, Upload, Star,
    Grid, Users, MapPin, Mail, Calendar, Award, Briefcase, Clock, Zap, MessageSquare,
    Link as LinkIcon, Plus, ChevronRight, MoreHorizontal, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';

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
    const portfolioInputRef = useRef<HTMLInputElement>(null);

    const level = Math.floor((user.xp || 0) / 100) + 1;
    const rating = user.rating || 5.0;
    const projectsCompleted = user.projects_completed || 0;

    // Load connections and requests on mount
    useEffect(() => {
        const loadNetwork = async () => {
            if (user?.id) {
                const reqs = await db.getIncomingRequests(user.id);
                setRequests(reqs);
                const conns = await db.getMyConnections(user.id);
                setConnections(conns);
            }
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const url = await db.uploadFile(e.target.files[0]);
                await db.updateProfile(user.id, { avatar_url: url });
                await refreshProfile();
                success("Avatar updated");
            } catch (e) {
                error("Failed to upload avatar");
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
        <div className="w-full min-h-screen bg-background font-sans text-text-main pb-20">
            {/* Header Removed as per request (Duplicate) */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Sidebar: Identity & Status */}
                    <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-soft border border-border-light flex flex-col items-center text-center relative overflow-hidden group">
                            {/* Verification Banner */}
                            {user.is_verified === 'verified' && (
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                            )}

                            <div className="relative mb-4 mt-2 group-hover:scale-105 transition-transform duration-300">
                                <div
                                    className="size-32 rounded-full bg-cover bg-center border-4 border-white shadow-lg"
                                    style={{ backgroundImage: `url('${user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}')` }}
                                ></div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <Camera size={16} className="text-secondary" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                                {user.is_verified === 'verified' && (
                                    <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm" title="Verified Student">
                                        <span className="material-symbols-outlined text-blue-500 text-[24px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-text-main font-display">{user.full_name}</h1>
                            <p className="text-primary font-bold text-sm mb-1">@{user.handle}</p>
                            <p className="text-secondary text-sm font-medium flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-base">school</span>
                                {user.school || 'University Student'}
                            </p>

                            {/* XP Level Bar */}
                            <div className="w-full mt-6 mb-4 px-2">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-primary uppercase tracking-wider flex items-center gap-1">
                                        <Zap size={12} className="fill-current" />
                                        Level {level}
                                    </span>
                                    <span className="text-secondary">{user.xp || 0} XP</span>
                                </div>
                                <div className="w-full bg-orange-50 rounded-full h-2 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-400 to-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((user.xp % 100), 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-secondary/70 mt-1.5 text-right">{100 - (user.xp % 100)} XP to next level</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button
                                    onClick={() => setEditingProfile(!editingProfile)}
                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 text-primary font-bold text-sm hover:bg-orange-100 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 text-secondary font-bold text-sm hover:bg-gray-100 transition-colors">
                                    <LinkIcon size={16} />
                                    Share
                                </button>
                            </div>

                            {/* Availability Status */}
                            <div className="mt-6 pt-6 border-t border-border-light w-full flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`size-2.5 rounded-full ${user.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm font-medium text-secondary">
                                        {user.is_online ? 'Available Now' : 'Offline'}
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={user.is_online} className="sr-only peer" readOnly />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Trust & Verification */}
                        <div className="bg-white rounded-3xl p-6 shadow-soft border border-border-light">
                            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-primary" />
                                Trust Score
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-1.5 rounded-full">
                                            <Mail size={16} className="text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-green-900">Email Verified</span>
                                    </div>
                                    <Check size={16} className="text-green-600" />
                                </div>

                                <div className={`flex items-center justify-between p-3 rounded-xl border ${user.is_verified === 'verified' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${user.is_verified === 'verified' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                            <Shield size={16} className={`${user.is_verified === 'verified' ? 'text-blue-600' : 'text-gray-500'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${user.is_verified === 'verified' ? 'text-blue-900' : 'text-gray-500'}`}>
                                            {user.is_verified === 'verified' ? 'ID Verified' : 'ID Not Verified'}
                                        </span>
                                    </div>
                                    {user.is_verified === 'verified' ? (
                                        <Check size={16} className="text-blue-600" />
                                    ) : (
                                        <button
                                            onClick={() => idInputRef.current?.click()}
                                            className="text-xs font-bold text-primary hover:underline"
                                            disabled={idUploading}
                                        >
                                            {idUploading ? '...' : 'Verify'}
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={idInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleIdSelect}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone (Collapsed) */}
                        <div className="text-center">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </aside>

                    {/* Right Column: Stats & Content */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Earned', value: `₹${user.total_earned || 0}`, icon: 'payments', color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Assignments', value: projectsCompleted, icon: 'assignment', color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Rating', value: rating.toFixed(1), icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                { label: 'On-Time Rate', value: `${user.on_time_rate || 100}%`, icon: 'schedule', color: 'text-purple-600', bg: 'bg-purple-50' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-border-light flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                                    <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                                        <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-text-main font-display">{stat.value}</span>
                                    <span className="text-xs font-medium text-secondary uppercase tracking-wide mt-1">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-border-light inline-flex w-full md:w-auto overflow-x-auto">
                            {['portfolio', 'about', 'reviews', 'network'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${activeTab === tab
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-secondary hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'portfolio' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold font-display">Featured Projects</h2>
                                            <button
                                                onClick={() => portfolioInputRef.current?.click()}
                                                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add New
                                            </button>
                                            <input
                                                type="file"
                                                ref={portfolioInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handlePortfolioUpload}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Add New Card */}
                                            <button
                                                onClick={() => portfolioInputRef.current?.click()}
                                                className="group aspect-[4/3] rounded-2xl border-2 border-dashed border-border-light hover:border-primary/50 hover:bg-orange-50/50 transition-all flex flex-col items-center justify-center gap-3"
                                            >
                                                <div className="p-4 rounded-full bg-orange-100 group-hover:scale-110 transition-transform">
                                                    <Upload size={24} className="text-primary" />
                                                </div>
                                                <span className="font-bold text-secondary group-hover:text-primary transition-colors">Upload Project</span>
                                            </button>

                                            {/* Portfolio Items */}
                                            {user.portfolio?.map((item: any, i: number) => (
                                                <div key={i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all">
                                                    <img src={item} alt="Portfolio" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                        <button
                                                            onClick={() => handleDeleteSample(item)}
                                                            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <p className="text-white font-bold">Project Sample #{i + 1}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'about' && (
                                    <div className="bg-white rounded-3xl p-8 shadow-soft border border-border-light space-y-8">
                                        {editingProfile ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-secondary mb-1">Full Name</label>
                                                    <GlassInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-secondary mb-1">Bio</label>
                                                    <textarea
                                                        className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-32"
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-secondary mb-1">School / University</label>
                                                    <CollegeAutocomplete value={school} onChange={setSchool} />
                                                </div>
                                                <div className="flex gap-3 pt-4">
                                                    <GlassButton onClick={saveProfile} variant="primary">Save Changes</GlassButton>
                                                    <GlassButton onClick={() => setEditingProfile(false)} variant="secondary">Cancel</GlassButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">person</span>
                                                        About Me
                                                    </h3>
                                                    <p className="text-secondary leading-relaxed">
                                                        {user.bio || "No bio added yet. Click 'Edit' to tell others about yourself!"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">school</span>
                                                        Education
                                                    </h3>
                                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-background-light">
                                                        <div className="p-3 bg-white rounded-xl shadow-sm">
                                                            <span className="material-symbols-outlined text-primary">school</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-text-main">{user.school || 'University Name'}</h4>
                                                            <p className="text-sm text-secondary">Student • Computer Science</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">label</span>
                                                        Skills & Tags
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.tags?.map((tag: string) => (
                                                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-orange-50 text-primary text-sm font-medium border border-orange-100 flex items-center gap-1 group">
                                                                {tag}
                                                                <button onClick={() => removeTag(tag)} className="hover:text-red-500 hidden group-hover:block">
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <div className="relative flex items-center">
                                                            <Plus size={16} className="absolute left-2 text-secondary" />
                                                            <input
                                                                type="text"
                                                                value={newTag}
                                                                onChange={(e) => setNewTag(e.target.value)}
                                                                onKeyDown={addTag}
                                                                placeholder="Add skill..."
                                                                className="pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-primary/20 w-32 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-3xl p-8 shadow-soft border border-border-light text-center py-12">
                                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Star size={32} className="text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold font-display mb-2">No Reviews Yet</h3>
                                            <p className="text-secondary max-w-md mx-auto">
                                                Complete assignments and get rated by other students to build your reputation!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'network' && (
                                    <div className="space-y-6">
                                        {/* Connection Requests */}
                                        {requests.length > 0 && (
                                            <div className="bg-white rounded-3xl p-6 shadow-soft border border-border-light">
                                                <h3 className="font-bold font-display mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                    Pending Requests
                                                </h3>
                                                <div className="space-y-3">
                                                    {requests.map((req) => (
                                                        <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-background-light">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${req.fromUser?.avatar_url}')` }}></div>
                                                                <div>
                                                                    <p className="font-bold text-sm">{req.fromUser?.full_name}</p>
                                                                    <p className="text-xs text-secondary">@{req.fromUser?.handle}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleConnectionResponse(req.id, 'accepted')} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check size={16} /></button>
                                                                <button onClick={() => handleConnectionResponse(req.id, 'rejected')} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><X size={16} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Connections List */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {connections.length > 0 ? connections.map((conn) => {
                                                const otherUser = conn.participants.find((p: any) => p.id !== user.id);
                                                return (
                                                    <div key={conn.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border-light flex items-center gap-4">
                                                        <div className="size-12 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${otherUser?.avatar_url}')` }}></div>
                                                        <div>
                                                            <p className="font-bold text-text-main">{otherUser?.full_name}</p>
                                                            <p className="text-xs text-secondary">@{otherUser?.handle}</p>
                                                        </div>
                                                        <button className="ml-auto p-2 rounded-full hover:bg-gray-100 text-secondary">
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="col-span-full text-center py-12 text-secondary">
                                                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                                                    <p>No connections yet. Start networking!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-red-100"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2">Delete Account?</h2>
                            <p className="text-secondary text-center mb-6">
                                This action is irreversible. All your data, including XP and portfolio items, will be permanently lost.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                        Type "DELETE" to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmInput}
                                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-background border border-border focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none font-bold text-center"
                                        placeholder="DELETE"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="py-3 rounded-xl font-bold text-secondary hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFinalDelete}
                                        disabled={deleteConfirmInput !== 'DELETE'}
                                        className="py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-500/30"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};