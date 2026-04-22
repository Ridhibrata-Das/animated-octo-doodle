export interface LocalTenseAnalysis {
  detectedTense: string;
  tenseCategory: 'past' | 'present' | 'future';
  formula: string;
  explanation: string;
  confidence: number;
}

const TENSE_PATTERNS = [
  {
    name: 'Present Continuous',
    category: 'present',
    formula: 'Subject + am/is/are + verb-ing',
    pattern: /\b(am|is|are)\s+(\w+ing)\b/i,
    explanation: 'Used for actions happening exactly now or around now.'
  },
  {
    name: 'Present Perfect',
    category: 'present',
    formula: 'Subject + have/has + Past Participle (V3)',
    pattern: /\b(have|has)\s+([a-z]+ed|been|gone|seen|done|eaten|known)\b/i,
    explanation: 'Short-term past actions with present relevance.'
  },
  {
    name: 'Past Simple',
    category: 'past',
    formula: 'Subject + Verb-ed (or irregular V2)',
    pattern: /\b(\w+ed|went|saw|did|ate|felt|kept|knew|told)\b/i,
    explanation: 'Completed actions in a specific time in the past.'
  },
  {
    name: 'Future Simple',
    category: 'future',
    formula: 'Subject + will + Base Verb',
    pattern: /\bwill\s+([a-z]+)\b/i,
    explanation: 'Promises, predictions, or spontaneous decisions.'
  },
  {
    name: 'Present Simple',
    category: 'present',
    formula: 'Subject + Base Verb (s/es for 3rd person)',
    pattern: /\b(I|you|we|they|he|she|it)\s+([a-z]+s?)\b/i,
    explanation: 'Habits, general truths, and fixed arrangements.'
  }
];

export function detectTenseLocally(sentence: string): LocalTenseAnalysis | null {
  const clean = sentence.trim().toLowerCase();
  
  for (const t of TENSE_PATTERNS) {
    if (t.pattern.test(clean)) {
      return {
        detectedTense: t.name,
        tenseCategory: t.category as any,
        formula: t.formula,
        explanation: t.explanation,
        confidence: 0.8 // High but not absolute
      };
    }
  }
  
  return null;
}
