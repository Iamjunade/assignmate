import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { useAuth } from '../contexts/AuthContext';
import { dbService as db } from '../services/firestoreService';
import { Loader2, FolderPlus, Search, Filter, Calendar, Users, ChevronRight } from 'lucide-react';

export const Projects: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        // Mocking projects for now, or fetching from a 'projects' collection if it exists
        const fetchProjects = async () => {
            try {
                // For now, let's use a mock or fetch active orders as projects
                const stats = await db.getDashboardStats(user?.id || '');
                setProjects(stats.activeOrders || []);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProjects();
    }, [user]);

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
                            <button className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 self-start sm:self-auto">
                                <FolderPlus size={18} />
                                New Project
                            </button>
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
                                    <div key={project.id} className="group bg-white p-6 rounded-[2.5rem] border border-border-subtle shadow-card hover:shadow-soft hover:border-primary/20 transition-all duration-300">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-text-dark group-hover:text-primary transition-colors">{project.title || 'Untitled Project'}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold">
                                                            <Users size={14} />
                                                            {project.writer_handle || 'Pending Match'}
                                                        </div>
                                                        <div className="size-1 bg-gray-300 rounded-full" />
                                                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {project.status || 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="size-10 rounded-full bg-gray-50 text-text-muted hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                                                <ChevronRight size={20} />
                                            </button>
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
