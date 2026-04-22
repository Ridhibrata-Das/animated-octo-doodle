import { createHash } from 'crypto';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** Generate a SHA-256 hash of question content for deduplication */
export function hashQuestion(content: string): string {
  return createHash('sha256').update(content.trim().toLowerCase()).digest('hex').slice(0, 16);
}

// Session-level in-memory cache (fast local dedup before Firestore)
const sessionCache = new Map<string, Set<string>>();

function sessionKey(uid: string, gameMode: string): string {
  return `${uid}:${gameMode}`;
}

/** Check if a question has already been seen by this user in this game mode */
export async function isDuplicate(uid: string, gameMode: string, hash: string): Promise<boolean> {
  const key = sessionKey(uid, gameMode);

  // Fast path: check in-memory session cache
  if (sessionCache.get(key)?.has(hash)) return true;

  // Slow path: check Firestore
  try {
    const ref = doc(db, `users/${uid}/dedupHashes/${hash}`);
    const snap = await getDoc(ref);
    return snap.exists() && (snap.data()?.gameMode === gameMode || snap.data()?.gameMode === 'all');
  } catch {
    return false; // On error, allow the question through
  }
}

/** Mark a question as seen (write to Firestore + update session cache) */
export async function markSeen(uid: string, gameMode: string, hash: string): Promise<void> {
  // Update session cache
  const key = sessionKey(uid, gameMode);
  if (!sessionCache.has(key)) sessionCache.set(key, new Set());
  sessionCache.get(key)!.add(hash);

  // Write to Firestore (non-blocking)
  try {
    const ref = doc(db, `users/${uid}/dedupHashes/${hash}`);
    await setDoc(ref, { gameMode, createdAt: serverTimestamp() });
  } catch {
    // Non-critical: session cache already prevents repeats this session
  }
}

/** Clear session cache (call on sign-out or new session) */
export function clearSessionCache(uid?: string): void {
  if (uid) {
    for (const key of sessionCache.keys()) {
      if (key.startsWith(`${uid}:`)) sessionCache.delete(key);
    }
  } else {
    sessionCache.clear();
  }
}
