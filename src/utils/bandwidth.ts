/** Data transfer time calculation: file size (binary units) over a network speed (decimal units, as ISPs advertise). */

export class BandwidthError extends Error {}

export const SIZE_UNITS = {
  kb: { label: 'KB', bits: 1024 * 8 },
  mb: { label: 'MB', bits: 1024 ** 2 * 8 },
  gb: { label: 'GB', bits: 1024 ** 3 * 8 },
  tb: { label: 'TB', bits: 1024 ** 4 * 8 }
} as const;

export const SPEED_UNITS = {
  kbps: { label: 'Kbps', bitsPerSecond: 1000 },
  mbps: { label: 'Mbps', bitsPerSecond: 1_000_000 },
  gbps: { label: 'Gbps', bitsPerSecond: 1_000_000_000 }
} as const;

export type SizeUnit = keyof typeof SIZE_UNITS;
export type SpeedUnit = keyof typeof SPEED_UNITS;

/** Seconds required to transfer a file of the given size at the given speed. */
export function calculateTransferSeconds(size: number, sizeUnit: SizeUnit, speed: number, speedUnit: SpeedUnit): number {
  if (!Number.isFinite(size) || size <= 0) throw new BandwidthError('Enter a file size greater than 0');
  if (!Number.isFinite(speed) || speed <= 0) throw new BandwidthError('Enter a connection speed greater than 0');

  const totalBits = size * SIZE_UNITS[sizeUnit].bits;
  const bitsPerSecond = speed * SPEED_UNITS[speedUnit].bitsPerSecond;
  return totalBits / bitsPerSecond;
}

/** Format a duration in seconds as a human-readable breakdown, e.g. "1 hour 4 minutes 12 seconds". */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 1) return `${(totalSeconds * 1000).toFixed(0)} ms`;

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  if (seconds || parts.length === 0) parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);

  return parts.join(' ');
}
