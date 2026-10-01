/**
 * CSV <-> JSON conversion. CSV is inherently tabular, so this only makes sense for
 * (and only accepts) a flat array of objects — not arbitrary nested JSON.
 */

export class CsvError extends Error {}

function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseCsv(text: string, delimiter = ','): Record<string, string>[] {
  const rows = parseCsvRows(text, delimiter);
  if (rows.length === 0) return [];
  const [header, ...dataRows] = rows;
  return dataRows
    .filter((row) => !(row.length === 1 && row[0] === ''))
    .map((row) => {
      const obj: Record<string, string> = {};
      header.forEach((col, i) => {
        obj[col] = row[i] ?? '';
      });
      return obj;
    });
}

function escapeCsvField(v: unknown, delimiter: string): string {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (s.includes(delimiter) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCsv(value: unknown, delimiter = ','): string {
  if (!Array.isArray(value)) {
    throw new CsvError('CSV output needs an array of objects, e.g. [{"a":1,"b":2}, ...].');
  }
  if (value.length === 0) return '';
  if (value.some((row) => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw new CsvError('Every item in the array must be a flat object (e.g. {"a":1,"b":2}) to convert to CSV.');
  }

  const rows = value as Record<string, unknown>[];
  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }

  const headerLine = columns.map((c) => escapeCsvField(c, delimiter)).join(delimiter);
  const dataLines = rows.map((row) => columns.map((col) => escapeCsvField(row[col], delimiter)).join(delimiter));
  return [headerLine, ...dataLines].join('\n');
}
