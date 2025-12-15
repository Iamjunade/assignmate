import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DashboardHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="h-24 flex items-center justify-between px-4 py-4 bg-[#faf9f7]/90 backdrop-blur-md sticky top-0 z-30">
            <button className="lg:hidden p-2 -ml-2 text-text-dark">
                <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex flex-1 max-w-lg">
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                    </div>
                    <input
                        className="block w-full pl-11 pr-4 py-3 border border-transparent hover:border-border-subtle hover:bg-white focus:bg-white rounded-full leading-5 bg-white/60 text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm shadow-sm transition-all"
                        placeholder="Find assignments, writers, or subjects..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
                <button className="relative p-2.5 bg-white text-text-dark hover:bg-primary-light rounded-full transition-colors border border-border-subtle shadow-sm group">
                    <span className="material-symbols-outlined group-hover:text-primary transition-colors">notifications</span>
                    <span className="absolute top-2.5 right-3 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button
                    onClick={() => navigate('/writers')}
                    className="hidden sm:flex items-center justify-center rounded-full h-11 px-6 bg-white border border-border-subtle text-text-dark text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Find a Writer
                </button>
                <button
                    onClick={() => navigate('/post-project')}
                    className="flex items-center justify-center gap-2 rounded-full h-11 px-6 bg-text-dark text-white text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-105 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span> Post Project
                </button>
            </div>
        </header>
    );
};
