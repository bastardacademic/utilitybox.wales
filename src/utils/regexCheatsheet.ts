/** Reference data for the Regex cheatsheet. */
import type { CheatSheetEntry } from './cheatsheet';

export const REGEX_CHEATSHEET: CheatSheetEntry[] = [
  { term: '^', category: 'Anchors', description: 'Matches the start of the string (or the start of a line, with the m flag).' },
  { term: '$', category: 'Anchors', description: 'Matches the end of the string (or the end of a line, with the m flag).' },
  { term: '\\b', category: 'Anchors', description: 'Word boundary — the point between a word character and a non-word character.' },
  { term: '\\B', category: 'Anchors', description: 'Not a word boundary.' },

  { term: '.', category: 'Character classes', description: 'Matches any single character except a newline (unless the s flag is set).' },
  { term: '\\d', category: 'Character classes', description: 'Matches any digit (0-9). \\D matches any non-digit.' },
  { term: '\\w', category: 'Character classes', description: 'Matches any word character: a letter, digit, or underscore. \\W matches the opposite.' },
  { term: '\\s', category: 'Character classes', description: 'Matches any whitespace character (space, tab, newline). \\S matches the opposite.' },
  { term: '[abc]', category: 'Character classes', description: 'Matches any one character inside the brackets — in this example, a, b, or c.' },
  { term: '[^abc]', category: 'Character classes', description: 'Matches any character NOT inside the brackets.' },
  { term: '[a-z]', category: 'Character classes', description: 'Matches any character in the given range — here, lowercase a through z.' },

  { term: '*', category: 'Quantifiers', description: 'Zero or more of the preceding element.' },
  { term: '+', category: 'Quantifiers', description: 'One or more of the preceding element.' },
  { term: '?', category: 'Quantifiers', description: 'Zero or one of the preceding element (makes it optional).' },
  { term: '{n}', category: 'Quantifiers', description: 'Exactly n repetitions of the preceding element.' },
  { term: '{n,}', category: 'Quantifiers', description: 'n or more repetitions of the preceding element.' },
  { term: '{n,m}', category: 'Quantifiers', description: 'Between n and m repetitions of the preceding element.' },
  { term: '*? +? ??', category: 'Quantifiers', description: 'Lazy (non-greedy) versions of *, +, and ? — match as little as possible instead of as much as possible.' },

  { term: '(abc)', category: 'Groups & alternation', description: 'Capturing group — groups a sequence and remembers the matched text for later reference.' },
  { term: '(?:abc)', category: 'Groups & alternation', description: 'Non-capturing group — groups a sequence without remembering the matched text.' },
  { term: '(?<name>abc)', category: 'Groups & alternation', description: 'Named capturing group, retrievable afterward by name rather than by position.' },
  { term: 'a|b', category: 'Groups & alternation', description: 'Alternation — matches either a or b.' },
  { term: '\\1', category: 'Groups & alternation', description: 'Backreference to the text matched by capture group 1.' },

  { term: '(?=abc)', category: 'Lookaround', description: 'Positive lookahead — matches a position only if followed by abc, without including abc in the match.' },
  { term: '(?!abc)', category: 'Lookaround', description: 'Negative lookahead — matches a position only if NOT followed by abc.' },
  { term: '(?<=abc)', category: 'Lookaround', description: 'Positive lookbehind — matches a position only if preceded by abc.' },
  { term: '(?<!abc)', category: 'Lookaround', description: 'Negative lookbehind — matches a position only if NOT preceded by abc.' },

  { term: 'g', category: 'Flags', description: 'Global — find every match in the string, not just the first.' },
  { term: 'i', category: 'Flags', description: 'Case-insensitive matching.' },
  { term: 'm', category: 'Flags', description: 'Multiline — ^ and $ match the start/end of each line, not just the whole string.' },
  { term: 's', category: 'Flags', description: 'Dotall — makes . also match newline characters.' },
  { term: 'u', category: 'Flags', description: 'Unicode mode — treats the pattern as a sequence of Unicode code points.' }
];
