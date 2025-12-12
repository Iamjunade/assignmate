import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth, presence } from '../services/firebase';
import { userApi } from '../services/firestoreService';
import { notificationService } from '../services/notificationService';
import { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: typeof firebaseAuth.loginWithGoogle;
  register: (email: string, pass: string, handle: string, school: string, is_writer: boolean) => Promise<any>;
  completeGoogleSignup: (handle: string, school: string, is_writer: boolean) => Promise<void>;
  loginAnonymously: typeof firebaseAuth.loginAnonymously;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync logic: Takes a Firebase User, finds/creates Supabase Profile
  const syncUser = async (fbUser: any) => {
    try {
      // DEBUG: Alert to confirm sync is starting
      // alert(`Syncing user: ${fbUser.email}`);
      
      let profile = await userApi.getProfile(fbUser.uid);

      if (!profile) {
        // New user via Google or direct login where profile creation failed.
        console.log("Profile missing, waiting for user completion...");
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          handle: fbUser.displayName || '',
          school: '',
          avatar_url: fbUser.photoURL,
          xp: 0,
          is_incomplete: true
        } as User);
      } else {
        // Profile exists, log them in fully
        setUser({ ...profile, email: fbUser.email, is_incomplete: false });
        // Initialize Presence
        presence.init(fbUser.uid);
      }
    } catch (e: any) {
      console.error("Sync Error:", e);
      // CRITICAL DEBUG: Show alert on sync failure
      if (typeof window !== 'undefined') {
          alert(`Login Sync Failed: ${e.message}\n\nCheck your internet or Firestore rules.`);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      // CRITICAL DEBUG: Check if Auth State Change is even firing
      if (typeof window !== 'undefined') alert(`Auth State Changed: ${firebaseUser ? 'LOGGED IN (' + firebaseUser.email + ')' : 'LOGGED OUT'}`);
      
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

  // Wrapper for Register to ensure Handle/School/Role are passed to Profile Creation
  const register = async (email: string, pass: string, handle: string, school: string, is_writer: boolean) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // Immediately create profile with specific data including role
        await userApi.createProfile(res.data.user.uid, { handle, school, email, is_writer });

        // Send Welcome Notification
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);

        // Trigger sync manually to update state fast
        await syncUser(res.data.user);

        return { data: { ...res.data, session: true } }; // Return success structure
      } catch (error: any) {
        console.error("Registration Error (Profile Creation):", error);
        // CRITICAL DEBUG: Alert the user on the live site
        if (typeof window !== 'undefined') {
             alert(`Registration Failed: ${error.message}\n\nCheck console for details.`);
        }
        return { error: { message: error.message || "Failed to create profile" } };
      }
    }
    return res;
  };

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean) => {
    if (!user) return;

    try {
      // 1. Create the profile in Supabase
      await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url,
        is_writer
      });

      // Send Welcome Notification
      notificationService.sendWelcome(user.id, handle).catch(console.error);

      // 2. Force a re-sync to fetch the newly created profile
      const profile = await userApi.getProfile(user.id);

      if (profile) {
        setUser({ ...profile, email: user.email, is_incomplete: false });
        presence.init(user.id);
      } else {
        setUser(prev => prev ? { ...prev, handle, school, is_incomplete: false } : null);
      }

    } catch (e) {
      console.error("Profile Completion Failed", e);
      throw e;
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      // 1. Delete DB Profile
      await userApi.deleteProfile(user.id);

      // 2. Delete Auth User
      const res = await firebaseAuth.deleteUser();
      if (res.error) throw res.error;

      // 3. Clear state
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const res = await firebaseAuth.resetPassword(email);
    if (res.error) throw res.error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: firebaseAuth.login,
      loginWithGoogle: firebaseAuth.loginWithGoogle,
      register,
      completeGoogleSignup,
      loginAnonymously: firebaseAuth.loginAnonymously,
      logout,
      deleteAccount,
      refreshProfile: async () => { if (user) await syncUser({ uid: user.id, email: user.email }); },
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
