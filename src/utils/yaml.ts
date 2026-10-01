/**
 * A pragmatic YAML subset parser/serializer — block-style mappings and sequences,
 * plain/quoted scalars, comments. Deliberately does NOT support flow style ({}/[]),
 * anchors/aliases, multi-document files, or block scalars (| and >), which covers
 * the vast majority of real-world config-style YAML without hand-rolling the full spec.
 */

export class YamlError extends Error {}

interface YamlLine {
  indent: number;
  content: string;
}

function stripYamlComment(line: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === '#' && !inSingle && !inDouble) {
      if (i === 0 || /\s/.test(line[i - 1])) return line.slice(0, i);
    }
  }
  return line;
}

function tokenizeYaml(text: string): YamlLine[] {
  const lines: YamlLine[] = [];
  for (const raw of text.split('\n')) {
    const stripped = stripYamlComment(raw).replace(/\s+$/, '');
    const trimmed = stripped.trim();
    if (trimmed === '' || trimmed === '---') continue;
    lines.push({ indent: stripped.length - stripped.trimStart().length, content: trimmed });
  }
  return lines;
}

function parseYamlValue(scalar: string): unknown {
  const s = scalar.trim();
  if (s === '' || s === '~' || /^null$/i.test(s)) return null;
  if (/^true$/i.test(s)) return true;
  if (/^false$/i.test(s)) return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYamlKey(raw: string): string {
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

/** Finds the index of the "key: value" separator colon, respecting quoted keys. Returns -1 if none. */
function findKeyColon(line: string): number {
  if (line[0] === '"' || line[0] === "'") {
    const quote = line[0];
    const end = line.indexOf(quote, 1);
    if (end === -1) return -1;
    const rest = line.slice(end + 1);
    const colon = rest.indexOf(':');
    return colon === -1 ? -1 : end + 1 + colon;
  }
  const idx = line.indexOf(': ');
  if (idx !== -1) return idx;
  return line.endsWith(':') ? line.length - 1 : -1;
}

function parseYamlBlock(lines: YamlLine[], pos: { i: number }, minIndent: number): unknown {
  if (pos.i >= lines.length || lines[pos.i].indent < minIndent) return null;
  const blockIndent = lines[pos.i].indent;
  const isSequence = lines[pos.i].content === '-' || lines[pos.i].content.startsWith('- ');

  if (isSequence) {
    const result: unknown[] = [];
    while (pos.i < lines.length && lines[pos.i].indent === blockIndent && (lines[pos.i].content === '-' || lines[pos.i].content.startsWith('- '))) {
      const afterDash = lines[pos.i].content === '-' ? '' : lines[pos.i].content.slice(2);
      if (afterDash === '') {
        pos.i++;
        result.push(parseYamlBlock(lines, pos, blockIndent + 1));
      } else if (afterDash.includes(': ') || afterDash.endsWith(':')) {
        // "- key: value" — an inline mapping start; continuation keys are indented
        // to align with where this key began (dash column + 2).
        const virtualIndent = blockIndent + 2;
        const synthetic: YamlLine[] = [{ indent: virtualIndent, content: afterDash }];
        pos.i++;
        while (pos.i < lines.length && lines[pos.i].indent >= virtualIndent) {
          synthetic.push(lines[pos.i]);
          pos.i++;
        }
        result.push(parseYamlBlock(synthetic, { i: 0 }, virtualIndent));
      } else {
        result.push(parseYamlValue(afterDash));
        pos.i++;
      }
    }
    return result;
  }

  const result: Record<string, unknown> = {};
  while (pos.i < lines.length && lines[pos.i].indent === blockIndent && !lines[pos.i].content.startsWith('- ')) {
    const line = lines[pos.i].content;
    const colonIdx = findKeyColon(line);
    if (colonIdx === -1) throw new YamlError(`Expected "key: value" but got "${line}".`);
    const key = parseYamlKey(line.slice(0, colonIdx).trim());
    const rest = line.slice(colonIdx + 1).trim();
    pos.i++;
    if (rest === '') {
      result[key] = pos.i < lines.length && lines[pos.i].indent > blockIndent ? parseYamlBlock(lines, pos, blockIndent + 1) : null;
    } else {
      result[key] = parseYamlValue(rest);
    }
  }
  return result;
}

export function parseYaml(text: string): unknown {
  const lines = tokenizeYaml(text);
  if (lines.length === 0) return null;

  const first = lines[0];
  const looksLikeSequence = first.content === '-' || first.content.startsWith('- ');
  const looksLikeMapping = findKeyColon(first.content) !== -1;
  if (!looksLikeSequence && !looksLikeMapping) {
    if (lines.length > 1) throw new YamlError('Multi-line scalar documents and block scalars (| or >) are not supported.');
    return parseYamlValue(first.content);
  }

  return parseYamlBlock(lines, { i: 0 }, 0);
}

function isContainer(v: unknown): v is Record<string, unknown> | unknown[] {
  return v !== null && typeof v === 'object';
}

function isEmptyContainer(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0;
  if (v !== null && typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

function scalarToYaml(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return formatYamlScalarString(value);
  return String(value);
}

function formatYamlScalarString(s: string): string {
  const needsQuoting =
    s === '' ||
    /^(true|false|null|~)$/i.test(s) ||
    /^-?\d+(\.\d+)?$/.test(s) ||
    /^[\s#\-?:,[\]{}&*!|>'"%@`]/.test(s) ||
    s.includes(': ') ||
    s.includes(' #') ||
    s !== s.trim();
  if (!needsQuoting) return s;
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function blockToYaml(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return pad + '[]';
    return value
      .map((item) => {
        if (isContainer(item) && !isEmptyContainer(item)) {
          const childPad = '  '.repeat(indent + 1);
          const nested = blockToYaml(item, indent + 1).split('\n');
          nested[0] = pad + '- ' + nested[0].slice(childPad.length);
          return nested.join('\n');
        }
        return pad + '- ' + scalarToYaml(item);
      })
      .join('\n');
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return pad + '{}';
  return entries
    .map(([k, v]) => {
      const key = formatYamlScalarString(k);
      if (isContainer(v) && !isEmptyContainer(v)) {
        return pad + key + ':\n' + blockToYaml(v, indent + 1);
      }
      return pad + key + ': ' + scalarToYaml(v);
    })
    .join('\n');
}

export function toYaml(value: unknown): string {
  if (!isContainer(value) || isEmptyContainer(value)) {
    return scalarToYaml(value) + '\n';
  }
  return blockToYaml(value, 0) + '\n';
}
