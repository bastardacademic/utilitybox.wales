/** Reference data for common network port numbers. */

export interface PortInfo {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  description: string;
}

export const COMMON_PORTS: PortInfo[] = [
  { port: 20, protocol: 'TCP', service: 'FTP (data)', description: 'File Transfer Protocol — data channel.' },
  { port: 21, protocol: 'TCP', service: 'FTP (control)', description: 'File Transfer Protocol — command channel.' },
  { port: 22, protocol: 'TCP', service: 'SSH', description: 'Secure Shell — encrypted remote login and tunnelling.' },
  { port: 23, protocol: 'TCP', service: 'Telnet', description: 'Unencrypted remote login. Considered insecure.' },
  { port: 25, protocol: 'TCP', service: 'SMTP', description: 'Simple Mail Transfer Protocol — sending email.' },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', description: 'Domain Name System — resolves domain names to IP addresses.' },
  { port: 67, protocol: 'UDP', service: 'DHCP (server)', description: 'Dynamic Host Configuration Protocol — server.' },
  { port: 68, protocol: 'UDP', service: 'DHCP (client)', description: 'Dynamic Host Configuration Protocol — client.' },
  { port: 69, protocol: 'UDP', service: 'TFTP', description: 'Trivial File Transfer Protocol.' },
  { port: 80, protocol: 'TCP', service: 'HTTP', description: 'Hypertext Transfer Protocol — unencrypted web traffic.' },
  { port: 110, protocol: 'TCP', service: 'POP3', description: 'Post Office Protocol v3 — retrieving email.' },
  { port: 119, protocol: 'TCP', service: 'NNTP', description: 'Network News Transfer Protocol — Usenet.' },
  { port: 123, protocol: 'UDP', service: 'NTP', description: 'Network Time Protocol — clock synchronisation.' },
  { port: 143, protocol: 'TCP', service: 'IMAP', description: 'Internet Message Access Protocol — retrieving email.' },
  { port: 161, protocol: 'UDP', service: 'SNMP', description: 'Simple Network Management Protocol — device monitoring.' },
  { port: 194, protocol: 'TCP', service: 'IRC', description: 'Internet Relay Chat.' },
  { port: 389, protocol: 'TCP', service: 'LDAP', description: 'Lightweight Directory Access Protocol.' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', description: 'HTTP over TLS/SSL — encrypted web traffic.' },
  { port: 445, protocol: 'TCP', service: 'SMB', description: 'Server Message Block — Windows file sharing.' },
  { port: 465, protocol: 'TCP', service: 'SMTPS', description: 'SMTP over implicit TLS.' },
  { port: 514, protocol: 'UDP', service: 'Syslog', description: 'System logging protocol.' },
  { port: 587, protocol: 'TCP', service: 'SMTP (submission)', description: 'Mail submission, typically with STARTTLS.' },
  { port: 636, protocol: 'TCP', service: 'LDAPS', description: 'LDAP over TLS/SSL.' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', description: 'IMAP over implicit TLS.' },
  { port: 995, protocol: 'TCP', service: 'POP3S', description: 'POP3 over implicit TLS.' },
  { port: 1433, protocol: 'TCP', service: 'Microsoft SQL Server', description: 'Default port for MS SQL Server.' },
  { port: 1521, protocol: 'TCP', service: 'Oracle DB', description: 'Default listener port for Oracle databases.' },
  { port: 2049, protocol: 'TCP/UDP', service: 'NFS', description: 'Network File System.' },
  { port: 3000, protocol: 'TCP', service: 'Dev server (common)', description: 'Common default for Node.js/React/Rails development servers.' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', description: 'Default port for MySQL/MariaDB.' },
  { port: 3389, protocol: 'TCP', service: 'RDP', description: 'Remote Desktop Protocol.' },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', description: 'Default port for PostgreSQL.' },
  { port: 5672, protocol: 'TCP', service: 'AMQP', description: 'Advanced Message Queuing Protocol (e.g. RabbitMQ).' },
  { port: 5900, protocol: 'TCP', service: 'VNC', description: 'Virtual Network Computing — remote desktop.' },
  { port: 6379, protocol: 'TCP', service: 'Redis', description: 'Default port for Redis.' },
  { port: 8080, protocol: 'TCP', service: 'HTTP (alternate)', description: 'Common alternate HTTP port, often for proxies/dev servers.' },
  { port: 8443, protocol: 'TCP', service: 'HTTPS (alternate)', description: 'Common alternate HTTPS port.' },
  { port: 9200, protocol: 'TCP', service: 'Elasticsearch', description: 'Default REST API port for Elasticsearch.' },
  { port: 27017, protocol: 'TCP', service: 'MongoDB', description: 'Default port for MongoDB.' }
];

export function findPort(port: number): PortInfo[] {
  return COMMON_PORTS.filter((p) => p.port === port);
}

export function searchPorts(query: string): PortInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return COMMON_PORTS;
  return COMMON_PORTS.filter(
    (p) => String(p.port).includes(q) || p.service.toLowerCase().includes(q) || p.protocol.toLowerCase().includes(q)
  );
}
