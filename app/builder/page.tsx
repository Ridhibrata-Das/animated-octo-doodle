import { SentenceBuilderGame } from "@/components/game/sentence-builder-game"
import { GameShell } from "@/components/game/game-shell"

export default function BuilderPage() {
  return (
    <GameShell 
      title="Sentence Builder" 
      description="Drag and drop words to build correct English sentences."
    >
      <SentenceBuilderGame />
    </GameShell>
  )
}
