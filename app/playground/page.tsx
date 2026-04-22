import { GameShell } from "@/components/game/game-shell"
import { PlaygroundContent } from "@/components/playground/playground-content"

export default function PlaygroundPage() {
  return (
    <GameShell 
      title="Sentence Analyzer" 
      description="Explore all 12 English tenses and analyze your own sentences with AI."
    >
      <PlaygroundContent />
    </GameShell>
  )
}
