/** UUID generation (v1, v4, v7, nil, max) and validation. */

import { generateUUID } from './generators';

export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
export const MAX_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function formatUuid(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Random, version 4 UUID — the most common type. No identifying information is encoded in it. */
export function generateV4(): string {
  return generateUUID();
}

/**
 * Time-ordered, version 7 UUID (RFC 9562): a 48-bit big-endian Unix millisecond
 * timestamp followed by random bits. Sorts chronologically as plain text/bytes,
 * which makes it a good fit for database primary keys.
 */
export function generateV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const unixMs = BigInt(Date.now());
  for (let i = 0; i < 6; i++) {
    bytes[i] = Number((unixMs >> BigInt((5 - i) * 8)) & 0xffn);
  }

  bytes[6] = 0x70 | (bytes[6] & 0x0f); // version 7
  bytes[8] = 0x80 | (bytes[8] & 0x3f); // variant 10

  return formatUuid(bytesToHex(bytes));
}

// Milliseconds between the start of the Gregorian calendar (1582-10-15, the UUID v1
// timestamp epoch) and the Unix epoch (1970-01-01).
const GREGORIAN_TO_UNIX_EPOCH_MS = 12219292800000n;

/**
 * Time-based, version 1 UUID (RFC 4122): a 60-bit timestamp (100-nanosecond intervals
 * since the Gregorian epoch) plus a clock sequence and a node ID. Browsers have no
 * access to a real MAC address, so the node ID here is random with the multicast bit
 * set — the standard way RFC 4122 says to signal "this isn't a real IEEE 802 address".
 */
export function generateV1(): string {
  const randomBytes = new Uint8Array(8); // 2 bytes clock sequence + 6 bytes node
  crypto.getRandomValues(randomBytes);

  const subMillisecondJitter = BigInt(Math.floor(Math.random() * 10000));
  const timestamp100ns = (BigInt(Date.now()) + GREGORIAN_TO_UNIX_EPOCH_MS) * 10000n + subMillisecondJitter;

  const timeLow = Number(timestamp100ns & 0xffffffffn);
  const timeMid = Number((timestamp100ns >> 32n) & 0xffffn);
  const timeHiAndVersion = Number((timestamp100ns >> 48n) & 0x0fffn) | (1 << 12);

  const clockSeq = (randomBytes[0] << 8) | randomBytes[1];
  const clockSeqHiAndReserved = ((clockSeq >> 8) & 0x3f) | 0x80;
  const clockSeqLow = clockSeq & 0xff;

  const node = randomBytes.slice(2, 8);
  node[0] |= 0x01; // multicast bit set: marks this as a random, non-IEEE address

  const hex =
    timeLow.toString(16).padStart(8, '0') +
    timeMid.toString(16).padStart(4, '0') +
    timeHiAndVersion.toString(16).padStart(4, '0') +
    clockSeqHiAndReserved.toString(16).padStart(2, '0') +
    clockSeqLow.toString(16).padStart(2, '0') +
    bytesToHex(node);

  return formatUuid(hex);
}

export type UuidVersion = 'v1' | 'v4' | 'v7' | 'nil' | 'max';

export function generateUuid(version: UuidVersion): string {
  switch (version) {
    case 'v1':
      return generateV1();
    case 'v4':
      return generateV4();
    case 'v7':
      return generateV7();
    case 'nil':
      return NIL_UUID;
    case 'max':
      return MAX_UUID;
  }
}

export function generateMultiple(version: UuidVersion, count: number): string[] {
  return Array.from({ length: count }, () => generateUuid(version));
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

/** Extracts the version nibble (1-8) from a UUID string, or null if it isn't a recognized RFC 4122/9562 version. */
export function getUuidVersion(value: string): number | null {
  const trimmed = value.trim();
  if (!isValidUuid(trimmed)) return null;
  const version = parseInt(trimmed[14], 16);
  return version >= 1 && version <= 8 ? version : null;
}
