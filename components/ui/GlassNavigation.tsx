import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GlassButton } from './GlassButton';

interface NavItem {
    label: string;
    href: string;
    onClick?: () => void;
}

interface GlassNavigationProps {
    logo: React.ReactNode;
    items: NavItem[];
    user?: {
        name: string;
        avatar?: string;
    };
    onLogin?: () => void;
    onLogout?: () => void;
}

export const GlassNavigation: React.FC<GlassNavigationProps> = ({
    logo,
    items,
    user,
    onLogin,
    onLogout
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {logo}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {items.map((item) => (
                            <button
                                key={item.label}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (item.onClick) item.onClick();
                                }}
                                className="text-sm font-medium text-slate-700 hover:text-orange-500 dark:text-slate-200 dark:hover:text-orange-400 transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {user.name}
                                </span>
                                <GlassButton variant="ghost" size="sm" onClick={onLogout}>
                                    Logout
                                </GlassButton>
                            </div>
                        ) : (
                            <GlassButton variant="primary" size="sm" onClick={onLogin}>
                                Sign In
                            </GlassButton>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-700 dark:text-slate-200"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-4 right-4 mt-2 p-4 glass rounded-2xl md:hidden animate-slide-down flex flex-col space-y-4">
                        {items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.onClick) item.onClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-base font-medium text-slate-700 hover:bg-white/10 rounded-lg dark:text-slate-200"
                            >
                                {item.label}
                            </button>
                        ))}
                        <div className="pt-4 border-t border-white/10">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="px-4 text-sm font-medium text-slate-500">
                                        Signed in as {user.name}
                                    </div>
                                    <GlassButton variant="ghost" className="w-full justify-start" onClick={onLogout}>
                                        Logout
                                    </GlassButton>
                                </div>
                            ) : (
                                <GlassButton variant="primary" className="w-full" onClick={onLogin}>
                                    Sign In
                                </GlassButton>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
