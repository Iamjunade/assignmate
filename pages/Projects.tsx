import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gig, GigStatus, Order, OrderStatus } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { dbService } from '../services/firestoreService';
import { format, differenceInDays } from 'date-fns';

interface ProjectsProps {
    user: User | null;
}

export const Projects = ({ user }: ProjectsProps) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Gig[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | string>('all');

    const isWriterMode = user?.is_writer === true;

    useEffect(() => {
        if (user?.id) {
            loadProjects();
        }
    }, [user?.id, isWriterMode]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            if (isWriterMode) {
                const writerOrders = await dbService.getWriterProjects(user!.id) as Order[];
                setOrders(writerOrders);
            } else {
                const userProjects = await dbService.getUserProjects(user!.id) as Gig[];
                setProjects(userProjects);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats based on mode
    const stats = isWriterMode ? {
        total: orders.length,
        inProgress: orders.filter(o => o.status === 'in_progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalEarnings: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0),
        pendingEarnings: orders.filter(o => o.status === 'in_progress').reduce((sum, o) => sum + (o.amount || 0), 0),
    } : {
        total: projects.length,
        live: projects.filter(p => p.status === GigStatus.LIVE).length,
        taken: projects.filter(p => p.status === GigStatus.TAKEN).length,
        completed: projects.filter(p => p.status === GigStatus.COMPLETED).length,
    };

    // Filter items
    const filteredItems = isWriterMode
        ? (filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus))
        : (filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus));

    const getStatusColor = (status: string) => {
        if (status === GigStatus.LIVE || status === 'in_progress') {
            return 'bg-green-50 text-green-700 border-green-200';
        } else if (status === GigStatus.TAKEN) {
            return 'bg-blue-50 text-blue-700 border-blue-200';
        } else if (status === GigStatus.COMPLETED || status === 'completed') {
            return 'bg-gray-50 text-gray-700 border-gray-200';
        } else if (status === 'cancelled') {
            return 'bg-red-50 text-red-700 border-red-200';
        }
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        if (status === GigStatus.LIVE || status === 'in_progress') {
            return 'radio_button_checked';
        } else if (status === GigStatus.TAKEN) {
            return 'pending';
        } else if (status === GigStatus.COMPLETED || status === 'completed') {
            return 'check_circle';
        } else if (status === 'cancelled') {
            return 'cancel';
        }
        return 'help';
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full flex flex-col gap-6">

                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-3xl">assignment</span>
                                        My Projects
                                    </h1>
                                    <p className="text-text-muted mt-1">
                                        {isWriterMode ? 'Track all projects you\'re working on' : 'Track and manage all your project requests'}
                                    </p>
                                </div>
                                {!isWriterMode && (
                                    <button
                                        onClick={() => navigate('/writers')}
                                        className="h-12 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                        New Request
                                    </button>
                                )}
                            </div>

                            {/* Stats Cards */}
                            {isWriterMode ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Total</h3>
                                            <div className="size-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">folder</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.total}</span>
                                        <p className="text-xs text-text-muted mt-1">All projects</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Active</h3>
                                            <div className="size-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">pending</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.inProgress}</span>
                                        <p className="text-xs text-green-600 font-medium mt-1">In progress</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Completed</h3>
                                            <div className="size-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.completed}</span>
                                        <p className="text-xs text-text-muted mt-1">Finished</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Earnings</h3>
                                            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">payments</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-primary">₹{stats.totalEarnings}</span>
                                        <p className="text-xs text-text-muted mt-1">Total earned</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Total</h3>
                                            <div className="size-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">folder</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.total}</span>
                                        <p className="text-xs text-text-muted mt-1">All projects</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Active</h3>
                                            <div className="size-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">radio_button_checked</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.live}</span>
                                        <p className="text-xs text-green-600 font-medium mt-1">Open for bids</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">In Progress</h3>
                                            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">pending</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.taken}</span>
                                        <p className="text-xs text-blue-600 font-medium mt-1">Being worked on</p>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-card border border-border-subtle">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-text-muted font-bold text-xs uppercase tracking-wide">Completed</h3>
                                            <div className="size-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </div>
                                        </div>
                                        <span className="text-3xl font-extrabold text-text-dark">{stats.completed}</span>
                                        <p className="text-xs text-text-muted mt-1">Finished</p>
                                    </div>
                                </div>
                            )}

                            {/* Filter Tabs */}
                            {isWriterMode ? (
                                <div className="bg-white p-2 rounded-2xl shadow-card border border-border-subtle inline-flex gap-2 w-fit">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('in_progress')}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === 'in_progress' ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        Active ({stats.inProgress})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('completed')}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === 'completed' ? 'bg-gray-500 text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        Completed ({stats.completed})
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white p-2 rounded-2xl shadow-card border border-border-subtle inline-flex gap-2 w-fit">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(GigStatus.LIVE)}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === GigStatus.LIVE ? 'bg-green-500 text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        Active ({stats.live})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus(GigStatus.TAKEN)}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === GigStatus.TAKEN ? 'bg-blue- text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                        In Progress ({stats.taken})
                                    </button>
                                    <button
                                        onClick(() => setFilterStatus(GigStatus.COMPLETED)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filterStatus === GigStatus.COMPLETED ? 'bg-gray-500 text-white shadow-sm' : 'text-text-muted hover:bg-secondary-bg'}`}
                                    >
                                    Completed ({stats.completed})
                                </button>
                                </div>
                            )}

                        {/* Projects List */}
                        <div className="bg-white rounded-2xl shadow-card border border-border-subtle overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="size-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-4xl">inbox</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-text-dark mb-2">No projects found</h3>
                                    <p className="text-text-muted mb-6">
                                        {filterStatus === 'all'
                                            ? (isWriterMode ? "You haven't accepted any projects yet." : "You haven't created any projects yet. Start by posting a new request!")
                                            : `No projects with status: ${filterStatus}`}
                                    </p>
                                    {!isWriterMode && (
                                        <button
                                            onClick={() => navigate('/writers')}
                                            className="h-10 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                            Post New Request
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {filteredItems.map((item: any) => {
                                        const isOrder = 'writer_id' in item;
                                        return (
                                            <div
                                                key={item.id}
                                                className="p-6 hover:bg-secondary-bg cursor-pointer transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start gap-3 mb-2">
                                                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                                <span className="material-symbols-outlined text-2xl">description</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-bold text-text-dark group-hover:text-primary transition-colors truncate">
                                                                    {item.title}
                                                                </h3>
                                                                <p className="text-sm text-text-muted line-clamp-2 mt-1">
                                                                    {item.description || 'No description'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4 ml-15 text-xs text-text-muted">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                                {format(new Date(item.created_at), 'MMM d, yyyy')}
                                                            </span>
                                                            {isOrder && item.deadline && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm">event</span>
                                                                    Due: {format(new Date(item.deadline), 'MMM d')}
                                                                </span>
                                                            )}
                                                            {!isOrder && item.subject && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm">subject</span>
                                                                    {item.subject}
                                                                </span>
                                                            )}
                                                            {!isOrder && item.attachment_url && (
                                                                <span className="flex items-center gap-1 text-primary">
                                                                    <span className="material-symbols-outlined text-sm">attach_file</span>
                                                                    Attachment
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${getStatusColor(item.status)}`}>
                                                            <span className="material-symbols-outlined text-sm">{getStatusIcon(item.status)}</span>
                                                            {item.status.replace('_', ' ').toUpperCase()}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-primary">₹{isOrder ? item.amount : item.budget}</p>
                                                            <p className="text-xs text-text-muted">{isOrder ? 'Payment' : 'Budget'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </div>
            </main >

    <MobileNav />
        </div >
    );
};
