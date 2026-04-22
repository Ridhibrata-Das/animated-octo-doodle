'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Swords, Brain, MessageSquare, Mic, BookOpen, Zap, 
  Gamepad2, Lightbulb, Search, SpellCheck, Shapes, 
  Quote, MapPin, Hash, CheckSquare, FastForward, 
  SplitSquareHorizontal, TextCursor, FileText, Ear, 
  Footprints, BookType, Smile, Target, Compass
} from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
  {
    id: 'grammar',
    title: 'Grammar & Structure',
    description: 'Master the rules of English sentences',
    games: [
      { id: 'grammar-puzzle', label: 'Grammar Puzzle', icon: Swords, color: 'from-blue-500 to-indigo-600', href: '/dashboard/games/grammar-puzzle' },
      { id: 'sentence-builder', label: 'Sentence Builder', icon: Shapes, color: 'from-purple-500 to-fuchsia-600', href: '/builder' },
      { id: 'quiz', label: 'Tense Quiz', icon: BookOpen, color: 'from-amber-500 to-orange-600', href: '/quiz' },
      { id: 'article-alley', label: 'Article Alley', icon: Quote, color: 'from-cyan-500 to-blue-600', href: '/dashboard/games/article-alley' },
      { id: 'preposition-park', label: 'Preposition Park', icon: MapPin, color: 'from-emerald-500 to-teal-600', href: '/dashboard/games/preposition-park' },
      { id: 'verb-voyager', label: 'Verb Voyager', icon: Compass, color: 'from-rose-500 to-pink-600', href: '/dashboard/games/verb-voyager' },
      { id: 'quick-think', label: 'Quick Think', icon: FastForward, color: 'from-indigo-400 to-purple-500', href: '/dashboard/games/quick-think' },
      { id: 'analyze', label: 'Sentence Analyzer', icon: Search, color: 'from-slate-500 to-slate-700', href: '/playground' },
    ]
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary & Words',
    description: 'Expand your dictionary and expressions',
    games: [
      { id: 'word-rainfall', label: 'Word Rainfall', icon: Zap, color: 'from-cyan-400 to-blue-500', href: '/game/rainfall' },
      { id: 'spelling-bee', label: 'Spelling Bee', icon: SpellCheck, color: 'from-amber-400 to-orange-500', href: '/dashboard/games/spelling-bee' },
      { id: 'synonym-sprint', label: 'Synonym Sprint', icon: SplitSquareHorizontal, color: 'from-purple-400 to-fuchsia-500', href: '/dashboard/games/synonym-sprint' },
      { id: 'odd-one-out', label: 'Odd One Out', icon: Target, color: 'from-rose-400 to-red-500', href: '/dashboard/games/odd-one-out' },
      { id: 'word-match', label: 'Word Match', icon: CheckSquare, color: 'from-emerald-400 to-green-500', href: '/dashboard/games/word-match' },
      { id: 'phrasal-verb-quest', label: 'Phrasal Verbs', icon: Footprints, color: 'from-indigo-400 to-blue-500', href: '/dashboard/games/phrasal-verb-quest' },
      { id: 'idiom-master', label: 'Idiom Master', icon: Smile, color: 'from-pink-400 to-rose-500', href: '/dashboard/games/idiom-master' },
      { id: 'vocabulary-speedrun', label: 'Vocab Speedrun', icon: FastForward, color: 'from-orange-400 to-red-500', href: '/dashboard/games/vocabulary-speedrun' },
    ]
  },
  {
    id: 'comprehension',
    title: 'Listening & Comprehension',
    description: 'Understand English in context',
    games: [
      { id: 'ai-chat-roleplay', label: 'AI Chat Roleplay', icon: MessageSquare, color: 'from-emerald-500 to-teal-600', href: '/dashboard/games/ai-chat-roleplay' },
      { id: 'speech-challenge', label: 'Speech Challenge', icon: Mic, color: 'from-rose-500 to-pink-600', href: '/dashboard/games/speech-challenge' },
      { id: 'dictation-master', label: 'Dictation Master', icon: Ear, color: 'from-blue-500 to-indigo-600', href: '/dashboard/games/dictation-master' },
      { id: 'story-weaver', label: 'Story Weaver', icon: BookType, color: 'from-purple-500 to-fuchsia-600', href: '/dashboard/games/story-weaver' },
      { id: 'context-detective', label: 'Context Detective', icon: Search, color: 'from-amber-500 to-orange-600', href: '/dashboard/games/context-detective' },
      { id: 'riddle-realm', label: 'Riddle Realm', icon: Lightbulb, color: 'from-cyan-500 to-blue-600', href: '/dashboard/games/riddle-realm' },
      { id: 'translate', label: 'AI Translate', icon: TextCursor, color: 'from-slate-500 to-slate-700', href: '/translate' },
    ]
  }
];

export default function GamesMenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('grammar');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4">Game Library</h1>
            <p className="text-lg text-muted-foreground">
              Choose from 26 AI-powered modes designed to adapt to your CEFR level and master English.
            </p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 p-1 bg-muted rounded-full">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Game Grid */}
        <div className="space-y-12">
          {CATEGORIES.filter(c => c.id === activeCategory).map(category => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.games.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={game.href} className="group block h-full">
                      <div className={`bg-gradient-to-br ${game.color} rounded-3xl p-6 h-full text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl`}>
                        <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                          <game.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg leading-tight mb-2">{game.label}</h3>
                        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                          Play now →
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

