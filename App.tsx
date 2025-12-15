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
const FindWriter = lazy(() => import('./pages/FindWriter').then(module => ({ default: module.FindWriter })));

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
    { label: 'Profile', href: '/profile', onClick: () => navigate('/profile') },
  ];

  return (
    <GlassLayout>
      {location.pathname !== '/' && location.pathname !== '/feed' && location.pathname !== '/auth' && (
        <GlassNavigation
          logo={
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user ? '/feed' : '/')}>
              <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                <GraduationCap size={20} />
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
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminRoutesWrapper />
              </AdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </GlassLayout>
  );
}

// Wrapper components to handle split view logic or params
function ChatListWrapper({ user }: { user: any }) {
  const navigate = useNavigate();
  const isDesktop = window.innerWidth >= 768;

  if (isDesktop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-4 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
            <ChatList user={user} onSelect={(id: string) => navigate(`/chats/${id}`)} selectedId={null} />
          </div>
          <div className="col-span-8 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ChatList user={user} onSelect={(id: string) => navigate(`/chats/${id}`)} selectedId={null} />;
}

function ChatRoomWrapper({ user }: { user: any }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const isDesktop = window.innerWidth >= 768;

  if (isDesktop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-4 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
            <ChatList user={user} onSelect={(id: string) => navigate(`/chats/${id}`)} selectedId={chatId} />
          </div>
          <div className="col-span-8 h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
            <ChatRoom user={user} chatId={chatId} onBack={() => navigate('/chats')} />
          </div>
        </div>
      </div>
    );
  }

  return <ChatRoom user={user} chatId={chatId} onBack={() => navigate('/chats')} />;
}

function AdminRoutesWrapper() {
  const [adminPage, setAdminPage] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync state with URL if needed, or just use internal state for now as per original design
  // Ideally, admin routes should be sub-routes like /admin/users, /admin/chats etc.
  // For now, preserving the "single page app" feel of the admin panel within the /admin route

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