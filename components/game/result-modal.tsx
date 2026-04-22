'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ResultModalProps {
  isOpen: boolean;
  score: number;
  total: number;
  xpEarned: number;
  onRetry: () => void;
  nextUrl?: string;
  children?: React.ReactNode;
  analyzing?: boolean;
  analysis?: {
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    cefrLevelEvaluation: string;
    finalScore?: number;
  } | null;
}

export function ResultModal({ 
  isOpen, 
  score, 
  total, 
  xpEarned, 
  onRetry, 
  nextUrl, 
  children,
  analyzing,
  analysis
}: ResultModalProps) {
  useEffect(() => {
    if (isOpen && score === total) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }
  }, [isOpen, score, total]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-card border-4 border-primary rounded-[3rem] shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Trophy size={120} className="text-primary" />
            </div>

            <div className="p-8 pt-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-2">
                <Trophy className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black italic tracking-tighter">
                  {score === total ? 'PERFECT SCORE!' : 'GAME OVER!'}
                </h2>
                <p className="text-muted-foreground font-medium text-lg">
                  You completed the session with {score}/{total} correct.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="bg-primary/5 rounded-[2rem] p-6 border-2 border-primary/10">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-1">XP Earned</p>
                  <p className="text-3xl font-black">+{xpEarned}</p>
                </div>
                <div className="bg-amber-500/5 rounded-[2rem] p-6 border-2 border-amber-500/10">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-600/60 mb-1">Accuracy</p>
                  <p className="text-3xl font-black text-amber-500">
                    {Math.round((score / total) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={onRetry}
                  variant="outline"
                  className="flex-1 h-14 rounded-full border-2 text-lg font-black gap-2 transition-all active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" /> Try Again
                </Button>
                {nextUrl && (
                  <Button asChild className="flex-1 h-14 rounded-full text-lg font-black gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95">
                    <Link href={nextUrl}>
                      Continue <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
              </div>

              {(analyzing || analysis) && (
                <div className="mt-8 pt-8 border-t border-border text-left space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Star className="w-4 h-4" /> AI Performance Review
                  </h4>
                  
                  {analyzing ? (
                    <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">AI is analyzing your results...</span>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                         <p className="text-sm font-medium leading-relaxed italic">"{analysis.feedback}"</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Strengths</p>
                          <ul className="text-xs space-y-1">
                            {analysis.strengths?.slice(0, 2).map((s: string, i: number) => (
                              <li key={i} className="flex gap-1 text-emerald-700 dark:text-emerald-300">
                                <span className="text-emerald-500">•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                          <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Target Areas</p>
                          <ul className="text-xs space-y-1">
                            {analysis.weaknesses?.slice(0, 2).map((w: string, i: number) => (
                              <li key={i} className="flex gap-1 text-amber-700 dark:text-amber-300">
                                <span className="text-amber-500">•</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-xl flex justify-between items-center">
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">CEFR Evaluation</p>
                          <div className="px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[10px] font-bold w-fit">
                            {analysis.cefrLevelEvaluation || 'B1'}
                          </div>
                        </div>
                        {analysis.finalScore && (
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">AI Score</p>
                            <p className="text-lg font-bold">{analysis.finalScore}/100</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

