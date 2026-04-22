'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { subscribeToLeaderboard, type LeaderboardEntry } from '@/lib/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    const unsub = subscribeToLeaderboard(setLeaders);
    return () => unsub();
  }, []);

  return (
    <div className="container max-w-4xl py-12 space-y-8 min-h-screen">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4"
        >
          <Trophy className="w-12 h-12 text-amber-500" />
        </motion.div>
        <h1 className="text-4xl font-black mb-2 text-foreground">Global Leaderboard</h1>
        <p className="text-muted-foreground text-lg">Top 20 learners worldwide</p>
      </div>

      <div className="space-y-3">
        {leaders.map((leader, i) => {
          const isCurrentUser = leader.uid === user?.uid;
          
          return (
            <motion.div
              key={leader.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`p-4 flex items-center gap-4 transition-all hover:scale-[1.01] ${
                isCurrentUser 
                  ? 'border-primary/50 shadow-md bg-primary/5' 
                  : 'hover:shadow-md'
              }`}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' :
                  i === 1 ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                  i === 2 ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i === 0 ? <Crown className="w-6 h-6" /> : 
                   i === 1 ? <Medal className="w-6 h-6" /> : 
                   i === 2 ? <Medal className="w-6 h-6" /> : 
                   i + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate flex items-center gap-2">
                    {leader.displayName}
                    {isCurrentUser && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Lvl {leader.level}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground border-border">
                      {leader.cefrLevel}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-amber-500">
                    {leader.totalXP.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Total XP
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        
        {leaders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed">
            No leaders yet. Be the first to play!
          </div>
        )}
      </div>
    </div>
  );
}
