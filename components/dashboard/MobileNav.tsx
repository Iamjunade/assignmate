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
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border-subtle z-50 safe-area-bottom shadow-[0_-2px_20px_-8px_rgba(0,0,0,0.12)]"
            aria-label="Mobile navigation"
        >
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 relative">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    if (item.isPrimary) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    absolute left-1/2 -translate-x-1/2 -translate-y-8
                                    touch-target-lg
                                    p-4 rounded-full shadow-xl
                                    transition-all duration-200 ease-out
                                    touch-feedback
                                    ring-4 ring-white dark:ring-slate-900
                                    ${isWriterMode
                                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-primary/40 hover:shadow-2xl active:shadow-primary/50 hover:scale-105'
                                        : 'bg-primary text-white shadow-primary/40 hover:shadow-2xl active:shadow-primary/50 hover:scale-105'
                                    }
                                `}
                                aria-label={item.label}
                            >
                                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                    {item.icon}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`
                                flex flex-col items-center justify-center gap-1 touch-target
                                px-3 transition-all duration-200 ease-out min-w-[68px]
                                touch-feedback-subtle
                                ${active
                                    ? 'text-primary'
                                    : 'text-text-muted hover:text-text-dark active:text-primary'
                                }
                            `}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <div className="relative">
                                <span
                                    className="material-symbols-outlined text-[26px] transition-all duration-200"
                                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                                    aria-hidden="true"
                                >
                                    {item.icon}
                                </span>
                                {item.badge && item.badge > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
                                        aria-label={`${item.badge} unread`}
                                    >
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-semibold whitespace-nowrap">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
