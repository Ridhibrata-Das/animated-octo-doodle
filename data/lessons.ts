export interface Lesson {
  id: string;
  title: string;
  description: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  grammarPoint: string;
  gameModes: string[];
  order: number;
  xpReward: number;
}

export const LESSONS: Lesson[] = [
  // A1 Beginner
  {
    id: 'l-a1-1',
    title: 'Hello World of Verbs',
    description: 'Learn to talk about everyday facts using the Present Simple tense. Essential for introducing yourself and daily routines.',
    cefrLevel: 'A1',
    grammarPoint: 'Present Simple',
    gameModes: ['multiple-choice', 'flashcards'],
    order: 1,
    xpReward: 50,
  },
  {
    id: 'l-a1-2',
    title: 'Right Now',
    description: 'Describe actions happening at this very moment using Present Continuous.',
    cefrLevel: 'A1',
    grammarPoint: 'Present Continuous',
    gameModes: ['sentence-builder', 'rainfall'],
    order: 2,
    xpReward: 50,
  },
  {
    id: 'l-a1-3',
    title: 'Yesterday\'s Stories',
    description: 'Talk about finished actions in the past. Master the Past Simple of regular and irregular verbs.',
    cefrLevel: 'A1',
    grammarPoint: 'Past Simple',
    gameModes: ['memory-match', 'story-creator'],
    order: 3,
    xpReward: 75,
  },
  
  // A2 Elementary
  {
    id: 'l-a2-1',
    title: 'Life Experiences',
    description: 'Use the Present Perfect to talk about experiences without specifying exactly when they happened.',
    cefrLevel: 'A2',
    grammarPoint: 'Present Perfect',
    gameModes: ['multiple-choice', 'chat-roleplay'],
    order: 4,
    xpReward: 100,
  },
  {
    id: 'l-a2-2',
    title: 'Future Plans',
    description: 'Express future intentions and plans using "going to" and Present Continuous.',
    cefrLevel: 'A2',
    grammarPoint: 'Future Intentions',
    gameModes: ['sentence-builder', 'time-traveler'],
    order: 5,
    xpReward: 100,
  },
  {
    id: 'l-a2-3',
    title: 'Interrupted Past',
    description: 'Describe ongoing background actions in the past using Past Continuous.',
    cefrLevel: 'A2',
    grammarPoint: 'Past Continuous',
    gameModes: ['grammar-detective', 'flashcards'],
    order: 6,
    xpReward: 125,
  },

  // B1 Intermediate
  {
    id: 'l-b1-1',
    title: 'Recent Changes',
    description: 'Connect the past to the present with Present Perfect Continuous for ongoing or recently finished activities.',
    cefrLevel: 'B1',
    grammarPoint: 'Present Perfect Continuous',
    gameModes: ['tense-converter', 'story-creator'],
    order: 7,
    xpReward: 150,
  },
  {
    id: 'l-b1-2',
    title: 'Before the Past',
    description: 'Use the Past Perfect to clarify which of two past actions happened first.',
    cefrLevel: 'B1',
    grammarPoint: 'Past Perfect',
    gameModes: ['multiple-choice', 'chat-roleplay'],
    order: 8,
    xpReward: 150,
  },
  {
    id: 'l-b1-3',
    title: 'Predictions & Promises',
    description: 'Master the Future Simple ("will") for spontaneous decisions, promises, and predictions.',
    cefrLevel: 'B1',
    grammarPoint: 'Future Simple',
    gameModes: ['fortune-teller', 'sentence-builder'],
    order: 9,
    xpReward: 175,
  },

  // B2 Upper-Intermediate
  {
    id: 'l-b2-1',
    title: 'Future in Progress',
    description: 'Describe actions that will be ongoing at a specific time in the future using Future Continuous.',
    cefrLevel: 'B2',
    grammarPoint: 'Future Continuous',
    gameModes: ['time-traveler', 'grammar-detective'],
    order: 10,
    xpReward: 200,
  },
  {
    id: 'l-b2-2',
    title: 'Deadline Approaching',
    description: 'Use the Future Perfect to talk about actions that will be completed before a certain time in the future.',
    cefrLevel: 'B2',
    grammarPoint: 'Future Perfect',
    gameModes: ['tense-converter', 'multiple-choice'],
    order: 11,
    xpReward: 250,
  },

  // C1 Advanced
  {
    id: 'l-c1-1',
    title: 'Narrative Mastery',
    description: 'Seamlessly blend Past Simple, Past Continuous, and Past Perfect to tell complex, engaging stories.',
    cefrLevel: 'C1',
    grammarPoint: 'Narrative Tenses',
    gameModes: ['story-creator', 'chat-roleplay'],
    order: 12,
    xpReward: 300,
  },
  {
    id: 'l-c1-2',
    title: 'Unreal Pasts',
    description: 'Express regrets and hypothetical past situations using Third Conditionals and Past Perfect.',
    cefrLevel: 'C1',
    grammarPoint: 'Unreal Past / Conditionals',
    gameModes: ['grammar-detective', 'sentence-builder'],
    order: 13,
    xpReward: 350,
  },
  {
    id: 'l-c1-3',
    title: 'Advanced Durations',
    description: 'Master the rare but precise Future Perfect Continuous for long-running actions leading up to a future point.',
    cefrLevel: 'C1',
    grammarPoint: 'Future Perfect Continuous',
    gameModes: ['time-traveler', 'multiple-choice'],
    order: 14,
    xpReward: 400,
  },
];
