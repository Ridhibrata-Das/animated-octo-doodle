"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AudioButton } from "@/components/common/audio-button"
import { cn } from "@/lib/utils"
import { Check, X, RotateCcw, ArrowRight, Trophy, Zap, Loader2, Play } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"

interface AiSentence {
  id: string;
  words: string[];
  correctOrder: number[];
  hint: string;
  tense: string;
  grammarPoint?: string;
}

export function SentenceBuilderGame() {
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
  } = useGame<AiSentence>({
    modeId: 'sentence-builder',
    questionCount: 10,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });

  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)

  // Initialize available words when a new question loads
  useEffect(() => {
    if (currentQuestion) {
      setAvailableWords([...currentQuestion.words])
      setSelectedWords([])
      setIsCorrect(null)
      setShowResult(false)
    }
  }, [currentQuestion])

  const handleWordSelect = useCallback((word: string, index: number) => {
    setSelectedWords((prev) => [...prev, word])
    setAvailableWords((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleWordRemove = useCallback((word: string, index: number) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== index))
    setAvailableWords((prev) => [...prev, word])
  }, [])

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return;
    
    // Check if the sequence matches correctOrder
    const correctSentence = currentQuestion.correctOrder.map(i => currentQuestion.words[i]).join(" ")
    const userSentence = selectedWords.join(" ")
    
    const correct = userSentence === correctSentence

    setIsCorrect(correct)
    setShowResult(true)
    submitAnswer(correct, currentQuestion.grammarPoint)

    if (correct) {
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }
  }, [selectedWords, currentQuestion, submitAnswer])

  const resetCurrent = useCallback(() => {
    if (currentQuestion) {
      setAvailableWords([...currentQuestion.words])
      setSelectedWords([])
      setIsCorrect(null)
      setShowResult(false)
    }
  }, [currentQuestion])

  if (status === 'idle') {
    return (
      <Card className="border-2 text-center p-12">
        <h3 className="text-2xl font-bold mb-4">Ready to build sentences?</h3>
        <p className="text-muted-foreground mb-8">AI will generate 10 dynamic sentences for you to unscramble based on your level.</p>
        <Button size="lg" onClick={startGame} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Play className="w-5 h-5" /> Start Game
        </Button>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="border-2 text-center p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">Generating Questions</h3>
        <p className="text-muted-foreground">The AI is creating your personalized sentences...</p>
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
        nextUrl="/dashboard/games"
      />
    );
  }

  if (!currentQuestion) return null;
  if (status !== 'playing') return null;

  const progress = ((currentIndex) / (questions?.length || 1)) * 100
  const correctSentence = currentQuestion.correctOrder.map(i => currentQuestion.words[i]).join(" ")

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
          {currentQuestion.tense}
        </Badge>

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
          <span>
            Question {currentIndex + 1} of {questions?.length || 0}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <Card className="border-2 border-indigo-500/20 shadow-lg relative overflow-hidden">
        {!showResult && (
          <TimerBar 
            timeLeft={timeLeft} 
            totalTime={17} 
            isCritical={isTimerCritical}
          />
        )}        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center justify-between text-sm sm:text-base">
            <span>Translate this sentence:</span>
            <AudioButton text={correctSentence} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Hint / Meaning */}
          <div className="p-3 sm:p-4 rounded-xl text-center bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            <p className="font-medium text-lg sm:text-2xl">
              {currentQuestion.hint}
            </p>
          </div>

          {/* Selected words area */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Your sentence:</p>
            <div
              className={cn(
                "min-h-16 sm:min-h-20 p-3 sm:p-4 border-2 border-dashed rounded-xl flex flex-wrap gap-1.5 sm:gap-2 items-center transition-colors",
                selectedWords.length === 0 && "justify-center border-border/50",
                isCorrect === true && "border-emerald-500 bg-emerald-500/10",
                isCorrect === false && "border-red-500 bg-red-500/10",
                selectedWords.length > 0 && isCorrect === null && "border-indigo-500/50"
              )}
            >
              {selectedWords.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">Click words below to build your sentence...</p>
              ) : (
                selectedWords.map((word, index) => (
                  <Button
                    key={`${word}-selected-${index}`}
                    variant="secondary"
                    size="sm"
                    className="transition-all text-sm sm:text-lg sm:px-6 h-8 sm:h-10 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleWordRemove(word, index)}
                    disabled={showResult}
                  >
                    {word}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Available words */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Available words:</p>
            <div className="p-3 sm:p-4 bg-muted/50 rounded-xl flex flex-wrap gap-2 sm:gap-3">
              {availableWords.map((word, index) => (
                <Button
                  key={`${word}-avail-${index}`}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105 text-sm sm:text-lg sm:px-6 h-8 sm:h-10 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10"
                  onClick={() => handleWordSelect(word, index)}
                  disabled={showResult}
                >
                  {word}
                </Button>
              ))}
              {availableWords.length === 0 && !showResult && (
                <p className="text-xs sm:text-sm text-muted-foreground w-full text-center">All words used. Check your answer!</p>
              )}
            </div>
          </div>

          {/* Result message */}
          {showResult && (
            <div
              className={cn(
                "p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3",
                isCorrect ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400",
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm sm:text-base">Excellent!</p>
                    <p className="text-xs sm:text-sm opacity-90">
                      Perfect sentence structure.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base">Not quite right</p>
                    <p className="text-xs sm:text-sm opacity-90 break-words">Correct: {correctSentence}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCurrent}
              className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-9 sm:h-10"
              disabled={selectedWords.length === 0 || showResult}
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset
            </Button>
            {!showResult ? (
              <Button
                onClick={checkAnswer}
                size="sm"
                className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10 bg-indigo-600 hover:bg-indigo-700"
                disabled={selectedWords.length !== currentQuestion.words.length}
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                size="sm"
                className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10 bg-indigo-600 hover:bg-indigo-700"
              >
                Next Sentence
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

