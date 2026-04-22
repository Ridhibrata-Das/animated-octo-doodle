'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { updateUser, logSession, updateLeaderboard, createPost, type GameSession } from '@/lib/firestore';
import { calculateLevel, calculateXPReward, type CefrLevel } from '@/lib/xp-engine';
import { getNewlyUnlockedBadges, type Badge } from '@/lib/badges';

interface XPState {
  totalXP: number;
  level: number;
  cefrLevel: CefrLevel;
  progressPercent: number;
  xpToNext: number;
  previousLevel: number;
  justLeveledUp: boolean;
  newBadges: Badge[];
  gems: number;
}

interface UseXPReturn extends XPState {
  awardXP: (gameMode: string, score: number) => Promise<number>;
  addRawXP: (xp: number, source: string) => Promise<number>;
  clearLevelUp: () => void;
  clearNewBadges: () => void;
}

export function useXP(): UseXPReturn {
  const { profile, user } = useAuth();
  const [state, setState] = useState<XPState>({
    totalXP: 0,
    level: 1,
    cefrLevel: 'A1',
    progressPercent: 0,
    xpToNext: 500,
    previousLevel: 1,
    justLeveledUp: false,
    newBadges: [],
    gems: 0,
  });

  // Sync from Firestore profile (real-time via subscribeToUser in AuthProvider)
  useEffect(() => {
    if (profile) {
      const info = calculateLevel(profile.totalXP ?? 0);
      setState(prev => ({
        ...prev,
        totalXP: profile.totalXP ?? 0,
        level: info.level,
        cefrLevel: info.cefrLevel,
        progressPercent: info.progressPercent,
        xpToNext: info.xpToNext,
        justLeveledUp: info.level > prev.level && prev.level > 0,
        previousLevel: prev.level,
        gems: profile.gems ?? 0,
      }));
    }
  }, [profile?.totalXP, profile?.level]);

  const processXP = async (earned: number) => {
    if (!user || !profile) return 0;
    const streak = profile.streak ?? 0;
    const newTotalXP = (profile.totalXP ?? 0) + earned;
    const { level, cefrLevel } = calculateLevel(newTotalXP);
    const newGamesPlayed = (profile.gamesPlayed ?? 0) + 1;

    const newlyUnlocked = getNewlyUnlockedBadges(profile.badges || [], {
      xp: newTotalXP,
      level,
      streak,
      gamesPlayed: newGamesPlayed
    });

    const newBadgeIds = newlyUnlocked.map(b => b.id);
    const updatedBadges = [...(profile.badges || []), ...newBadgeIds];
    
    // Gems calculation (10% of XP + 50 gem bonus per level up)
    const earnedGems = Math.floor(earned / 10);
    const leveledUp = level > (profile.level || 1);
    const levelUpBonusGems = leveledUp ? 50 : 0;
    const newGemsTotal = (profile.gems || 0) + earnedGems + levelUpBonusGems;

    await updateUser(user.uid, { 
      totalXP: newTotalXP, 
      xp: newTotalXP, 
      level, 
      cefrLevel,
      gamesPlayed: newGamesPlayed,
      badges: updatedBadges,
      gems: newGemsTotal
    });
    
    if (newlyUnlocked.length > 0) {
      setState(prev => ({ ...prev, newBadges: [...prev.newBadges, ...newlyUnlocked] }));
      for (const badge of newlyUnlocked) {
        await createPost(profile, `I've just earned the ${badge.name} badge! 🏆`, 'achievement', {
          badgeId: badge.id,
          badgeName: badge.name
        });
      }
    }

    if (leveledUp) {
      await createPost(profile, `Level UP! I'm now Level ${level}! 🚀`, 'achievement', {
        level: level
      });
    }

    // Update leaderboard (non-blocking)
    updateLeaderboard(user.uid, { ...profile, totalXP: newTotalXP, level, cefrLevel }, earned).catch(() => {});

    return earned;
  };

  const awardXP = useCallback(async (gameMode: string, score: number): Promise<number> => {
    if (!profile) return 0;
    const streak = profile.streak ?? 0;
    const earned = calculateXPReward(gameMode, score, streak);
    return processXP(earned);
  }, [user, profile]);

  const addRawXP = useCallback(async (xp: number, source: string): Promise<number> => {
    // Just add exact xp given
    return processXP(xp);
  }, [user, profile]);

  const clearLevelUp = useCallback(() => {
    setState(prev => ({ ...prev, justLeveledUp: false }));
  }, []);

  const clearNewBadges = useCallback(() => {
    setState(prev => ({ ...prev, newBadges: [] }));
  }, []);

  return { ...state, awardXP, addRawXP, clearLevelUp, clearNewBadges };
}
