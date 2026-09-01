/**
 * IPv6 address utilities: validation, expand/compress, classification, and CIDR ranges.
 * Addresses are handled as 128-bit BigInt values internally since they don't fit in a Number.
 */

export class Ipv6Error extends Error {}

const FULL_MASK = (1n << 128n) - 1n;

/** Parse any valid textual IPv6 address (with "::" compression, optional embedded IPv4 tail) into a 128-bit BigInt. */
export function parseIpv6(address: string): bigint {
  const trimmed = address.trim();
  if (!trimmed) throw new Ipv6Error('Enter an IPv6 address');

  let addr = trimmed;

  const ipv4TailMatch = addr.match(/(?:^|:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4TailMatch) {
    const ipv4 = ipv4TailMatch[1];
    const octets = ipv4.split('.').map(Number);
    if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) {
      throw new Ipv6Error(`Invalid embedded IPv4 address: ${ipv4}`);
    }
    const hex1 = ((octets[0] << 8) | octets[1]).toString(16);
    const hex2 = ((octets[2] << 8) | octets[3]).toString(16);
    addr = addr.slice(0, addr.length - ipv4.length) + hex1 + ':' + hex2;
  }

  if ((addr.match(/::/g) || []).length > 1) throw new Ipv6Error('Only one "::" is allowed in an IPv6 address');

  let groups: string[];
  if (addr.includes('::')) {
    const [head, tail] = addr.split('::');
    const headParts = head ? head.split(':') : [];
    const tailParts = tail ? tail.split(':') : [];
    const missing = 8 - headParts.length - tailParts.length;
    if (missing < 0) throw new Ipv6Error('Too many groups for a compressed address');
    groups = [...headParts, ...Array(missing).fill('0'), ...tailParts];
  } else {
    groups = addr.split(':');
  }

  if (groups.length !== 8) throw new Ipv6Error('An IPv6 address needs 8 groups (use "::" to compress runs of zeros)');

  let value = 0n;
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) throw new Ipv6Error(`Invalid group: "${g}"`);
    value = (value << 16n) | BigInt(parseInt(g, 16));
  }
  return value;
}

export function isValidIpv6(address: string): boolean {
  try {
    parseIpv6(address);
    return true;
  } catch {
    return false;
  }
}

/** The 8 hex groups of a 128-bit value, no leading-zero padding. */
function toGroups(value: bigint): string[] {
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    groups.push(((value >> BigInt(i * 16)) & 0xffffn).toString(16));
  }
  return groups;
}

function expand(value: bigint): string {
  return toGroups(value)
    .map((g) => g.padStart(4, '0'))
    .join(':');
}

/** Canonical compressed form per RFC 5952: longest run of zero groups (2+) replaced with "::", leftmost wins ties. */
function compress(value: bigint): string {
  const groups = toGroups(value);

  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < 8; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
    } else {
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
      curStart = -1;
      curLen = 0;
    }
  }
  if (curLen > bestLen) {
    bestLen = curLen;
    bestStart = curStart;
  }

  if (bestLen < 2) return groups.join(':');

  const head = groups.slice(0, bestStart).join(':');
  const tail = groups.slice(bestStart + bestLen).join(':');
  return `${head}::${tail}`;
}

function classify(value: bigint): string {
  const masked = (network: bigint, prefixLen: number) => {
    const hostBits = BigInt(128 - prefixLen);
    const mask = hostBits === 0n ? FULL_MASK : ((FULL_MASK >> hostBits) << hostBits);
    return (value & mask) === (network & mask);
  };

  if (value === 0n) return 'Unspecified address (::)';
  if (value === 1n) return 'Loopback address (::1)';
  if (masked(parseIpv6('::ffff:0:0'), 96)) return 'IPv4-mapped IPv6 address';
  if (masked(parseIpv6('64:ff9b::'), 96)) return 'NAT64 well-known prefix';
  if (masked(parseIpv6('2001:db8::'), 32)) return 'Documentation address (RFC 3849) — reserved for examples';
  if (masked(parseIpv6('fe80::'), 10)) return 'Link-local unicast';
  if (masked(parseIpv6('fc00::'), 7)) return 'Unique local address (private)';
  if (masked(parseIpv6('ff00::'), 8)) return 'Multicast';
  return 'Global unicast';
}

export function expandIpv6(address: string): string {
  return expand(parseIpv6(address));
}

export function compressIpv6(address: string): string {
  return compress(parseIpv6(address));
}

export function getIpv6Type(address: string): string {
  return classify(parseIpv6(address));
}

function formatBigWithCommas(n: bigint): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface Ipv6CidrInfo {
  prefix: number;
  networkAddress: string;
  networkAddressExpanded: string;
  lastAddress: string;
  lastAddressExpanded: string;
  totalAddresses: string;
  type: string;
}

/** Parse an IPv6 CIDR string like "2001:db8::/32" and compute the address range. */
export function calculateIpv6Cidr(cidr: string): Ipv6CidrInfo {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) throw new Ipv6Error('Expected format: address/prefix, e.g. 2001:db8::/32');

  const [addr, prefixStr] = parts;
  const prefix = Number(prefixStr);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) {
    throw new Ipv6Error('Prefix must be an integer between 0 and 128');
  }

  const value = parseIpv6(addr);
  const hostBits = BigInt(128 - prefix);
  const networkMask = hostBits === 0n ? FULL_MASK : ((FULL_MASK >> hostBits) << hostBits);
  const networkValue = value & networkMask;
  const lastValue = networkValue | (FULL_MASK ^ networkMask);

  return {
    prefix,
    networkAddress: compress(networkValue),
    networkAddressExpanded: expand(networkValue),
    lastAddress: compress(lastValue),
    lastAddressExpanded: expand(lastValue),
    totalAddresses: formatBigWithCommas(1n << hostBits),
    type: classify(value)
  };
}
