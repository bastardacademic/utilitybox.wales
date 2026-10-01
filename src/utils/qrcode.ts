/**
 * A from-scratch QR Code encoder (ISO/IEC 18004), byte mode only, versions 1-10.
 *
 * Scope: byte mode (any UTF-8 text/URL) covers the overwhelming majority of real QR
 * use cases; numeric/alphanumeric modes are skipped since byte mode can always encode
 * the same content, just slightly less compactly for purely-numeric input. Versions
 * 1-10 (up to 271 bytes at the lowest error-correction level) cover URLs and short
 * text comfortably, and keep the capacity table small enough to verify exhaustively
 * rather than transcribing the full 40-version table from memory.
 *
 * Implements the real algorithm end to end: Reed-Solomon error correction (GF(256)),
 * codeword interleaving, all function patterns (finder/separator/timing/alignment/
 * dark module, plus version info for V7+), all 8 data masks scored by the standard
 * 4-rule penalty system, and format/version information with BCH error correction.
 */

export class QrError extends Error {}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeResult {
  version: number;
  size: number;
  modules: boolean[][]; // [row][col], true = dark
}

// ---------------------------------------------------------------------------
// Capacity table: versions 1-10, by EC level.
// Each entry: total data codewords, and the block structure as
// [[blockCount, dataCodewordsPerBlock], ...] (one or two groups).
// ---------------------------------------------------------------------------

interface VersionEcInfo {
  dataCodewords: number;
  eccPerBlock: number;
  blocks: [count: number, dataPerBlock: number][];
}

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 48], 10: [6, 28, 54]
};

const EC_TABLE: Record<number, Record<ErrorCorrectionLevel, VersionEcInfo>> = {
  1: {
    L: { dataCodewords: 19, eccPerBlock: 7, blocks: [[1, 19]] },
    M: { dataCodewords: 16, eccPerBlock: 10, blocks: [[1, 16]] },
    Q: { dataCodewords: 13, eccPerBlock: 13, blocks: [[1, 13]] },
    H: { dataCodewords: 9, eccPerBlock: 17, blocks: [[1, 9]] }
  },
  2: {
    L: { dataCodewords: 34, eccPerBlock: 10, blocks: [[1, 34]] },
    M: { dataCodewords: 28, eccPerBlock: 16, blocks: [[1, 28]] },
    Q: { dataCodewords: 22, eccPerBlock: 22, blocks: [[1, 22]] },
    H: { dataCodewords: 16, eccPerBlock: 28, blocks: [[1, 16]] }
  },
  3: {
    L: { dataCodewords: 55, eccPerBlock: 15, blocks: [[1, 55]] },
    M: { dataCodewords: 44, eccPerBlock: 26, blocks: [[1, 44]] },
    Q: { dataCodewords: 34, eccPerBlock: 18, blocks: [[2, 17]] },
    H: { dataCodewords: 26, eccPerBlock: 22, blocks: [[2, 13]] }
  },
  4: {
    L: { dataCodewords: 80, eccPerBlock: 20, blocks: [[1, 80]] },
    M: { dataCodewords: 64, eccPerBlock: 18, blocks: [[2, 32]] },
    Q: { dataCodewords: 48, eccPerBlock: 26, blocks: [[2, 24]] },
    H: { dataCodewords: 36, eccPerBlock: 16, blocks: [[4, 9]] }
  },
  5: {
    L: { dataCodewords: 108, eccPerBlock: 26, blocks: [[1, 108]] },
    M: { dataCodewords: 86, eccPerBlock: 24, blocks: [[2, 43]] },
    Q: { dataCodewords: 62, eccPerBlock: 18, blocks: [[2, 15], [2, 16]] },
    H: { dataCodewords: 46, eccPerBlock: 22, blocks: [[2, 11], [2, 12]] }
  },
  6: {
    L: { dataCodewords: 136, eccPerBlock: 18, blocks: [[2, 68]] },
    M: { dataCodewords: 108, eccPerBlock: 16, blocks: [[4, 27]] },
    Q: { dataCodewords: 76, eccPerBlock: 24, blocks: [[4, 19]] },
    H: { dataCodewords: 60, eccPerBlock: 28, blocks: [[4, 15]] }
  },
  7: {
    L: { dataCodewords: 156, eccPerBlock: 20, blocks: [[2, 78]] },
    M: { dataCodewords: 124, eccPerBlock: 18, blocks: [[4, 31]] },
    Q: { dataCodewords: 88, eccPerBlock: 18, blocks: [[2, 14], [4, 15]] },
    H: { dataCodewords: 66, eccPerBlock: 26, blocks: [[4, 13], [1, 14]] }
  },
  8: {
    L: { dataCodewords: 194, eccPerBlock: 24, blocks: [[2, 97]] },
    M: { dataCodewords: 154, eccPerBlock: 22, blocks: [[2, 38], [2, 39]] },
    Q: { dataCodewords: 110, eccPerBlock: 22, blocks: [[4, 18], [2, 19]] },
    H: { dataCodewords: 86, eccPerBlock: 26, blocks: [[4, 14], [2, 15]] }
  },
  9: {
    L: { dataCodewords: 232, eccPerBlock: 30, blocks: [[2, 116]] },
    M: { dataCodewords: 182, eccPerBlock: 22, blocks: [[3, 36], [2, 37]] },
    Q: { dataCodewords: 132, eccPerBlock: 20, blocks: [[4, 16], [4, 17]] },
    H: { dataCodewords: 100, eccPerBlock: 24, blocks: [[4, 12], [4, 13]] }
  },
  10: {
    L: { dataCodewords: 274, eccPerBlock: 18, blocks: [[2, 68], [2, 69]] },
    M: { dataCodewords: 216, eccPerBlock: 26, blocks: [[4, 43], [1, 44]] },
    Q: { dataCodewords: 154, eccPerBlock: 24, blocks: [[6, 19], [2, 20]] },
    H: { dataCodewords: 122, eccPerBlock: 28, blocks: [[6, 15], [2, 16]] }
  }
};

// Internal consistency check (block codewords must sum to the stated total) runs
// once per module load — if this ever fails, the table above has a typo.
for (const v of Object.keys(EC_TABLE).map(Number)) {
  for (const level of ['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]) {
    const info = EC_TABLE[v][level];
    const sum = info.blocks.reduce((acc, [count, per]) => acc + count * per, 0);
    if (sum !== info.dataCodewords) {
      throw new QrError(`Internal error: EC table mismatch at version ${v} level ${level} (${sum} != ${info.dataCodewords})`);
    }
  }
}

// ---------------------------------------------------------------------------
// GF(256) arithmetic and Reed-Solomon error correction
// ---------------------------------------------------------------------------

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function buildGfTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Generator polynomial for `degree` EC codewords, as coefficients highest-degree first. */
function rsGeneratorPolynomial(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsComputeRemainder(data: number[], eccLength: number): number[] {
  const generator = rsGeneratorPolynomial(eccLength);
  const remainder = new Array(eccLength).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let i = 0; i < eccLength; i++) {
      remainder[i] ^= gfMul(generator[i + 1], factor);
    }
  }
  return remainder;
}

// ---------------------------------------------------------------------------
// Bit buffer
// ---------------------------------------------------------------------------

class BitBuffer {
  bits: number[] = [];

  appendBits(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }

  get length() {
    return this.bits.length;
  }
}

// ---------------------------------------------------------------------------
// Data encoding (byte mode) + version selection
// ---------------------------------------------------------------------------

function charCountBits(version: number): number {
  return version <= 9 ? 8 : 16;
}

function encodeByteModeSegment(bytes: Uint8Array, version: number): BitBuffer {
  const bb = new BitBuffer();
  bb.appendBits(0b0100, 4); // byte mode indicator
  bb.appendBits(bytes.length, charCountBits(version));
  for (const byte of bytes) bb.appendBits(byte, 8);
  return bb;
}

function findSmallestVersion(byteLength: number, ec: ErrorCorrectionLevel): number {
  for (let version = 1; version <= 10; version++) {
    const info = EC_TABLE[version][ec];
    // Each byte-mode segment costs: 4 (mode) + charCountBits + 8*byteLength, plus up to a 4-bit terminator.
    const headerBits = 4 + charCountBits(version);
    const availableBits = info.dataCodewords * 8;
    if (headerBits + byteLength * 8 <= availableBits) return version;
  }
  throw new QrError(
    `Too much data for a QR code at error correction level ${ec} (max ~${EC_TABLE[10][ec].dataCodewords - 3} bytes). Try a lower error correction level or shorter text.`
  );
}

function buildCodewords(text: string, ec: ErrorCorrectionLevel): { version: number; codewords: number[] } {
  const bytes = new TextEncoder().encode(text);
  const version = findSmallestVersion(bytes.length, ec);
  const info = EC_TABLE[version][ec];
  const bb = encodeByteModeSegment(bytes, version);

  const capacityBits = info.dataCodewords * 8;
  const terminatorLength = Math.min(4, capacityBits - bb.length);
  if (terminatorLength > 0) bb.appendBits(0, terminatorLength);
  while (bb.length % 8 !== 0) bb.bits.push(0);

  const dataCodewords: number[] = [];
  for (let i = 0; i < bb.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bb.bits[i + j];
    dataCodewords.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (dataCodewords.length < info.dataCodewords) {
    dataCodewords.push(padBytes[padIndex % 2]);
    padIndex++;
  }

  // Split into blocks, compute EC codewords per block, then interleave.
  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let offset = 0;
  for (const [count, perBlock] of info.blocks) {
    for (let b = 0; b < count; b++) {
      const block = dataCodewords.slice(offset, offset + perBlock);
      offset += perBlock;
      dataBlocks.push(block);
      eccBlocks.push(rsComputeRemainder(block, info.eccPerBlock));
    }
  }

  const interleaved: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) if (i < block.length) interleaved.push(block[i]);
  }
  for (let i = 0; i < info.eccPerBlock; i++) {
    for (const block of eccBlocks) interleaved.push(block[i]);
  }

  return { version, codewords: interleaved };
}

// ---------------------------------------------------------------------------
// Matrix construction
// ---------------------------------------------------------------------------

type ModuleGrid = (boolean | null)[][]; // null = not yet set / not a function module

function versionSize(version: number): number {
  return 17 + 4 * version;
}

function alignmentCenters(version: number): [number, number][] {
  const positions = ALIGNMENT_POSITIONS[version];
  if (positions.length === 0) return [];
  const first = positions[0];
  const last = positions[positions.length - 1];
  const centers: [number, number][] = [];
  for (const r of positions) {
    for (const c of positions) {
      if ((r === first && c === first) || (r === first && c === last) || (r === last && c === first)) continue;
      centers.push([r, c]);
    }
  }
  return centers;
}

function placeFinderPattern(grid: ModuleGrid, reserved: boolean[][], topRow: number, leftCol: number) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = topRow + dr;
      const c = leftCol + dc;
      if (r < 0 || c < 0 || r >= grid.length || c >= grid.length) continue;
      reserved[r][c] = true;
      const inRing0 = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 && (dr === 0 || dr === 6 || dc === 0 || dc === 6);
      const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      grid[r][c] = inRing0 || inCore;
    }
  }
}

function placeAlignmentPattern(grid: ModuleGrid, reserved: boolean[][], centerRow: number, centerCol: number) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = centerRow + dr;
      const c = centerCol + dc;
      reserved[r][c] = true;
      const ring = Math.max(Math.abs(dr), Math.abs(dc));
      grid[r][c] = ring !== 1;
    }
  }
}

function applyMask(maskId: number, row: number, col: number): boolean {
  switch (maskId) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: throw new QrError(`Invalid mask id ${maskId}`);
  }
}

const FORMAT_GENERATOR = 0x537; // ISO 18004 format info generator polynomial, as used for BCH(15,5)
const FORMAT_MASK = 0x5412;

function computeFormatBits(ec: ErrorCorrectionLevel, maskId: number): number {
  const ecBits: Record<ErrorCorrectionLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };
  const data = (ecBits[ec] << 3) | maskId; // 5 bits
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) rem ^= FORMAT_GENERATOR << (i - 10);
  }
  return ((data << 10) | rem) ^ FORMAT_MASK;
}

const VERSION_GENERATOR = 0x1f25; // BCH(18,6) generator for version information (V7+)

function computeVersionBits(version: number): number {
  let rem = version << 12;
  for (let i = 17; i >= 12; i--) {
    if ((rem >>> i) & 1) rem ^= VERSION_GENERATOR << (i - 12);
  }
  return (version << 12) | rem;
}

function buildMatrix(version: number, ec: ErrorCorrectionLevel, codewords: number[]): boolean[][] {
  const size = versionSize(version);
  const grid: ModuleGrid = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  placeFinderPattern(grid, reserved, 0, 0);
  placeFinderPattern(grid, reserved, 0, size - 7);
  placeFinderPattern(grid, reserved, size - 7, 0);

  for (const [r, c] of alignmentCenters(version)) placeAlignmentPattern(grid, reserved, r, c);

  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    reserved[6][i] = true;
    grid[i][6] = i % 2 === 0;
    reserved[i][6] = true;
  }

  grid[size - 8][8] = true; // dark module
  reserved[size - 8][8] = true;

  // Reserve format info areas (content written after masking is chosen).
  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  if (version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        reserved[r][size - 11 + c] = true;
        reserved[size - 11 + c][r] = true;
      }
    }
  }

  // Place data bits in the standard zigzag: 2-column strips, alternating scan direction,
  // skipping the vertical timing column (6) entirely rather than pairing with it.
  const bits: boolean[] = [];
  for (const byte of codewords) for (let i = 7; i >= 0; i--) bits.push(((byte >>> i) & 1) === 1);
  let bitIndex = 0;
  let upward = true;
  let rightCol = size - 1;
  while (rightCol > 0) {
    if (rightCol === 6) rightCol--;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const c of [rightCol, rightCol - 1]) {
        if (reserved[row][c]) continue;
        grid[row][c] = bitIndex < bits.length ? bits[bitIndex] : false;
        bitIndex++;
      }
    }
    upward = !upward;
    rightCol -= 2;
  }

  // Try all 8 masks on a copy, score each, keep the best.
  let bestScore = Infinity;
  let bestGrid: boolean[][] | null = null;

  for (let maskId = 0; maskId < 8; maskId++) {
    const masked: boolean[][] = grid.map((row, r) =>
      row.map((cell, c) => {
        const base = cell ?? false;
        return reserved[r][c] ? base : base !== applyMask(maskId, r, c);
      })
    );
    writeFormatAndVersionInfo(masked, reserved, size, version, ec, maskId);
    const score = penaltyScore(masked);
    if (score < bestScore) {
      bestScore = score;
      bestGrid = masked;
    }
  }

  return bestGrid as boolean[][];
}

function writeFormatAndVersionInfo(
  grid: boolean[][],
  reserved: boolean[][],
  size: number,
  version: number,
  ec: ErrorCorrectionLevel,
  maskId: number
) {
  void reserved; // reserved[] already excluded these cells from masking/data placement above

  const formatBits = computeFormatBits(ec, maskId);
  const bit = (i: number) => ((formatBits >>> i) & 1) === 1;

  // Top-left copy, split around the two timing-pattern lines.
  for (let i = 0; i <= 5; i++) grid[8][i] = bit(i);
  grid[8][7] = bit(6);
  grid[8][8] = bit(7);
  grid[7][8] = bit(8);
  for (let i = 9; i <= 14; i++) grid[14 - i][8] = bit(i);

  // Redundant bottom-left / top-right copy.
  for (let i = 0; i <= 6; i++) grid[size - 1 - i][8] = bit(i);
  for (let i = 7; i <= 14; i++) grid[8][size - 15 + i] = bit(i);

  if (version >= 7) {
    const versionBits = computeVersionBits(version);
    for (let i = 0; i < 18; i++) {
      const bit = ((versionBits >>> i) & 1) === 1;
      const row = Math.floor(i / 3);
      const col = i % 3;
      grid[row][size - 11 + col] = bit;
      grid[size - 11 + col][row] = bit;
    }
  }
}

function penaltyScore(grid: boolean[][]): number {
  const size = grid.length;
  let score = 0;

  // Rule 1: runs of 5+ same-color modules in a row/column.
  for (let r = 0; r < size; r++) {
    let runColor = grid[r][0];
    let runLength = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) score += 3 + (runLength - 5);
        runColor = grid[r][c];
        runLength = 1;
      }
    }
    if (runLength >= 5) score += 3 + (runLength - 5);
  }
  for (let c = 0; c < size; c++) {
    let runColor = grid[0][c];
    let runLength = 1;
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) score += 3 + (runLength - 5);
        runColor = grid[r][c];
        runLength = 1;
      }
    }
    if (runLength >= 5) score += 3 + (runLength - 5);
  }

  // Rule 2: 2x2 blocks of the same color.
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (grid[r][c + 1] === v && grid[r + 1][c] === v && grid[r + 1][c + 1] === v) score += 3;
    }
  }

  // Rule 3: finder-pattern-like 1:1:3:1:1 sequences with 4 light modules on one side.
  const pattern = [true, false, true, true, true, false, true];
  const checkLine = (getCell: (i: number) => boolean) => {
    for (let start = 0; start <= size - 11; start++) {
      let matches = true;
      for (let i = 0; i < 7; i++) if (getCell(start + i) !== pattern[i]) { matches = false; break; }
      if (!matches) continue;
      const beforeLight = Array.from({ length: 4 }, (_, i) => start - 1 - i).every((idx) => idx < 0 || !getCell(idx));
      const afterLight = Array.from({ length: 4 }, (_, i) => start + 7 + i).every((idx) => idx >= size || !getCell(idx));
      if (beforeLight || afterLight) score += 40;
    }
  };
  for (let r = 0; r < size; r++) checkLine((c) => grid[r][c]);
  for (let c = 0; c < size; c++) checkLine((r) => grid[r][c]);

  // Rule 4: overall dark-module proportion away from 50%.
  let darkCount = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c]) darkCount++;
  const percentDark = (darkCount / (size * size)) * 100;
  score += Math.floor(Math.abs(percentDark - 50) / 5) * 10;

  return score;
}

export function generateQrCode(text: string, ec: ErrorCorrectionLevel = 'M'): QrCodeResult {
  if (text.length === 0) throw new QrError('Enter some text or a URL to encode.');
  const { version, codewords } = buildCodewords(text, ec);
  const modules = buildMatrix(version, ec, codewords);
  return { version, size: modules.length, modules };
}

export function qrCodeToSvg(result: QrCodeResult, moduleSize = 8, margin = 4): string {
  const quietZone = margin;
  const dim = result.size + quietZone * 2;
  const px = dim * moduleSize;
  let path = '';
  for (let r = 0; r < result.size; r++) {
    for (let c = 0; c < result.size; c++) {
      if (result.modules[r][c]) {
        const x = (c + quietZone) * moduleSize;
        const y = (r + quietZone) * moduleSize;
        path += `M${x},${y}h${moduleSize}v${moduleSize}h${-moduleSize}z`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}" width="${px}" height="${px}">` +
    `<rect width="${px}" height="${px}" fill="#fff"/>` +
    `<path d="${path}" fill="#000"/>` +
    `</svg>`;
}
