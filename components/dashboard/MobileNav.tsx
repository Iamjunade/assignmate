import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'dashboard', label: 'Home', path: '/feed' },
        { icon: 'assignment', label: 'Projects', path: '/projects' },
        { icon: 'search', label: 'Search', path: '/writers', isPrimary: true },
        { icon: 'chat_bubble', label: 'Chat', path: '/chats' },
        { icon: 'person', label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle px-6 py-3 z-50 safe-area-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    if (item.isPrimary) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="relative -top-6 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                            >
                                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-text-muted hover:text-text-dark'}`}
                        >
                            <span
                                className="material-symbols-outlined text-2xl transition-transform active:scale-90"
                                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
