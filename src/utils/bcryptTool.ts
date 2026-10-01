/** Bcrypt hashing and verification, via the bcryptjs library (pure JS, runs entirely client-side). */

import { hash, compare, getRounds, truncates } from 'bcryptjs';

export async function hashPassword(password: string, saltRounds: number): Promise<string> {
  return hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}

export function getHashRounds(hashValue: string): number {
  return getRounds(hashValue);
}

/** Bcrypt only uses the first 72 bytes of a password — anything beyond that is silently ignored. */
export function passwordExceedsBcryptLimit(password: string): boolean {
  return truncates(password);
}

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isValidBcryptHash(value: string): boolean {
  return BCRYPT_HASH_PATTERN.test(value.trim());
}
