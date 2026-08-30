/**
 * Random string and Lorem Ipsum generators.
 * Uses crypto.getRandomValues for cryptographically secure randomness.
 */

export interface RandomStringOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous?: boolean;
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', '1', 'l', 'I', '|']);

/** Returns a cryptographically secure random integer in [0, max). */
function secureRandomInt(max: number): number {
  if (max <= 0) throw new Error('max must be positive');
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

export function generateRandomString(options: RandomStringOptions): string {
  const { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous = false } = options;

  if (length < 1 || length > 512) throw new Error('Length must be between 1 and 512');

  let pool = '';
  if (uppercase) pool += CHAR_SETS.uppercase;
  if (lowercase) pool += CHAR_SETS.lowercase;
  if (numbers) pool += CHAR_SETS.numbers;
  if (symbols) pool += CHAR_SETS.symbols;

  if (excludeAmbiguous) {
    pool = Array.from(pool).filter((c) => !AMBIGUOUS_CHARS.has(c)).join('');
  }

  if (!pool) throw new Error('At least one character set must be selected');

  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(pool[secureRandomInt(pool.length)]);
  }
  return result.join('');
}

export function calculatePasswordStrength(password: string): { score: number; label: string; entropy: number } {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = password.length > 0 && poolSize > 0 ? password.length * Math.log2(poolSize) : 0;

  let score: number;
  let label: string;
  if (entropy < 28) { score = 1; label = 'Very weak'; }
  else if (entropy < 36) { score = 2; label = 'Weak'; }
  else if (entropy < 60) { score = 3; label = 'Reasonable'; }
  else if (entropy < 128) { score = 4; label = 'Strong'; }
  else { score = 5; label = 'Very strong'; }

  return { score, label, entropy };
}

/** Generate a UUID v4 using crypto.randomUUID where available, otherwise a manual fallback. */
export function generateUUID(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ---------------------------------------------------------------------------
// Lorem Ipsum generator
// ---------------------------------------------------------------------------

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est',
  'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium',
  'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo'
];

function randomInt(min: number, max: number): number {
  return Math.floor(secureRandomInt(max - min + 1)) + min;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateWord(): string {
  return LOREM_WORDS[secureRandomInt(LOREM_WORDS.length)];
}

function generateSentence(minWords = 6, maxWords = 16): string {
  const wordCount = randomInt(minWords, maxWords);
  const words = Array.from({ length: wordCount }, generateWord);
  words[0] = capitalize(words[0]);

  // Occasionally insert a comma for readability.
  if (wordCount > 6) {
    const commaPos = randomInt(2, wordCount - 3);
    words[commaPos] += ',';
  }

  return words.join(' ') + '.';
}

function generateParagraph(minSentences = 4, maxSentences = 8): string {
  const sentenceCount = randomInt(minSentences, maxSentences);
  return Array.from({ length: sentenceCount }, () => generateSentence()).join(' ');
}

export type LoremUnit = 'words' | 'sentences' | 'paragraphs';

export interface LoremOptions {
  unit: LoremUnit;
  count: number;
  startWithLorem: boolean;
}

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

export function generateLoremIpsum(options: LoremOptions): string {
  const { unit, count, startWithLorem } = options;
  if (count < 1 || count > 200) throw new Error('Count must be between 1 and 200');

  if (unit === 'words') {
    const words = Array.from({ length: count }, generateWord);
    if (startWithLorem) {
      const opener = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'].slice(0, count);
      for (let i = 0; i < opener.length; i++) words[i] = opener[i];
    }
    words[0] = capitalize(words[0]);
    return words.join(' ') + '.';
  }

  if (unit === 'sentences') {
    const sentences = Array.from({ length: count }, () => generateSentence());
    if (startWithLorem) sentences[0] = CLASSIC_OPENING;
    return sentences.join(' ');
  }

  const paragraphs = Array.from({ length: count }, () => generateParagraph());
  if (startWithLorem) {
    paragraphs[0] = CLASSIC_OPENING + ' ' + paragraphs[0].split('. ').slice(1).join('. ');
  }
  return paragraphs.join('\n\n');
}
