/** HTML entity encoding/decoding. */

const BASIC_ENTITIES: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;']
];

/** Escapes the five reserved HTML/XML characters. Safe for embedding text inside HTML markup. */
export function encodeHtmlEntitiesBasic(text: string): string {
  return BASIC_ENTITIES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

/** Escapes the reserved characters AND every non-ASCII character as a numeric entity. */
export function encodeHtmlEntitiesAll(text: string): string {
  const basicEscaped = encodeHtmlEntitiesBasic(text);
  return Array.from(basicEscaped)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code > 127 ? `&#${code};` : char;
    })
    .join('');
}

/**
 * Decodes any named or numeric HTML entity using the browser's own HTML parser
 * (via an off-DOM <textarea>) rather than a hand-maintained entity table.
 */
export function decodeHtmlEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}
