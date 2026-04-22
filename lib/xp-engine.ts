// XP thresholds and CEFR level calculation

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

interface LevelInfo {
  level: number;
  cefrLevel: CefrLevel;
  xpForThisLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpToNext: number;
}

// 30 levels, 5 CEFR bands (6 levels each)
const LEVEL_THRESHOLDS: number[] = [
  0,     // Level 1  — A1
  500,   // Level 2
  1000,  // Level 3
  1500,  // Level 4
  2250,  // Level 5
  3000,  // Level 6  — A1 max
  3750,  // Level 7  — A2
  4750,  // Level 8
  5750,  // Level 9
  7000,  // Level 10
  8000,  // Level 11
  9000,  // Level 12 — A2 max
  10500, // Level 13 — B1
  12000, // Level 14
  13500, // Level 15
  15000, // Level 16
  16500, // Level 17
  18000, // Level 18 — B1 max
  20000, // Level 19 — B2
  22000, // Level 20
  24000, // Level 21
  26000, // Level 22
  28000, // Level 23
  30000, // Level 24 — B2 max
  33000, // Level 25 — C1
  36000, // Level 26
  39500, // Level 27
  43000, // Level 28
  47000, // Level 29
  52000, // Level 30 — C1 max (no cap on XP above this)
];

function getCefrForLevel(level: number): CefrLevel {
  if (level <= 6) return 'A1';
  if (level <= 12) return 'A2';
  if (level <= 18) return 'B1';
  if (level <= 24) return 'B2';
  return 'C1';
}

export function calculateLevel(totalXP: number): LevelInfo {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  level = Math.min(level, 30);

  const xpForThisLevel = LEVEL_THRESHOLDS[level - 1];
  const xpForNextLevel = level < 30 ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[29] + 10000;
  const xpInCurrentLevel = totalXP - xpForThisLevel;
  const xpNeededForLevel = xpForNextLevel - xpForThisLevel;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
  const xpToNext = Math.max(0, xpForNextLevel - totalXP);

  return {
    level,
    cefrLevel: getCefrForLevel(level),
    xpForThisLevel,
    xpForNextLevel,
    progressPercent,
    xpToNext,
  };
}

// XP awarded per game mode (base values, before streak multiplier)
export const XP_REWARDS: Record<string, number> = {
  'playground': 10,
  'sentence-builder': 20,
  'word-rainfall': 25,
  'quiz': 20,
  'translate': 15,
  'sentence-analyzer': 10,
  'grammar-puzzle': 20,
  'spelling-bee': 15,
  'odd-one-out': 15,
  'article-alley': 15,
  'preposition-park': 15,
  'quick-think': 10,
  'synonym-sprint': 20,
  'verb-voyager': 20,
  'word-match': 20,
  'dictation-master': 30,
  'phrasal-verb-quest': 25,
  'story-weaver': 35,
  'context-detective': 25,
  'riddle-realm': 30,
  'idiom-master': 25,
  'speech-challenge': 40,
  'ai-chat-roleplay': 50,
  'vocabulary-speedrun': 20,
};

/** Calculate final XP with streak multiplier applied */
export function calculateXPReward(gameMode: string, score: number, streak: number): number {
  const base = XP_REWARDS[gameMode] ?? 15;
  const scoreMultiplier = 0.5 + (score / 100) * 0.5; // 50%–100% based on score
  const streakMultiplier = streak >= 30 ? 2.0 : streak >= 7 ? 1.5 : 1.0;
  return Math.round(base * scoreMultiplier * streakMultiplier);
}
