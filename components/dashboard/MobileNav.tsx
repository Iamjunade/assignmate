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
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 z-50 pb-safe"
            aria-label="Mobile navigation"
        >
            {/* Main navbar container */}
            <div className="relative">
                {/* Shadow/border at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="flex items-center justify-around h-20 max-w-md mx-auto px-4 relative">
                    {navItems.map((item, index) => {
                        const active = isActive(item.path);

                        if (item.isPrimary) {
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        absolute left-1/2 -translate-x-1/2 -top-8
                                        w-16 h-16 rounded-full shadow-2xl
                                        transition-all duration-300 ease-out
                                        transform hover:scale-110 active:scale-95
                                        ring-[6px] ring-white dark:ring-slate-900
                                        ${isWriterMode
                                            ? 'bg-gradient-to-br from-orange-500 via-primary to-red-500 text-white'
                                            : 'bg-gradient-to-br from-orange-500 via-primary to-red-500 text-white'
                                        }
                                    `}
                                    aria-label={item.label}
                                >
                                    <span className="material-symbols-outlined text-[32px] drop-shadow-sm" aria-hidden="true">
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
                                    flex flex-col items-center justify-center gap-1.5
                                    w-20 h-16 transition-all duration-200
                                    ${active
                                        ? 'text-primary'
                                        : 'text-slate-400 hover:text-slate-600 active:text-primary'
                                    }
                                `}
                                aria-label={item.label}
                                aria-current={active ? 'page' : undefined}
                            >
                                <div className="relative">
                                    <span
                                        className={`material-symbols-outlined transition-all duration-200 ${active ? 'text-[28px]' : 'text-[26px]'
                                            }`}
                                        style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
                                        aria-hidden="true"
                                    >
                                        {item.icon}
                                    </span>
                                    {item.badge && item.badge > 0 && (
                                        <span
                                            className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md border-2 border-white"
                                            aria-label={`${item.badge} unread`}
                                        >
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[11px] font-medium transition-all ${active ? 'font-semibold' : ''
                                    }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* iOS-style home indicator */}
                <div className="flex justify-center pt-1 pb-2">
                    <div className="w-32 h-1 bg-slate-900/20 dark:bg-slate-100/20 rounded-full" />
                </div>
            </div>
        </nav>
    );
};
```
