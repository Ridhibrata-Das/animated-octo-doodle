import { GameShell } from "@/components/game/game-shell"
import { DictationMasterGame } from "@/components/game/dictation-master-game"

export default function DictationMasterPage() {
  return (
    <GameShell 
      title="Dictation Master" 
      description="Listen to the audio and type exactly what you hear to improve your listening skills."
    >
      <DictationMasterGame />
    </GameShell>
  )
}
