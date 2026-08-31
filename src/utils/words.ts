/**
 * Word game utilities: unscrambling, word building from letter tiles,
 * and letter-value scoring. Dictionary word lists are loaded at call time
 * from /data/dictionary.json (see loadDictionary).
 */

export const LETTER_SCORES: Record<string, number> = {
  a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8,
  k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1,
  u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
};

export function scoreWord(word: string): number {
  return Array.from(word.toLowerCase())
    .filter((c) => c in LETTER_SCORES)
    .reduce((total, c) => total + LETTER_SCORES[c], 0);
}

let dictionaryCache: string[] | null = null;

/** Fetch and cache the word list from /data/dictionary.json. */
export async function loadDictionary(): Promise<string[]> {
  if (dictionaryCache) return dictionaryCache;
  const response = await fetch('/data/dictionary.json');
  if (!response.ok) throw new Error('Failed to load dictionary');
  const data: string[] = await response.json();
  dictionaryCache = data.map((w) => w.toLowerCase());
  return dictionaryCache;
}

/** Build a sorted-letters signature used to detect anagrams. */
function letterSignature(word: string): string {
  return Array.from(word.toLowerCase()).sort().join('');
}

export interface UnscrambleResult {
  word: string;
  score: number;
  length: number;
}

/**
 * Find every dictionary word that is a valid anagram (or sub-anagram) of the
 * given scrambled letters. Returns results sorted by length desc, then score desc.
 */
export function unscramble(letters: string, dictionary: string[], exactLengthOnly = false): UnscrambleResult[] {
  const clean = letters.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return [];

  const letterCounts = countLetters(clean);
  const results: UnscrambleResult[] = [];

  for (const word of dictionary) {
    if (word.length < 2 || word.length > clean.length) continue;
    if (exactLengthOnly && word.length !== clean.length) continue;
    if (canFormWord(word, letterCounts)) {
      results.push({ word, score: scoreWord(word), length: word.length });
    }
  }

  results.sort((a, b) => b.length - a.length || b.score - a.score || a.word.localeCompare(b.word));
  return results;
}

function countLetters(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of word) counts.set(c, (counts.get(c) ?? 0) + 1);
  return counts;
}

function canFormWord(word: string, availableCounts: Map<string, number>): boolean {
  const needed = countLetters(word);
  for (const [letter, count] of needed) {
    if ((availableCounts.get(letter) ?? 0) < count) return false;
  }
  return true;
}

/**
 * Word builder: find all dictionary words that can be built using the given
 * letter tiles, optionally constrained by a pattern (e.g. "c_t" matches "cat", "cot").
 */
export function buildWords(
  availableLetters: string,
  dictionary: string[],
  pattern?: string
): UnscrambleResult[] {
  const clean = availableLetters.toLowerCase().replace(/[^a-z]/g, '');
  const letterCounts = countLetters(clean);
  const results: UnscrambleResult[] = [];

  const normalizedPattern = pattern?.toLowerCase().trim();

  for (const word of dictionary) {
    if (word.length < 2 || word.length > clean.length) continue;
    if (normalizedPattern && normalizedPattern.length > 0) {
      if (word.length !== normalizedPattern.length) continue;
      if (!matchesPattern(word, normalizedPattern)) continue;
    }
    if (canFormWord(word, letterCounts)) {
      results.push({ word, score: scoreWord(word), length: word.length });
    }
  }

  results.sort((a, b) => b.score - a.score || b.length - a.length || a.word.localeCompare(b.word));
  return results;
}

function matchesPattern(word: string, pattern: string): boolean {
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    if (p !== '_' && p !== '?' && p !== word[i]) return false;
  }
  return true;
}

export function isAnagramOf(word1: string, word2: string): boolean {
  return letterSignature(word1) === letterSignature(word2) && word1.toLowerCase() !== word2.toLowerCase();
}

/** Ignores case, spaces, and punctuation — "A man, a plan, a canal: Panama" counts as a palindrome. */
export function isPalindrome(text: string): boolean {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return false;
  return clean === Array.from(clean).reverse().join('');
}
