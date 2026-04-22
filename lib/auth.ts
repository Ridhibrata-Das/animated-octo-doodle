import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createUser, getUser, mergeGuestData } from '@/lib/firestore';
import { clearSessionCache } from '@/lib/ai/dedup';

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Create user doc if it doesn't exist, or migrate guest data
  const existing = await getUser(user.uid);
  if (!existing) {
    // Check for guest data to migrate
    const guestData = getGuestDataFromLocalStorage();
    await createUser(user.uid, {
      displayName: user.displayName ?? 'Learner',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      isGuest: false,
      ...guestData,
    });
    if (guestData) clearGuestDataFromLocalStorage();
  }

  return user;
}

export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signOut(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (uid) clearSessionCache(uid);
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Guest data migration helpers
const GUEST_DATA_KEY = 'eng-app-guest-progress';

export function saveGuestDataToLocalStorage(data: Record<string, unknown>): void {
  try { localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function getGuestDataFromLocalStorage(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearGuestDataFromLocalStorage(): void {
  try { localStorage.removeItem(GUEST_DATA_KEY); } catch { /* ignore */ }
}
