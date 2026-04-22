'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { onAuthChange } from '@/lib/auth';
import { getUser, createUser, updateUser, subscribeToUser, type UserProfile } from '@/lib/firestore';
import { signInWithGoogle, signInAsGuest, signOut as authSignOut } from '@/lib/auth';
import type { User } from 'firebase/auth';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeProfileRef = useRef<(() => void) | null>(null);

  const setupProfileSubscription = useCallback((uid: string) => {
    unsubscribeProfileRef.current?.();
    unsubscribeProfileRef.current = subscribeToUser(uid, setProfile);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Set cookie so middleware knows about auth status
        document.cookie = `eng-app-auth=true; path=/; max-age=86400; SameSite=Lax`;
        
        // Get or create Firestore profile
        let userProfile = await getUser(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await createUser(firebaseUser.uid, {
            displayName: firebaseUser.displayName ?? 'Learner',
            email: firebaseUser.email ?? '',
            photoURL: firebaseUser.photoURL ?? '',
            isGuest: firebaseUser.isAnonymous,
          });
        }
        setProfile(userProfile);
        setupProfileSubscription(firebaseUser.uid);
      } else {
        document.cookie = `eng-app-auth=; path=/; max-age=0; SameSite=Lax`;
        unsubscribeProfileRef.current?.();
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfileRef.current?.();
    };
  }, [setupProfileSubscription]);

  const handleSignInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const handleSignInGuest = useCallback(async () => {
    await signInAsGuest();
  }, []);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await getUser(user.uid);
      if (p) setProfile(p);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isGuest: user?.isAnonymous ?? false,
      signInWithGoogle: handleSignInGoogle,
      signInAsGuest: handleSignInGuest,
      signOut: handleSignOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
