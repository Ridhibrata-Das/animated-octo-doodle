import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function SynonymSprintPage() {
  return (
    <GameShell 
      title="Synonym Sprint" 
      description="Find the closest synonym for the given word before time runs out!"
    >
      <GenericMCQGame modeId="synonym-sprint" title="Synonym Sprint" description="Find the closest synonym for the given word before time runs out!" />
    </GameShell>
  )
}
