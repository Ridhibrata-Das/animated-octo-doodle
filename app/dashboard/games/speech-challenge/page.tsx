import { GameShell } from "@/components/game/game-shell"
import { SpeechChallengeGame } from "@/components/game/speech-challenge-game"

export default function SpeechChallengePage() {
  return (
    <GameShell 
      title="Speech Challenge" 
      description="Improve your pronunciation by reading English sentences out loud."
    >
      <SpeechChallengeGame />
    </GameShell>
  )
}
