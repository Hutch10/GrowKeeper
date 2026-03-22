/**
 * GrowKeeper Cryptographic Utilities
 * Provides secure entropy and hashing primitives to replace insecure defaults.
 */

export function generateSecureId(prefix: string = 'GK', length: number = 12): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex.toUpperCase()}`;
}

export function generateNullifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a SHA-256 hash of a payload for deterministic anchoring.
 */
export async function computeHash(payload: Record<string, unknown> | unknown[]): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
