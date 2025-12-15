import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types';

interface SidebarProps {
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-72 h-full hidden lg:flex flex-col border-r border-border-subtle bg-white z-20 shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-3 text-text-dark">
                    <div className="size-9 text-primary bg-primary/10 rounded-xl flex items-center justify-center">
                        <svg className="size-6" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
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
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">3</span>
                </a>
                <a
                    onClick={() => navigate('/escrow')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/escrow') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">account_balance_wallet</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Escrow</span>
                </a>
                <div className="mt-8 mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Settings</div>
                <a
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${isActive('/profile') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">person</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Profile</span>
                </a>
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
