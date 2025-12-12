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
  const [syncing, setSyncing] = useState(false); // Prevent concurrent syncs

  // Simplified Sync: Just get the profile, don't overthink it
  const syncUser = async (fbUser: any, retryCount = 0) => {
    // Prevent concurrent syncs for the same user
    if (syncing && user?.id === fbUser.uid) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:29',message:'syncUser skipped - already syncing',data:{uid:fbUser.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    setSyncing(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:35',message:'syncUser entry',data:{uid:fbUser.uid,email:fbUser.email,retryCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log("AuthContext: Syncing user...", fbUser.uid);
      const profile = await userApi.getProfile(fbUser.uid);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:31',message:'getProfile returned',data:{hasProfile:!!profile,isIncomplete:profile?.is_incomplete},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (profile) {
        console.log("AuthContext: Profile found");
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:34',message:'setting user from profile',data:{handle:profile.handle,isIncomplete:profile.is_incomplete},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setUser({ ...profile, email: fbUser.email, is_incomplete: false });
        presence.init(fbUser.uid);
      } else {
        // If profile is missing, retry once after a short delay (in case it's still being created)
        if (retryCount === 0) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:47',message:'profile missing, retrying once',data:{uid:fbUser.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return syncUser(fbUser, 1); // Retry once
        }
        console.log("AuthContext: Profile missing, marking incomplete");
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:51',message:'profile missing after retry, setting incomplete',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:63',message:'syncUser exception',data:{errorMessage:e.message,errorStack:e.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error("AuthContext: Sync Failed", e);
      // Don't leave user in limbo - log them out if critical failure, or set basic state
      setUser(null); 
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:57',message:'onAuthStateChange fired',data:{hasUser:!!firebaseUser,uid:firebaseUser?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:73',message:'register entry',data:{email,handle,school,is_writer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const res = await firebaseAuth.register(email, pass);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:74',message:'firebaseAuth.register returned',data:{hasError:!!res.error,hasUser:!!res.data?.user,uid:res.data?.user?.uid,errorMsg:res.error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (res.error) return res;

    if (res.data?.user) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:79',message:'calling createProfile',data:{uid:res.data.user.uid,handle,school},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const profile = await userApi.createProfile(res.data.user.uid, { handle, school, email, is_writer });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:79',message:'createProfile success',data:{profileHandle:profile.handle},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Directly set user state to avoid race condition with onAuthStateChange
        // This ensures the user is marked as complete immediately after profile creation
        setUser({ 
          ...profile, 
          email: res.data.user.email || email, 
          is_incomplete: false 
        });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:108',message:'user state set directly after createProfile',data:{handle:profile.handle,isIncomplete:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
        presence.init(res.data.user.uid);
        notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);
        
        // Also sync to ensure consistency, but state is already set above
        await syncUser(res.data.user);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:115',message:'syncUser completed after direct state set',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return { data: { ...res.data, session: true } };
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:119',message:'register exception',data:{errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error("Registration Error:", error);
        return { error: { message: "Account created but profile setup failed. Please login." } };
      }
    }
    return res;
  };

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:131',message:'completeGoogleSignup entry',data:{hasUser:!!user,userId:user?.id,handle,school,is_writer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (!user) return;

    try {
      console.log("Completing Signup...", { handle, school });
      
      // 1. Create Profile
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:138',message:'calling createProfile for Google',data:{userId:user.id,handle,school},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url,
        full_name: user.full_name || user.displayName || 'Student',
        is_writer
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:138',message:'createProfile success for Google',data:{profileHandle:profile.handle},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      // 2. Update Local State with full profile data (not just partial update)
      setUser({ 
        ...profile, 
        email: user.email, 
        is_incomplete: false 
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:150',message:'state updated with full profile after createProfile',data:{handle:profile.handle,isIncomplete:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // 3. Init Presence
      presence.init(user.id);

      // 4. Send Notification (Background)
      notificationService.sendWelcome(user.id, handle).catch(console.error);

    } catch (e: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/29f02d4f-4ba7-4760-b5a9-e993ea521030',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:158',message:'completeGoogleSignup exception',data:{errorMessage:e.message,errorStack:e.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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
