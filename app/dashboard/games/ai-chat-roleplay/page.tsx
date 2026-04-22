import { GameShell } from "@/components/game/game-shell"
import { ChatRoleplayGame } from "@/components/game/chat-roleplay-game"

export default function ChatRoleplayPage() {
  return (
    <GameShell 
      title="AI Chat Roleplay" 
      description="Practice real-life English conversations with our AI tutor."
    >
      <ChatRoleplayGame />
    </GameShell>
  )
}
