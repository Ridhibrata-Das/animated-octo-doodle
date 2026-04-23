"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X, ArrowRight, Trophy, Zap, Loader2, Play, Volume2 } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"
import { speakText } from "@/lib/speech"

interface DictationSentence {
  id: string;
  text: string;
  difficulty: string;
  focusPoint: string;
  grammarPoint?: string;
}

export function DictationMasterGame() {
  const {
    status,
    questions,
    currentIndex,
    currentQuestion,
    score,
    xpEarned,
    error,
    analysis,
    analyzing,
    timeLeft,
    isTimerCritical,
    startGame,
    submitAnswer,
    nextQuestion,
    reset
  } = useGame<DictationSentence>({
    modeId: 'dictation-master',
    questionCount: 5,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });

  const [input, setInput] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (currentQuestion) {
      setInput("")
      setShowResult(false)
    }
  }, [currentQuestion])

  const playAudio = useCallback(() => {
    if (currentQuestion) {
      speakText(currentQuestion.text, { rate: 0.85 }); // Slightly slower for dictation
    }
  }, [currentQuestion])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (showResult || !currentQuestion || !input.trim()) return;
    
    setShowResult(true)
    
    // Simple text normalization for comparison
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const isCorrect = normalize(input) === normalize(currentQuestion.text);
    submitAnswer(isCorrect, currentQuestion.grammarPoint)

    if (isCorrect) {
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }
  }, [showResult, currentQuestion, input, submitAnswer])

  if (status === 'idle') {
    return (
      <Card className="border-2 text-center p-12">
        <h3 className="text-2xl font-bold mb-4">Dictation Master</h3>
        <p className="text-muted-foreground mb-8">Listen carefully to the audio and type exactly what you hear.</p>
        <Button size="lg" onClick={startGame} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Play className="w-5 h-5" /> Start Dictation
        </Button>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="border-2 text-center p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">Preparing Audio</h3>
        <p className="text-muted-foreground">The AI is generating dictation sentences...</p>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="border-2 border-red-500/50 text-center p-12">
        <h3 className="text-xl font-bold text-red-500 mb-2">Oops!</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={startGame} variant="outline">Try Again</Button>
      </Card>
    );
  }

  if (status === 'finished') {
    return (
      <ResultModal 
        isOpen={true}
        score={score}
        total={questions?.length || 0}
        xpEarned={xpEarned}
        onRetry={startGame}
        nextUrl="/dashboard"
        analysis={analysis}
        analyzing={analyzing}
      />
    );
  }

  if (!currentQuestion) return null;
  if (status !== 'playing') return null;

  const progress = (currentIndex / (questions?.length || 1)) * 100;
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const isCorrectAnswer = normalize(input) === normalize(currentQuestion.text);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {currentQuestion.focusPoint && (
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
            Focus: {currentQuestion.focusPoint}
          </Badge>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          <Badge variant="outline" className="gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
            Score: {score}
          </Badge>
          <Badge variant="outline" className={cn("gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm", streak > 0 && "bg-emerald-500/10 border-emerald-500/50")}>
            <Zap className={cn("h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground", streak > 0 && "text-emerald-500")} />
            Streak: {streak}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>Dictation {currentIndex + 1} of {questions?.length || 0}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <Card className="border-2 border-primary/20 shadow-lg relative overflow-hidden">
        {!showResult && (
          <TimerBar 
            timeLeft={timeLeft} 
            totalTime={17} 
            isCritical={isTimerCritical}
          />
        )}        <CardHeader className="pb-6 pt-8 items-center border-b bg-muted/30">
          <Button 
            onClick={playAudio} 
            size="lg" 
            className="w-24 h-24 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20"
          >
            <Volume2 className="w-12 h-12" />
          </Button>
          <p className="text-muted-foreground mt-4 font-medium">Click to listen</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what you hear..."
              className="h-14 text-lg text-center"
              disabled={showResult}
              autoComplete="off"
              autoFocus
            />
            {!showResult && (
              <Button type="submit" disabled={!input.trim()} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
                Check Answer
              </Button>
            )}
          </form>

          {/* Result and Explanation */}
          {showResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div
                className={cn(
                  "p-4 rounded-xl flex items-start gap-3",
                  isCorrectAnswer ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                )}
              >
                {isCorrectAnswer ? (
                  <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <X className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={cn("font-semibold mb-1", isCorrectAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {isCorrectAnswer ? "Perfect!" : "Not quite"}
                  </p>
                  {!isCorrectAnswer && (
                    <div className="space-y-2 mt-2">
                      <p className="text-sm text-muted-foreground">You typed:</p>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">{input}</p>
                      <p className="text-sm text-muted-foreground mt-2">Correct sentence:</p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{currentQuestion.text}</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
              >
                Next Sentence
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

