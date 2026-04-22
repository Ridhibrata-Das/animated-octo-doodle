"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X, ArrowRight, Trophy, Zap, Loader2, Play } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tenseCategory?: string;
}

export function QuizGame() {
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
  } = useGame<QuizQuestion>({
    modeId: 'quiz',
    questionCount: 10,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }, [currentQuestion])

  const handleAnswer = useCallback((index: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(index)
    setShowResult(true)
    
    const isCorrect = index === currentQuestion.correctIndex
    submitAnswer(isCorrect)

    if (isCorrect) {
      setStreak((prev) => prev + 1)
    } else {
      setStreak(0)
    }
  }, [showResult, currentQuestion, submitAnswer])

  if (status === 'idle') {
    return (
      <Card className="border-2 text-center p-12">
        <h3 className="text-2xl font-bold mb-4">Grammar Quiz</h3>
        <p className="text-muted-foreground mb-8">Test your knowledge with 10 AI-generated multiple-choice questions.</p>
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
        <p className="text-muted-foreground">The AI is preparing your quiz...</p>
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
        analysis={analysis}
        analyzing={analyzing}
      />
    );
  }

  if (!currentQuestion) return null;
  if (status !== 'playing') return null;

  const progress = (currentIndex / (questions?.length || 1)) * 100
  const isCorrectAnswer = selectedAnswer === currentQuestion.correctIndex

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {currentQuestion.tenseCategory && (
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
            {currentQuestion.tenseCategory}
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

      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions?.length || 0}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main game area */}
      <Card className="border-2 border-indigo-500/20 shadow-lg">
        {!showResult && (
          <TimerBar 
            timeLeft={timeLeft} 
            totalTime={17} 
            isCritical={isTimerCritical}
            className="rounded-t-lg" 
          />
        )}        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          
          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              let btnClass = "justify-start text-left h-auto py-3 px-4 text-sm sm:text-base transition-all"
              
              if (showResult) {
                if (index === currentQuestion.correctIndex) {
                  btnClass = cn(btnClass, "bg-emerald-500/20 hover:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300")
                } else if (index === selectedAnswer) {
                  btnClass = cn(btnClass, "bg-red-500/20 hover:bg-red-500/20 border-red-500 text-red-700 dark:text-red-300")
                } else {
                  btnClass = cn(btnClass, "opacity-50 cursor-not-allowed border-dashed")
                }
              } else {
                btnClass = cn(btnClass, "hover:border-indigo-500 hover:bg-indigo-500/5")
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={btnClass}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                >
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </Button>
              )
            })}
          </div>

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
                    {isCorrectAnswer ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
              >
                Next Question
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

