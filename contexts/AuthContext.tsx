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
  // ✅ FIX 1: Updated signature to accept fullName and bio
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
  // ✅ FIX 2: Updated signature to accept bio
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

  // Sync user profile from Firestore
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
        // ✅ FIX 3: Handle undefined photoURL for Google Users
        const newProfile = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user_' + userId.substring(0, 6),
          school: 'Not Specified',
          avatar_url: fbUser.photoURL || null, // FIX: Use null, not undefined
          full_name: fbUser.displayName || 'Student',
          xp: 0,
          is_writer: false,
          is_incomplete: true // Forces redirect to /onboarding
        };

        // Create incomplete profile in DB
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

  // ✅ FIX 4: Register function now captures fullName and bio
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        const profile = await userApi.createProfile(res.data.user.uid, {
          handle,
          school,
          email,
          full_name: fullName, // ✅ Correctly saving Name
          bio: bio || '',      // ✅ Correctly saving Bio
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

  // ✅ FIX 5: Complete Google Signup captures bio
  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string) => {
    if (!user) throw new Error("User not found.");

    try {
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url || null,
        full_name: user.full_name || 'Student',
        bio: bio || '', // ✅ Correctly saving Bio
        is_writer,
        is_incomplete: false // Mark as complete
      });

      setUser({ ...profile, email: user.email, is_incomplete: false });
      presence.init(user.id);
      notificationService.sendWelcome(user.id, handle).catch(console.error);

    } catch (e: any) {
      console.error("Profile Completion Failed:", e);
      throw e;
    }
  };

  const login = async (email: string, password: string) => {
    return await firebaseAuth.login(email, password);
  };
  const loginWithGoogle = firebaseAuth.loginWithGoogle;
  const loginAnonymously = firebaseAuth.loginAnonymously;
  const deleteAccount = async () => { if (!user) return; try { await userApi.deleteProfile(user.id); const res = await firebaseAuth.deleteUser(); if (res.error) throw res.error; setUser(null); } catch (error) { throw error; } };
  const resetPassword = async (email: string) => { const res = await firebaseAuth.resetPassword(email); if (res.error) throw res.error; };

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginWithGoogle, register, completeGoogleSignup,
      loginAnonymously, logout, deleteAccount, resetPassword,
      refreshProfile: async () => { if (user) await syncUser({ uid: user.id, email: user.email }); }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
