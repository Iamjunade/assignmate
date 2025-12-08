
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as firebaseAuth } from '../services/firebase';
import { userApi } from '../services/mockSupabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof firebaseAuth.login;
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
        let profile = await userApi.getProfile(fbUser.uid);
        
        if (!profile) {
            // New user via Google or direct login where profile creation failed.
            // DO NOT auto-create profile. Allow UI to prompt user for Handle/School.
            console.log("Profile missing, waiting for user completion...");
            setUser({ 
                id: fbUser.uid, 
                email: fbUser.email, 
                handle: fbUser.displayName || '', // Temporary
                school: '', // Temporary
                avatar_url: fbUser.photoURL,
                balance: 0, 
                xp: 0,
                is_incomplete: true // Flag to trigger "Complete Profile" flow
            } as User);
        } else {
            // Profile exists, log them in fully
            setUser({ ...profile, email: fbUser.email, is_incomplete: false });
        }
    } catch (e) {
        console.error("Sync Error:", e);
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

  // Wrapper for Register to ensure Handle/School/Role are passed to Profile Creation
  const register = async (email: string, pass: string, handle: string, school: string, is_writer: boolean) => {
      const res = await firebaseAuth.register(email, pass);
      if (res.error) return res;
      
      if (res.data?.user) {
          // Immediately create profile with specific data including role
          await userApi.createProfile(res.data.user.uid, { handle, school, email, is_writer });
          // Trigger sync manually to update state fast
          await syncUser(res.data.user);
          
          return { data: { ...res.data, session: true } }; // Return success structure
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

        // 2. Force a re-sync to fetch the newly created profile
        // We verify the profile exists before finishing to prevent UI flicker
        const profile = await userApi.getProfile(user.id);
        
        if (profile) {
            setUser({ ...profile, email: user.email, is_incomplete: false });
        } else {
            // Fallback if read fails immediately (rare replication lag)
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
