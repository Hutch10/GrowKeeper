import { logger } from '../observability/logger';
import { RAIS_CONSTITUTION } from '../rais-constitution';
import { MarineRegion } from '@/types/marine';

export interface RegionalPolicy {
  region: MarineRegion;
  thermalThreshold: number;
  phThreshold: number;
  autoPayoutEnabled: boolean;
  version: number;
}

export class MarineTreatyService {
  private policies: Map<MarineRegion, RegionalPolicy> = new Map();
  
  constructor() {
    // Initial Mainnet Treaty (Phase 6)
    const regions: MarineRegion[] = ['CARIBBEAN', 'MALDIVES', 'PACIFIC_NORTHWEST', 'GREAT_BARRIER_REEF'];
    regions.forEach(r => {
      this.policies.set(r, {
        region: r,
        thermalThreshold: 1.5,
        phThreshold: 0.2,
        autoPayoutEnabled: true,
        version: 1,
      });
    });
  }

  /**
   * Proposes a change to the regional treaty (Governance).
   * Enforces Constitutional Rails (v2.1.0).
   */
  async proposePolicyChange(region: MarineRegion, newPolicy: Partial<RegionalPolicy>): Promise<string> {
    const current = this.policies.get(region);
    if (!current) throw new Error('Region not found in registry.');

    // 1. Bound Check (v2.1.0 Constitutional Invariant)
    if (newPolicy.thermalThreshold !== undefined) {
      if (newPolicy.thermalThreshold < RAIS_CONSTITUTION.ABSOLUTE_MIN_THERMAL_THRESHOLD) {
        throw new Error(`CONSTITUTION_VIOLATION: Thermal threshold cannot go below ${RAIS_CONSTITUTION.ABSOLUTE_MIN_THERMAL_THRESHOLD}`);
      }
      
      // 2. Velocity Check (v2.1.0 Constitutional Velocity)
      const delta = Math.abs(newPolicy.thermalThreshold - current.thermalThreshold);
      if (delta > RAIS_CONSTITUTION.MAX_TREATY_VELOCITY) {
        throw new Error(`VELOCITY_VIOLATION: Change of ${delta} exceeds the constitutional limit of ${RAIS_CONSTITUTION.MAX_TREATY_VELOCITY}`);
      }
    }

    const proposalId = `TRE_PROP_${Date.now()}`;
    logger.info('Governance', `New Treaty Proposal ${proposalId} for ${region} (SAFE_LIMITS_VERIFIED).`);
    
    // In a real DAO, this would queue a vote. For v1.0.5, we apply if safe.
    this.policies.set(region, { ...current, ...newPolicy, version: current.version + 1 });
    
    return proposalId;
  }

  getPolicy(region: MarineRegion): RegionalPolicy | undefined {
    return this.policies.get(region);
  }
}

export const marineTreatyService = new MarineTreatyService();
