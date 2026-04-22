/**
 * Central prompt builder for all 26 game modes.
 * Each mode returns a JSON array of question objects.
 * All prompts enforce CEFR-level vocabulary calibration.
 */
import { getPersonaInstruction } from './personas';

type GameMode =
  | 'grammar-puzzle' | 'spelling-bee' | 'odd-one-out' | 'article-alley'
  | 'preposition-park' | 'quick-think' | 'synonym-sprint' | 'verb-voyager'
  | 'word-match' | 'dictation-master' | 'phrasal-verb-quest' | 'story-weaver'
  | 'context-detective' | 'riddle-realm' | 'idiom-master' | 'speech-challenge'
  | 'ai-chat-roleplay' | 'vocabulary-speedrun' | 'quiz' | 'sentence-builder'
  | 'word-rainfall' | 'translate' | 'analyze' | 'playground' | 'tips' | 'daily-workout' | 'performance-review' | 'onboarding-exam';

const CEFR_VOCAB_GUIDE: Record<string, string> = {
  A1: 'Use only the most common 500 English words. Very simple sentence structures.',
  A2: 'Use common everyday vocabulary. Simple sentences with basic connectors.',
  B1: 'Use intermediate vocabulary with some idiomatic expressions. Varied sentence structures.',
  B2: 'Use upper-intermediate vocabulary, complex sentences, and nuanced expressions.',
  C1: 'Use advanced vocabulary, complex grammatical structures, and sophisticated idioms.',
};

const LANG_INSTRUCTION: Record<string, string> = {
  en: '',
  hi: 'Provide any explanations or notes in Hindi (हिंदी).',
  'hi-latn': 'Provide any explanations or notes in Hinglish (Roman Hindi).',
  bn: 'Provide any explanations or notes in Bengali (বাংলা).',
  ml: 'Provide any explanations or notes in Malayalam (മലയാളം).',
  te: 'Provide any explanations or notes in Telugu (తెలుగు).',
  ta: 'Provide any explanations or notes in Tamil (தமிழ்).',
};

function base(cefrLevel: string, topic: string, userLanguage: string, personaId?: string): string {
  const langNote = LANG_INSTRUCTION[userLanguage] ?? '';
  const personaNote = getPersonaInstruction(personaId);
  return `${personaNote ? personaNote + '\n\n' : ''}CEFR Level: ${cefrLevel}. ${CEFR_VOCAB_GUIDE[cefrLevel] ?? ''}
Topic context: ${topic}. ${langNote}
Return ONLY valid JSON. No markdown, no code fences, no extra text.`;
}

export function buildPrompt(
  gameMode: string,
  cefrLevel: string,
  topic: string,
  userLanguage: string,
  count: number = 5,
  personaId?: string,
  options?: { performanceData?: any[] }
): string {
  const b = base(cefrLevel, topic, userLanguage, personaId);

  switch (gameMode as GameMode) {
    case 'grammar-puzzle':
      return `${b}
Generate ${count} grammar error-correction questions.
Schema: {"questions": [{"id":"string","sentence":"string with ONE grammatical error","options":["correct","wrong","wrong","wrong"],"correctIndex":0,"explanation":"string","note":"string (native language explanation if applicable)"}]}
Make the error subtle and educationally valuable. Relate sentences to ${topic}.`;

    case 'spelling-bee':
      return `${b}
Generate ${count} spelling questions.
Schema: {"questions": [{"id":"string","word":"string (correct spelling)","options":["correct","misspelling1","misspelling2","misspelling3"],"correctIndex":0,"definition":"string","pronunciation":"string"}]}
Misspellings should be plausible (common mistakes, not random letters).`;

    case 'odd-one-out':
      return `${b}
Generate ${count} "odd one out" vocabulary questions.
Schema: {"questions": [{"id":"string","words":["word1","word2","word3","word4"],"options":["word1","word2","word3","word4"],"correctIndex":2,"category":"string (what the other 3 share)","explanation":"string"}]}
The 3 similar words should clearly share a category; the odd one should have a non-obvious reason.`;

    case 'article-alley':
      return `${b}
Generate ${count} article selection questions (a/an/the/none).
Schema: {"questions": [{"id":"string","sentenceBefore":"string","sentenceAfter":"string","options":["a","an","the","(none)"],"correctIndex":0,"explanation":"string"}]}
The blank is between sentenceBefore and sentenceAfter.`;

    case 'preposition-park':
      return `${b}
Generate ${count} preposition fill-in-the-blank questions.
Schema: {"questions": [{"id":"string","sentenceBefore":"string","sentenceAfter":"string","options":["in","on","at","by","with","for","of","to"],"correctIndex":0,"explanation":"string"}]}`;

    case 'quick-think':
      return `${b}
Generate ${count} True/False grammar statements.
Schema: {"questions": [{"id":"string","sentence":"string (the statement)","options":["True","False"],"correctIndex":0,"explanation":"string"}]}
Make some statements subtly false (common misconceptions).`;

    case 'synonym-sprint':
      return `${b}
Generate ${count} synonym questions.
Schema: {"questions": [{"id":"string","word":"string","partOfSpeech":"string","options":["synonym","notSynonym","notSynonym","notSynonym"],"correctIndex":0,"contextSentence":"string"}]}`;

    case 'verb-voyager':
      return `${b}
Generate ${count} verb tense selection questions.
Schema: {"questions": [{"id":"string","sentenceBefore":"string","sentenceAfter":"string","verb":"string (base form)","options":["form1","form2","form3","form4"],"correctIndex":0,"tenseName":"string","explanation":"string"}]}`;

    case 'word-match':
      return `${b}
Generate ${count} word definition matching questions.
Schema: {"questions": [{"id":"string","word":"string","options":["correct definition","wrong definition1","wrong definition2","wrong definition3"],"correctIndex":0,"explanation":"string"}]}
All words should be from the ${topic} domain.`;

    case 'dictation-master':
      return `${b}
Generate ${count} dictation challenges.
Schema: {"questions": [{"id":"string","text":"string","difficulty":"easy|medium|hard","focusPoint":"string","grammarPoint":"string"}]}
Include common phonetic challenges or tense-specific sentences. Sentences should be natural, clearly speakable, and test common English patterns.`;

    case 'phrasal-verb-quest':
      return `${b}
Generate ${count} phrasal verb fill-in questions.
Schema: {"questions": [{"id":"string","sentenceBefore":"string","sentenceAfter":"string","verb":"string","particle":"string","distractors":["wrong1","wrong2","wrong3"],"explanation":"string","example":"string"}]}`;

    case 'story-weaver':
      return `${b}
Generate a short story with exactly 5 fill-in-the-blank gaps related to ${topic}.
Schema: {"title":"string","story":"string (use [BLANK_1] through [BLANK_5] for gaps)","blanks":[{"id":"BLANK_1","options":["correct","wrong","wrong","wrong"],"correctIndex":0,"explanation":"string"}]}
Story should be engaging and natural.`;

    case 'context-detective':
      return `${b}
Generate ${count} context-clue inference questions.
Schema: {"questions": [{"id":"string","paragraph":"string (contains the target word in context)","targetWord":"string","options":["correct meaning","wrong","wrong","wrong"],"correctIndex":0,"contextClues":"string (what clues helped)"}]}`;

    case 'riddle-realm':
      return `${b}
Generate ${count} English language riddles that test vocabulary or wordplay.
Schema: {"questions": [{"id":"string","paragraph":"string (the riddle)","options":["correct answer","wrong1","wrong2","wrong3"],"correctIndex":0,"explanation":"string","hint":"string"}]}`;

    case 'idiom-master':
      return `${b}
Generate ${count} English idiom questions.
Schema: {"questions": [{"id":"string","idiom":"string","options":["correct meaning","wrong","wrong","wrong"],"correctIndex":0,"originStory":"string","exampleSentence":"string","note":"string (translation/note in user language if applicable)"}]}`;

    case 'speech-challenge':
      return `${b}
Generate ${count} pronunciation challenges.
Schema: {"questions": [{"id":"string","text":"string","difficulty":"easy|medium|hard","pronunciationTips":"string","focusSound":"string","grammarPoint":"string"}]}
Include tongue-twisters and sentences that test common non-native speaker challenges.`;

    case 'ai-chat-roleplay':
      return `${b}
Generate a unique roleplay scenario.
Instead of a single message, generate a sequence of 5 potential assistant responses to keep the conversation flowing.
The user will respond to these one by one.
Schema: {"scenario": "string", "role": "string (AI's role)", "goal": "string (User's goal)", "assistantTurns": ["string (initial message)", "string (2nd response)", "string (3rd response)", "string (4th response)", "string (5th response)"]}
Ensure the turns are flexible enough to accommodate various user inputs.`;

    case 'vocabulary-speedrun':
      return `${b}
Generate ${count} rapid-fire vocabulary questions for a speed round.
Schema: {"questions": [{"id":"string","word":"string","options":["correct definition","wrong","wrong","wrong"],"correctIndex":0,"timeLimit":8}]}
Questions should be quick to read and answer.`;

    case 'quiz':
      return `${b}
Generate ${count} English grammar quiz questions about tenses and sentence structure.
Schema: {"questions": [{"id":"string","question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"string","tenseCategory":"string"}]}
Relate examples to ${topic} scenarios.`;

    case 'sentence-builder':
      return `${b}
Generate ${count} sentence building challenges.
Schema: {"questions": [{"id":"string","words":["string"],"correctOrder":[number],"hint":"string (translation/meaning)","tense":"string","grammarPoint":"string"}]}
Make sure the words can only form one logical sentence.`;

    case 'translate':
      return `${b}
Generate ${count} translation exercises from English to the user's language.
Schema: {"exercises": [{"id":"string","englishText":"string","targetLanguage":"string","grammarNote":"string","tenseUsed":"string"}]}`;

    case 'analyze':
      return `${b}
Analyze the provided sentence for tense and grammar.
Schema: {"detectedTense":"string","tenseCategory":"past|present|future","formula":"string","englishTranslation":"string","explanation":"string","breakdown":{"subject":"string","verb":"string","object":"string","auxiliaryVerb":"string"},"alternativeTenses":[{"tense":"string","sentence":"string","usage":"string"}],"confidence":0.95}`;

    case 'daily-workout':
      return `${b}
Generate ${count} custom grammar questions targeting the user's weaknesses: ${topic}.
Schema: {"questions": [{"id":"string","question":"string","options":["string","string","string","string"],"correctIndex":0,"explanation":"string","grammarPoint":"string (which weakness this targets)"}]}
Make it challenging but encouraging.`;

    case 'performance-review':
      return `${b}
Analyze the following session history and provide a detailed performance review.
Session History: ${JSON.stringify(options?.performanceData?.[0] || [])}
Schema: {"feedback": "string (encouraging and specific)", "strengths": ["string"], "weaknesses": ["string"], "cefrLevelEvaluation": "string (A1-C2)", "finalScore": number (0-100)}
Be honest but constructive. Highlight specific grammar points.`;

    case 'onboarding-exam':
      return `${b}
Generate 3 English grammar placement questions for a new user.
User Context: Profession: ${options?.performanceData?.[0] || 'Student'}, Motive: ${options?.performanceData?.[1] || 'Learning'}
Schema: {"questions": [{"id": "number", "text": "string", "options": ["string", "string", "string", "string"], "correct": number}]}
Make the questions relevant to their profession/motive when possible.`;

    default:
      return `${b}
Generate ${count} English learning exercises for mode: ${gameMode}.
Schema: {"questions": [{"id":"string","question":"string","answer":"string","options":["string"],"correctIndex":0,"explanation":"string"}]}`;
  }
}
