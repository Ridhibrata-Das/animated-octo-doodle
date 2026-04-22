import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function ContextDetectivePage() {
  return (
    <GameShell 
      title="Context Detective" 
      description="Read the short paragraph and infer the meaning of the highlighted word."
    >
      <GenericMCQGame modeId="context-detective" title="Context Detective" description="Read the short paragraph and infer the meaning of the highlighted word." />
    </GameShell>
  )
}
