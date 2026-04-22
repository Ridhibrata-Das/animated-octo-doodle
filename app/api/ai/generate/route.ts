import { NextResponse } from 'next/server';
import { callGeminiJSON, GeminiError } from '@/lib/ai/gemini-pool';
import { buildPrompt } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const { gameMode, cefrLevel = 'A2', topic = 'General', userLanguage = 'en', count = 5, personaId, performanceData } = await request.json();

    if (!gameMode) {
      return NextResponse.json({ error: 'gameMode is required' }, { status: 400 });
    }

    const prompt = buildPrompt(gameMode, cefrLevel, topic, userLanguage, count, personaId, { performanceData });
    
    const result = await callGeminiJSON(prompt, { 
      temperature: gameMode === 'performance-review' ? 0.3 : 0.85, 
      maxOutputTokens: 2048 
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError && err.status === 429) {
      return NextResponse.json({ error: 'AI service temporarily unavailable. Please try again in a moment.' }, { status: 503 });
    }
    console.error('[/api/ai/generate]', err);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
