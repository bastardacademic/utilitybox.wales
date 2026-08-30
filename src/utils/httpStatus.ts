/** Reference data for HTTP status codes. */

export interface HttpStatus {
  code: number;
  name: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  description: string;
}

export const HTTP_STATUS_CODES: HttpStatus[] = [
  { code: 100, name: 'Continue', category: '1xx', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', category: '1xx', description: 'The requester has asked the server to switch protocols.' },
  { code: 200, name: 'OK', category: '2xx', description: 'The request succeeded.' },
  { code: 201, name: 'Created', category: '2xx', description: 'The request succeeded and a new resource was created.' },
  { code: 202, name: 'Accepted', category: '2xx', description: 'The request has been accepted for processing, but processing is not complete.' },
  { code: 204, name: 'No Content', category: '2xx', description: 'The server successfully processed the request but is not returning any content.' },
  { code: 206, name: 'Partial Content', category: '2xx', description: 'The server is delivering only part of the resource due to a range header.' },
  { code: 300, name: 'Multiple Choices', category: '3xx', description: 'The request has more than one possible response.' },
  { code: 301, name: 'Moved Permanently', category: '3xx', description: 'The resource has been permanently moved to a new URL.' },
  { code: 302, name: 'Found', category: '3xx', description: 'The resource temporarily resides at a different URL.' },
  { code: 304, name: 'Not Modified', category: '3xx', description: 'The resource has not changed since the version specified by request headers.' },
  { code: 307, name: 'Temporary Redirect', category: '3xx', description: 'The request should be repeated with another URL, but future requests should still use the original.' },
  { code: 308, name: 'Permanent Redirect', category: '3xx', description: 'The resource has permanently moved, and future requests should use the new URL.' },
  { code: 400, name: 'Bad Request', category: '4xx', description: 'The server cannot process the request due to a client error (malformed syntax, invalid data).' },
  { code: 401, name: 'Unauthorized', category: '4xx', description: 'Authentication is required and has failed or not been provided.' },
  { code: 403, name: 'Forbidden', category: '4xx', description: 'The server understood the request but refuses to authorize it.' },
  { code: 404, name: 'Not Found', category: '4xx', description: 'The server cannot find the requested resource.' },
  { code: 405, name: 'Method Not Allowed', category: '4xx', description: 'The request method is not supported for this resource.' },
  { code: 408, name: 'Request Timeout', category: '4xx', description: 'The server timed out waiting for the request.' },
  { code: 409, name: 'Conflict', category: '4xx', description: 'The request conflicts with the current state of the resource.' },
  { code: 410, name: 'Gone', category: '4xx', description: 'The resource requested is no longer available and will not be available again.' },
  { code: 413, name: 'Payload Too Large', category: '4xx', description: 'The request entity is larger than limits defined by the server.' },
  { code: 414, name: 'URI Too Long', category: '4xx', description: 'The URI requested by the client is longer than the server is willing to interpret.' },
  { code: 415, name: 'Unsupported Media Type', category: '4xx', description: 'The media format of the requested data is not supported.' },
  { code: 418, name: "I'm a teapot", category: '4xx', description: 'A April Fools joke from RFC 2324 — the server refuses to brew coffee because it is, permanently, a teapot.' },
  { code: 422, name: 'Unprocessable Entity', category: '4xx', description: 'The request was well-formed but contains semantic errors.' },
  { code: 429, name: 'Too Many Requests', category: '4xx', description: 'The user has sent too many requests in a given amount of time (rate limiting).' },
  { code: 500, name: 'Internal Server Error', category: '5xx', description: 'A generic error message when the server encountered an unexpected condition.' },
  { code: 501, name: 'Not Implemented', category: '5xx', description: 'The server does not support the functionality required to fulfil the request.' },
  { code: 502, name: 'Bad Gateway', category: '5xx', description: 'The server, acting as a gateway, received an invalid response from an upstream server.' },
  { code: 503, name: 'Service Unavailable', category: '5xx', description: 'The server is currently unavailable, often due to maintenance or overload.' },
  { code: 504, name: 'Gateway Timeout', category: '5xx', description: 'The server, acting as a gateway, did not receive a timely response from an upstream server.' },
  { code: 505, name: 'HTTP Version Not Supported', category: '5xx', description: 'The server does not support the HTTP protocol version used in the request.' }
];

export function findHttpStatus(code: number): HttpStatus | undefined {
  return HTTP_STATUS_CODES.find((s) => s.code === code);
}

export function searchHttpStatus(query: string): HttpStatus[] {
  const q = query.trim().toLowerCase();
  if (!q) return HTTP_STATUS_CODES;
  return HTTP_STATUS_CODES.filter(
    (s) => String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.category.includes(q)
  );
}
