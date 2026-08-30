/** URL component encoding/decoding. */

export class UrlEncodingError extends Error {}

/** Encodes a value for use inside a single URL component (query value, path segment). */
export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    throw new UrlEncodingError('Could not decode — this is not valid percent-encoded text.');
  }
}

/** Encodes a full URL, leaving already-valid URL characters (like : / ?) untouched. */
export function urlEncodeFull(text: string): string {
  return encodeURI(text);
}

export function urlDecodeFull(text: string): string {
  try {
    return decodeURI(text);
  } catch {
    throw new UrlEncodingError('Could not decode — this is not valid percent-encoded text.');
  }
}
