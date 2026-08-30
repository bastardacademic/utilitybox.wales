/**
 * IPv4 networking utilities: CIDR parsing, subnet masks, host ranges.
 */

export class NetworkError extends Error {}

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function isValidIPv4(ip: string): boolean {
  const match = ip.match(IPV4_REGEX);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    const n = Number(octet);
    return n >= 0 && n <= 255 && String(n) === octet.replace(/^0+(?=\d)/, '') ;
  });
}

/** Parse a dotted-quad IPv4 address into a 32-bit unsigned integer. */
export function ipToInt(ip: string): number {
  const match = ip.match(IPV4_REGEX);
  if (!match) throw new NetworkError(`Invalid IPv4 address: ${ip}`);
  const octets = match.slice(1).map(Number);
  if (octets.some((o) => o < 0 || o > 255)) throw new NetworkError(`Invalid IPv4 address: ${ip}`);
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function intToIp(int: number): string {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
}

export function intToBinary(int: number): string {
  return int.toString(2).padStart(32, '0');
}

export function ipToBinary(ip: string): string {
  return intToBinary(ipToInt(ip));
}

/** Format a 32-bit binary string as four dot-separated octets. */
export function formatBinaryOctets(binary: string): string {
  return [binary.slice(0, 8), binary.slice(8, 16), binary.slice(16, 24), binary.slice(24, 32)].join('.');
}

export function prefixToSubnetMask(prefix: number): string {
  if (prefix < 0 || prefix > 32) throw new NetworkError('Prefix must be between 0 and 32');
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

export function subnetMaskToPrefix(mask: string): number {
  const maskInt = ipToInt(mask);
  const binary = intToBinary(maskInt);
  if (!/^1*0*$/.test(binary)) throw new NetworkError('Invalid subnet mask');
  return binary.split('1').length - 1;
}

export function getIpClass(ip: string): string {
  const firstOctet = ipToInt(ip) >>> 24;
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (Multicast)';
  return 'E (Reserved)';
}

export function isPrivateIp(ip: string): boolean {
  const int = ipToInt(ip);
  const ranges: [string, string][] = [
    ['10.0.0.0', '10.255.255.255'],
    ['172.16.0.0', '172.31.255.255'],
    ['192.168.0.0', '192.168.255.255'],
    ['127.0.0.0', '127.255.255.255']
  ];
  return ranges.some(([start, end]) => int >= ipToInt(start) && int <= ipToInt(end));
}

export interface CidrInfo {
  ip: string;
  prefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  isPrivate: boolean;
  binaryMask: string;
  binaryNetwork: string;
}

/** Parse a CIDR string like "192.168.1.10/24" and compute all derived values. */
export function calculateCidr(cidr: string): CidrInfo {
  const parts = cidr.trim().split('/');
  if (parts.length !== 2) throw new NetworkError('Expected format: IP/prefix, e.g. 192.168.1.0/24');

  const [ip, prefixStr] = parts;
  const prefix = Number(prefixStr);

  if (!isValidIPv4(ip)) throw new NetworkError(`Invalid IPv4 address: ${ip}`);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new NetworkError('Prefix must be an integer between 0 and 32');
  }

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;

  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

  const firstHostInt = prefix >= 31 ? networkInt : networkInt + 1;
  const lastHostInt = prefix >= 31 ? broadcastInt : broadcastInt - 1;

  return {
    ip,
    prefix,
    subnetMask: intToIp(maskInt),
    wildcardMask: intToIp(wildcardInt),
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    totalHosts,
    usableHosts,
    ipClass: getIpClass(ip),
    isPrivate: isPrivateIp(ip),
    binaryMask: formatBinaryOctets(intToBinary(maskInt)),
    binaryNetwork: formatBinaryOctets(intToBinary(networkInt))
  };
}

/** Split a network into the requested number of equal-sized subnets. */
export function splitSubnet(cidr: string, subnetCount: number): CidrInfo[] {
  const base = calculateCidr(cidr);
  const bitsNeeded = Math.ceil(Math.log2(Math.max(1, subnetCount)));
  const newPrefix = base.prefix + bitsNeeded;
  if (newPrefix > 32) throw new NetworkError('Not enough address space for that many subnets');

  const subnetSize = Math.pow(2, 32 - newPrefix);
  const networkInt = ipToInt(base.networkAddress);
  const results: CidrInfo[] = [];

  for (let i = 0; i < subnetCount; i++) {
    const subnetStart = networkInt + i * subnetSize;
    results.push(calculateCidr(`${intToIp(subnetStart)}/${newPrefix}`));
  }

  return results;
}
