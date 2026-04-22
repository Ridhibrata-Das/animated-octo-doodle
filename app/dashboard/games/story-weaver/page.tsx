import { GameShell } from "@/components/game/game-shell"
import { StoryWeaverGame } from "@/components/game/story-weaver-game"

export default function StoryWeaverPage() {
  return (
    <GameShell 
      title="Story Weaver" 
      description="Fill in the blanks to complete the AI-generated short story."
    >
      <StoryWeaverGame />
    </GameShell>
  )
}
