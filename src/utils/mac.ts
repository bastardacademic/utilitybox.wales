/** MAC address validation and formatting. */

export class MacError extends Error {}

/** Strips any separators and returns 12 uppercase hex characters, or throws. */
function normalizeMac(input: string): string {
  const hex = input.trim().replace(/[:.\-\s]/g, '').toUpperCase();
  if (!/^[0-9A-F]{12}$/.test(hex)) {
    throw new MacError('Not a valid MAC address — expected 12 hex digits (e.g. AA:BB:CC:DD:EE:FF).');
  }
  return hex;
}

export function isValidMac(input: string): boolean {
  try {
    normalizeMac(input);
    return true;
  } catch {
    return false;
  }
}

export type MacFormat = 'colon' | 'hyphen' | 'dot' | 'none';

export function formatMac(input: string, format: MacFormat, uppercase = true): string {
  const hex = normalizeMac(input);
  const cased = uppercase ? hex : hex.toLowerCase();
  const pairs = cased.match(/.{1,2}/g) as string[];

  switch (format) {
    case 'colon':
      return pairs.join(':');
    case 'hyphen':
      return pairs.join('-');
    case 'dot': {
      const groups = cased.match(/.{1,4}/g) as string[];
      return groups.join('.');
    }
    case 'none':
      return cased;
    default:
      throw new MacError(`Unknown format: ${format}`);
  }
}

/** Whether the MAC is administered locally (bit 1 of the first octet) rather than a factory-assigned OUI. */
export function isLocallyAdministered(input: string): boolean {
  const hex = normalizeMac(input);
  const firstByte = parseInt(hex.slice(0, 2), 16);
  return (firstByte & 0b10) !== 0;
}

/** Whether the MAC is a multicast address (bit 0 of the first octet). */
export function isMulticast(input: string): boolean {
  const hex = normalizeMac(input);
  const firstByte = parseInt(hex.slice(0, 2), 16);
  return (firstByte & 0b1) !== 0;
}
