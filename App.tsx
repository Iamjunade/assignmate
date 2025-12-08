import React, { useState, Suspense, lazy, useEffect } from 'react';
import { db } from './services/mockSupabase';
import { notifications, fcm } from './services/firebase';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { User } from './types';

// Lazy Load Pages for Performance
const Auth = lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const Feed = lazy(() => import('./pages/Feed').then(module => ({ default: module.Feed })));
const ChatList = lazy(() => import('./pages/ChatList').then(module => ({ default: module.ChatList })));
const ChatRoom = lazy(() => import('./pages/ChatRoom').then(module => ({ default: module.ChatRoom })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

export default function AppWrapper() {
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
  const [page, setPage] = useState('feed');
  const [chatId, setChatId] = useState<string | null>(null);

  // Global Notification & FCM Listener
  useEffect(() => {
    if (!user) return;

    // 1. Request FCM Permission & Save Token
    fcm.requestPermission(user.id).then(token => {
      if (token) {
        // Save token to Supabase so backend can target this device
        db.updateProfile(user.id, { fcm_token: token });
      }
    });

    // 2. Listen for Foreground FCM Messages
    fcm.onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {};

      // Play Sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => { });

      toast(`${title || 'New Notification'}: ${body || ''}`, 'info');
    });

    // 3. Fallback: Internal Firestore Listener (Legacy)
    const unsubscribe = notifications.listen(user.id, (data) => {
      // Note: We removed the page/chatId check here to avoid re-subscribing constantly.
      // Ideally, we'd check current route in a ref if we wanted to suppress notifications for active chat.

      toast(
        `${data.senderName}: ${data.content.length > 30 ? data.content.substring(0, 30) + '...' : data.content}`,
        'info'
      );
    });

    return () => unsubscribe();
  }, [user]); // Optimized: Only re-subscribe when user changes

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center text-orange-600 gap-3">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-sm font-bold text-slate-500 animate-pulse">Loading AssignMate...</p>
      </div>
    );
  }

  // Handle "Hire" action
  const startChatFromWriter = async (writer: User) => {
    // Gating: If visitor clicks hire, send to auth
    if (!user) {
      setPage('auth');
      return;
    }

    const chat = await db.createChat(null, user.id, writer.id);
    setChatId(chat.id);
    setPage('room');
  };

  const openChat = (id: string) => { setChatId(id); setPage('room'); };

  // If page is 'auth' and user is not logged in, show Auth Screen directly
  if (page === 'auth' && !user) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" /></div>}>
        <div className="relative">
          <button
            onClick={() => setPage('feed')}
            className="absolute top-4 left-4 z-50 text-slate-500 hover:text-slate-900 text-xs font-bold bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-200"
          >
            ← Back to Browse
          </button>
          <Auth />
        </div>
      </Suspense>
    );
  }

  // If user logs in while on auth page, redirect to feed ONLY if profile is complete
  if (page === 'auth' && user && !user.is_incomplete) {
    setPage('feed');
  }

  const isDesktop = window.innerWidth >= 768;
  const showSplit = isDesktop && (page === 'chats' || page === 'room');

  // If user is incomplete, force them to see Auth/Profile Creation screen content
  if (user?.is_incomplete) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <Auth />
      </Suspense>
    )
  }

  return (
    <Layout user={user} page={page === 'room' && isDesktop ? 'chats' : page} setPage={setPage} onLogout={logout}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-[50vh] text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        {/* Feed is always visible to everyone */}
        {page === 'feed' && <Feed user={user} onChat={startChatFromWriter} />}

        {/* Protected Pages - Only show content if user exists */}
        {page === 'profile' && user && <Profile user={user} />}
        {page === 'admin' && <Admin />}

        {/* Mobile Chat Routing */}
        {!isDesktop && page === 'chats' && user && <ChatList user={user} onSelect={openChat} selectedId={chatId} />}
        {!isDesktop && page === 'room' && user && <ChatRoom user={user} chatId={chatId} onBack={() => setPage('chats')} />}

        {/* Desktop Split View */}
        {showSplit && user && (
          <div className="flex h-[calc(100vh-theme(spacing.16))] md:h-screen border-l border-slate-200">
            <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-white">
              <ChatList user={user} onSelect={openChat} selectedId={chatId} />
            </div>
            <div className="w-2/3 h-full bg-slate-50">
              {chatId ? <ChatRoom user={user} chatId={chatId} onBack={() => { }} /> : <div className="h-full flex items-center justify-center text-slate-400 font-medium">Select a student to chat</div>}
            </div>
          </div>
        )}
      </Suspense>
    </Layout>
  );
}