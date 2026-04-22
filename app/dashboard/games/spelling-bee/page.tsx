import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function SpellingBeePage() {
  return (
    <GameShell 
      title="Spelling Bee" 
      description="Listen to the word and select the correct spelling."
    >
      <GenericMCQGame modeId="spelling-bee" title="Spelling Bee" description="Listen to the word and select the correct spelling." />
    </GameShell>
  )
}
