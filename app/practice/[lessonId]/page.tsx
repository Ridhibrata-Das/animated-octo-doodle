'use client';

import { useParams, useRouter } from 'next/navigation';
import { LESSONS } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play, Info } from 'lucide-react';

export default function LessonDetailsPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  
  const lesson = LESSONS.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Lesson not found</h1>
        <Button onClick={() => router.push('/practice')}>Return to Practice</Button>
      </div>
    );
  }

  // Choose the first game mode for this lesson as the primary action for now.
  const primaryMode = lesson.gameModes[0] || 'multiple-choice';

  return (
    <div className="container max-w-3xl py-12 space-y-8 min-h-[80vh]">
      <Button variant="ghost" onClick={() => router.push('/practice')} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Curriculum
      </Button>

      <Card className="p-8 border-primary/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground font-black px-3 py-1 rounded-lg">
              {lesson.cefrLevel}
            </span>
            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-sm">
              {lesson.grammarPoint}
            </span>
          </div>
          
          <h1 className="text-4xl font-black">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {lesson.description}
          </p>

          <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 border border-border/50">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Lesson Objectives</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Master the use of {lesson.grammarPoint}.</li>
                <li>Complete interactive challenges in {lesson.gameModes.join(' and ').replace(/-/g, ' ')}.</li>
                <li>Earn up to {lesson.xpReward} XP upon mastery.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="gap-2 w-full sm:w-auto text-lg h-14 px-8"
              onClick={() => router.push(`/game/${primaryMode}?topic=${encodeURIComponent(lesson.grammarPoint)}&level=${lesson.cefrLevel}`)}
            >
              <Play className="w-5 h-5 fill-current" /> Start Lesson
            </Button>
            
            {lesson.gameModes.slice(1).map(mode => (
              <Button 
                key={mode}
                size="lg" 
                variant="outline"
                className="gap-2 w-full sm:w-auto h-14"
                onClick={() => router.push(`/game/${mode}?topic=${encodeURIComponent(lesson.grammarPoint)}&level=${lesson.cefrLevel}`)}
              >
                Play {mode.replace(/-/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
