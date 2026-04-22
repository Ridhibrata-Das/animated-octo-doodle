import { describe, it, expect } from 'vitest';
import { getNewlyUnlockedBadges, BADGE_DEFINITIONS } from '../lib/badges';

describe('Badges System', () => {
  it('should unlock First Steps badge after 1 game', () => {
    const stats = { xp: 0, level: 1, streak: 0, gamesPlayed: 1 };
    const unlocked = getNewlyUnlockedBadges([], stats);
    
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe('first-steps');
  });

  it('should not unlock First Steps if already unlocked', () => {
    const stats = { xp: 0, level: 1, streak: 0, gamesPlayed: 1 };
    const unlocked = getNewlyUnlockedBadges(['first-steps'], stats);
    
    expect(unlocked).toHaveLength(0);
  });

  it('should unlock multiple badges simultaneously', () => {
    const stats = { xp: 550, level: 5, streak: 3, gamesPlayed: 10 };
    const unlocked = getNewlyUnlockedBadges([], stats);
    
    const unlockedIds = unlocked.map(b => b.id);
    expect(unlockedIds).toContain('first-steps');
    expect(unlockedIds).toContain('quick-learner');
    expect(unlockedIds).toContain('xp-500');
    expect(unlockedIds).toContain('level-5');
    expect(unlockedIds).toContain('streak-3');
    expect(unlocked).toHaveLength(5);
  });

  it('should correctly respect thresholds (exact matches)', () => {
    const stats = { xp: 499, level: 4, streak: 2, gamesPlayed: 9 };
    const unlocked = getNewlyUnlockedBadges(['first-steps'], stats);
    
    // Not enough for xp-500, level-5, streak-3, quick-learner
    expect(unlocked).toHaveLength(0);
  });
});
