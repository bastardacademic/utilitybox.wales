/** JSON formatting and validation, with best-effort line/column extraction from parser error messages. */

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

export function formatJson(input: string, indent: number | string = 2): string {
  return JSON.stringify(JSON.parse(input), null, indent);
}

export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export function validateJson(input: string): JsonValidationResult {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    return { valid: false, error: message, ...extractPosition(message, input) };
  }
}

/** Parses V8's "position N" or Firefox's "line N column N" error message formats. */
function extractPosition(message: string, input: string): { line?: number; column?: number } {
  const lineColMatch = message.match(/line (\d+)[^\d]+column (\d+)/i);
  if (lineColMatch) {
    return { line: parseInt(lineColMatch[1], 10), column: parseInt(lineColMatch[2], 10) };
  }

  const positionMatch = message.match(/position (\d+)/i);
  if (positionMatch) {
    const pos = parseInt(positionMatch[1], 10);
    const upToPos = input.slice(0, pos);
    const lines = upToPos.split('\n');
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }

  return {};
}
