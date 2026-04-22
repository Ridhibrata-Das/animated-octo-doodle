import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function OddOneOutPage() {
  return (
    <GameShell 
      title="Odd One Out" 
      description="Identify the word that doesn't belong with the others."
    >
      <GenericMCQGame modeId="odd-one-out" title="Odd One Out" description="Identify the word that doesn't belong with the others." />
    </GameShell>
  )
}
