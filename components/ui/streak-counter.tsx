'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  hasPlayedToday?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ streak, hasPlayedToday = true, size = 'md' }: StreakCounterProps) {
  const atRisk = !hasPlayedToday && streak > 0;

  const sizeClasses = {
    sm: { wrapper: 'gap-1', icon: 'w-4 h-4', text: 'text-sm font-bold', label: 'text-[10px]' },
    md: { wrapper: 'gap-1.5', icon: 'w-5 h-5', text: 'text-base font-bold', label: 'text-xs' },
    lg: { wrapper: 'gap-2', icon: 'w-7 h-7', text: 'text-2xl font-bold', label: 'text-sm' },
  }[size];

  return (
    <div className={cn('flex items-center', sizeClasses.wrapper)}>
      <motion.div
        animate={atRisk ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        <Flame
          className={cn(
            sizeClasses.icon,
            atRisk ? 'text-red-400' : streak >= 7 ? 'text-orange-400' : 'text-amber-400'
          )}
          fill={streak > 0 ? 'currentColor' : 'none'}
        />
      </motion.div>
      <div className="flex flex-col leading-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={streak}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            className={cn(sizeClasses.text, 'text-foreground')}
          >
            {streak}
          </motion.span>
        </AnimatePresence>
        <span className={cn(sizeClasses.label, 'text-muted-foreground')}>
          {atRisk ? '⚠ at risk' : 'day streak'}
        </span>
      </div>
    </div>
  );
}
