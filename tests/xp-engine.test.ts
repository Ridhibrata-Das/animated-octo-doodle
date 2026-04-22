import { describe, it, expect } from 'vitest';
import { calculateLevel, calculateXPReward } from '../lib/xp-engine';

describe('XP Engine', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.cefrLevel).toBe('A1');
    });

    it('should correctly calculate levels at thresholds', () => {
      expect(calculateLevel(500).level).toBe(2);
      expect(calculateLevel(1000).level).toBe(3);
    });

    it('should max out at level 30', () => {
      expect(calculateLevel(9999999).level).toBe(30);
    });
  });

  describe('CEFR logic', () => {
    it('should return correct CEFR bands', () => {
      expect(calculateLevel(0).cefrLevel).toBe('A1');
      expect(calculateLevel(4000).cefrLevel).toBe('A2'); // Level 7
      expect(calculateLevel(11000).cefrLevel).toBe('B1'); // Level 13
      expect(calculateLevel(33000).cefrLevel).toBe('C1'); // Level 25
    });
  });

  describe('calculateXPReward', () => {
    it('should award base XP correctly for 100 score', () => {
      // 'playground' base is 10. 100 score -> multiplier 1.0 -> 10
      const reward = calculateXPReward('playground', 100, 0);
      expect(reward).toBe(10);
    });

    it('should apply streak multipliers correctly', () => {
      const rewardBase = calculateXPReward('ai-chat-roleplay', 100, 0); // base 50 -> 50
      const rewardStreak7 = calculateXPReward('ai-chat-roleplay', 100, 7); // 50 * 1.5 -> 75
      const rewardStreak30 = calculateXPReward('ai-chat-roleplay', 100, 30); // 50 * 2.0 -> 100
      
      expect(rewardStreak7).toBe(75);
      expect(rewardStreak30).toBe(100);
    });

    it('should penalize poor performance', () => {
      // 'ai-chat-roleplay' base 50. score 0 -> multiplier 0.5 -> 25
      const reward = calculateXPReward('ai-chat-roleplay', 0, 0);
      expect(reward).toBe(25);
    });
  });
});

