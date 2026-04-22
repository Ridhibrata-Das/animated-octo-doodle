export type ItemType = 'powerup' | 'persona' | 'theme';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: ItemType;
  icon: string;
  isConsumable: boolean;
  color: string;
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Miss a day of practice without losing your streak! Equips automatically.',
    cost: 200,
    type: 'powerup',
    icon: '🧊',
    isConsumable: true,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'persona_shakespeare',
    name: 'Shakespeare AI',
    description: 'Practice English with the dramatic flair of William Shakespeare.',
    cost: 500,
    type: 'persona',
    icon: '🎭',
    isConsumable: false,
    color: 'from-amber-700 to-yellow-900',
  },
  {
    id: 'persona_chef',
    name: 'Angry Chef AI',
    description: 'A persona that critiques your grammar like a very angry British chef.',
    cost: 500,
    type: 'persona',
    icon: '🍳',
    isConsumable: false,
    color: 'from-red-500 to-red-700',
  },
  {
    id: 'persona_pirate',
    name: 'Pirate Captain',
    description: 'Ahoy! Practice yer tenses with a salty sea dog.',
    cost: 750,
    type: 'persona',
    icon: '🏴‍☠️',
    isConsumable: false,
    color: 'from-slate-700 to-slate-900',
  },
  {
    id: 'theme_cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Unlock the exclusive Neon Cyberpunk dark mode theme for the app.',
    cost: 1500,
    type: 'theme',
    icon: '🌆',
    isConsumable: false,
    color: 'from-fuchsia-600 to-purple-800',
  }
];
