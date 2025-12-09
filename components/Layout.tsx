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
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-orange-50/30">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col sticky top-0 h-screen border-r border-orange-100 bg-white z-50 shadow-sm">
            <div className="p-6 cursor-pointer" onClick={() => setPage('feed')}>
                <div className="flex items-center gap-3">
                    {/* Logo Image */}
                    <img
                        src="https://i.ibb.co/0pVsZCnx/assignmate.png"
                        alt="AssignMate"
                        className="h-16 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            document.getElementById('fallback-logo-desktop')?.classList.remove('hidden');
                            document.getElementById('fallback-logo-desktop')?.classList.add('flex');
                        }}
                    />
                    {/* Text Fallback (Hidden by default if image loads) */}
                    <div id="fallback-logo-desktop" className="hidden items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <span className="font-bold text-xl tracking-tight text-slate-900">AssignMate</span>
                    </div>
                </div>
            </div>

            <nav className="space-y-1 flex-1 px-4 mt-2">
                <NavBtn label="Find Mates" icon={<Search size={18} />} active={page === 'feed'} onClick={() => setPage('feed')} />

                {user && (
                    <>
                        <NavBtn label="Messages" icon={<MessageSquare size={18} />} active={page === 'chats'} onClick={() => setPage('chats')} />
                        <NavBtn label="Profile" icon={<UserIcon size={18} />} active={page === 'profile'} onClick={() => setPage('profile')} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-100">
                {user ? (
                    <div className="space-y-3">

                        <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm px-2 transition-colors w-full font-medium">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setPage('auth')}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                    >
                        <LogIn size={16} /> Login
                    </button>
                )}
            </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-orange-100 flex items-center justify-between px-4 sticky top-0 bg-white/90 backdrop-blur-xl z-20">
            <div className="flex items-center" onClick={() => setPage('feed')}>
                <img
                    src="https://i.ibb.co/0pVsZCnx/assignmate.png"
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        document.getElementById('fallback-logo-mobile')?.classList.remove('hidden');
                        document.getElementById('fallback-logo-mobile')?.classList.add('flex');
                    }}
                />
                <div id="fallback-logo-mobile" className="hidden items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-bold text-lg text-slate-900">AssignMate</span>
                </div>
            </div>

            {user ? (

            ): (
                    <button onClick = { () => setPage('auth') } className = "text-xs bg-orange-600 text-white px-4 py-2 rounded-md font-bold shadow-md shadow-orange-200">
              Login
          </button>
      )}
    </header>

    {/* Main Content */ }
<main className="flex-1 overflow-y-auto relative bg-slate-50">
    <div className="max-w-5xl mx-auto w-full min-h-full pb-20 md:pb-0">
        {children}
    </div>
</main>

{/* Mobile Bottom Nav */ }
<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-30 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
    <MobileNavBtn label="Find" icon={<Search size={20} />} active={page === 'feed'} onClick={() => setPage('feed')} />
    {user ? (
        <>
            <MobileNavBtn label="Chats" icon={<MessageSquare size={20} />} active={page === 'chats'} onClick={() => setPage('chats')} />
            <MobileNavBtn label="Profile" icon={<UserIcon size={20} />} active={page === 'profile'} onClick={() => setPage('profile')} />
        </>
    ) : (
        <MobileNavBtn label="Login" icon={<LogIn size={20} />} active={page === 'auth'} onClick={() => setPage('auth')} />
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${active ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
        <span className={active ? 'text-orange-600' : ''}>{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

const MobileNavBtn = ({ label, icon, active, onClick }: NavBtnProps) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full ${active ? 'text-orange-600' : 'text-slate-400'}`}>
        <div className={`p-1.5 rounded-full transition-all ${active ? 'bg-orange-50 -translate-y-1' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold mt-0.5">{label}</span>
    </button>
);