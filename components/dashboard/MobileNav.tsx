import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/firestoreService';

export const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [requestsCount, setRequestsCount] = useState(0);

    const isWriterMode = user?.is_writer === true;

    useEffect(() => {
        if (user?.id) {
            const unsubscribe = dbService.listenToUnreadCount(user.id, (count) => {
                setUnreadCount(count);
            });

            if (isWriterMode) {
                dbService.getIncomingRequests(user.id).then(requests => {
                    setRequestsCount(requests.length);
                });
            }

            return () => unsubscribe();
        }
    }, [user?.id, isWriterMode]);

    const isActive = (path: string) => location.pathname === path;

    // Dynamic nav items based on mode
    const navItems = isWriterMode ? [
        { icon: 'dashboard', label: 'Home', path: '/feed' },
        { icon: 'person_add', label: 'Requests', path: '/connections', badge: requestsCount },
        { icon: 'payments', label: 'Earnings', path: '/earnings', isPrimary: true },
        { icon: 'chat_bubble', label: 'Chat', path: '/chats', badge: unreadCount },
        { icon: 'person', label: 'Profile', path: '/profile' },
    ] : [
        { icon: 'dashboard', label: 'Home', path: '/feed' },
        { icon: 'assignment', label: 'Projects', path: '/projects' },
        { icon: 'search', label: 'Writers', path: '/writers', isPrimary: true },
        { icon: 'chat_bubble', label: 'Chat', path: '/chats', badge: unreadCount },
        { icon: 'person', label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-subtle px-4 py-2 z-50 safe-area-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    if (item.isPrimary) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`relative -top-5 p-3.5 rounded-full shadow-lg transition-all ${isWriterMode
                                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-primary/30 hover:shadow-xl'
                                        : 'bg-primary text-white shadow-primary/30 hover:scale-105'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`relative flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${active ? 'text-primary' : 'text-text-muted hover:text-text-dark'}`}
                        >
                            <div className="relative">
                                <span
                                    className="material-symbols-outlined text-xl transition-transform active:scale-90"
                                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    {item.icon}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
