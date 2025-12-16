import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth as firebaseAuth, presence } from '../services/firebase';
import { userApi } from '../services/firestoreService';
import { notificationService } from '../services/notificationService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  // ✅ FIXED: Updated signature to accept fullName and bio
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
  // ✅ FIXED: Updated signature to accept bio
  completeGoogleSignup: (handle: string, school: string, is_writer: boolean, bio?: string) => Promise<void>;
  loginAnonymously: () => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncingRef = useRef<string | null>(null);

  const syncUser = async (fbUser: any) => {
    const userId = fbUser.uid;
    if (syncingRef.current === userId) return;
    syncingRef.current = userId;

    try {
      const profile = await userApi.getProfile(userId);

      if (profile) {
        setUser({
          ...profile,
          email: fbUser.email || profile.email,
          is_incomplete: false
        } as User);
        presence.init(userId);
      } else {
        // ✅ FIXED: Set is_incomplete to TRUE for new Google users
        // This ensures they are redirected to /onboarding
        const newProfile = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user_' + userId.substring(0, 6),
          school: 'Not Specified',
          avatar_url: fbUser.photoURL || undefined,
          full_name: fbUser.displayName || 'Student',
          xp: 0,
          is_writer: false,
          is_incomplete: true // <--- Critical Fix
        };

        // We do NOT create the profile in DB yet to avoid partial data.
        // Or we create it as incomplete.
        await userApi.createProfile(userId, newProfile);

        setUser(newProfile as User);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      setUser(null);
    } finally {
      syncingRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        await syncUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseAuth.logout();
    setUser(null);
  };

  // ✅ FIXED: Register function now accepts fullName and bio
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        const profile = await userApi.createProfile(res.data.user.uid, {
          handle,
          school,
          email,
          full_name: fullName, // Saved
          bio: bio || '',      // Saved
          is_writer,
          is_incomplete: false // Manual setup is complete immediately
        });

        setUser({ ...profile, email: res.data.user.email || email, is_incomplete: false });
        presence.init(res.data.user.uid);
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);

        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        console.error("Registration Error:", error);
        return { error: { message: "Account created but profile setup failed." } };
      }
    }
    return res;
  };

  // ✅ FIXED: completeGoogleSignup now accepts bio
  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string) => {
    if (!user) throw new Error("User not found.");

    try {
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url,
        full_name: user.full_name || 'Student',
        bio: bio || '', // Saved
        is_writer,
        is_incomplete: false // Mark as complete!
      });

      setUser({ ...profile, email: user.email, is_incomplete: false });
      presence.init(user.id);
      notificationService.sendWelcome(user.id, handle).catch(console.error);

    } catch (e: any) {
      console.error("Profile Completion Failed:", e);
      throw e;
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await userApi.deleteProfile(user.id);
      const res = await firebaseAuth.deleteUser();
      if (res.error) throw res.error;
      setUser(null);
    } catch (error) { throw error; }
  };

  const login = async (email: string, password: string) => {
    return await firebaseAuth.login(email, password);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle: firebaseAuth.loginWithGoogle,
      register,
      completeGoogleSignup,
      loginAnonymously: firebaseAuth.loginAnonymously,
      logout,
      deleteAccount,
      refreshProfile: async () => { if (user) await syncUser({ uid: user.id, email: user.email }); },
      resetPassword: async (email) => { const res = await firebaseAuth.resetPassword(email); if (res.error) throw res.error; }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
