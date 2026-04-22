import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function VerbVoyagerPage() {
  return (
    <GameShell 
      title="Verb Voyager" 
      description="Navigate through English verb conjugations and irregular verbs."
    >
      <GenericMCQGame modeId="verb-voyager" title="Verb Voyager" description="Navigate through English verb conjugations and irregular verbs." />
    </GameShell>
  )
}
