/**
 * JWT decoding only — this deliberately does NOT verify the signature. Verifying a JWT
 * requires the issuer's secret/public key, which this tool never has, so a decoded token
 * here tells you nothing about whether it's authentic.
 */
import { base64Decode } from './encoding';

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
}

export class JwtError extends Error {}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new JwtError('A JWT has three dot-separated parts (header.payload.signature) — this has ' + parts.length + '.');
  }

  const [headerB64, payloadB64, signature] = parts;

  let headerRaw: string;
  let payloadRaw: string;
  try {
    headerRaw = base64Decode(headerB64);
  } catch {
    throw new JwtError('Could not base64url-decode the header segment.');
  }
  try {
    payloadRaw = base64Decode(payloadB64);
  } catch {
    throw new JwtError('Could not base64url-decode the payload segment.');
  }

  let header: unknown;
  let payload: unknown;
  try {
    header = JSON.parse(headerRaw);
  } catch {
    throw new JwtError('Header segment is not valid JSON.');
  }
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    throw new JwtError('Payload segment is not valid JSON.');
  }

  return { header, payload, signature, headerRaw, payloadRaw };
}

/** Standard JWT timestamp claims that are worth showing as human-readable dates. */
export const JWT_DATE_CLAIMS: Record<string, string> = {
  exp: 'Expires',
  iat: 'Issued at',
  nbf: 'Not valid before'
};

export function formatUnixTimestamp(seconds: number): string {
  return new Date(seconds * 1000).toLocaleString();
}
