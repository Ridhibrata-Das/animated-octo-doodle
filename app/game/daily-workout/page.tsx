"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { getTopWeaknesses, type GrammarWeakness } from '@/lib/srs-engine'
import { GenericMCQGame } from '@/components/game/generic-mcq-game'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, BrainCircuit } from 'lucide-react'

export default function DailyWorkoutPage() {
  const { user } = useAuth()
  const [weaknesses, setWeaknesses] = useState<GrammarWeakness[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [topic, setTopic] = useState('General grammar review')

  useEffect(() => {
    async function loadWeaknesses() {
      if (!user) return
      
      try {
        const topWeaknesses = await getTopWeaknesses(user.uid, 3)
        setWeaknesses(topWeaknesses)
        
        if (topWeaknesses.length > 0) {
          const names = topWeaknesses.map(w => w.grammarPoint).join(', ')
          setTopic(`Focusing on: ${names}`)
        }
      } catch (error) {
        console.error('Failed to load weaknesses', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeaknesses()
  }, [user])

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Personalizing your workout...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          Daily Custom Workout
        </h1>
        <p className="text-muted-foreground">
          AI-generated exercises based on your recent mistakes and learning patterns.
        </p>
      </div>

      <GenericMCQGame 
        modeId="daily-workout"
        title="Custom Session"
        description={topic}
        questionCount={10}
      />
      
      {weaknesses.length === 0 && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Note: You haven't made many mistakes yet! This session will provide a general grammar review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
