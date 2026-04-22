import { NextResponse } from "next/server";
import { callGeminiJSON, GeminiError } from '@/lib/ai/gemini-pool';
import type { TranslationResult } from '@/services/ai-service';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage, sourceLanguage = "auto" } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Please provide valid text to translate" }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({ error: "Please specify a target language" }, { status: 400 });
    }

    const prompt = `Translate this text:
Original: "${text}"
From: ${sourceLanguage}
To: ${targetLanguage}

Your response MUST be valid JSON with this exact structure:
{
  "originalText": "${text}",
  "translatedText": "string - the translated text",
  "sourceLanguage": "string - detected or specified source language",
  "targetLanguage": "${targetLanguage}",
  "tenseUsed": "string or null - the tense used in the sentence",
  "formula": "string or null - the grammar formula for the tense",
  "grammarNotes": ["array of strings - helpful grammar notes about the translation"]
}

Maintain natural, fluent translation and preserve original meaning. Add helpful grammar notes for learners.`;

    const result = await callGeminiJSON<TranslationResult>(prompt, { temperature: 0.3 });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
