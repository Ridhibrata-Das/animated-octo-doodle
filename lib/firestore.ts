import {
  doc, getDoc, setDoc, updateDoc, collection,
  addDoc, serverTimestamp, query, orderBy,
  limit, getDocs, onSnapshot, runTransaction, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateLevel } from '@/lib/xp-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isGuest: boolean;
  level: number;
  xp: number;
  totalXP: number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  badges: string[];
  gamesPlayed: number;
  preferredTopics: string[];
  preferredLanguage: string;
  gems: number;
  inventory: string[];
  activePersona: string | null;
  guildId: string | null;
  premiumUntil?: string | null;
  energy?: number;
  maxEnergy?: number;
  lastEnergyUpdate?: string | null;
  playedGames?: Record<string, number>;
  isOnboarded?: boolean;
  profession?: string;
  age?: number;
  learningMotive?: string;
  username?: string;
  subscriptionStatus?: 'none' | 'pending' | 'active';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SubscriptionRequest {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  weeksRequested: number;
  transactionId?: string;
  amountPaid?: number;
  notified?: boolean;
  createdAt: any;
  processedAt?: any;
}

export interface GameSession {
  gameMode: string;
  score: number;
  xpEarned: number;
  cefrLevel: string;
  questionsAnswered: number;
  correctAnswers: number;
  durationSeconds: number;
  topic?: string;
  timestamp?: unknown;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  totalXP: number;
  weeklyXP: number;
  level: number;
  cefrLevel: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  photoURL: string;
  memberCount: number;
  level: number;
  totalXP: number;
  members: string[]; // array of UIDs
  ownerId: string;
  createdAt?: unknown;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  content: string;
  type: 'achievement' | 'status' | 'guild_announcement' | 'game_score';
  likes: string[]; // array of UIDs
  commentCount: number;
  createdAt?: unknown;
  metadata?: any;
}

// ─── User CRUD ────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null;
}

export async function createUser(
  uid: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const defaults: Omit<UserProfile, 'uid'> = {
    displayName: 'Learner',
    email: '',
    photoURL: '',
    isGuest: false,
    level: 1,
    xp: 0,
    totalXP: 0,
    cefrLevel: 'A1',
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    badges: [],
    gamesPlayed: 0,
    preferredTopics: [],
    preferredLanguage: 'en',
    gems: 0,
    inventory: [],
    activePersona: null,
    guildId: null,
  };
  const profile = { ...defaults, ...data };
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { uid, ...profile };
}

export async function updateUser(uid: string, partial: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...partial,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUser(uid: string, callback: (profile: UserProfile) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback({ uid, ...snap.data() } as UserProfile);
  });
}

export async function purchaseItem(uid: string, itemId: string, cost: number, isConsumable: boolean): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', uid);
    
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) throw new Error("User does not exist");
      
      const data = snap.data() as UserProfile;
      const currentGems = data.gems || 0;
      
      if (currentGems < cost) throw new Error("Insufficient gems");
      if (!isConsumable && (data.inventory || []).includes(itemId)) throw new Error("Already owned");

      const newInventory = isConsumable ? (data.inventory || []) : [...(data.inventory || []), itemId];
      
      transaction.update(userRef, {
        gems: currentGems - cost,
        inventory: newInventory,
        updatedAt: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error("Purchase failed:", error);
    return false;
  }
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function logSession(uid: string, session: GameSession): Promise<void> {
  await addDoc(collection(db, `users/${uid}/sessions`), {
    ...session,
    timestamp: serverTimestamp(),
  });
}

export async function createSubscriptionRequest(
  uid: string, 
  email: string, 
  displayName: string,
  transactionId: string,
  amountPaid: number
): Promise<void> {
  try {
    await addDoc(collection(db, 'subscription_requests'), {
      uid,
      email,
      displayName,
      transactionId,
      amountPaid,
      status: 'pending',
      weeksRequested: 1,
      createdAt: serverTimestamp(),
    });
    
    await updateDoc(doc(db, 'users', uid), {
      subscriptionStatus: 'pending'
    });
  } catch (error: any) {
    console.error("Subscription request error:", error);
    if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
      throw new Error("Firestore client state error. Please refresh the page and try again.");
    }
    throw error;
  }
}

export async function getRecentSessions(uid: string, count = 50): Promise<GameSession[]> {
  const q = query(
    collection(db, `users/${uid}/sessions`),
    orderBy('timestamp', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as GameSession);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function updateLeaderboard(uid: string, profile: UserProfile, weeklyXP: number): Promise<void> {
  await setDoc(doc(db, 'leaderboard', uid), {
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    totalXP: profile.totalXP,
    weeklyXP,
    level: profile.level,
    cefrLevel: profile.cefrLevel,
    updatedAt: serverTimestamp(),
  });
}

export async function getTopLeaderboard(count = 20): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('totalXP', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as LeaderboardEntry));
}

export function subscribeToLeaderboard(callback: (entries: LeaderboardEntry[]) => void): Unsubscribe {
  const q = query(collection(db, 'leaderboard'), orderBy('totalXP', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ uid: d.id, ...d.data() } as LeaderboardEntry)));
  });
}

// ─── Guest data migration ─────────────────────────────────────────────────────

export async function mergeGuestData(uid: string, guestData: Record<string, unknown>): Promise<void> {
  const existing = await getUser(uid);
  if (!existing) return;
  // Only migrate XP/streak if guest had more
  const guestXP = (guestData.totalXP as number) ?? 0;
  if (guestXP > existing.totalXP) {
    const { level, cefrLevel } = calculateLevel(guestXP);
    await updateUser(uid, { totalXP: guestXP, xp: guestXP, level, cefrLevel });
  }
}

// ─── Guilds ───────────────────────────────────────────────────────────────────

export async function createGuild(ownerId: string, name: string, description: string): Promise<string> {
  const guildRef = await addDoc(collection(db, 'guilds'), {
    name,
    description,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
    memberCount: 1,
    level: 1,
    totalXP: 0,
    members: [ownerId],
    ownerId,
    createdAt: serverTimestamp(),
  });
  
  await updateUser(ownerId, { guildId: guildRef.id });
  return guildRef.id;
}

export async function joinGuild(uid: string, guildId: string): Promise<void> {
  const guildRef = doc(db, 'guilds', guildId);
  const snap = await getDoc(guildRef);
  if (!snap.exists()) return;
  
  const data = snap.data() as Guild;
  if (data.members.includes(uid)) return;
  
  await updateDoc(guildRef, {
    members: [...data.members, uid],
    memberCount: data.memberCount + 1,
  });
  
  await updateUser(uid, { guildId });
}

export async function getGuild(guildId: string): Promise<Guild | null> {
  const snap = await getDoc(doc(db, 'guilds', guildId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Guild) : null;
}

export async function getAllGuilds(limitCount = 10): Promise<Guild[]> {
  const q = query(collection(db, 'guilds'), orderBy('totalXP', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Guild));
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(author: UserProfile, content: string, type: Post['type'], metadata?: any): Promise<void> {
  await addDoc(collection(db, 'posts'), {
    authorId: author.uid,
    authorName: author.displayName,
    authorPhotoURL: author.photoURL,
    content,
    type,
    likes: [],
    commentCount: 0,
    metadata: metadata || {},
    createdAt: serverTimestamp(),
  });
}

export async function getCommunityFeed(limitCount = 20): Promise<Post[]> {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}

export function subscribeToCommunityFeed(callback: (posts: Post[]) => void): Unsubscribe {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
  });
}

export async function toggleLikePost(uid: string, postId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;
  
  const data = snap.data() as Post;
  const isLiked = data.likes.includes(uid);
  
  await updateDoc(postRef, {
    likes: isLiked ? data.likes.filter(id => id !== uid) : [...data.likes, uid]
  });
}
