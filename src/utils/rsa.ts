/** RSA key pair generation via the browser's native Web Crypto API (SubtleCrypto). */

export type RsaKeyPurpose = 'sign' | 'encrypt';
export type RsaModulusLength = 2048 | 3072 | 4096;

export interface RsaKeyPairPem {
  publicKeyPem: string;
  privateKeyPem: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Wraps base64 key data into standard 64-column PEM format with the given label. */
function toPem(base64: string, label: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

const ALGORITHMS: Record<RsaKeyPurpose, { name: string; keyUsages: KeyUsage[] }> = {
  sign: { name: 'RSASSA-PKCS1-v1_5', keyUsages: ['sign', 'verify'] },
  encrypt: { name: 'RSA-OAEP', keyUsages: ['encrypt', 'decrypt'] }
};

/**
 * Generates an RSA key pair entirely in the browser and returns it as PEM text
 * (SPKI for the public key, PKCS#8 for the private key). Nothing is sent anywhere —
 * key generation and export both happen via crypto.subtle.
 */
export async function generateRsaKeyPair(
  purpose: RsaKeyPurpose,
  modulusLength: RsaModulusLength
): Promise<RsaKeyPairPem> {
  const { name, keyUsages } = ALGORITHMS[purpose];

  const keyPair = await crypto.subtle.generateKey(
    {
      name,
      modulusLength,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537, the standard choice
      hash: 'SHA-256'
    },
    true, // extractable, so we can export it below
    keyUsages
  ) as CryptoKeyPair;

  const [publicKeyRaw, privateKeyRaw] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  ]);

  return {
    publicKeyPem: toPem(arrayBufferToBase64(publicKeyRaw), 'PUBLIC KEY'),
    privateKeyPem: toPem(arrayBufferToBase64(privateKeyRaw), 'PRIVATE KEY')
  };
}
