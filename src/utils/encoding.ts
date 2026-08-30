/** Base64 / Base64URL encoding, safe for arbitrary UTF-8 text (not just Latin1, unlike raw btoa/atob). */

export function base64Encode(input: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  let encoded = btoa(binary);
  if (urlSafe) encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return encoded;
}

/** Decodes standard or URL-safe base64 (accepts either alphabet, with or without padding). */
export function base64Decode(input: string): string {
  const normalized = input.trim().replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded); // throws DOMException on invalid base64
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
