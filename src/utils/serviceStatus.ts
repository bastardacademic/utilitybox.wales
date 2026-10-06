/**
 * Live service status via each provider's public Atlassian Statuspage API.
 *
 * Every host below was checked to answer `/api/v2/summary.json` with `access-control-allow-origin: *`, so the
 * visitor's browser can call it directly — no server of ours is involved. Services whose status pages don't
 * allow cross-origin reads are deliberately left out rather than guessed at.
 */

export type ServiceGroup = 'Cloud & hosting' | 'Developer tools' | 'AI' | 'Communication & work' | 'Commerce & payments';

export interface StatusService {
  id: string;
  name: string;
  group: ServiceGroup;
  /** Hostname of the provider's status page (no scheme, no path). */
  host: string;
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  'Cloud & hosting',
  'Developer tools',
  'AI',
  'Communication & work',
  'Commerce & payments'
];

export const STATUS_SERVICES: StatusService[] = [
  { id: 'cloudflare', name: 'Cloudflare', group: 'Cloud & hosting', host: 'www.cloudflarestatus.com' },
  { id: 'digitalocean', name: 'DigitalOcean', group: 'Cloud & hosting', host: 'status.digitalocean.com' },
  { id: 'linode', name: 'Linode (Akamai)', group: 'Cloud & hosting', host: 'status.linode.com' },
  { id: 'netlify', name: 'Netlify', group: 'Cloud & hosting', host: 'www.netlifystatus.com' },
  { id: 'vercel', name: 'Vercel', group: 'Cloud & hosting', host: 'www.vercel-status.com' },
  { id: 'render', name: 'Render', group: 'Cloud & hosting', host: 'status.render.com' },
  { id: 'supabase', name: 'Supabase', group: 'Cloud & hosting', host: 'status.supabase.com' },
  { id: 'mongodb', name: 'MongoDB Atlas', group: 'Cloud & hosting', host: 'status.mongodb.com' },

  { id: 'github', name: 'GitHub', group: 'Developer tools', host: 'www.githubstatus.com' },
  { id: 'npm', name: 'npm', group: 'Developer tools', host: 'status.npmjs.org' },
  { id: 'docker', name: 'Docker', group: 'Developer tools', host: 'www.dockerstatus.com' },
  { id: 'circleci', name: 'CircleCI', group: 'Developer tools', host: 'status.circleci.com' },
  { id: 'sentry', name: 'Sentry', group: 'Developer tools', host: 'status.sentry.io' },
  { id: 'datadog', name: 'Datadog', group: 'Developer tools', host: 'status.datadoghq.com' },
  { id: 'hashicorp', name: 'HashiCorp', group: 'Developer tools', host: 'status.hashicorp.com' },

  { id: 'openai', name: 'OpenAI', group: 'AI', host: 'status.openai.com' },
  { id: 'anthropic', name: 'Claude (Anthropic)', group: 'AI', host: 'status.claude.com' },

  { id: 'discord', name: 'Discord', group: 'Communication & work', host: 'discordstatus.com' },
  { id: 'zoom', name: 'Zoom', group: 'Communication & work', host: 'www.zoomstatus.com' },
  { id: 'reddit', name: 'Reddit', group: 'Communication & work', host: 'www.redditstatus.com' },
  { id: 'dropbox', name: 'Dropbox', group: 'Communication & work', host: 'status.dropbox.com' },
  { id: 'box', name: 'Box', group: 'Communication & work', host: 'status.box.com' },
  { id: 'figma', name: 'Figma', group: 'Communication & work', host: 'status.figma.com' },
  { id: 'asana', name: 'Asana', group: 'Communication & work', host: 'status.asana.com' },
  { id: 'atlassian', name: 'Atlassian', group: 'Communication & work', host: 'status.atlassian.com' },
  { id: 'hubspot', name: 'HubSpot', group: 'Communication & work', host: 'status.hubspot.com' },

  { id: 'shopify', name: 'Shopify', group: 'Commerce & payments', host: 'www.shopifystatus.com' },
  { id: 'squarespace', name: 'Squarespace', group: 'Commerce & payments', host: 'status.squarespace.com' },
  { id: 'coinbase', name: 'Coinbase', group: 'Commerce & payments', host: 'status.coinbase.com' },
  { id: 'twilio', name: 'Twilio', group: 'Commerce & payments', host: 'status.twilio.com' }
];

export type ServiceState = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface ServiceIncident {
  name: string;
  /** Statuspage impact: none / minor / major / critical. */
  impact: string;
  url: string | null;
}

export interface ServiceStatus {
  state: ServiceState;
  /** The provider's own one-line description, e.g. "All Systems Operational". */
  description: string;
  /** Names of components currently not operational (capped). */
  affected: string[];
  /** Total number of non-operational components, before capping. */
  affectedCount: number;
  incidents: ServiceIncident[];
}

export const MAX_AFFECTED_SHOWN = 5;

export function stateFromIndicator(indicator: unknown): ServiceState {
  switch (indicator) {
    case 'none':
      return 'operational';
    case 'minor':
      return 'degraded';
    case 'major':
    case 'critical':
      return 'outage';
    default:
      return 'unknown';
  }
}

export const STATE_LABELS: Record<ServiceState, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  unknown: 'Unknown'
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Only ever link to https URLs from third-party data. */
function safeHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Turns a Statuspage `summary.json` body into a `ServiceStatus`. The input is untrusted third-party JSON, so every
 * field is type-checked; a body without a recognisable `status.indicator` throws rather than guessing.
 */
export function parseSummary(body: unknown): ServiceStatus {
  if (typeof body !== 'object' || body === null) throw new Error('Unexpected response');
  const data = body as Record<string, unknown>;
  const status = data.status as Record<string, unknown> | undefined;
  const state = stateFromIndicator(status?.indicator);
  if (state === 'unknown') throw new Error('Unexpected response');

  const components = Array.isArray(data.components) ? data.components : [];
  const affectedAll = components
    .filter((c): c is Record<string, unknown> => typeof c === 'object' && c !== null)
    // Group headers are containers, not services — their children carry the real status.
    .filter((c) => c.group !== true && c.status !== 'operational' && typeof c.status === 'string')
    .map((c) => asString(c.name))
    .filter(Boolean);

  const incidents = (Array.isArray(data.incidents) ? data.incidents : [])
    .filter((i): i is Record<string, unknown> => typeof i === 'object' && i !== null)
    .map((i) => ({
      name: asString(i.name) || 'Ongoing incident',
      impact: asString(i.impact) || 'none',
      url: safeHttpsUrl(i.shortlink)
    }));

  return {
    state,
    description: asString(status?.description) || STATE_LABELS[state],
    affected: affectedAll.slice(0, MAX_AFFECTED_SHOWN),
    affectedCount: affectedAll.length,
    incidents
  };
}

export function summaryUrl(service: StatusService): string {
  return `https://${service.host}/api/v2/summary.json`;
}

export function statusPageUrl(service: StatusService): string {
  return `https://${service.host}/`;
}

export async function fetchServiceStatus(service: StatusService, timeoutMs = 10000): Promise<ServiceStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(summaryUrl(service), { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseSummary(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

export interface StatusTally {
  operational: number;
  degraded: number;
  outage: number;
  unknown: number;
  checked: number;
}

export function tallyStates(states: Array<ServiceState | undefined>): StatusTally {
  const tally: StatusTally = { operational: 0, degraded: 0, outage: 0, unknown: 0, checked: 0 };
  for (const state of states) {
    if (!state) continue;
    tally[state] += 1;
    tally.checked += 1;
  }
  return tally;
}
