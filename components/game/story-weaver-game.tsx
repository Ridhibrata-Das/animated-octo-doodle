"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X, ArrowRight, Trophy, Zap, Loader2, Play, Share2 } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"
import { AudioButton } from "@/components/common/audio-button"
import { useAuth } from "@/components/providers/auth-provider"
import { createPost } from "@/lib/firestore"
import { toast } from "sonner"

interface BlankQuestion {
  id: string;
  correctWord: string;
  options: string[];
  hint: string;
}

export function StoryWeaverGame() {
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
    rawData // We need this to get the story content
  } = useGame<BlankQuestion>({
    modeId: 'story-weaver',
    questionCount: 5,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasPublished, setHasPublished] = useState(false)
  const { profile } = useAuth()

  // Extract story content
  const story = rawData?.story || rawData;

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
    
    const isCorrect = currentQuestion.options[index] === currentQuestion.correctWord;
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
        <h3 className="text-2xl font-bold mb-4">Story Weaver</h3>
        <p className="text-muted-foreground mb-8">Fill in the blanks to complete the AI-generated story.</p>
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
        <h3 className="text-xl font-bold mb-2">Weaving Story</h3>
        <p className="text-muted-foreground">The AI is writing a unique story for you...</p>
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

  const handlePublish = async () => {
    if (!profile || !story?.content || hasPublished) return;
    setIsPublishing(true);
    try {
      let finalStory = story.content;
      questions.forEach((q) => {
        finalStory = finalStory.replace('[blank]', q.correctWord);
      });

      await createPost(profile, `I completed a Story Weaver challenge with ${score}/${questions.length} score!\n\n"${finalStory}"`, 'game_score', {
        gameMode: 'Story Weaver',
        score: score,
        xpEarned: xpEarned
      });
      setHasPublished(true);
      toast.success("Story published to community!");
    } catch (error) {
      toast.error("Failed to publish story.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (status === 'finished') {
    return (
      <ResultModal 
        isOpen={true}
        score={score}
        total={questions?.length || 0}
        xpEarned={xpEarned}
        onRetry={startGame}
        nextUrl="/dashboard"
      >
        {!hasPublished ? (
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing} 
            className="w-full gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            {isPublishing ? "Publishing..." : "Publish to Community"}
          </Button>
        ) : (
          <div className="w-full text-center p-3 bg-emerald-500/10 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Published to Community Feed!
          </div>
        )}
      </ResultModal>
    );
  }

  if (!currentQuestion) return null;
  if (status !== 'playing') return null;

  const progress = (currentIndex / (questions?.length || 1)) * 100
  const isCorrectAnswer = selectedAnswer !== null && currentQuestion.options[selectedAnswer] === currentQuestion.correctWord;

  // Replace blanks in story
  let displayContent = story?.content || "";
  
  // Create an array of parts separated by [blank]
  const parts = displayContent.split("[blank]");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          <span>Blank {currentIndex + 1} of {questions?.length || 0}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-2 border-indigo-500/20 shadow-lg relative overflow-hidden">
        {!showResult && (
          <TimerBar 
            timeLeft={timeLeft} 
            totalTime={17} 
            isCritical={isTimerCritical}
          />
        )}        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex justify-between items-start mb-4">
            <CardTitle className="text-xl sm:text-2xl leading-relaxed flex-1">
              {story?.title || "A Story"}
            </CardTitle>
            <AudioButton text={displayContent.replace(/\[blank\]/g, "blank")} />
          </div>
          
          <div className="text-lg leading-loose text-foreground/90 bg-muted/30 p-4 sm:p-6 rounded-xl border">
            {parts.map((part: string, i: number) => {
              if (i === parts.length - 1) return <span key={i}>{part}</span>;
              
              let blankContent = "____";
              let blankClass = "inline-block px-2 py-1 mx-1 border-b-2 font-semibold min-w-[80px] text-center";
              
              if (i < currentIndex) {
                // Completed blanks
                blankContent = questions[i].correctWord;
                blankClass = cn(blankClass, "border-emerald-500 text-emerald-600");
              } else if (i === currentIndex) {
                // Current blank
                if (showResult && selectedAnswer !== null) {
                  blankContent = currentQuestion.options[selectedAnswer];
                  blankClass = cn(blankClass, isCorrectAnswer ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600 line-through decoration-2");
                } else {
                  blankContent = "???";
                  blankClass = cn(blankClass, "border-indigo-500 text-indigo-500 bg-indigo-500/10 animate-pulse rounded");
                }
              } else {
                // Future blanks
                blankClass = cn(blankClass, "border-muted-foreground/30 text-muted-foreground/50");
              }
              
              return (
                <span key={i}>
                  {part}
                  <span className={blankClass}>{blankContent}</span>
                </span>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          
          {currentQuestion.hint && (
            <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900 mb-4 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Hint: {currentQuestion.hint}</p>
            </div>
          )}
          
          {/* Options */}
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              let btnClass = "justify-start text-left h-auto py-3 px-4 text-sm sm:text-base transition-all"
              
              if (showResult) {
                if (option === currentQuestion.correctWord) {
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
                  <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="break-words">{option}</span>
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
                  {!isCorrectAnswer && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The correct word was <strong>{currentQuestion.correctWord}</strong>.
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
              >
                Next Blank
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

// Need to import Lightbulb at the top
import { Lightbulb } from "lucide-react"

