/** Generates simple SVG placeholder images — no image library required. */

export interface PlaceholderOptions {
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  text?: string;
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generatePlaceholderSvg(options: PlaceholderOptions): string {
  const { width, height, bgColor, textColor, text } = options;
  if (width < 1 || height < 1 || width > 4000 || height > 4000) {
    throw new Error('Width and height must be between 1 and 4000 pixels.');
  }

  const label = escapeXml(text?.trim() || `${width} x ${height}`);
  const fontSize = Math.max(12, Math.round(Math.min(width, height) / 8));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <text x="50%" y="50%" fill="${textColor}" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>`;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
