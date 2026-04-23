"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ArrowRight, Trophy, Zap, Loader2, Play, Mic, Square, RefreshCcw, Check, X, Lightbulb } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"
import { AudioButton } from "@/components/common/audio-button"

// Type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechSentence {
  id: string;
  text: string;
  difficulty: string;
  pronunciationTips: string;
  focusSound: string;
  grammarPoint?: string;
}

export function SpeechChallengeGame() {
  const {
    status,
    score,
    questions,
    currentQuestion,
    currentIndex,
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
  } = useGame<SpeechSentence>({
    modeId: 'speech-challenge',
    questionCount: 5,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });

  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [missedWords, setMissedWords] = useState<string[]>([])
  const [speechError, setSpeechError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize SpeechRecognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setSpeechError(`Microphone error: ${event.error}`);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } else {
        setSpeechError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      }
    }
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      setTranscript("")
      setShowResult(false)
      setAccuracy(0)
      setMissedWords([])
      setSpeechError(null)
    }
  }, [currentQuestion])

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // We process the result when they stop manually or it stops automatically
      if (transcript && currentQuestion) {
        evaluateSpeech(transcript, currentQuestion.text);
      }
    } else {
      setTranscript("");
      setSpeechError(null);
      setShowResult(false);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isRecording, transcript, currentQuestion]);

  // Watch for end of recording to trigger evaluation if not already evaluated
  useEffect(() => {
    if (!isRecording && transcript && !showResult && currentQuestion) {
      evaluateSpeech(transcript, currentQuestion.text);
    }
  }, [isRecording, transcript, showResult, currentQuestion]);

  const evaluateSpeech = (spoken: string, expected: string) => {
    if (!spoken.trim()) return;
    
    // Simple string similarity for grading (Levenshtein would be better in prod)
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const spokenWords = normalize(spoken).split(/\s+/);
    const expectedWords = normalize(expected).split(/\s+/);
    
    let matches = 0;
    expectedWords.forEach(word => {
      if (spokenWords.includes(word)) matches++;
    });
    
    const acc = Math.round((matches / expectedWords.length) * 100);
    setAccuracy(Math.min(acc, 100)); // Cap at 100
    
    const missed = expectedWords.filter(word => !spokenWords.includes(word));
    setMissedWords(missed);
    
    const isCorrect = acc >= 75; // 75% accuracy required to pass
    
    setShowResult(true);
    submitAnswer(isCorrect, currentQuestion?.grammarPoint);

    if (isCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  if (status === 'idle') {
    return (
      <Card className="border-2 text-center p-12">
        <h3 className="text-2xl font-bold mb-4">Speech Challenge</h3>
        <p className="text-muted-foreground mb-8">Read the sentences aloud. The AI will listen and score your pronunciation.</p>
        <Button size="lg" onClick={startGame} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Play className="w-5 h-5" /> Start Speaking
        </Button>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="border-2 text-center p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">Preparing Sentences</h3>
        <p className="text-muted-foreground">The AI is generating pronunciation challenges...</p>
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
  const isCorrectAnswer = accuracy >= 75;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {currentQuestion.focusSound && (
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
            Focus Sound: /{currentQuestion.focusSound}/
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
          <span>Challenge {currentIndex + 1} of {questions?.length || 0}</span>
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
        )}        {isRecording && (
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
        )}
        <CardHeader className="pb-4 sm:pb-6 items-center text-center">
          <CardTitle className="text-2xl sm:text-3xl leading-relaxed font-bold tracking-tight mb-2">
            "{currentQuestion.text}"
          </CardTitle>
          <div className="flex items-center gap-4 text-muted-foreground">
            <AudioButton text={currentQuestion.text} />
            <span className="text-sm">Listen to the correct pronunciation</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex flex-col items-center">
          
          <div className="relative">
            <Button 
              onClick={toggleRecording} 
              size="lg" 
              className={cn(
                "w-24 h-24 rounded-full shadow-xl transition-all duration-300",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/50 scale-105" 
                  : showResult 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
              )}
              disabled={showResult}
            >
              {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </Button>
            {isRecording && (
              <span className="absolute -inset-4 rounded-full border-4 border-red-500/30 animate-ping pointer-events-none" />
            )}
          </div>
          
          <p className="text-sm font-medium text-muted-foreground">
            {isRecording ? "Listening... (Tap to stop)" : showResult ? "Evaluation complete" : "Tap the microphone to start speaking"}
          </p>
          
          {isCorrectAnswer && (
            <div className="flex items-center gap-2 text-emerald-500 animate-bounce">
              <Zap className="w-5 h-5 fill-current" />
              <span className="font-bold text-lg">+10 Score!</span>
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-red-500/10 text-red-600 text-sm rounded-lg border border-red-500/20">
              {speechError}
            </div>
          )}

          {transcript && (
            <div className="w-full bg-muted/50 rounded-xl p-4 border text-center relative mt-4">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">You said:</p>
              <p className="text-lg italic font-medium">"{transcript}"</p>
              {isRecording && <span className="absolute bottom-4 right-4 flex w-3 h-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            </div>
          )}

          {/* Result and Explanation */}
          {showResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 w-full mt-4">
              <div
                className={cn(
                  "p-4 rounded-xl flex items-start gap-3 w-full",
                  isCorrectAnswer ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
                )}
              >
                {isCorrectAnswer ? (
                  <Check className="h-8 w-8 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <RefreshCcw className="h-8 w-8 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className={cn("font-bold text-lg", isCorrectAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                      {isCorrectAnswer ? "Excellent!" : "Needs Practice"}
                    </p>
                    <Badge variant={isCorrectAnswer ? "default" : "secondary"} className={cn(isCorrectAnswer && "bg-emerald-500 hover:bg-emerald-600")}>
                      {accuracy}% Match
                    </Badge>
                  </div>
                  
                  {currentQuestion.pronunciationTips && (
                    <div className="mt-3 p-3 bg-background/50 rounded-lg text-sm">
                      <strong className="text-foreground">Tip:</strong> {currentQuestion.pronunciationTips}
                    </div>
                  )}

                  {!isCorrectAnswer && missedWords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Words to focus on:</p>
                      <div className="flex flex-wrap gap-1">
                        {missedWords.map((word, i) => (
                          <Badge key={i} variant="outline" className="bg-amber-500/5 border-amber-500/30 text-amber-700 dark:text-amber-400">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!isCorrectAnswer && (
                    <Button variant="link" onClick={() => { setShowResult(false); setTranscript(""); }} className="px-0 h-auto text-amber-600 mt-2">
                      Try Again
                    </Button>
                  )}
                </div>
              </div>

              <Button
                onClick={nextQuestion}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
              >
                Next Challenge
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

