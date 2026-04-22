import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function PrepositionParkPage() {
  return (
    <GameShell 
      title="Preposition Park" 
      description="Select the correct preposition of time, place, or direction."
    >
      <GenericMCQGame modeId="preposition-park" title="Preposition Park" description="Select the correct preposition of time, place, or direction." />
    </GameShell>
  )
}
