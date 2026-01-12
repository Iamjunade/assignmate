import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { useAuth } from '../contexts/AuthContext';
import { dbService as db } from '../services/firestoreService';
import { Loader2, FolderPlus, Search, Filter, Calendar, Users, ChevronRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

export const Projects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [showNewProjectDropdown, setShowNewProjectDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNewProjectDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                const [stats, conns] = await Promise.all([
                    db.getDashboardStats(user.id),
                    db.getMyConnections(user.id)
                ]);
                setProjects(stats.activeOrders || []);

                // Process connections to get the "other" user details
                const processedConns = conns.map((c: any) => {
                    // Start by looking for the "other" user in participants list
                    if (c.participants && Array.isArray(c.participants)) {
                        const otherUser = c.participants.find((p: any) => (p.id || p) !== user.id);
                        if (otherUser && typeof otherUser === 'object') return otherUser; // Already populated
                    }
                    // Fallback if structure varies
                    return c;
                }).filter(Boolean);

                setConnections(processedConns);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleStartProject = async (peerId: string) => {
        if (!user) return;
        try {
            // Find existing chat or create new one
            let chatId = await db.findExistingChat(user.id, peerId);
            if (!chatId) {
                const newChat = await db.createChat(null, user.id, peerId);
                chatId = newChat.id;
            }
            // Navigate with state to auto-open Collaborate modal
            navigate(`/chats/${chatId}`, { state: { openCollaborate: true } });
        } catch (err) {
            console.error("Error starting project flow:", err);
            alert("Failed to open chat. Please try again.");
        }
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">My Projects</h1>
                                <p className="text-text-muted text-sm mt-1">Manage and track your ongoing academic collaborations.</p>
                            </div>

                            {/* Smart New Project Dropdown */}
                            <div className="relative self-start sm:self-auto" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowNewProjectDropdown(!showNewProjectDropdown)}
                                    className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <FolderPlus size={18} />
                                    New Project
                                    <ChevronRight size={16} className={`transition-transform duration-200 ${showNewProjectDropdown ? 'rotate-90' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showNewProjectDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-border-subtle z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-border-subtle bg-gray-50/50">
                                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Select Collaborator</h3>
                                                <p className="text-[10px] text-text-muted">Choose a connection to start a project with.</p>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                                {connections.length > 0 ? (
                                                    connections.map((conn) => (
                                                        <button
                                                            key={conn.id || conn.objectID}
                                                            onClick={() => handleStartProject(conn.id || conn.objectID)}
                                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg transition-all group"
                                                        >
                                                            <Avatar
                                                                src={conn.avatar_url}
                                                                alt={conn.handle}
                                                                className="size-10 rounded-full border border-gray-100"
                                                                fallback={conn.handle?.charAt(0)}
                                                            />
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="font-bold text-sm text-text-dark truncate group-hover:text-primary transition-colors">
                                                                    {conn.full_name || conn.handle}
                                                                </p>
                                                                <p className="text-xs text-text-muted truncate">
                                                                    @{conn.handle}
                                                                </p>
                                                            </div>
                                                            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                                                                handshake
                                                            </span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 px-4">
                                                        <div className="mx-auto size-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-400">
                                                            <UserPlus size={20} />
                                                        </div>
                                                        <p className="text-sm font-bold text-text-dark">No connections yet</p>
                                                        <button
                                                            onClick={() => navigate('/peers')}
                                                            className="text-xs text-primary font-bold mt-2 hover:underline"
                                                        >
                                                            Find Peers
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-border-subtle focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium outline-none"
                                />
                            </div>
                            <button className="bg-white px-4 py-3 rounded-2xl border border-border-subtle text-text-muted hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold">
                                <Filter size={18} />
                                Filters
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-border-subtle shadow-card">
                                <div className="size-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <FolderPlus size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-text-dark">No active projects</h3>
                                <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
                                    You don't have any ongoing projects. Start a new collaboration or find a mentor to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="group bg-white p-6 rounded-[2rem] border border-border-subtle shadow-card hover:shadow-soft hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 cursor-pointer" onClick={() => console.log('Navigate to project details')}>
                                        {/* Header */}
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-text-dark group-hover:text-primary transition-colors line-clamp-1">{project.title || 'Untitled Project'}</h3>
                                                <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-text-muted">
                                                    <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                        {project.writer_avatar ? (
                                                            <img src={project.writer_avatar} alt="Avatar" className="size-6 rounded-full object-cover" />
                                                        ) : (
                                                            <Users size={12} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                    <span>With <span className="text-text-dark font-bold">{project.writer_handle || 'Peer'}</span></span>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                                                {project.status === 'in_progress' ? 'In Progress' : project.status || 'Active'}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                            {project.description || 'No description provided.'}
                                        </p>

                                        {/* Footer Details */}
                                        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="flex items-center gap-1.5 text-text-muted bg-gray-50 px-2.5 py-1 rounded-lg">
                                                    <Calendar size={14} className="text-orange-500" />
                                                    <span className="font-bold text-text-dark text-xs">
                                                        {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                                                    </span>
                                                </div>
                                                {project.pages > 0 && (
                                                    <div className="hidden sm:flex items-center gap-1.5 text-text-muted bg-gray-50 px-2.5 py-1 rounded-lg">
                                                        <FolderPlus size={14} className="text-blue-500" />
                                                        <span className="font-bold text-text-dark text-xs">{project.pages} Pages</span>
                                                    </div>
                                                )}
                                            </div>

                                            {project.budget > 0 && (
                                                <div className="text-right">
                                                    <span className="text-lg font-extrabold text-[#111827]">₹{project.budget.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
