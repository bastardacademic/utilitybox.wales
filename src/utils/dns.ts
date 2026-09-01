/** Reference data for common DNS record types, and helpers for the DNS-over-HTTPS lookup tool. */

export interface DnsRecordType {
  type: string;
  code: number;
  name: string;
  description: string;
  example: string;
}

export const DNS_RECORD_TYPES: DnsRecordType[] = [
  { type: 'A', code: 1, name: 'Address (IPv4)', description: 'Maps a hostname to an IPv4 address.', example: 'example.com → 93.184.216.34' },
  { type: 'AAAA', code: 28, name: 'Address (IPv6)', description: 'Maps a hostname to an IPv6 address.', example: 'example.com → 2606:2800:220:1:248:1893:25c8:1946' },
  { type: 'CNAME', code: 5, name: 'Canonical Name', description: 'Aliases one hostname to another; DNS resolution continues at the target name.', example: 'www.example.com → example.com' },
  { type: 'MX', code: 15, name: 'Mail Exchange', description: 'Lists the mail servers that accept email for the domain, each with a priority (lower is preferred).', example: '10 mail.example.com' },
  { type: 'TXT', code: 16, name: 'Text', description: 'Holds arbitrary text, commonly used for domain ownership verification and email authentication (SPF, DKIM, DMARC).', example: '"v=spf1 include:_spf.example.com ~all"' },
  { type: 'NS', code: 2, name: 'Name Server', description: 'Delegates a DNS zone to a set of authoritative name servers.', example: 'ns1.example.com' },
  { type: 'SOA', code: 6, name: 'Start of Authority', description: 'Administrative info about the zone: the primary name server, admin contact, and refresh/retry/expire timers.', example: 'ns1.example.com hostmaster.example.com 2024010101 7200 3600 1209600 3600' },
  { type: 'SRV', code: 33, name: 'Service Locator', description: 'Specifies the host and port for a specific service, with priority and weight.', example: '0 5 5060 sipserver.example.com' },
  { type: 'CAA', code: 257, name: 'Certification Authority Authorization', description: 'Restricts which certificate authorities are allowed to issue TLS certificates for the domain.', example: '0 issue "letsencrypt.org"' },
  { type: 'PTR', code: 12, name: 'Pointer', description: 'Maps an IP address back to a hostname; used for reverse DNS lookups.', example: '93.216.184.34.in-addr.arpa → example.com' },
  { type: 'NAPTR', code: 35, name: 'Naming Authority Pointer', description: 'Rewrites domain names using regex rules, notably for VoIP number mapping (ENUM) and SIP.', example: '100 10 "u" "E2U+sip" "!^.*$!sip:info@example.com!"' },
  { type: 'DNSKEY', code: 48, name: 'DNS Key', description: 'Publishes the public key used to verify DNSSEC signatures for the zone.', example: '256 3 8 AwEAAaz...' },
  { type: 'DS', code: 43, name: 'Delegation Signer', description: 'Links a child zone to its parent in a DNSSEC chain of trust.', example: '12345 8 2 49FDACC1...' },
  { type: 'TLSA', code: 52, name: 'TLSA', description: 'Associates a TLS certificate with a hostname, used for DANE certificate pinning.', example: '3 1 1 0C72AC70...' },
  { type: 'HINFO', code: 13, name: 'Host Information', description: 'Legacy record describing host CPU and OS type; rarely used today.', example: 'INTEL-64 LINUX' }
];

export function searchDnsRecordTypes(query: string): DnsRecordType[] {
  const q = query.trim().toLowerCase();
  if (!q) return DNS_RECORD_TYPES;
  return DNS_RECORD_TYPES.filter(
    (r) => r.type.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  );
}

/** Record types worth offering in a forward (name → records) lookup tool. */
export const LOOKUP_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'CAA'];

const CODE_TO_TYPE = new Map(DNS_RECORD_TYPES.map((r) => [r.code, r.type]));

export function dnsTypeCodeToName(code: number): string {
  return CODE_TO_TYPE.get(code) ?? `TYPE${code}`;
}

export interface DohAnswer {
  name: string;
  type: number;
  ttl: number;
  data: string;
}

export interface DohResponse {
  status: number;
  answers: DohAnswer[];
}

const DOH_STATUS_NAMES: Record<number, string> = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN — this domain does not exist',
  4: 'NOTIMP',
  5: 'REFUSED'
};

export function dohStatusMessage(status: number): string {
  return DOH_STATUS_NAMES[status] ?? `Status ${status}`;
}

/** Query Cloudflare's DNS-over-HTTPS JSON API for a hostname and record type. */
export async function lookupDns(name: string, type: string): Promise<DohResponse> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const response = await fetch(url, { headers: { accept: 'application/dns-json' } });
  if (!response.ok) throw new Error('DNS lookup failed');
  const data = await response.json();
  return {
    status: data.Status ?? -1,
    answers: (data.Answer ?? []).map((a: { name: string; type: number; TTL: number; data: string }) => ({
      name: a.name,
      type: a.type,
      ttl: a.TTL,
      data: a.data
    }))
  };
}
