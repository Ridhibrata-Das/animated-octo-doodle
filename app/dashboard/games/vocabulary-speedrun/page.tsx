import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function VocabularySpeedrunPage() {
  return (
    <GameShell 
      title="Vocabulary Speedrun" 
      description="Answer vocabulary questions as fast as you can. You have 10 seconds per question!"
    >
      <GenericMCQGame modeId="vocabulary-speedrun" title="Vocabulary Speedrun" description="Answer vocabulary questions as fast as you can. You have 10 seconds per question!" />
    </GameShell>
  )
}
