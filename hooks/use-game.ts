'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useXP } from '@/hooks/use-xp';
import { logSession, createPost } from '@/lib/firestore';
import { playSound } from '@/lib/sounds';
import { logWeakness, logStrength } from '@/lib/srs-engine';

export type GameStatus = 'idle' | 'loading' | 'playing' | 'finished' | 'error';

interface UseGameOptions {
  modeId: string;
  topic?: string;
  questionCount?: number;
  timeLimitSeconds?: number;
  perQuestionTimer?: boolean;
}

interface UseGameReturn<T> {
  status: GameStatus;
  questions: T[];
  currentIndex: number;
  currentQuestion: T | null;
  score: number;
  xpEarned: number;
  timeLeft: number;
  error: string | null;
  rawData: any | null;
  analysis: any | null;
  analyzing: boolean;
  isTimerCritical: boolean;
  startGame: () => Promise<void>;
  submitAnswer: (isCorrect: boolean, grammarPoint?: string) => void;
  nextQuestion: () => void;
  finishGame: () => Promise<void>;
  reset: () => void;
}

export function useGame<T>({ modeId, topic = 'General', questionCount = 5, timeLimitSeconds, perQuestionTimer = false }: UseGameOptions): UseGameReturn<T> {
  const { profile, user } = useAuth();
  const { awardXP } = useXP();
  
  const [status, setStatus] = useState<GameStatus>('idle');
  const [questions, setQuestions] = useState<T[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  const isTimerCritical = timeLeft > 0 && timeLeft <= 5;

  const finishGame = useCallback(async () => {
    setStatus('finished');
    clearTimer();
    
    if (!user || !profile) return;
    
    const percentage = Math.round((score / Math.max(1, questions.length)) * 100);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    try {
      // API call 2: Performance analysis
      setAnalyzing(true);
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameMode: 'performance-review',
          performanceData: {
            modeId,
            score: percentage,
            correctCount: score,
            totalCount: questions.length,
            history
          },
          cefrLevel: profile.cefrLevel,
          userLanguage: profile.preferredLanguage ?? 'en'
        })
      });

      if (res.ok) {
        const analyzeData = await res.json();
        setAnalysis(analyzeData);
      }
      setAnalyzing(false);

      const earned = await awardXP(modeId, percentage);
      setXpEarned(earned);
      
      await logSession(user.uid, {
        gameMode: modeId,
        score: percentage,
        xpEarned: earned,
        cefrLevel: profile.cefrLevel,
        questionsAnswered: currentIndex,
        correctAnswers: score,
        durationSeconds: duration,
        topic
      });

      // Auto-share high scores (80%+)
      if (percentage >= 80) {
        await createPost(profile, `I just scored ${percentage}% in ${modeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}!`, 'game_score', {
          score: percentage,
          modeId: modeId
        });
      }
      
      playSound('badge');
    } catch (e) {
      console.error('Failed to log session or analyze', e);
      setAnalyzing(false);
    }
  }, [user, profile, score, questions.length, modeId, awardXP, currentIndex, topic, clearTimer, history]);

  const startGame = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setScore(0);
    setXpEarned(0);
    setCurrentIndex(0);
    setRawData(null);
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameMode: modeId,
          cefrLevel: profile?.cefrLevel ?? 'A2',
          topic,
          userLanguage: profile?.preferredLanguage ?? 'en',
          count: questionCount,
          personaId: profile?.activePersona || null
        })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load questions');
      }
      
      const data = await res.json();
      setRawData(data);
      // Most modes return { questions: [...] } but some use { sentences: [...] } etc.
      // We look for an array in the response object values
      const items = Object.values(data).find(Array.isArray) as T[] | undefined;
      
      if (!items || items.length === 0) {
        throw new Error('Invalid response format from AI');
      }
      
      setQuestions(items);
      setStatus('playing');
      startTimeRef.current = Date.now();
      
      if (timeLimitSeconds) {
        setTimeLeft(timeLimitSeconds);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
               if (!perQuestionTimer) {
                 clearTimer();
                 finishGame();
                 return 0;
               } else {
                 // Auto-answer incorrect and move to next content for per-question timer
                 playSound('wrong');
                 nextQuestion();
                 return timeLimitSeconds; 
               }
            }
            if (prev <= 6) playSound('timer'); // Beep for last 5 seconds
            return prev - 1;
          });
        }, 1000);
      }
      
    } catch (e) {
      setStatus('error');
      setError((e as Error).message);
    }
  }, [modeId, profile, topic, questionCount, timeLimitSeconds, finishGame, clearTimer]);

  const submitAnswer = useCallback((isCorrect: boolean, grammarPoint?: string) => {
    // Record history for the final performance analysis call
    const currentQ = questions[currentIndex];
    setHistory(prev => [...prev, {
      question: currentQ,
      answerIndex: -1, // in GenericMCQGame specific logic handles this, we just need a record
      isCorrect
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
      if (grammarPoint && user) {
        logStrength(user.uid, grammarPoint);
      }
    } else {
      playSound('wrong');
      if (grammarPoint && user) {
        logWeakness(user.uid, grammarPoint);
      }
    }
  }, [user, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (perQuestionTimer && timeLimitSeconds) {
        setTimeLeft(timeLimitSeconds);
      }
    } else {
      finishGame();
    }
  }, [currentIndex, questions.length, finishGame, perQuestionTimer, timeLimitSeconds]);

  const reset = useCallback(() => {
    setStatus('idle');
    setQuestions([]);
    setHistory([]);
    setCurrentIndex(0);
    setScore(0);
    setXpEarned(0);
    setError(null);
    setRawData(null);
    setAnalysis(null);
    setAnalyzing(false);
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer; // cleanup on unmount
  }, [clearTimer]);

  return {
    status,
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex] ?? null,
    score,
    xpEarned,
    timeLeft,
    error,
    rawData,
    analysis,
    analyzing,
    isTimerCritical,
    startGame,
    submitAnswer,
    nextQuestion,
    finishGame,
    reset
  };
}
