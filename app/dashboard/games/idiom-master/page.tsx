import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function IdiomMasterPage() {
  return (
    <GameShell 
      title="Idiom Master" 
      description="Learn common English idioms and their meanings."
    >
      <GenericMCQGame modeId="idiom-master" title="Idiom Master" description="Learn common English idioms and their meanings." />
    </GameShell>
  )
}
