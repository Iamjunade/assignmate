import React, { useState, useRef, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import {
    Camera, Edit2, X, Trash2, AlertTriangle, Check, Shield, Globe, Lock, Upload, Star,
    Grid, Users, MapPin, Mail, Calendar, Award, Briefcase, Clock, Zap, MessageSquare,
    Link as LinkIcon, Plus, ChevronRight, MoreHorizontal, Settings, UserPlus, UserCheck, Loader2, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Avatar } from '../components/ui/Avatar';

export const Profile = ({ user: currentUser }: { user: any }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { refreshProfile, deleteAccount } = useAuth();
    const { success, error } = useToast();

    // 1. Determine if we are viewing our own profile
    const isOwnProfile = !userId || (currentUser && userId === currentUser.id);

    // 2. State for the profile we are VIEWING
    const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
    const [loadingProfile, setLoadingProfile] = useState(!isOwnProfile);

    // Existing state variables
    const [activeTab, setActiveTab] = useState('portfolio');
    const [connections, setConnections] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'connected'>('none');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [newTag, setNewTag] = useState('');
    const [uploading, setUploading] = useState(false);
    const [idUploading, setIdUploading] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    // Form State
    const [bio, setBio] = useState('');
    const [school, setSchool] = useState('');
    const [fullName, setFullName] = useState('');

    const [visibility, setVisibility] = useState('global');
    const [isWriter, setIsWriter] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const idInputRef = useRef<HTMLInputElement>(null);
    const portfolioInputRef = useRef<HTMLInputElement>(null);

    // 3. Effect: Fetch data if we are viewing someone else
    useEffect(() => {
        if (isOwnProfile) {
            setProfileUser(currentUser);
            setLoadingProfile(false);
        } else {
            setLoadingProfile(true);
            // Fetch public profile of the other user
            db.getUserProfile(userId).then(data => {
                if (data) {
                    setProfileUser(data);
                    // Check connection status
                    if (currentUser) {
                        db.getConnectionStatus(currentUser.id, userId).then(status => {
                            setConnectionStatus(status as any);
                        });
                    }
                } else {
                    error("User not found");
                    navigate('/writers');
                }
                setLoadingProfile(false);
            }).catch(() => {
                setLoadingProfile(false);
            });
        }
    }, [userId, currentUser, isOwnProfile, navigate, error]);

    // Update state when profileUser changes
    useEffect(() => {
        if (profileUser) {
            setBio(profileUser.bio || '');
            setSchool(profileUser.school || '');
            setFullName(profileUser.full_name || '');
            setVisibility(profileUser.visibility || 'global');
            setIsWriter(profileUser.is_writer || false);
        }
    }, [profileUser]);

    // Load connections and requests
    useEffect(() => {
        const loadNetwork = async () => {
            if (profileUser?.id) {
                // Only load requests if it's own profile
                if (isOwnProfile) {
                    const reqs = await db.getIncomingRequests(profileUser.id);
                    setRequests(reqs);
                }
                const conns = await db.getMyConnections(profileUser.id);
                setConnections(conns);
            }
        };
        loadNetwork();
    }, [profileUser?.id, isOwnProfile]);

    const addTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const updatedTags = [...(profileUser.tags || []), newTag.trim()];
            await db.updateProfile(profileUser.id, { tags: updatedTags });
            setNewTag('');
            if (isOwnProfile) await refreshProfile();
            else setProfileUser({ ...profileUser, tags: updatedTags });
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const updatedTags = (profileUser.tags || []).filter((t: string) => t !== tagToRemove);
        await db.updateProfile(profileUser.id, { tags: updatedTags });
        if (isOwnProfile) await refreshProfile();
        else setProfileUser({ ...profileUser, tags: updatedTags });
    };

    const handleDeleteSample = async (url: string) => {
        await db.deleteFromPortfolio(profileUser.id, url);
        if (isOwnProfile) await refreshProfile();
        // Update local state
        const updatedPortfolio = profileUser.portfolio.filter((p: string) => p !== url);
        setProfileUser({ ...profileUser, portfolio: updatedPortfolio });
        success("Sample removed");
    };

    const handleConnectionResponse = async (id: string, status: 'accepted' | 'rejected') => {
        await db.respondToConnectionRequest(id, status);
        const reqs = await db.getIncomingRequests(profileUser.id);
        setRequests(reqs);
        const conns = await db.getMyConnections(profileUser.id);
        setConnections(conns);
        success('Connection ' + status);
    };

    const handleConnect = async () => {
        if (!currentUser || !profileUser) return;
        try {
            await db.sendConnectionRequest(currentUser.id, profileUser.id);
            setConnectionStatus('pending_sent');
            success("Connection request sent");
        } catch (e) {
            error("Failed to send request");
        }
    };

    const handleMessage = async () => {
        if (!currentUser || !profileUser) return;
        try {
            const existingChatId = await db.findExistingChat(currentUser.id, profileUser.id);
            if (existingChatId) {
                navigate(`/chats/${existingChatId}`);
            } else {
                const chat = await db.createChat(null, currentUser.id, profileUser.id);
                navigate(`/chats/${chat.id}`);
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const saveProfile = async () => {
        try {
            await db.updateProfile(profileUser.id, {
                bio,
                school,
                visibility,
                full_name: fullName,
                is_writer: isWriter
            });
            setEditingProfile(false);
            if (isOwnProfile) await refreshProfile();
            success("Profile updated!");
        } catch (e) {
            error("Failed to update profile");
        }
    };

    const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIdUploading(true);
            try {
                const path = `verification/${profileUser.id}/${Date.now()}_${e.target.files[0].name}`;
                const url = await db.uploadFile(e.target.files[0], path);
                await db.updateProfile(profileUser.id, { is_verified: 'pending', id_card_url: url });
                if (isOwnProfile) await refreshProfile();
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
                const path = `portfolio/${profileUser.id}/${Date.now()}_${e.target.files[0].name}`;
                const url = await db.uploadFile(e.target.files[0], path);
                await db.addToPortfolio(profileUser.id, url);
                if (isOwnProfile) await refreshProfile();
                // Update local state
                const updatedPortfolio = [...(profileUser.portfolio || []), url];
                setProfileUser({ ...profileUser, portfolio: updatedPortfolio });
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
                const path = `avatars/${profileUser.id}/${Date.now()}_${e.target.files[0].name}`;
                const url = await db.uploadFile(e.target.files[0], path);
                await db.updateProfile(profileUser.id, { avatar_url: url });
                if (isOwnProfile) await refreshProfile();
                setProfileUser({ ...profileUser, avatar_url: url });
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

    // 4. Loading State
    if (loadingProfile || !profileUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    const level = Math.floor((profileUser.xp || 0) / 100) + 1;
    const rating = profileUser.rating || 5.0;
    const projectsCompleted = profileUser.projects_completed || 0;

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={currentUser} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Left Sidebar: Identity & Status */}
                            <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4 space-y-6">

                                {/* Profile Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-soft border border-border-light flex flex-col items-center text-center relative overflow-hidden group">
                                    {/* Verification Banner */}
                                    {profileUser.is_verified === 'verified' && (
                                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                    )}

                                    <div className="relative mb-4 mt-2 group-hover:scale-105 transition-transform duration-300">
                                        <Avatar
                                            src={profileUser.avatar_url}
                                            alt={profileUser.full_name}
                                            className="size-32 rounded-full border-4 border-white shadow-lg"
                                            fallback={profileUser.full_name?.charAt(0)}
                                        />
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <Camera size={16} className="text-secondary" />
                                            </button>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                        {profileUser.is_verified === 'verified' && (
                                            <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm" title="Verified Student">
                                                <span className="material-symbols-outlined text-blue-500 text-[24px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="text-2xl font-bold text-text-main font-display">{profileUser.full_name}</h1>
                                    <p className="text-primary font-bold text-sm mb-1">@{profileUser.handle}</p>
                                    <p className="text-secondary text-sm font-medium flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-base">school</span>
                                        {profileUser.school || 'University Student'}
                                    </p>

                                    {/* XP Level Bar */}
                                    <div className="w-full mt-6 mb-4 px-2">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-primary uppercase tracking-wider flex items-center gap-1">
                                                <Zap size={12} className="fill-current" />
                                                Level {level}
                                            </span>
                                            <span className="text-secondary">{profileUser.xp || 0} XP</span>
                                        </div>
                                        <div className="w-full bg-orange-50 rounded-full h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-orange-400 to-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((profileUser.xp % 100), 100)}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-secondary/70 mt-1.5 text-right">{100 - (profileUser.xp % 100)} XP to next level</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                        {isOwnProfile ? (
                                            <button
                                                onClick={() => setEditingProfile(!editingProfile)}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-50 text-primary font-bold text-sm hover:bg-orange-100 transition-colors"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                        ) : connectionStatus === 'connected' ? (
                                            <button
                                                onClick={async () => {
                                                    const chatId = await db.findExistingChat(currentUser.id, profileUser.id);
                                                    if (chatId) navigate(`/chats/${chatId}`);
                                                    else {
                                                        const newChat = await db.createChat(null, currentUser.id, profileUser.id);
                                                        navigate(`/chats/${newChat.id}`);
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <MessageSquare size={16} /> Message
                                            </button>
                                        ) : connectionStatus === 'pending_sent' || connectionStatus === 'pending' ? (
                                            <button disabled className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-200 text-gray-500 font-bold text-sm">
                                                <Clock size={16} /> Pending
                                            </button>
                                        ) : connectionStatus === 'pending_received' ? (
                                            <button
                                                onClick={() => setActiveTab('network')}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors"
                                            >
                                                <UserCheck size={16} /> Respond
                                            </button>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    await db.sendConnectionRequest(currentUser.id, profileUser.id);
                                                    setConnectionStatus('pending_sent');
                                                    success("Request sent!");
                                                }}
                                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-[#1b140d] font-bold text-sm hover:opacity-90 transition-colors shadow-sm"
                                            >
                                                <UserPlus size={16} /> Connect
                                            </button>
                                        )}

                                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 text-secondary font-bold text-sm hover:bg-gray-100 transition-colors">
                                            <LinkIcon size={16} /> Share
                                        </button>
                                    </div>

                                    {/* Availability Status */}
                                    <div className="mt-6 pt-6 border-t border-border-light w-full flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`size-2.5 rounded-full ${profileUser.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                            <span className="text-sm font-medium text-secondary">
                                                {profileUser.is_online ? 'Available Now' : 'Offline'}
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={profileUser.is_online} className="sr-only peer" readOnly />
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

                                        <div className={`flex items-center justify-between p-3 rounded-xl border ${profileUser.is_verified === 'verified' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-full ${profileUser.is_verified === 'verified' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                                    <Shield size={16} className={`${profileUser.is_verified === 'verified' ? 'text-blue-600' : 'text-gray-500'}`} />
                                                </div>
                                                <span className={`text-sm font-medium ${profileUser.is_verified === 'verified' ? 'text-blue-900' : 'text-gray-500'}`}>
                                                    {profileUser.is_verified === 'verified' ? 'ID Verified' : 'ID Not Verified'}
                                                </span>
                                            </div>
                                            {profileUser.is_verified === 'verified' ? (
                                                <Check size={16} className="text-blue-600" />
                                            ) : (
                                                <button
                                                    onClick={() => isOwnProfile && idInputRef.current?.click()}
                                                    className={`text-xs font-bold ${isOwnProfile ? 'text-primary hover:underline' : 'text-gray-400 cursor-default'}`}
                                                    disabled={idUploading || !isOwnProfile}
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

                                {/* Danger Zone (Collapsed) - Only for own profile */}
                                {isOwnProfile && (
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                )}
                            </aside>

                            {/* Right Column: Stats & Content */}
                            <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Earned', value: `₹${profileUser.total_earned || 0}`, icon: 'payments', color: 'text-green-600', bg: 'bg-green-50' },
                                        { label: 'Assignments', value: projectsCompleted, icon: 'assignment', color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Rating', value: rating.toFixed(1), icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                        { label: 'On-Time Rate', value: `${profileUser.on_time_rate || 100}%`, icon: 'schedule', color: 'text-purple-600', bg: 'bg-purple-50' },
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
                                                    {isOwnProfile && (
                                                        <>
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
                                                        </>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {/* Add New Card - Only for own profile */}
                                                    {isOwnProfile && (
                                                        <button
                                                            onClick={() => portfolioInputRef.current?.click()}
                                                            className="group aspect-[4/3] rounded-2xl border-2 border-dashed border-border-light hover:border-primary/50 hover:bg-orange-50/50 transition-all flex flex-col items-center justify-center gap-3"
                                                        >
                                                            <div className="p-4 rounded-full bg-orange-100 group-hover:scale-110 transition-transform">
                                                                <Upload size={24} className="text-primary" />
                                                            </div>
                                                            <span className="font-bold text-secondary group-hover:text-primary transition-colors">Upload Project</span>
                                                        </button>
                                                    )}

                                                    {/* Portfolio Items */}
                                                    {profileUser.portfolio?.map((item: any, i: number) => (
                                                        <div key={i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all">
                                                            <img src={item} alt="Portfolio" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                                {isOwnProfile && (
                                                                    <button
                                                                        onClick={() => handleDeleteSample(item)}
                                                                        className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                                <p className="text-white font-bold">Project Sample #{i + 1}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'about' && (
                                            <div className="bg-white rounded-3xl p-8 shadow-soft border border-border-light space-y-8">
                                                {editingProfile && isOwnProfile ? (
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
                                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                            <div>
                                                                <h4 className="font-bold text-text-main text-sm">Available as Writer</h4>
                                                                <p className="text-xs text-secondary">Allow others to find you and request assignments</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isWriter}
                                                                    onChange={(e) => setIsWriter(e.target.checked)}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                            </label>
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
                                                                {profileUser.bio || "No bio added yet."}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-primary">school</span>
                                                                    Education
                                                                </h3>
                                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-background-light">
                                                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                                                        <GraduationCap size={20} className="text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-text-main">{profileUser.school || 'University'}</p>
                                                                        <p className="text-xs text-secondary">Student</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-primary">label</span>
                                                                    Skills & Tags
                                                                </h3>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {profileUser.tags?.map((tag: string, i: number) => (
                                                                        <span key={i} className="px-3 py-1 rounded-lg bg-orange-50 text-primary text-xs font-bold flex items-center gap-1">
                                                                            {tag}
                                                                            {isOwnProfile && (
                                                                                <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                                                    <X size={12} />
                                                                                </button>
                                                                            )}
                                                                        </span>
                                                                    ))}
                                                                    {isOwnProfile && (
                                                                        <input
                                                                            type="text"
                                                                            value={newTag}
                                                                            onChange={(e) => setNewTag(e.target.value)}
                                                                            onKeyDown={addTag}
                                                                            placeholder="+ Add Tag"
                                                                            className="px-3 py-1 rounded-lg bg-gray-50 text-secondary text-xs font-medium border border-transparent focus:border-primary focus:bg-white outline-none transition-all w-24"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'network' && (
                                            <div className="space-y-6">
                                                {/* Connection Requests - Only for own profile */}
                                                {isOwnProfile && requests.length > 0 && (
                                                    <div className="bg-white rounded-3xl p-6 shadow-soft border border-border-light">
                                                        <h3 className="font-bold font-display mb-4 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                            Pending Requests
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {requests.map((req) => (
                                                                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-background-light">
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar src={req.fromUser?.avatar_url} alt={req.fromUser?.full_name} className="size-10 rounded-full" />
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
                                                        const otherUser = conn.participants.find((p: any) => p.id !== profileUser.id);
                                                        return (
                                                            <div key={conn.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border-light flex items-center gap-4">
                                                                <Avatar src={otherUser?.avatar_url} alt={otherUser?.full_name} className="size-12 rounded-full" />
                                                                <div>
                                                                    <p className="font-bold text-text-main">{otherUser?.full_name}</p>
                                                                    <p className="text-xs text-secondary">@{otherUser?.handle}</p>
                                                                </div>
                                                                <button
                                                                    onClick={async () => {
                                                                        const chat = await db.createChat(null, currentUser.id, otherUser.id);
                                                                        navigate(`/chats/${chat.id}`);
                                                                    }}
                                                                    className="ml-auto p-2 rounded-full hover:bg-gray-100 text-secondary"
                                                                >
                                                                    <MessageSquare size={18} />
                                                                </button>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <div className="col-span-full text-center py-12 text-secondary">
                                                            <Users size={48} className="mx-auto mb-3 opacity-20" />
                                                            <p>No connections yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <div className="text-center mb-6">
                                    <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={32} className="text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-main mb-2">Delete Account?</h2>
                                    <p className="text-secondary text-sm">
                                        This action is permanent and cannot be undone. All your data, chats, and earnings will be wiped.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-secondary uppercase mb-2">
                                            Type "DELETE" to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmInput}
                                            onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-center tracking-widest focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                                            placeholder="DELETE"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="py-3 rounded-xl font-bold text-secondary hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleFinalDelete}
                                            disabled={deleteConfirmInput !== 'DELETE'}
                                            className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30"
                                        >
                                            Delete Forever
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};