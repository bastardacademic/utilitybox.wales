/** Line-level diff using the standard LCS (longest common subsequence) backtracking algorithm. */

export type DiffOp = 'same' | 'add' | 'remove';

export interface DiffLine {
  type: DiffOp;
  value: string;
  aLine: number | null;
  bLine: number | null;
}

const MAX_LINES = 2000;

export class DiffTooLargeError extends Error {}

export function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const n = aLines.length;
  const m = bLines.length;

  if (n > MAX_LINES || m > MAX_LINES) {
    throw new DiffTooLargeError(`One of the inputs has more than ${MAX_LINES} lines — too large to diff in the browser.`);
  }

  // Flat (n+1) x (m+1) LCS-length table: lcs[i * (m+1) + j] = LCS length of aLines[i:] and bLines[j:].
  const width = m + 1;
  const lcs = new Int32Array((n + 1) * width);

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const idx = i * width + j;
      lcs[idx] =
        aLines[i] === bLines[j]
          ? lcs[(i + 1) * width + (j + 1)] + 1
          : Math.max(lcs[(i + 1) * width + j], lcs[i * width + (j + 1)]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      result.push({ type: 'same', value: aLines[i], aLine: i + 1, bLine: j + 1 });
      i++;
      j++;
    } else if (lcs[(i + 1) * width + j] >= lcs[i * width + (j + 1)]) {
      result.push({ type: 'remove', value: aLines[i], aLine: i + 1, bLine: null });
      i++;
    } else {
      result.push({ type: 'add', value: bLines[j], aLine: null, bLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    result.push({ type: 'remove', value: aLines[i], aLine: i + 1, bLine: null });
    i++;
  }
  while (j < m) {
    result.push({ type: 'add', value: bLines[j], aLine: null, bLine: j + 1 });
    j++;
  }

  return result;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return lines.reduce(
    (stats, line) => {
      if (line.type === 'add') stats.added++;
      else if (line.type === 'remove') stats.removed++;
      else stats.unchanged++;
      return stats;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}
