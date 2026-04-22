'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useXP } from '@/hooks/use-xp';
import { LevelUpModal } from '@/components/ui/level-up-modal';
import { RARITY_COLORS } from '@/lib/badges';
import { playSound } from '@/lib/sounds';
import { Sparkles } from 'lucide-react';

export function GlobalGamification() {
  const { newBadges, clearNewBadges, justLeveledUp, level, cefrLevel, clearLevelUp } = useXP();

  useEffect(() => {
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        playSound('badge');
        toast.custom((t) => (
          <div className={`p-4 rounded-xl border bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} text-white shadow-xl flex items-center gap-4 w-full`}>
             <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full text-2xl shrink-0">
               {badge.icon}
             </div>
             <div className="flex-1">
               <div className="flex items-center gap-1 opacity-90 mb-0.5">
                 <Sparkles className="w-3 h-3" />
                 <p className="text-[10px] font-bold uppercase tracking-wider">Badge Unlocked</p>
               </div>
               <h3 className="font-bold text-base leading-tight">{badge.name}</h3>
               <p className="text-sm opacity-90 mt-0.5 leading-snug">{badge.description}</p>
             </div>
             <div className="text-right shrink-0">
               <div className="font-bold text-lg">+{badge.xpReward}</div>
               <div className="text-[10px] opacity-80 font-semibold uppercase">XP</div>
             </div>
          </div>
        ), { duration: 5000 });
      });
      clearNewBadges();
    }
  }, [newBadges, clearNewBadges]);

  return (
    <>
      <LevelUpModal 
        isOpen={justLeveledUp} 
        newLevel={level} 
        cefrLevel={cefrLevel} 
        onClose={clearLevelUp} 
      />
    </>
  );
}
