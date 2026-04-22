import { GameShell } from "@/components/game/game-shell"
import { GenericMCQGame } from "@/components/game/generic-mcq-game"

export default function ArticleAlleyPage() {
  return (
    <GameShell 
      title="Article Alley" 
      description="Choose the correct article (a, an, the, or no article)."
    >
      <GenericMCQGame modeId="article-alley" title="Article Alley" description="Choose the correct article (a, an, the, or no article)." />
    </GameShell>
  )
}
