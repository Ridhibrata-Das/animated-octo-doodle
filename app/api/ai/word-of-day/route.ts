import { NextResponse } from 'next/server';
import { callGeminiJSON, GeminiError } from '@/lib/ai/gemini-pool';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WordOfDay {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  etymology?: string;
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'wordOfDay', today);

  // Try to read from cache
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return NextResponse.json(snap.data() as WordOfDay);
    }
  } catch (dbReadErr) {
    console.warn('[/api/ai/word-of-day] Cache read failed:', dbReadErr);
    // Continue to generation anyway
  }

  try {
    // Generate a new word
    const prompt = `Generate an interesting English word of the day for language learners.
Return ONLY valid JSON matching this exact schema:
{
  "word": "string (the word)",
  "pronunciation": "string (phonetic, e.g. /ˈwɜː.θɪ/)",
  "partOfSpeech": "string (noun/verb/adjective/adverb/etc)",
  "definition": "string (clear, concise definition in 1-2 sentences)",
  "example": "string (natural usage example sentence)",
  "synonyms": ["string", "string", "string"],
  "etymology": "string (brief interesting origin story, optional)"
}
Choose a word that is:
- Useful and practical for everyday English
- B1-B2 level (intermediate)
- Not too common (not: happy, big, go) but not too obscure`;

    const word = await callGeminiJSON<WordOfDay>(prompt, { temperature: 0.9, maxOutputTokens: 512 });

    // Try to cache in Firestore (non-blocking)
    try {
      await setDoc(ref, { ...word, generatedAt: serverTimestamp() });
    } catch (dbWriteErr) {
      console.warn('[/api/ai/word-of-day] Cache write failed:', dbWriteErr);
    }

    return NextResponse.json(word);
  } catch (err) {
    if (err instanceof GeminiError) {
      console.error('[/api/ai/word-of-day] Gemini Error:', err.message, 'Status:', err.status);
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[/api/ai/word-of-day] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
