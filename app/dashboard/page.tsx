'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';
import { useXP } from '@/hooks/use-xp';
import { useStreak } from '@/hooks/use-streak';
import { XPBar } from '@/components/ui/xp-bar';
import { StreakCounter } from '@/components/ui/streak-counter';
import { LevelUpModal } from '@/components/ui/level-up-modal';
import { getTopLeaderboard, subscribeToCommunityFeed, type LeaderboardEntry, type Post } from '@/lib/firestore';
import {
  Brain, Swords, BookOpen, Mic, Headphones, MessageSquare,
  Globe2, Zap, Clock, Trophy, Star, ArrowRight, Sparkles,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOPICS = ['Travel', 'Business', 'Food', 'Science', 'Daily Life', 'Sports', 'Technology', 'Nature'];

const FEATURED_GAMES = [
  { id: 'grammar-puzzle', label: 'Grammar Puzzle', icon: Swords, color: 'from-blue-500 to-indigo-600', href: '/dashboard/games/grammar-puzzle' },
  { id: 'sentence-builder', label: 'Sentence Builder', icon: Brain, color: 'from-purple-500 to-fuchsia-600', href: '/builder' },
  { id: 'ai-chat-roleplay', label: 'AI Chat Roleplay', icon: MessageSquare, color: 'from-emerald-500 to-teal-600', href: '/dashboard/games/ai-chat-roleplay' },
  { id: 'speech-challenge', label: 'Speech Challenge', icon: Mic, color: 'from-rose-500 to-pink-600', href: '/dashboard/games/speech-challenge' },
  { id: 'quiz', label: 'Tense Quiz', icon: BookOpen, color: 'from-amber-500 to-orange-600', href: '/quiz' },
  { id: 'word-rainfall', label: 'Word Rainfall', icon: Zap, color: 'from-cyan-500 to-blue-600', href: '/game/rainfall' },
];

const DAILY_GOAL_XP = 100;

export default function DashboardPage() {
  const { profile } = useAuth();
  const { totalXP, level, cefrLevel, progressPercent, xpToNext, justLeveledUp, clearLevelUp } = useXP();
  const { currentStreak, hasPlayedToday, recordActivity } = useStreak();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('Travel');
  const [wordOfDay, setWordOfDay] = useState<{ word: string; definition: string; example: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    
    recordActivity();
    getTopLeaderboard(5).then(setLeaderboard).catch(() => {});
    fetch('/api/ai/word-of-day').then(r => r.json()).then(setWordOfDay).catch(() => {});
    const unsubPosts = subscribeToCommunityFeed((posts) => setRecentPosts(posts.slice(0, 3)));
    
    return () => {
      unsubPosts();
    };
  }, [profile]);

  const displayName = profile?.displayName ?? 'Learner';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            {profile?.photoURL ? (
              <Image src={profile.photoURL} alt="Avatar" width={56} height={56}
                className="rounded-2xl border-2 border-primary/20" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {displayName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-sm">{greeting},</p>
              <h1 className="text-2xl font-bold text-foreground">{displayName} 👋</h1>
            </div>
          </div>
          <StreakCounter streak={currentStreak} hasPlayedToday={hasPlayedToday} size="lg" />
        </motion.div>

        {/* XP Progress */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <XPBar totalXP={totalXP} level={level} cefrLevel={cefrLevel}
            progressPercent={progressPercent} xpToNext={xpToNext} />
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: totalXP.toLocaleString(), icon: Star, color: 'text-amber-400' },
            { label: 'Level', value: String(level), icon: Trophy, color: 'text-indigo-400' },
            { label: 'CEFR', value: cefrLevel, icon: Globe2, color: 'text-emerald-400' },
            { label: 'Streak', value: `${currentStreak}d`, icon: Zap, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              className="bg-card border border-border rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Word of the Day */}
        {wordOfDay && (
          <motion.div
            className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Word of the Day</span>
            </div>
            <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mb-1">{wordOfDay.word}</h3>
            <p className="text-sm text-muted-foreground mb-2">{wordOfDay.definition}</p>
            <p className="text-sm italic text-indigo-600/80 dark:text-indigo-400/80">"{wordOfDay.example}"</p>
          </motion.div>
        )}

        {/* Topic Filter */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Filter by Topic</h2>
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Custom Workout CTA */}
        <motion.div
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Daily Custom Workout</h3>
              <p className="text-emerald-100 text-sm">Focus on your weak points with AI-generated drills</p>
            </div>
          </div>
          <Button asChild className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold gap-2 w-full sm:w-auto">
            <Link href="/game/daily-workout">Start Workout <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </motion.div>

        {/* Quick Play */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Play</h2>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <Link href="/dashboard/games">All 26 modes <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURED_GAMES.map(({ id, label, icon: Icon, color, href }, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link href={href} className="group block">
                  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 h-full text-white transition-transform group-hover:scale-105 group-hover:shadow-lg`}>
                    <Icon className="w-8 h-8 mb-3 opacity-90" />
                    <p className="font-semibold text-sm leading-tight">{label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {leaderboard.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Top Learners
                </h2>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  <Link href="/leaderboard">Full board <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                {leaderboard.map((entry, i) => (
                  <div key={entry.uid} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {entry.photoURL ? (
                        <Image src={entry.photoURL} alt="" width={32} height={32} className="rounded-full" />
                      ) : entry.displayName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{entry.displayName}</p>
                      <p className="text-xs text-muted-foreground">{entry.cefrLevel} · Level {entry.level}</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-400">{entry.totalXP.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Buzz Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" /> Community Buzz
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <Link href="/community">Visit feed <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                    {post.authorPhotoURL ? (
                      <Image src={post.authorPhotoURL} alt="" width={32} height={32} />
                    ) : post.authorName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{post.authorName}</p>
                    <p className="text-xs text-foreground line-clamp-2 italic">"{post.content}"</p>
                  </div>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                  <p className="text-xs text-muted-foreground">No buzz yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explore all games CTA */}
        <motion.div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <h3 className="font-bold text-lg mb-1">Ready to level up?</h3>
            <p className="text-indigo-100 text-sm">26 game modes waiting for you</p>
          </div>
          <Button asChild className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold gap-2 shrink-0">
            <Link href="/dashboard/games">Play Now <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </motion.div>
      </div>

      {/* Level-up modal */}
      <LevelUpModal
        isOpen={justLeveledUp}
        newLevel={level}
        cefrLevel={cefrLevel}
        onClose={clearLevelUp}
      />
    </div>
  );
}

