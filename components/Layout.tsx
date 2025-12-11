import React, { ReactNode } from 'react';
import { MessageSquare, User as UserIcon, LogOut, Search, LogIn } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
    children?: ReactNode;
    user: User | null;
    page: string;
    setPage: (page: string) => void;
    onLogout: () => Promise<void>;
}

export const Layout = ({ children, user, page, setPage, onLogout }: LayoutProps) => (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 flex-col sticky top-0 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 shadow-sm">
            <div className="p-8 cursor-pointer" onClick={() => setPage('feed')}>
                <div className="flex items-center gap-3">
                    {/* Logo Image */}
                    <img
                        src="https://i.ibb.co/0pVsZCnx/assignmate.png"
                        alt="AssignMate"
                        className="h-12 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            document.getElementById('fallback-logo-desktop')?.classList.remove('hidden');
                            document.getElementById('fallback-logo-desktop')?.classList.add('flex');
                        }}
                    />
                    {/* Text Fallback */}
                    <div id="fallback-logo-desktop" className="hidden items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">AssignMate</span>
                    </div>
                </div>
            </div>

            <nav className="space-y-2 flex-1 px-6 mt-4">
                <NavBtn label="Find Mates" icon={<Search size={20} />} active={page === 'feed'} onClick={() => setPage('feed')} />

                {user && (
                    <>
                        <NavBtn label="Messages" icon={<MessageSquare size={20} />} active={page === 'chats'} onClick={() => setPage('chats')} />
                        <NavBtn label="Profile" icon={<UserIcon size={20} />} active={page === 'profile'} onClick={() => setPage('profile')} />
                    </>
                )}
            </nav>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                {user ? (
                    <div className="space-y-3">
                        <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 text-sm px-4 py-2 transition-colors w-full font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setPage('auth')}
                        className="w-full btn-primary py-3 shadow-orange-500/20"
                    >
                        <LogIn size={18} className="mr-2" /> Login
                    </button>
                )}
            </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-20">
            <div className="flex items-center" onClick={() => setPage('feed')}>
                <img
                    src="https://i.ibb.co/0pVsZCnx/assignmate.png"
                    alt="Logo"
                    className="h-9 w-auto object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        document.getElementById('fallback-logo-mobile')?.classList.remove('hidden');
                        document.getElementById('fallback-logo-mobile')?.classList.add('flex');
                    }}
                />
                <div id="fallback-logo-mobile" className="hidden items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">AssignMate</span>
                </div>
            </div>

            {!user && (
                <button onClick={() => setPage('auth')} className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-orange-500/20">
                    Login
                </button>
            )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
            <div className="max-w-6xl mx-auto w-full min-h-full pb-24 md:pb-8 px-4 md:px-8 pt-6">
                {children}
            </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <MobileNavBtn label="Find" icon={<Search size={22} />} active={page === 'feed'} onClick={() => setPage('feed')} />
            {user ? (
                <>
                    <MobileNavBtn label="Chats" icon={<MessageSquare size={22} />} active={page === 'chats'} onClick={() => setPage('chats')} />
                    <MobileNavBtn label="Profile" icon={<UserIcon size={22} />} active={page === 'profile'} onClick={() => setPage('profile')} />
                </>
            ) : (
                <MobileNavBtn label="Login" icon={<LogIn size={22} />} active={page === 'auth'} onClick={() => setPage('auth')} />
            )}
        </nav>
    </div >
);

interface NavBtnProps {
    label: string;
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}

const NavBtn = ({ label, icon, active, onClick }: NavBtnProps) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 ${active ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        <span className={active ? 'text-orange-600 dark:text-orange-400' : ''}>{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

const MobileNavBtn = ({ label, icon, active, onClick }: NavBtnProps) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full ${active ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'}`}>
        <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-orange-50 dark:bg-orange-500/10 -translate-y-1 shadow-sm' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
);