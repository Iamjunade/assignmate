import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { dbService as db } from './services/firestoreService';
import { notifications, fcm } from './services/firebase';
import { GlassLayout } from './components/layout/GlassLayout';
import { GlassNavigation } from './components/ui/GlassNavigation';
import { Loader2, GraduationCap, MessageSquare } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
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
const Connections = lazy(() => import('./pages/Connections').then(module => ({ default: module.Connections })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })));
const FindWriter = lazy(() => import('./pages/FindWriter').then(module => ({ default: module.FindWriter })));
const AdminVerifications = lazy(() => import('./admin/pages/AdminVerifications').then(module => ({ default: module.AdminVerifications })));

export default function AppWrapper() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

function AppRoutes() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const startChatFromWriter = async (writer: User) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const chat = await db.createChat(null, user.id, writer.id);
    navigate(`/chats/${chat.id}`);
  };

  const navItems = [
    { label: 'Browse', href: '/', onClick: () => navigate('/') },
    { label: 'How it Works', href: '/', onClick: () => navigate('/') },
    { label: 'Pricing', href: '/', onClick: () => navigate('/') },
  ];

  const authNavItems = [
    { label: 'Feed', href: '/feed', onClick: () => navigate('/feed') },
    { label: 'Messages', href: '/chats', onClick: () => navigate('/chats') },
    { label: 'Connections', href: '/connections', onClick: () => navigate('/connections') },
    { label: 'Profile', href: '/profile', onClick: () => navigate('/profile') },
  ];

  // Fix for Full Screen Layout: Render FindWriter independently to bypass GlassLayout constraints
  if (location.pathname === '/writers') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <FindWriter />
      </Suspense>
    );
  }

  // Fix for Feed Layout: Render Feed independently to avoid double sidebar/header
  if (location.pathname === '/feed') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <ProtectedRoute>
          <Feed user={user} onChat={startChatFromWriter} />
        </ProtectedRoute>
      </Suspense>
    );
  }

  // Fix for Profile Layout
  if (location.pathname.startsWith('/profile')) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <ProtectedRoute>
          {user && <Profile user={user} />}
        </ProtectedRoute>
      </Suspense>
    );
  }

  // Fix for Connections Layout
  if (location.pathname === '/connections') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <ProtectedRoute>
          {user && <Connections user={user} />}
        </ProtectedRoute>
      </Suspense>
    );
  }

  // Fix for Chats Layout
  if (location.pathname.startsWith('/chats')) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<ChatListWrapper user={user} />} />
            <Route path="/:chatId" element={<ChatRoomWrapper user={user} />} />
          </Routes>
        </ProtectedRoute>
      </Suspense>
    );
  }

  return (
    <GlassLayout>
      {location.pathname !== '/' && location.pathname !== '/feed' && location.pathname !== '/auth' && location.pathname !== '/writers' && !location.pathname.startsWith('/profile') && location.pathname !== '/connections' && !location.pathname.startsWith('/chats') && (
        <GlassNavigation
          logo={
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user ? '/feed' : '/')}>
              <div className="size-10 rounded-xl overflow-hidden">
                <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
                AssignMate
              </span>
            </div>
          }
          items={user ? authNavItems : navItems}
          user={user ? { name: user.full_name || user.email } : undefined}
          onLogin={() => navigate('/auth')}
          onLogout={async () => {
            await logout();
            navigate('/');
          }}
        />
      )}

      <div className={`${location.pathname !== '/' && location.pathname !== '/auth' ? 'pt-20' : ''} min-h-screen`}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh] text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth onComplete={() => navigate('/feed')} />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed user={user} onChat={startChatFromWriter} />
              </ProtectedRoute>
            } />

            <Route path="/writers" element={<FindWriter />} />

            <Route path="/profile" element={
              <ProtectedRoute>
                {user && <Profile user={user} />}
              </ProtectedRoute>
            } />

            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                {user && <Profile user={user} />}
              </ProtectedRoute>
            } />

            <Route path="/connections" element={
              <ProtectedRoute>
                {user && <Connections user={user} />}
              </ProtectedRoute>
            } />

            <Route path="/chats" element={
              <ProtectedRoute>
                <ChatListWrapper user={user} />
              </ProtectedRoute>
            } />

            <Route path="/chats/:chatId" element={
              <ProtectedRoute>
                <ChatRoomWrapper user={user} />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verifications" element={<AdminVerifications />} />
              <Route path="chats" element={<AdminChats />} />
              <Route path="connections" element={<AdminConnections />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </GlassLayout>
  );
}

// Wrapper components to handle params
function ChatListWrapper({ user }: { user: any }) {
  return <ChatList user={user} />;
}

function ChatRoomWrapper({ user }: { user: any }) {
  const { chatId } = useParams();
  return <ChatRoom chatId={chatId!} user={user} />;
}