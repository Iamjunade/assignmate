import { sendEmailVerification } from 'firebase/auth';
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
  // ✅ FIXED: Now accepts 7 arguments including fullName and bio
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
  completeGoogleSignup: (handle: string, school: string, is_writer: boolean, bio?: string, fullName?: string, aiProfile?: any) => Promise<void>;
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
  const skipNextSyncRef = useRef<boolean>(false); // Flag to prevent race condition after registration
  const userJustSetRef = useRef<boolean>(false); // Flag to track if user was just set by register/completeSignup


  // Sync user profile from Firestore
  const syncUser = async (fbUser: any) => {
    const userId = fbUser.uid;

    // Skip sync if register() or completeGoogleSignup() just set the user
    // This prevents the race condition where onAuthStateChanged fires after we've already set the user
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      // User was already set synchronously by register/completeSignup
      // Just ensure loading is false and exit
      if (userJustSetRef.current) {
        userJustSetRef.current = false;
        setLoading(false);
        return;
      }
    }

    if (syncingRef.current === userId) return;
    syncingRef.current = userId;

    try {
      const profile = await userApi.getProfile(userId);

      if (profile) {
        // Cast profile to User type for proper property access
        const typedProfile = profile as User;
        setUser({
          ...typedProfile,
          email: fbUser.email || typedProfile.email || '',
          // Use the actual value from Firestore, don't override!
          is_incomplete: typedProfile.is_incomplete ?? false
        } as User);
        presence.init(userId);
      } else {
        // ✅ ISSUE 3 FIX: Don't use invalid defaults like 'Student' or 'Not Specified'
        // Use empty strings which will correctly trigger the onboarding flow
        // The isProfileComplete() helper will properly detect these as incomplete
        const newProfile: Partial<User> = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user_' + userId.substring(0, 6),
          school: '', // Empty string - will be set in onboarding
          avatar_url: fbUser.photoURL || null,
          full_name: fbUser.displayName || '', // Empty string instead of 'Student'
          xp: 0,
          is_writer: false,
          is_incomplete: true // This forces onboarding
        };

        // Create the partial profile so we don't get 404s
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

  // ✅ FIXED: register function now SAVES the name and bio
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    const res = await firebaseAuth.register(email, pass);
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // Create full profile immediately
        const profile = await userApi.createProfile(res.data.user.uid, {
          handle,
          school,
          email,
          full_name: fullName, // <--- SAVED HERE
          bio: bio || '',      // <--- SAVED HERE
          is_writer,
          is_incomplete: false,
          avatar_url: null
        });

        // CRITICAL: Set user state FIRST, then set skip flags
        // This prevents race condition where onAuthStateChanged fires between flag set and user set
        const completeProfile = { ...profile, email: res.data.user.email || email, is_incomplete: false } as User;
        setUser(completeProfile);

        // Now set flags to prevent syncUser from overwriting our freshly set user
        userJustSetRef.current = true;
        skipNextSyncRef.current = true;

        presence.init(res.data.user.uid);
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);

        // ✅ Native Firebase Email Verification
        // Await ensures email is sent BEFORE navigating to onboarding
        try {
          await sendEmailVerification(res.data.user);
          console.log("Verification email sent (Native)");
        } catch (err) {
          console.error("Failed to send verification email:", err);
          // Don't block registration if email fails, but log it
        }

        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        console.error("Registration Error - Profile creation failed:", error);

        // ✅ ISSUE 7 FIX: Rollback - Delete the Firebase Auth user to prevent orphaned accounts
        // This ensures consistency between Auth and Firestore
        try {
          await firebaseAuth.deleteUser();
          console.log("Rollback: Firebase Auth user deleted after profile creation failure");
        } catch (deleteError) {
          console.error("Rollback failed - orphaned Auth user may exist:", deleteError);
        }

        return { error: { message: "Registration failed. Please try again." } };
      }
    }
    return res;
  };

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string, fullName?: string, aiProfile?: any) => {
    if (!user) throw new Error("User not found.");

    try {
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url || null,
        full_name: fullName || user.full_name || 'Student',
        bio: bio || '',
        is_writer,
        is_incomplete: false,
        ai_profile: aiProfile // Pass AI data
      });

      setUser({ ...profile, email: user.email, is_incomplete: false } as User);
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
  const deleteAccount = async () => {
    if (!user) return;

    try {
      await userApi.deleteProfile(user.id);
      const res = await firebaseAuth.deleteUser();

      if (res.error) {
        throw res.error;
      }

      setUser(null);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("For security, please log out and log back in before deleting your account.");
      } else {
        console.error("Delete Account Error:", error);
        throw error;
      }
    }
  };
  const resetPassword = async (email: string) => { const res = await firebaseAuth.resetPassword(email); if (res.error) throw res.error; };

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginWithGoogle, register, completeGoogleSignup,
      loginAnonymously, logout, deleteAccount, resetPassword,
      // ✅ ISSUE 13 FIX: Improved refreshProfile with force refresh option
      refreshProfile: async () => {
        if (!user) return;
        // Reset sync lock to force a refresh (useful when user data is stale)
        syncingRef.current = null;
        await syncUser({ uid: user.id, email: user.email });
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
