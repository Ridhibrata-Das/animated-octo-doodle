'use client';

import { useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { updateUser } from '@/lib/firestore';

interface UseStreakReturn {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  hasPlayedToday: boolean;
  recordActivity: () => Promise<void>;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useStreak(): UseStreakReturn {
  const { profile, user } = useAuth();

  const currentStreak = profile?.streak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const lastActiveDate = profile?.lastActiveDate ?? null;
  const today = getTodayStr();
  const hasPlayedToday = lastActiveDate === today;

  const recordActivity = useCallback(async () => {
    if (!user || !profile || hasPlayedToday) return;

    const yesterday = getYesterdayStr();
    const isConsecutive = lastActiveDate === yesterday;

    const newStreak = isConsecutive ? currentStreak + 1 : 1;
    const newLongest = Math.max(longestStreak, newStreak);

    await updateUser(user.uid, {
      streak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    });
  }, [user, profile, hasPlayedToday, lastActiveDate, currentStreak, longestStreak, today]);

  return { currentStreak, longestStreak, lastActiveDate, hasPlayedToday, recordActivity };
}
