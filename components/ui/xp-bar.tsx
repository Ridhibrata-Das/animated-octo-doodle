'use client';

import { motion } from 'framer-motion';
import { type CefrLevel } from '@/lib/xp-engine';

const CEFR_COLORS: Record<CefrLevel, string> = {
  A1: 'from-emerald-400 to-green-500',
  A2: 'from-cyan-400 to-blue-500',
  B1: 'from-indigo-400 to-violet-500',
  B2: 'from-purple-400 to-fuchsia-500',
  C1: 'from-amber-400 to-orange-500',
};

interface XPBarProps {
  totalXP: number;
  level: number;
  cefrLevel: CefrLevel;
  progressPercent: number;
  xpToNext: number;
  compact?: boolean;
}

export function XPBar({ totalXP, level, cefrLevel, progressPercent, xpToNext, compact = false }: XPBarProps) {
  const gradient = CEFR_COLORS[cefrLevel];

  return (
    <div className={`space-y-${compact ? '1' : '2'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`bg-gradient-to-r ${gradient} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
            {cefrLevel}
          </div>
          <span className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
            Level {level}
          </span>
        </div>
        {!compact && (
          <span className="text-xs text-muted-foreground">{xpToNext.toLocaleString()} XP to next</span>
        )}
      </div>

      <div className={`relative w-full bg-muted rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-3'}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {!compact && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/90 mix-blend-overlay">{progressPercent}%</span>
          </div>
        )}
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground text-right">{totalXP.toLocaleString()} total XP</p>
      )}
    </div>
  );
}
