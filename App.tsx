import React, { useState, Suspense, lazy, useEffect } from 'react';
import { dbService as db } from './services/firestoreService';
import { notifications, fcm } from './services/firebase';
import { GlassLayout } from './components/layout/GlassLayout';
import { GlassNavigation } from './components/ui/GlassNavigation';
import { Loader2, GraduationCap, MessageSquare } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { User } from './types';

// Admin Components
import { AdminLayout } from './admin/layouts/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminUsers } from './admin/pages/AdminUsers';
import { AdminChats } from './admin/pages/AdminChats';
import { AdminConnections } from './admin/pages/AdminConnections';
import { AdminSettings } from './admin/pages/AdminSettings';

// Lazy Load Pages for Performance
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Auth = lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const Feed = lazy(() => import('./pages/Feed').then(module => ({ default: module.Feed })));
const ChatList = lazy(() => import('./pages/ChatList').then(module => ({ default: module.ChatList })));
const ChatRoom = lazy(() => import('./pages/ChatRoom').then(module => ({ default: module.ChatRoom })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));

export default function AppWrapper() {
  // Admin Routing Check
  const isAdminRoute = window.location.pathname === '/pashabhai2020$';
  const [adminPage, setAdminPage] = useState('dashboard');

  if (isAdminRoute) {
    return (
      <AdminLayout currentPage={adminPage} onNavigate={setAdminPage}>
        {adminPage === 'dashboard' && <AdminDashboard />}
        {adminPage === 'users' && <AdminUsers />}
        {adminPage === 'chats' && <AdminChats />}
        {adminPage === 'connections' && <AdminConnections />}
        {adminPage === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState('landing'); // Default to landing
  const [chatId, setChatId] = useState<string | null>(null);

  // Redirect to feed if logged in and complete, or to auth if incomplete
  useEffect(() => {
    if (user && !user.is_incomplete && (page === 'landing' || page === 'auth')) {
      setPage('feed');
    } else if (user?.is_incomplete && page !== 'auth') {
      setPage('auth');
    }
  }, [user, page]);

  // Global Notification & FCM Listener
  useEffect(() => {
    if (!user) return;

    // 1. Request FCM Permission & Save Token
    fcm.requestPermission(user.id).then(token => {
      if (token) {
        db.updateProfile(user.id, { fcm_token: token });
      }
    });

    // 2. Listen for Foreground FCM Messages
    fcm.onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => { });
      toast(`${title || 'New Notification'}: ${body || ''}`, 'info');
    });

    // 3. Fallback: Internal Firestore Listener
    const unsubscribe = notifications.listen(user.id, (data) => {
      toast(
        `${data.senderName}: ${data.content.length > 30 ? data.content.substring(0, 30) + '...' : data.content}`,
        'info'
      );
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-orange-600 gap-3">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-sm font-bold text-slate-500 animate-pulse">Loading AssignMate...</p>
      </div>
    );
  }

  const startChatFromWriter = async (writer: User) => {
    if (!user) {
      setPage('auth');
      return;
    }
    const chat = await db.createChat(null, user.id, writer.id);
    setChatId(chat.id);
    setPage('room');
  };

  const openChat = (id: string) => { setChatId(id); setPage('room'); };

  const isDesktop = window.innerWidth >= 768;
  const showSplit = isDesktop && (page === 'chats' || page === 'room');

  // Navigation Items
  const navItems = [
    { label: 'Browse', href: '#', onClick: () => setPage('landing') },
    { label: 'How it Works', href: '#', onClick: () => setPage('landing') },
    { label: 'Pricing', href: '#', onClick: () => setPage('landing') },
  ];

  // Handle Navigation Clicks (Simple router for now)
  const handleNavClick = (p: string) => {
    setPage(p);
  };

  return (
    <GlassLayout>
      <GlassNavigation
        logo={
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage(user ? 'feed' : 'landing')}>
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
              AssignMate
            </span>
          </div>
        }
        items={user ? [
          { label: 'Feed', href: '#', onClick: () => setPage('feed') },
          { label: 'Messages', href: '#', onClick: () => setPage('chats') },
          { label: 'Profile', href: '#', onClick: () => setPage('profile') },
        ] : navItems}
        user={user ? { name: user.full_name || user.email } : undefined}
        onLogin={() => setPage('auth')}
        onLogout={logout}
      />

      <div className="pt-20 min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh] text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        }>
          {page === 'landing' && <Landing onGetStarted={() => setPage('auth')} />}

          {page === 'auth' && (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
              <Auth onComplete={() => setPage('feed')} />
            </div>
          )}

          {page === 'feed' && <Feed user={user} onChat={startChatFromWriter} />}

          {page === 'profile' && user && <Profile user={user} />}

          {/* Mobile Chat Routing */}
          {!isDesktop && page === 'chats' && user && <ChatList user={user} onSelect={openChat} selectedId={chatId} />}
          {!isDesktop && page === 'room' && user && <ChatRoom user={user} chatId={chatId} onBack={() => setPage('chats')} />}

          {/* Desktop Split View */}
          {showSplit && user && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
              <div className="grid grid-cols-12 gap-6 h-full">
                <div className="col-span-4 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                  <ChatList user={user} onSelect={openChat} selectedId={chatId} />
                </div>
                <div className="col-span-8 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                  {chatId ? (
                    <ChatRoom user={user} chatId={chatId} onBack={() => { }} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <MessageSquare size={48} className="mb-4 opacity-50" />
                      <p>Select a chat to start messaging</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </GlassLayout>
  );
}