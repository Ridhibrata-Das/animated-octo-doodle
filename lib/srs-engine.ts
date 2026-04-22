import { db } from './firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, orderBy, limit, serverTimestamp, increment } from 'firebase/firestore';

export interface GrammarWeakness {
  id?: string;
  grammarPoint: string;
  errorCount: number;
  lastTested: any;
  masteryScore: number;
}

export async function logWeakness(uid: string, grammarPoint: string) {
  if (!uid || !grammarPoint) return;
  
  const pointId = grammarPoint.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
  const docRef = doc(db, 'users', uid, 'weaknesses', pointId);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await setDoc(docRef, {
        errorCount: increment(1),
        masteryScore: 0, // Reset mastery on failure
        lastTested: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        grammarPoint,
        errorCount: 1,
        masteryScore: 0,
        lastTested: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Failed to log weakness', error);
  }
}

export async function logStrength(uid: string, grammarPoint: string) {
  if (!uid || !grammarPoint) return;
  
  const pointId = grammarPoint.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
  const docRef = doc(db, 'users', uid, 'weaknesses', pointId);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await setDoc(docRef, {
        masteryScore: increment(1),
        lastTested: serverTimestamp()
      }, { merge: true });
    }
    // If it doesn't exist, we don't log it. We only track strengths for known weaknesses to show improvement.
  } catch (error) {
    console.error('Failed to log strength', error);
  }
}

export async function getTopWeaknesses(uid: string, count: number = 3): Promise<GrammarWeakness[]> {
  if (!uid) return [];
  
  const q = query(
    collection(db, 'users', uid, 'weaknesses'),
    orderBy('errorCount', 'desc'),
    limit(count)
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GrammarWeakness));
  } catch (error) {
    console.error('Failed to get weaknesses', error);
    return [];
  }
}
