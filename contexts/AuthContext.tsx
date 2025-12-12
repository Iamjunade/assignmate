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

  // Simplified Sync: Just get the profile, don't overthink it
  const syncUser = async (fbUser: any) => {
    try {
      console.log("AuthContext: Syncing user...", fbUser.uid);
      const profile = await userApi.getProfile(fbUser.uid);

      if (profile) {
        console.log("AuthContext: Profile found");
        setUser({ ...profile, email: fbUser.email, is_incomplete: false });
        presence.init(fbUser.uid);
      } else {
        console.log("AuthContext: Profile missing, marking incomplete");
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          handle: fbUser.displayName || '',
          school: '',
          avatar_url: fbUser.photoURL,
          xp: 0,
          is_incomplete: true
        } as User);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      // Don't leave user in limbo - log them out if critical failure, or set basic state
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

  const register = async (email: string, pass: string, handle: string, school: string, is_writer: boolean) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        await userApi.createProfile(res.data.user.uid, { handle, school, email, is_writer });
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);
        await syncUser(res.data.user); // Just sync normally
        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        console.error("Registration Error:", error);
        return { error: { message: "Account created but profile setup failed. Please login." } };
      }
    }
    return res;
  };

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean) => {
    if (!user) return;

    try {
      console.log("Completing Signup...", { handle, school });
      
      // 1. Create Profile
      await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url,
        full_name: user.displayName || 'Student',
        is_writer
      });

      // 2. Update Local State Immediately (Optimistic UI)
      setUser(prev => prev ? { ...prev, handle, school, is_incomplete: false, is_writer } : null);
      
      // 3. Init Presence
      presence.init(user.id);

      // 4. Send Notification (Background)
      notificationService.sendWelcome(user.id, handle).catch(console.error);

    } catch (e: any) {
      console.error("Profile Completion Failed:", e);
      alert("Setup Failed: " + e.message);
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
