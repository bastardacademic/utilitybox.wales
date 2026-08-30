/** Unix timestamp conversions. */

export class TimestampError extends Error {}

/** Accepts a Unix timestamp in seconds or milliseconds (detected by magnitude) and returns a Date. */
export function unixToDate(value: number): Date {
  if (!Number.isFinite(value)) throw new TimestampError('Not a valid number.');
  // Treat anything below this as seconds; above, as milliseconds. (Seconds for the year ~2286 is 10 digits.)
  const ms = Math.abs(value) < 1e11 ? value * 1000 : value;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new TimestampError('Out of range for a valid date.');
  return date;
}

export function dateToUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** Parses a date string (e.g. from a datetime-local input) into Unix seconds. */
export function parseDateStringToUnixSeconds(input: string): number {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) throw new TimestampError('Not a valid date/time.');
  return dateToUnixSeconds(date);
}

export function currentUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
