import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function WordMatchPage() {
  return (
    <GameShell 
      title="Word Match" 
      description="Match the word with its correct definition."
    >
      <GenericMCQGame modeId="word-match" title="Word Match" description="Match the word with its correct definition." />
    </GameShell>
  )
}
