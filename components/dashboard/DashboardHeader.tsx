import React from 'react';
import { User } from '../../types';

interface DashboardHeaderProps {
    user: User | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onMobileMenuClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, searchTerm, setSearchTerm, onMobileMenuClick }) => {
    return (
        <header className="h-20 flex items-center justify-between px-8 py-4 bg-background-light/80 backdrop-blur-md sticky top-0 z-30 border-b border-border-color/50">
            {/* Mobile Menu Button (Visible only on small screens) */}
            <button className="lg:hidden p-2 -ml-2 text-text-dark" onClick={onMobileMenuClick}>
                <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-text-muted">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-full leading-5 bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm shadow-sm transition-shadow group-hover:shadow-md"
                        placeholder="Search for writers, subjects, or projects..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="relative p-2 text-text-dark hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light"></span>
                </button>
                <div className="h-6 w-px bg-border-color mx-1"></div>
                <button className="hidden sm:flex items-center justify-center rounded-full h-11 px-6 bg-white border border-border-color text-text-dark text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    Find a Writer
                </button>
                <button className="flex items-center justify-center rounded-full h-11 px-6 bg-primary text-text-dark text-sm font-bold shadow-[0_4px_14px_0_rgba(240,153,66,0.39)] hover:shadow-[0_6px_20px_rgba(240,153,66,0.23)] hover:-translate-y-0.5 transition-all">
                    Post a Project
                </button>
            </div>
        </header>
    );
};
