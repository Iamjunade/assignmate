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
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
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
    // Prevent double syncing
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
        // ✅ FIXED: Use 'null' instead of 'undefined' for avatar_url
        // Firestore crashes if you send 'undefined'
        const newProfile = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user_' + userId.substring(0, 6),
          school: 'Not Specified',
          avatar_url: fbUser.photoURL || null, // <--- THIS WAS THE CAUSE OF YOUR ERROR
          full_name: fbUser.displayName || 'Student',
          xp: 0,
          is_writer: false,
          is_incomplete: true
        };

        // Create the incomplete profile in DB so we don't sync 404s forever
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

  // ✅ FIXED: Added 'fullName' and 'bio' to the parameters so they are saved
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // ✅ Now we save the 'fullName' to the database
        const profile = await userApi.createProfile(res.data.user.uid, {
          handle,
          school,
          email,
          full_name: fullName, // <--- This was missing before!
          bio: bio || '',
          is_writer,
          is_incomplete: false
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

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string) => {
    if (!user) throw new Error("User not found.");

    try {
      // ✅ FIXED: Ensure avatar_url is explicitly null if undefined
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url || null, // <--- ALSO FIXED HERE
        full_name: user.full_name || 'Student',
        bio: bio || '',
        is_writer,
        is_incomplete: false
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
