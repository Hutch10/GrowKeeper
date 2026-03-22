/**
 * Cryptographic Provenance Utility
 * Generates and verifies 'Proof of Care' signatures for biological assets.
 */

import { logger } from '@/lib/observability/logger';
import { hardwareSecurity } from './services/hardware-security';

export interface VitalSignSnapshot {
  [key: string]: unknown; // Index signature for Record compatibility
  specimenId: string;
  timestamp: string;
  moisture?: number;
  uvIndex?: number;
  temp?: number;
  isHardwareAnchored?: boolean;
}

export class ProvenanceProvider {
  private keyPair: CryptoKeyPair | null = null;

  /**
   * Generates or retrieves an asymmetric key-pair for this node.
   * ECDSA P-384 provides high clinical/institutional security.
   */
  async ensureKeys(): Promise<CryptoKeyPair> {
    if (this.keyPair) return this.keyPair;
    
    this.keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-384' },
      true,
      ['sign', 'verify']
    );
    return this.keyPair;
  }

  /**
   * Signs a payload using the node's PRIVATE key.
   * Impossible to forge without access to the local key-pair.
   */
  async signVitals(vitals: VitalSignSnapshot): Promise<{ signature: string, publicKey: JsonWebKey, attestation?: string }> {
    if (vitals.isHardwareAnchored && hardwareSecurity.isEnrolled()) {
      const { signature, attestation } = await hardwareSecurity.signWithHardware(vitals);
      // For simulation, we still export a mock JWK for the 'hardware-backed' pubkey
      const { publicKey } = await this.ensureKeys();
      const jwk = await crypto.subtle.exportKey('jwk', publicKey);
      
      logger.info('Provenance', `Generated TEE-ANCHORED Proof-of-Care for ${vitals.specimenId}`);
      return { signature, publicKey: jwk, attestation };
    }

    const { privateKey, publicKey } = await this.ensureKeys();
    const payload = JSON.stringify(vitals);
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-384' } },
      privateKey,
      data
    );

    const hashArray = Array.from(new Uint8Array(signature));
    const token = btoa(String.fromCharCode.apply(null, hashArray));
    const jwk = await crypto.subtle.exportKey('jwk', publicKey);

    logger.info('Provenance', `Generated ASYMMETRIC Proof-of-Care for ${vitals.specimenId}`);
    return { 
      signature: `GKPV_v2_${token}`, 
      publicKey: jwk 
    };
  }

  /**
   * Verifies the integrity of a signed vital record using a PUBLIC key.
   */
  async verifyVitals(vitals: VitalSignSnapshot, signature: string, publicJwk: JsonWebKey): Promise<boolean> {
    if (!signature.startsWith('GKPV_v2_')) return false;
    
    const token = signature.replace('GKPV_v2_', '');
    const signatureBuffer = Uint8Array.from(atob(token), c => c.charCodeAt(0));
    
    const publicKey = await crypto.subtle.importKey(
      'jwk', 
      publicJwk, 
      { name: 'ECDSA', namedCurve: 'P-384' }, 
      true, 
      ['verify']
    );

    const payload = JSON.stringify(vitals);
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-384' } },
      publicKey,
      signatureBuffer,
      data
    );
  }
}

export const provenance = new ProvenanceProvider();
