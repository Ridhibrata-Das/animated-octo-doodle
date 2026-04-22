import { GameShell } from "@/components/game/game-shell"
import { RainfallGame } from "@/components/game/rainfall-game"

export default function RainfallPage() {
  return (
    <GameShell 
      title="Word Rainfall" 
      description="Catch falling words in the correct order to form sentences. Beat the clock!"
    >
      <RainfallGame />
    </GameShell>
  )
}
