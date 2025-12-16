import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth, presence } from '../services/firebase';
import { userApi } from '../services/firestoreService';
import { notificationService } from '../services/notificationService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  // ✅ FIX 1: Updated signature to include fullName and bio
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
  // ✅ FIX 2: Updated signature to include bio
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

  // Sync user profile from Firestore
  const syncUser = async (fbUser: any) => {
    const userId = fbUser.uid;
    try {
      const profile = await userApi.getProfile(userId);
      if (profile) {
        setUser({ ...profile, email: fbUser.email || profile.email, is_incomplete: false } as User);
        presence.init(userId);
      } else {
        // Only set basic info for Google first-timers, marked as incomplete
        const newProfile = {
          id: userId,
          email: fbUser.email || '',
          full_name: fbUser.displayName || 'Student',
          avatar_url: fbUser.photoURL || undefined,
          is_incomplete: true // ✅ Critical: Mark as incomplete so they go to Onboarding
        };
        setUser(newProfile as User);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      setUser(null);
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

  // ✅ FIX 3: Pass fullName and bio to Firestore
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        await userApi.createProfile(res.data.user.uid, {
          email,
          full_name: fullName, // Save Name
          handle,
          school,
          is_writer,
          bio: bio || '',      // Save Bio
          is_incomplete: false
        });
        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        return { error: { message: "Account created but profile setup failed." } };
      }
    }
    return res;
  };

  // ✅ FIX 4: Pass bio to Firestore for Google users
  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string) => {
    if (!user) throw new Error("User not found.");
    try {
      const profile = await userApi.createProfile(user.id, {
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        handle,
        school,
        is_writer,
        bio: bio || '', // Save Bio
        is_incomplete: false
      });
      setUser({ ...profile, email: user.email, is_incomplete: false } as User);
      presence.init(user.id);
    } catch (e: any) { throw e; }
  };

  const login = async (email: string, password: string) => {
    return await firebaseAuth.login(email, password);
  };

  // (Include other existing functions: loginWithGoogle, deleteAccount, etc.)
  const loginWithGoogle = firebaseAuth.loginWithGoogle;
  const loginAnonymously = firebaseAuth.loginAnonymously;

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await userApi.deleteProfile(user.id);
      const res = await firebaseAuth.deleteUser();
      if (res.error) throw res.error;
      setUser(null);
    } catch (error) { throw error; }
  };

  const resetPassword = async (email: string) => {
    const res = await firebaseAuth.resetPassword(email);
    if (res.error) throw res.error;
  };

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
