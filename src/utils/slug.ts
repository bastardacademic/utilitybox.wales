/** URL-safe slug generation. */

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function toSlug(text: string, separator: '-' | '_' = '-'): string {
  const normalized = text.normalize('NFKD').replace(COMBINING_MARKS, '');

  const sep = separator === '-' ? '-' : '_';
  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`${sep}+`, 'g'), sep)
    .replace(new RegExp(`^${sep}+|${sep}+$`, 'g'), '');
}
