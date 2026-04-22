import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function PhrasalVerbQuestPage() {
  return (
    <GameShell 
      title="Phrasal Verb Quest" 
      description="Choose the correct phrasal verb to complete the sentence."
    >
      <GenericMCQGame modeId="phrasal-verb-quest" title="Phrasal Verb Quest" description="Choose the correct phrasal verb to complete the sentence." />
    </GameShell>
  )
}
