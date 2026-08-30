/** Color format conversions and palette generation. */

export class ColorError extends Error {}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(hex) || /^#?[0-9a-fA-F]{3}$/.test(hex);
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) throw new ColorError('Not a valid hex color.');

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16)
  };
}

function toHexByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function parseHslString(hsl: string): HSL {
  const match = hsl.match(/hsl\(\s*(-?\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%\s*\)/i);
  if (!match) throw new ColorError('Expected format: hsl(210, 80%, 55%)');
  return { h: ((parseFloat(match[1]) % 360) + 360) % 360, s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

export function parseRgbString(rgb: string): RGB {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*\)/i);
  if (!match) throw new ColorError('Expected format: rgb(37, 99, 235)');
  return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
}

/** Generates a palette of `count` colors, evenly spaced around the hue wheel from a starting hex color. */
export function generatePalette(baseHex: string, count = 5): string[] {
  const base = rgbToHsl(hexToRgb(baseHex));
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const h = (base.h + i * step) % 360;
    return rgbToHex(hslToRgb({ h, s: base.s, l: base.l }));
  });
}

export function randomHexColor(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return rgbToHex({ r: bytes[0], g: bytes[1], b: bytes[2] });
}
