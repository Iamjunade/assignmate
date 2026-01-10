import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { dbService as db } from './services/firestoreService';
import { notifications, fcm } from './services/firebase';
import { GlassLayout } from './components/layout/GlassLayout';
import { Loader2, GraduationCap, MessageSquare } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { User } from './types';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';

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
const Projects = lazy(() => import('./pages/Projects').then(module => ({ default: module.Projects })));
const AdminVerifications = lazy(() => import('./admin/pages/AdminVerifications').then(module => ({ default: module.AdminVerifications })));
const PitchDeck = lazy(() => import('./pages/PitchDeck').then(module => ({ default: module.PitchDeck })));
const GDC = lazy(() => import('./pages/GDC').then(module => ({ default: module.GDC })));
const Documentation = lazy(() => import('./pages/Documentation').then(module => ({ default: module.Documentation })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines').then(module => ({ default: module.CommunityGuidelines })));
const Community = lazy(() => import('./pages/Community').then(module => ({ default: module.Community })));

export default function AppWrapper() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <ScrollToTop />
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </Router>
    </GlobalErrorBoundary>
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

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-slate-400">
          <Loader2 className="animate-spin" />
        </div>
      }>
        <Routes>
          {/* --- Dashboard Routes (Self-contained Layouts) --- */}
          <Route path="/feed" element={
            <ProtectedRoute>
              <Feed user={user} onChat={startChatFromWriter} />
            </ProtectedRoute>
          } />

            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
  
            <Route path="/mentors" element={<FindWriter />} />
  
            <Route path="/projects" element={

            <ProtectedRoute>
              {user && <Projects user={user} />}
            </ProtectedRoute>
          } />

          <Route path="/connections" element={
            <ProtectedRoute>
              {user && <Connections user={user} />}
            </ProtectedRoute>
          } />

          <Route path="/chats/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<ChatListWrapper user={user} />} />
                <Route path="/:chatId" element={<ChatRoomWrapper user={user} />} />
              </Routes>
            </ProtectedRoute>
          } />

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

          {/* --- Admin Routes --- */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="verifications" element={<AdminVerifications />} />
          </Route>

          {/* --- Pitch Deck --- */}
          <Route path="/pitch" element={<PitchDeck />} />

          {/* --- GDC Presentation --- */}
          <Route path="/gdc" element={<GDC />} />

          {/* --- Documentation --- */}
          <Route path="/docs" element={<Documentation />} />
          <Route path="/docs/:section" element={<Documentation />} />

          {/* --- Legal Pages --- */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />

          {/* --- Public Routes (Glass Layout) --- */}
          <Route element={
            <GlassLayout>
              <Outlet />
            </GlassLayout>
          }>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth onComplete={() => navigate('/feed')} />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

        </Routes>
      </Suspense>
    </div>
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