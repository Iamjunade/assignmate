import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types';

import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/firestoreService';
import { useState, useEffect } from 'react';

interface SidebarProps {
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user?.id) {
            const unsubscribe = dbService.listenToUnreadCount(user.id, (count) => {
                setUnreadCount(count);
            });
            return () => unsubscribe();
        }
    }, [user?.id]);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside className="w-72 h-full hidden lg:flex flex-col border-r border-border-subtle bg-white z-20 shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-3 text-text-dark">
                    <div className="size-9 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight">AssignMate</h2>
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-2">
                <div className="mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Main Menu</div>
                <a
                    onClick={() => navigate('/feed')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group shadow-sm cursor-pointer ${isActive('/feed') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-sm font-bold">Dashboard</span>
                </a>
                <a
                    onClick={() => navigate('/projects')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/projects') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">assignment</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">My Projects</span>
                </a>
                <a
                    onClick={() => navigate('/writers')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/writers') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">person_search</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Find Writers</span>
                </a>
                <a
                    onClick={() => navigate('/chats')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/chats') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">chat_bubble</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Messages</span>
                    {unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{unreadCount}</span>
                    )}
                </a>

                <div className="mt-8 mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Settings</div>
                <a
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${isActive('/profile') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">person</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Profile</span>
                </a>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer hover:bg-red-50 text-text-muted hover:text-red-500 mt-auto"
                >
                    <span className="material-symbols-outlined transition-colors">logout</span>
                    <span className="text-sm font-medium transition-colors">Logout</span>
                </button>
            </nav>
            <div className="p-6">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary-bg border border-border-subtle cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate('/profile')}>
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white shadow-sm"
                            style={{ backgroundImage: `url("${user?.avatar_url || 'https://via.placeholder.com/150'}")` }}
                        ></div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full size-3 border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-text-dark text-sm font-bold truncate">{user?.full_name || user?.handle || 'Student'}</h1>
                        <p className="text-text-muted text-[11px] truncate">{user?.school || 'University'}</p>
                    </div>
                    <span className="material-symbols-outlined text-text-muted ml-auto text-lg">expand_more</span>
                </div>
            </div>
        </aside>
    );
};
