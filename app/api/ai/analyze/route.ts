import { NextResponse } from 'next/server';
import { callGeminiJSON, GeminiError } from '@/lib/ai/gemini-pool';
import type { TenseAnalysisResult } from '@/services/ai-service';
import { detectTenseLocally } from '@/lib/utils/tense-patterns';

export async function POST(request: Request) {
  try {
    const { sentence, sourceLanguage = 'auto', userLanguage = 'en' } = await request.json();
    if (!sentence?.trim()) {
      return NextResponse.json({ error: 'Sentence is required' }, { status: 400 });
    }

    // Try local detection FIRST to save API quota
    const localResult = detectTenseLocally(sentence);
    if (localResult) {
      return NextResponse.json({
        ...localResult,
        englishTranslation: sentence, // Local restate
        breakdown: { subject: 'Detected', verb: 'Detected', object: '', auxiliaryVerb: '' },
        alternativeTenses: [],
        isLocal: true // Metadata for debugging/telemetry
      });
    }

    const langNote = userLanguage !== 'en'
      ? `Provide explanation in the user's language (language code: ${userLanguage}) when possible.`
      : '';

    const prompt = `Analyze the following English sentence for tense and grammar structure.
Sentence: "${sentence}"
Source language hint: ${sourceLanguage}
${langNote}

Return ONLY valid JSON matching this exact schema:
{
  "detectedTense": "string",
  "tenseCategory": "past" | "present" | "future",
  "formula": "string",
  "englishTranslation": "string",
  "explanation": "string",
  "breakdown": {
    "subject": "string",
    "verb": "string",
    "object": "string",
    "auxiliaryVerb": "string"
  },
  "alternativeTenses": [
    {"tense": "string", "sentence": "string", "usage": "string"}
  ],
  "confidence": 0.95
}`;

    const result = await callGeminiJSON<TenseAnalysisResult>(prompt, { temperature: 0.3 });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
