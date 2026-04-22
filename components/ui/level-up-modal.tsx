'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type CefrLevel } from '@/lib/xp-engine';
import Link from 'next/link';

const CEFR_MESSAGES: Record<CefrLevel, string> = {
  A1: 'Great start! Keep building your basics!',
  A2: 'Elementary mastery! You\'re growing fast!',
  B1: 'Intermediate level! You\'re halfway there!',
  B2: 'Upper-intermediate! Impressive progress!',
  C1: '🎓 Advanced! You\'re among the elite learners!',
};

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  cefrLevel: CefrLevel;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, cefrLevel, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const end = Date.now() + 2500;
      const colors = ['#4f46e5', '#7c3aed', '#db2777', '#f59e0b'];
      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              ⭐
            </motion.div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1 mb-4">
              <Star className="w-4 h-4 text-indigo-300" fill="currentColor" />
              <span className="text-indigo-200 text-sm font-semibold">Level Up!</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-2">Level {newLevel}</h2>
            <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
              {cefrLevel}
            </div>
            <p className="text-indigo-200 text-sm mb-6">{CEFR_MESSAGES[cefrLevel]}</p>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1 border-indigo-400/30 text-indigo-200 hover:bg-indigo-800/50">
                Keep Playing
              </Button>
              <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-500 gap-1">
                <Link href="/dashboard" onClick={onClose}>
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
