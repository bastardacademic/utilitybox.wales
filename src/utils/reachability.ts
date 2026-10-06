/**
 * "Is this site reachable from my browser?" check.
 *
 * Browsers hide the response of cross-origin requests, so a `no-cors` fetch can only tell us whether *any* HTTP
 * response came back (the promise resolves) or the connection failed outright (it rejects). That is enough to say
 * "reachable" but not to say why something failed, so a failure is paired with a DNS check to separate "this
 * domain doesn't exist" from "it exists but didn't answer".
 */

import { lookupDns } from './dns';

export interface Target {
  /** The https URL that will be requested. */
  url: string;
  hostname: string;
  /** True when the user typed http:// and it was upgraded, because browsers block plain-http requests from an https page. */
  upgraded: boolean;
}

const HOSTNAME_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/;

/** Accepts `example.com`, `www.example.com/path`, or a full http(s) URL. Returns null for anything else. */
export function parseTarget(input: string): Target | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // Credentials in a URL are never something to send on a user's behalf.
  if (url.username || url.password) return null;

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!HOSTNAME_PATTERN.test(hostname)) return null;

  const upgraded = url.protocol === 'http:';
  url.protocol = 'https:';
  // An explicit :80 would not make sense once upgraded; drop any port that was only valid for http.
  if (upgraded) url.port = '';
  return { url: url.toString(), hostname, upgraded };
}

export type ReachabilityVerdict = 'reachable' | 'no-dns' | 'no-response' | 'dns-unavailable';

export interface ReachabilityResult {
  verdict: ReachabilityVerdict;
  /** Round-trip time in ms, only for `reachable`. */
  ms?: number;
}

async function requestResponds(url: string, timeoutMs: number): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', signal: controller.signal });
    return Math.round(performance.now() - started);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkReachability(target: Target, timeoutMs = 8000): Promise<ReachabilityResult> {
  const ms = await requestResponds(target.url, timeoutMs);
  if (ms !== null) return { verdict: 'reachable', ms };

  try {
    const dns = await lookupDns(target.hostname, 'A');
    // 3 = NXDOMAIN. Anything else (including NOERROR with no A record) means the name is at least known.
    if (dns.status === 3) return { verdict: 'no-dns' };
    return { verdict: 'no-response' };
  } catch {
    return { verdict: 'dns-unavailable' };
  }
}
