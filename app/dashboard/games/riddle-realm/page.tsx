import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function RiddleRealmPage() {
  return (
    <GameShell 
      title="Riddle Realm" 
      description="Solve English language riddles that test your vocabulary and wordplay."
    >
      <GenericMCQGame modeId="riddle-realm" title="Riddle Realm" description="Solve English language riddles that test your vocabulary and wordplay." />
    </GameShell>
  )
}
