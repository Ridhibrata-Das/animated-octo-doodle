"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Loader2, Play, Send, Bot, User, CheckCircle2, Sparkles, Trophy } from "lucide-react"
import { useGame } from "@/hooks/use-game"
import { ResultModal } from "@/components/game/result-modal"
import { TimerBar } from "@/components/game/timer-bar"
import { AudioButton } from "@/components/common/audio-button"
import { useAuth } from "@/components/providers/auth-provider"

interface ChatScenario {
  id: string;
  scenario: string;
  role: string;
  goal: string;
  assistantTurns: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Result of performance-review call
interface PerformanceAnalysis {
  finalScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  cefrLevelEvaluation: string;
}

export function ChatRoleplayGame() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [turnIndex, setTurnIndex] = useState(0);
  
  const {
    status,
    questions,
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
    finishGame
  } = useGame<ChatScenario>({
    modeId: 'ai-chat-roleplay',
    questionCount: 1,
    timeLimitSeconds: 17,
    perQuestionTimer: true
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat when scenario is loaded
  useEffect(() => {
    if (currentQuestion && messages.length === 0 && currentQuestion.assistantTurns?.length > 0) {
      setMessages([{ role: 'assistant', content: currentQuestion.assistantTurns[0] }]);
    }
  }, [currentQuestion, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !currentQuestion) return;

    const userMessage = input.trim();
    setInput("");
    
    const nextTurnIndex = turnIndex + 1;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    
    // Check if we have more pre-generated turns
    if (nextTurnIndex < currentQuestion.assistantTurns.length) {
      newMessages.push({ role: 'assistant', content: currentQuestion.assistantTurns[nextTurnIndex] });
      setMessages(newMessages);
      setTurnIndex(nextTurnIndex);
    } else {
      setMessages(newMessages);
      // All turns completed
    }
    
    // Record as a successful "answer" for scoring purposes
    submitAnswer(true);
  };

  const handleFinish = async () => {
    await finishGame();
  };

  if (status === 'idle') {
    return (
      <Card className="border-2 text-center p-12">
        <h3 className="text-2xl font-bold mb-4">AI Chat Roleplay</h3>
        <p className="text-muted-foreground mb-8">Practice open-ended conversations with an AI tutor in diverse scenarios.</p>
        <Button size="lg" onClick={startGame} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Play className="w-5 h-5" /> Start Roleplay
        </Button>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="border-2 text-center p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">Preparing Scenario</h3>
        <p className="text-muted-foreground">The AI is setting up the roleplay environment...</p>
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
        onRetry={() => { resetMessages(); startGame(); }}
        nextUrl="/dashboard/games"
        analysis={analysis}
        analyzing={analyzing}
      />
    );
  }

  if (!currentQuestion) return null;
  if (status !== 'playing') return null;

  const resetMessages = () => {
    setMessages([]);
    setTurnIndex(0);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-12rem)] min-h-[500px] flex flex-col">
      {/* Timer Bar */}
      <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 shrink-0 overflow-hidden">
        <TimerBar 
          timeLeft={timeLeft} 
          totalTime={17} 
          isCritical={isTimerCritical}
        />
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400">Scenario: {currentQuestion.scenario}</h3>
            <p className="text-sm text-muted-foreground"><strong>Your Goal:</strong> {currentQuestion.goal}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <Badge variant="outline" className="justify-center bg-background">
              Turn: {turnIndex + 1} / {currentQuestion.assistantTurns?.length || 0}
            </Badge>
            <Button size="sm" variant="outline" onClick={handleFinish} className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
              Finish Chat <CheckCircle2 className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-2 shadow-lg flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-indigo-500" : "bg-emerald-500"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                
                <div className={cn(
                  "p-3 rounded-2xl",
                  msg.role === 'user' 
                    ? "bg-indigo-500 text-white rounded-tr-sm" 
                    : "bg-muted rounded-tl-sm border border-border"
                )}>
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t bg-background shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              placeholder={turnIndex >= (currentQuestion.assistantTurns?.length || 0) - 1 && messages[messages?.length-1]?.role === 'user' ? "Conversation Finished! Click Finish Chat." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={turnIndex >= (currentQuestion.assistantTurns?.length || 0) - 1 && messages[messages?.length-1]?.role === 'user'}
              className="flex-1 bg-muted/50 border-transparent focus-visible:ring-emerald-500"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || (turnIndex >= (currentQuestion.assistantTurns?.length || 0) - 1 && messages[messages?.length-1]?.role === 'user')}
              size="icon"
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

