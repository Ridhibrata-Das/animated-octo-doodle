'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/sounds';
import { useState, useEffect, useRef } from 'react';
import { useEnergy } from '@/hooks/use-energy';
import { PaymentModal } from '@/components/payment-modal';
import { useGame } from '@/hooks/use-game'; // Optional if we want to hook into game end natively, but simple timeout might suffice.

interface GameShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  currentQuestion?: number;
  totalQuestions?: number;
}

export function GameShell({ title, description, children, onBack, currentQuestion, totalQuestions }: GameShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const gameId = pathname?.replace(/\//g, '_') || 'unknown_game'; // unique ID based on route

  const [gracefulEnd, setGracefulEnd] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  
  const { isPremium, canPlayGame, consumeAttempt } = useEnergy();
  const attemptConsumed = useRef(false);

  useEffect(() => {
    if (soundManager) setIsMuted(soundManager.isMuted);
  }, []);

  // Check allowances on mount
  useEffect(() => {
    if (isAllowed !== null) return;
    
    const allowed = canPlayGame(gameId);
    if (!allowed) {
      setIsAllowed(false);
      setShowPayment(true);
    } else {
      setIsAllowed(true);
      if (!attemptConsumed.current) {
        consumeAttempt(gameId);
        attemptConsumed.current = true;
      }
    }
  }, [gameId, canPlayGame, consumeAttempt, isAllowed]);

  // Timers
  useEffect(() => {
    if (!isAllowed) return;

    // 2-mins (120s) for free, 4-mins (240s) for Premium
    const timeoutMs = isPremium ? 240 * 1000 : 120 * 1000;
    
    const timer = setTimeout(() => {
      if (isPremium) {
        setGracefulEnd(true);
      } else {
        setShowPayment(true);
        setIsAllowed(false);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isAllowed, isPremium]);

  const toggleSound = () => {
    if (soundManager) setIsMuted(soundManager.toggle());
  };

  const handleBack = () => {
    if (onBack) onBack();
    else router.push('/dashboard/games');
  };

  if (isAllowed === null) return <div className="min-h-screen bg-background" />; // loading

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => router.push('/dashboard/games')}
        onSuccess={() => {
          setShowPayment(false);
          setIsAllowed(true);
        }} 
      />

      {isAllowed && (
        <>
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="font-bold text-foreground text-lg leading-tight">{title}</h1>
                  {totalQuestions && currentQuestion !== undefined && (
                    <div className="text-xs text-muted-foreground font-medium">
                      Question {currentQuestion + 1} of {totalQuestions}
                    </div>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={toggleSound} className="text-muted-foreground">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
            
            {totalQuestions && currentQuestion !== undefined && (
              <div className="h-1 bg-muted w-full">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>
            )}
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            {gracefulEnd ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 text-center bg-card rounded-3xl border border-border shadow-2xl p-12"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                  <span className="text-5xl">✨</span>
                </div>
                <h2 className="text-4xl font-black mb-4">Time's Up!</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-md">
                  You survived the full 4 minutes! Your progress and XP have been recorded. Excellent job!
                </p>
                <Button 
                  onClick={() => router.push('/dashboard/games')}
                  className="h-14 px-8 rounded-full text-lg font-bold"
                >
                  Return to Dashboard
                </Button>
              </motion.div>
            ) : (
              <>
                {description && (
                  <p className="text-center text-muted-foreground text-sm mb-6">{description}</p>
                )}
                <div className="flex-1 flex flex-col relative">
                  {children}
                </div>
              </>
            )}
          </main>
        </>
      )}
    </div>
  );
}

