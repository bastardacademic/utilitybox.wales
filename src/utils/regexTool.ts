/** Regex testing: run a pattern against text and collect every match, safely. */

export interface RegexMatch {
  match: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups?: Record<string, string>;
}

export interface RegexTestResult {
  valid: boolean;
  error?: string;
  matches: RegexMatch[];
}

const MAX_MATCHES = 1000;

export function testRegex(pattern: string, flags: string, input: string): RegexTestResult {
  if (!pattern) return { valid: true, matches: [] };

  try {
    // matchAll requires the 'g' flag regardless of what the user selected.
    const scanFlags = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, scanFlags);

    const matches: RegexMatch[] = [];
    for (const m of input.matchAll(re)) {
      matches.push({
        match: m[0],
        index: m.index ?? 0,
        groups: m.slice(1),
        namedGroups: m.groups as Record<string, string> | undefined
      });
      if (matches.length >= MAX_MATCHES) break;
    }

    // The user didn't ask for a global search, so only the first match applies.
    const result = flags.includes('g') ? matches : matches.slice(0, 1);
    return { valid: true, matches: result };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid regular expression', matches: [] };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Builds HTML with <mark> around every match, for live highlighting. Input text is HTML-escaped throughout. */
export function highlightMatches(input: string, matches: RegexMatch[]): string {
  if (matches.length === 0) return escapeHtml(input);

  let html = '';
  let cursor = 0;

  for (const m of matches) {
    if (m.index < cursor) continue; // overlapping match, skip
    html += escapeHtml(input.slice(cursor, m.index));
    if (m.match.length === 0) {
      html += '<mark class="zero-width">&#8203;</mark>';
    } else {
      html += `<mark>${escapeHtml(m.match)}</mark>`;
    }
    cursor = m.index + m.match.length;
  }

  html += escapeHtml(input.slice(cursor));
  return html;
}
