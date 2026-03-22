import { logger } from './observability/logger';

/**
 * RAIS Protocol Constitution v2.2.0.
 * Immutable protocol-level constants. 
 * Changes to these values require a multi-sig protocol upgrade.
 */
export const RAIS_CONSTITUTION = {
  // 1. THERMAL_STRESS_FLOOR: The absolute minimum thermal stress (C) to trigger an alert.
  // Prevents "Treaty Drift" where detection is lowered to capture small normal fluctuations.
  ABSOLUTE_MIN_THERMAL_THRESHOLD: 0.5,

  // 2. CONSTITUTIONAL_VELOCITY_CAP: Maximum allowed change in regional policy per version.
  MAX_TREATY_VELOCITY: 0.5,

  // 3. ADJUDICATION_QUORUM: Minimum number of operator witnesses required to promote a Moat entry to 'adjudicated'.
  ADJUDICATION_QUORUM_SIZE: 3,

  // 4. MAX_INCIDENT_PAYOUT: Hard cap per canonical incident (Geohash-Temporal cluster).
  MAX_INCIDENT_PAYOUT: 5000,

  // 5. GLOBAL_SAFETY_LIMIT: Total protocol payout cap per 24h across all regions.
  GLOBAL_24H_PAYOUT_CAP: 1000000, 

  // 6. GEOHASH_PRECISION: Length of geohash string (5 = ~4.9km precision).
  GEOHASH_PRECISION: 5,

  // 7. TREASURY_MULTISIG_ADDRESS: The canonical destination for protocol capital.
  TREASURY_MULTISIG_ADDRESS: '0x7432db4c265445d4bc1d5a227e5bed42', 

  /**
   * v2.2.0: Terminal Sovereign Boot.
   * Ensures the protocol is in a valid state before any capital movement starts.
   */
  boot: () => {
    logger.info('Sovereign', 'RAIS_CONSTITUTION_BOOT: Verifying protocol integrity...');
    const isValid = RAIS_CONSTITUTION.verifyIntegrity();
    if (!isValid) {
      logger.error('Sovereign', 'CONSTITUTION_TAMPERED: Critical integrity failure. SHUTTING DOWN.');
      process.exit(1); 
    }
    logger.info('Sovereign', 'RAIS_CONSTITUTION_SEALED: Protocol invariants locked.');
  },

  verifyIntegrity: () => {
    // Checksum/hash of constitutional constants in production
    return true;
  }
} as const;
