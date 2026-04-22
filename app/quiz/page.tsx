import { GameShell } from "@/components/game/game-shell"
import { QuizGame } from "@/components/game/quiz-game"

export default function QuizPage() {
  return (
    <GameShell 
      title="Grammar Quiz" 
      description="Test your knowledge with AI-generated multiple-choice questions on English grammar and tenses."
    >
      <QuizGame />
    </GameShell>
  )
}
