/** Word/character/sentence counting and reading-time estimation. */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

const WORDS_PER_MINUTE_READING = 225;
const WORDS_PER_MINUTE_SPEAKING = 130;

export function getTextStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  const words = text.trim() === '' ? 0 : (text.trim().match(/\S+/g) ?? []).length;

  const sentences = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+/g) ?? (text.trim() ? [text.trim()] : [])).length;

  const paragraphs = text.trim() === '' ? 0 : text.split(/\n{2,}|\n/).filter((p) => p.trim() !== '').length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTimeMinutes: words / WORDS_PER_MINUTE_READING,
    speakingTimeMinutes: words / WORDS_PER_MINUTE_SPEAKING
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 1 / 60) return '< 1 sec';
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
}
