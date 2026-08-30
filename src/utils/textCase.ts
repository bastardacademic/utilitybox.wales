/** Text case conversions. */

/** Splits arbitrary text (spaces, hyphens, underscores, camelCase) into lowercase words. */
function toWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'with']);
  const words = text.split(/\s+/);
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i !== 0 && i !== words.length - 1 && minorWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function toSentenceCase(text: string): string {
  const trimmed = text.toLowerCase();
  return trimmed.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

export function toCamelCase(text: string): string {
  const words = toWords(text);
  return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
}

export function toPascalCase(text: string): string {
  return toWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

export function toSnakeCase(text: string): string {
  return toWords(text).join('_');
}

export function toKebabCase(text: string): string {
  return toWords(text).join('-');
}

export function toConstantCase(text: string): string {
  return toWords(text).join('_').toUpperCase();
}
