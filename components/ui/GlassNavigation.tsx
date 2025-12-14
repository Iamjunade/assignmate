import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GlassButton } from './GlassButton';

interface NavItem {
    label: string;
    href: string;
    onClick?: () => void;
}

// ... props interface

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
                <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between bg-white/70 backdrop-blur-md border-white/40 shadow-sm">
                    {/* Logo */}
                    <div className="flex-1 flex justify-start">
                        {logo}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={(e) => {
                                    if (item.onClick) item.onClick();
                                }}
                                className="text-sm font-semibold text-slate-600 hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400 transition-colors tracking-tight"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex flex-1 items-center justify-end space-x-6">
                        <Link to="/auth" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                            Student
                        </Link>
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
                            <div className="flex items-center gap-4">
                                <Link to="/auth" className="text-sm font-semibold text-slate-600 hover:text-orange-600 dark:text-slate-300 transition-colors">
                                    Login
                                </Link>
                                <GlassButton variant="primary" size="sm" onClick={onLogin}>
                                    Sign Up
                                </GlassButton>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:text-orange-600 dark:text-slate-200 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-4 right-4 mt-2 p-4 glass rounded-2xl md:hidden animate-slide-down flex flex-col space-y-4 bg-orange-50/95 backdrop-blur-xl border border-orange-100 shadow-xl">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => {
                                    if (item.onClick) item.onClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-3 text-base font-semibold text-slate-700 hover:bg-orange-100/50 hover:text-orange-700 rounded-xl transition-all dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-orange-200/50 dark:border-white/10">
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
