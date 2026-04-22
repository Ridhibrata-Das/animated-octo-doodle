/**
 * Gemini API Key Pool — 20-key rotating fallback system
 * On rate limit (429): moves to next key automatically
 * On all keys exhausted: waits 60s then resets
 */

const KEYS: string[] = Array.from({ length: 20 }, (_, i) => {
  const key = process.env[`GEMINI_API_KEY_${i + 1}`] ?? '';
  return key;
}).filter(Boolean);

// Fallback to legacy single key if pool is empty
if (KEYS.length === 0 && process.env.GEMINI_API_KEY) {
  KEYS.push(process.env.GEMINI_API_KEY);
}

if (KEYS.length === 0) {
  console.warn('[GeminiPool] No Gemini API keys configured');
}

let currentIndex = 0;
let exhaustedAt: number | null = null;
const EXHAUST_WAIT_MS = 60_000;

export interface GeminiCallOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export class GeminiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * Call Gemini API with automatic key rotation on rate-limit.
 * Returns parsed JSON from the model's text response.
 */
export async function callGemini(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<string> {
  if (KEYS.length === 0) {
    throw new GeminiError('No Gemini API keys available');
  }

  // If all keys were exhausted, check if wait period has passed
  if (exhaustedAt !== null) {
    const elapsed = Date.now() - exhaustedAt;
    if (elapsed < EXHAUST_WAIT_MS) {
      throw new GeminiError(`All Gemini keys rate-limited. Retry in ${Math.ceil((EXHAUST_WAIT_MS - elapsed) / 1000)}s`);
    }
    // Reset after wait
    exhaustedAt = null;
    currentIndex = 0;
  }

  const {
    model = 'gemini-2.5-flash-lite',
    temperature = 0.7,
    maxOutputTokens = 2048,
  } = options;

  const startIndex = currentIndex;
  let attempts = 0;

  while (attempts < KEYS.length) {
    const key = KEYS[currentIndex];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.status === 429 || response.status === 503) {
        // Rate limited — rotate to next key
        console.warn(`[GeminiPool] Key ${currentIndex + 1} rate-limited (${response.status}), rotating...`);
        currentIndex = (currentIndex + 1) % KEYS.length;
        attempts++;

        // All keys exhausted
        if ((currentIndex === startIndex) || attempts >= KEYS.length) {
          exhaustedAt = Date.now();
          throw new GeminiError('All Gemini API keys are rate-limited', 429);
        }
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new GeminiError(
          errorBody?.error?.message ?? `Gemini API error ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new GeminiError('Empty response from Gemini');

      return text;
    } catch (err) {
      if (err instanceof GeminiError) throw err;
      throw new GeminiError(`Network error: ${(err as Error).message}`);
    }
  }

  exhaustedAt = Date.now();
  throw new GeminiError('All Gemini API keys exhausted', 429);
}

/**
 * Call Gemini and parse the JSON response.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  options?: GeminiCallOptions
): Promise<T> {
  const raw = await callGemini(prompt, options);
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GeminiError(`Failed to parse Gemini JSON response: ${raw.slice(0, 200)}`);
  }
}

export function getPoolStatus() {
  return {
    totalKeys: KEYS.length,
    currentKeyIndex: currentIndex + 1,
    isExhausted: exhaustedAt !== null,
    exhaustedSecondsAgo: exhaustedAt ? Math.floor((Date.now() - exhaustedAt) / 1000) : null,
  };
}
