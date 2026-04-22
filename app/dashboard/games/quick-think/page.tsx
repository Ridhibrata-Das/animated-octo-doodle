import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function QuickThinkPage() {
  return (
    <GameShell 
      title="Quick Think" 
      description="True or False? Test your grammar intuition with tricky statements."
    >
      <GenericMCQGame modeId="quick-think" title="Quick Think" description="True or False? Test your grammar intuition with tricky statements." />
    </GameShell>
  )
}
