// Badge definitions and unlock logic

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeDefinition extends Badge {
  condition: {
    xp?: number;
    level?: number;
    streak?: number;
    gamesPlayed?: number;
  };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Starter / Games played ──────────────────────────────────────────────────
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your very first game session.',
    icon: '🌟',
    xpReward: 25,
    rarity: 'common',
    condition: { gamesPlayed: 1 },
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 10 game sessions.',
    icon: '⚡',
    xpReward: 50,
    rarity: 'common',
    condition: { gamesPlayed: 10 },
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Play 25 sessions — you love to learn!',
    icon: '💬',
    xpReward: 75,
    rarity: 'rare',
    condition: { gamesPlayed: 25 },
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 game sessions.',
    icon: '🎯',
    xpReward: 100,
    rarity: 'rare',
    condition: { gamesPlayed: 50 },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Play 100 games — an incredible achievement!',
    icon: '💯',
    xpReward: 200,
    rarity: 'epic',
    condition: { gamesPlayed: 100 },
  },

  // ── XP milestones ────────────────────────────────────────────────────────────
  {
    id: 'xp-500',
    name: 'Knowledge Seedling',
    description: 'Earn your first 500 XP.',
    icon: '🌱',
    xpReward: 25,
    rarity: 'common',
    condition: { xp: 500 },
  },
  {
    id: 'xp-3000',
    name: 'Grammar Guru',
    description: 'Reach 3,000 XP — Elementary mastery unlocked.',
    icon: '🏅',
    xpReward: 75,
    rarity: 'rare',
    condition: { xp: 3000 },
  },
  {
    id: 'xp-9000',
    name: 'Language Artisan',
    description: 'Reach 9,000 XP — Intermediate reached!',
    icon: '🔮',
    xpReward: 150,
    rarity: 'epic',
    condition: { xp: 9000 },
  },
  {
    id: 'xp-18000',
    name: 'Word Wizard',
    description: 'Reach 18,000 XP — Upper-Intermediate!',
    icon: '🧙',
    xpReward: 300,
    rarity: 'epic',
    condition: { xp: 18000 },
  },
  {
    id: 'xp-30000',
    name: 'English Master',
    description: 'Reach 30,000 XP — C1 Advanced!',
    icon: '👑',
    xpReward: 500,
    rarity: 'legendary',
    condition: { xp: 30000 },
  },

  // ── Level milestones ──────────────────────────────────────────────────────
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach Level 5.',
    icon: '🌠',
    xpReward: 50,
    rarity: 'common',
    condition: { level: 5 },
  },
  {
    id: 'level-10',
    name: 'On Fire',
    description: "Reach Level 10 — you're on a roll!",
    icon: '🔥',
    xpReward: 100,
    rarity: 'rare',
    condition: { level: 10 },
  },
  {
    id: 'level-15',
    name: 'Polyglot',
    description: 'Reach Level 15 — true multilingual learner.',
    icon: '🌍',
    xpReward: 150,
    rarity: 'rare',
    condition: { level: 15 },
  },
  {
    id: 'level-20',
    name: 'Speed Demon',
    description: 'Blast past Level 20!',
    icon: '🚀',
    xpReward: 250,
    rarity: 'epic',
    condition: { level: 20 },
  },

  // ── Streak badges ─────────────────────────────────────────────────────────
  {
    id: 'streak-3',
    name: 'Consistent',
    description: 'Maintain a 3-day learning streak.',
    icon: '🔗',
    xpReward: 30,
    rarity: 'common',
    condition: { streak: 3 },
  },
  {
    id: 'streak-7',
    name: 'Streak Master',
    description: 'Keep a 7-day streak going!',
    icon: '🏆',
    xpReward: 75,
    rarity: 'rare',
    condition: { streak: 7 },
  },
  {
    id: 'streak-30',
    name: 'Time Traveler',
    description: 'Maintain a 30-day streak — legendary dedication!',
    icon: '⏰',
    xpReward: 500,
    rarity: 'legendary',
    condition: { streak: 30 },
  },
];

/**
 * Given existing badge IDs and current stats, returns newly unlocked Badge objects.
 */
export function getNewlyUnlockedBadges(
  existingBadgeIds: string[],
  stats: { xp: number; level: number; streak: number; gamesPlayed: number }
): Badge[] {
  const existing = new Set(existingBadgeIds);
  return BADGE_DEFINITIONS.filter((badge) => {
    if (existing.has(badge.id)) return false;
    const c = badge.condition;
    if (c.xp !== undefined && stats.xp < c.xp) return false;
    if (c.level !== undefined && stats.level < c.level) return false;
    if (c.streak !== undefined && stats.streak < c.streak) return false;
    if (c.gamesPlayed !== undefined && stats.gamesPlayed < c.gamesPlayed) return false;
    return true;
  });
}

/** Lookup a badge by ID */
export function getBadgeById(id: string): Badge | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

/** Get all Badge objects for an array of badge IDs */
export function getBadgesByIds(ids: string[]): Badge[] {
  return ids
    .map(getBadgeById)
    .filter((b): b is Badge => b !== undefined);
}

export const RARITY_COLORS: Record<Badge['rarity'], string> = {
  common:    'from-slate-400 to-slate-500',
  rare:      'from-blue-400 to-indigo-500',
  epic:      'from-purple-400 to-fuchsia-500',
  legendary: 'from-amber-400 to-orange-500',
};

export const RARITY_BORDER: Record<Badge['rarity'], string> = {
  common:    'border-slate-400/40',
  rare:      'border-blue-400/40',
  epic:      'border-purple-400/40',
  legendary: 'border-amber-400/40',
};
