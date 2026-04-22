import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function GrammarPuzzlePage() {
  return (
    <GameShell 
      title="Grammar Puzzle" 
      description="Select the grammatically correct option to complete the sentence."
    >
      <GenericMCQGame modeId="grammar-puzzle" title="Grammar Puzzle" description="Select the grammatically correct option to complete the sentence." />
    </GameShell>
  )
}
