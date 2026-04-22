import { NextResponse } from 'next/server';
import { callGeminiJSON, GeminiError } from '@/lib/ai/gemini-pool';
import { getPersonaInstruction } from '@/lib/ai/personas';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

export async function POST(request: Request) {
  try {
    const { message, history = [], cefrLevel = 'B1', userLanguage = 'en', scenario = '', personaId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const langNote = userLanguage !== 'en'
      ? `When the user struggles, you may briefly explain in their language (code: ${userLanguage}).`
      : '';

    const historyText = (history as ChatMessage[]).slice(-10)
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const personaOverride = getPersonaInstruction(personaId);
    const tutorIdentity = personaOverride ? personaOverride : "You are Tensey, a friendly and encouraging English AI tutor.";

    const prompt = `${tutorIdentity}
CEFR Level target: ${cefrLevel}. ${langNote}
${scenario ? `Current roleplay scenario: ${scenario}` : 'General English conversation practice.'}

Conversation history:
${historyText || '(New conversation)'}

Student says: "${message}"

Respond as a helpful English tutor. Keep responses conversational, correct any grammar errors kindly, and help the student practice.

Return ONLY valid JSON:
{
  "reply": "string (your tutor response, warm and encouraging)",
  "correctedInput": "string or null (if student made grammar errors, show corrected version)",
  "grammarNote": "string or null (brief explanation of any error corrected)",
  "suggestions": ["string", "string"],
  "relatedTopics": ["string", "string"]
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.8, maxOutputTokens: 1024 });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GeminiError) {
      return NextResponse.json({ error: 'AI assistant unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
