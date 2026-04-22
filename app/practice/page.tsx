'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Star, Lock } from 'lucide-react';
import { LESSONS } from '@/data/lessons';
import { useAuth } from '@/components/providers/auth-provider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PracticePage() {
  const { profile } = useAuth();
  
  // A simple mapping to determine if a lesson is locked based on user CEFR level.
  // In a real app, you might save specific lesson completions. For now, we unlock based on level.
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const userLevelIndex = levels.indexOf(profile?.cefrLevel || 'A1');

  // Group lessons by CEFR
  const groupedLessons = LESSONS.reduce((acc, lesson) => {
    if (!acc[lesson.cefrLevel]) acc[lesson.cefrLevel] = [];
    acc[lesson.cefrLevel].push(lesson);
    return acc;
  }, {} as Record<string, typeof LESSONS>);

  return (
    <div className="container max-w-5xl py-12 min-h-screen space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black">Structured Practice</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Follow our curated curriculum from A1 Beginner to C1 Advanced. Complete lessons to master specific grammar points and earn XP.
        </p>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedLessons).map(([level, lessons], groupIndex) => {
          const levelIndex = levels.indexOf(level);
          const isLocked = levelIndex > userLevelIndex + 1; // Allow playing one level above current
          
          return (
            <div key={level} className="space-y-6 relative">
              {isLocked && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl border border-dashed">
                  <div className="bg-background border shadow-lg p-6 rounded-2xl text-center max-w-sm">
                    <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">Level Locked</h3>
                    <p className="text-muted-foreground text-sm">
                      Reach {level} or the level right below it to unlock these lessons.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground font-black text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                  {level}
                </div>
                <div className="h-0.5 bg-border flex-1" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (i * 0.05) }}
                  >
                    <Link href={isLocked ? '#' : `/practice/${lesson.id}`}>
                      <Card className={`h-full flex flex-col p-6 transition-all ${!isLocked ? 'hover:shadow-md hover:border-primary/50 cursor-pointer' : 'opacity-80'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                            {lesson.grammarPoint}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-amber-500" />
                            {lesson.xpReward}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{lesson.title}</h3>
                        <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                          {lesson.description}
                        </p>
                        
                        <div className="mt-auto space-y-3">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Modes Included:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {lesson.gameModes.map(mode => (
                              <Badge key={mode} variant="secondary" className="text-xs capitalize">
                                {mode.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
