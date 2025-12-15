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
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean) => Promise<any>;
  completeGoogleSignup: (handle: string, school: string, is_writer: boolean) => Promise<void>;
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
        // Profile exists - set user as complete
        setUser({
          ...profile,
          email: fbUser.email || profile.email,
          is_incomplete: false
        } as User);
        presence.init(userId);
      } else {
        // Profile missing - auto-complete for Google signups or legacy users
        const newProfile = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || fbUser.email?.split('@')[0] || 'user_' + userId.substring(0, 6),
          school: 'Not Specified',
          avatar_url: fbUser.photoURL || undefined,
          full_name: fbUser.displayName || 'Student',
          xp: 0,
          is_writer: false,
          is_incomplete: false
        };

        // Create the profile immediately
        await userApi.createProfile(userId, newProfile);

        setUser(newProfile as User);
        presence.init(userId);
        notificationService.sendWelcome(userId, newProfile.handle).catch(console.error);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      // Fallback: If Firestore fails, still log the user in so they aren't stuck
      setUser({
        id: userId,
        email: fbUser.email || '',
        handle: 'User',
        school: 'Unknown',
        xp: 0,
        is_writer: false,
        is_incomplete: false
      } as User);
    }
  };

  // Listen to Firebase auth state changes - THIS IS THE SINGLE SOURCE OF TRUTH
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

  // Register new user
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // Create user profile in Firestore immediately
        await userApi.createProfile(res.data.user.uid, {
          handle,
          full_name: fullName,
          school,
          email,
          is_writer
        });

        // We do NOT manually set user here to avoid conflicts with the listener
        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        console.error("Registration Error:", error);
        return { error: { message: "Account created but profile setup failed." } };
      }
    }
    return res;
  };

  const login = async (email: string, password: string) => {
    // Simply call firebase login. The useEffect listener above handles the state update.
    return await firebaseAuth.login(email, password);
  };

  // Complete Google signup by creating profile
  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean) => {
    if (!user) throw new Error("User not found.");
    try {
      const profile = await userApi.createProfile(user.id, {
        handle, school, email: user.email, avatar_url: user.avatar_url, full_name: user.full_name, is_writer
      });
      setUser({ ...profile, email: user.email, is_incomplete: false });
      presence.init(user.id);
    } catch (e: any) { throw e; }
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

  const resetPassword = async (email: string) => {
    const res = await firebaseAuth.resetPassword(email);
    if (res.error) throw res.error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login, // Updated simple login
      loginWithGoogle: firebaseAuth.loginWithGoogle,
      register, // Updated register
      completeGoogleSignup,
      loginAnonymously: firebaseAuth.loginAnonymously,
      logout,
      deleteAccount,
      refreshProfile: async () => {
        if (user) await syncUser({ uid: user.id, email: user.email });
      },
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
