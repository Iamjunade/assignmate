import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface GlassNavigationProps {
    logo: React.ReactNode;
    items: { label: string; href: string; onClick?: () => void }[];
    user?: { name: string };
    onLogin: () => void;
    onLogout: () => void;
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
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:bg-white/90">
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
                                className="text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors tracking-tight"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user.name}
                                </span>
                                <button
                                    onClick={onLogout}
                                    className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/auth"
                                    className="text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-300 transition-colors"
                                >
                                    Log In
                                </Link>
                                <button
                                    onClick={onLogin}
                                    className="px-6 py-2.5 rounded-full bg-primary text-text-dark text-xs font-bold shadow-[0_4px_14px_0_rgba(240,153,66,0.39)] hover:shadow-[0_6px_20px_rgba(240,153,66,0.23)] hover:-translate-y-0.5 transition-all"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:text-primary dark:text-slate-200 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-4 right-4 mt-2 p-4 bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl md:hidden animate-slide-down flex flex-col space-y-4 shadow-xl z-50">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => {
                                    if (item.onClick) item.onClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-3 text-base font-bold text-slate-700 hover:bg-orange-50 hover:text-primary rounded-xl transition-all dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                            {user ? (
                                <div className="space-y-3">
                                    <div className="px-4 text-sm font-medium text-slate-500">
                                        Signed in as {user.name}
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onLogin}
                                    className="w-full py-3 rounded-xl bg-primary text-text-dark text-sm font-bold shadow-lg transition-all"
                                >
                                    Sign Up
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
