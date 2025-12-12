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
  register: (email: string, pass: string, handle: string, school: string, is_writer: boolean) => Promise<any>;
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
  const syncingRef = useRef<string | null>(null); // Track which user is being synced

  // Sync user profile from Firestore
  const syncUser = async (fbUser: any) => {
    const userId = fbUser.uid;
    
    // Prevent concurrent syncs for the same user
    if (syncingRef.current === userId) {
      return;
    }
    
    syncingRef.current = userId;
    
    try {
      const profile = await userApi.getProfile(userId);

      if (profile) {
        // Profile exists - set user as complete
        setUser({ 
          ...profile, 
          email: fbUser.email || profile.email, 
          is_incomplete: false 
        });
        presence.init(userId);
      } else {
        // Profile missing - mark as incomplete (for Google signups)
        setUser({
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName || '',
          school: '',
          avatar_url: fbUser.photoURL || undefined,
          xp: 0,
          is_incomplete: true
        } as User);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      setUser(null);
    } finally {
      syncingRef.current = null;
    }
  };

  // Listen to Firebase auth state changes
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

  // Register new user with email/password
  const register = async (email: string, pass: string, handle: string, school: string, is_writer: boolean) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // Create user profile in Firestore
        const profile = await userApi.createProfile(res.data.user.uid, { 
          handle, 
          school, 
          email, 
          is_writer 
        });
        
        // Set user state immediately to avoid race conditions
        setUser({ 
          ...profile, 
          email: res.data.user.email || email, 
          is_incomplete: false 
        });
        
        // Initialize presence and send welcome notification
        presence.init(res.data.user.uid);
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);
        
        // Sync to ensure consistency
        await syncUser(res.data.user);
        
        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        console.error("Registration Error:", error);
        return { error: { message: "Account created but profile setup failed. Please login." } };
      }
    }
    return res;
  };

  // Complete Google signup by creating profile
  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean) => {
    if (!user) {
      throw new Error("User not found. Please try logging in again.");
    }

    try {
      // Create profile in Firestore
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url,
        full_name: user.full_name || 'Student',
        is_writer
      });

      // Update user state immediately
      setUser({ 
        ...profile, 
        email: user.email, 
        is_incomplete: false 
      });
      
      // Initialize presence and send welcome notification
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
      refreshProfile: async () => { 
        if (user) {
          await syncUser({ uid: user.id, email: user.email });
        }
      },
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
