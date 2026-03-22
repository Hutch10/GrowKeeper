import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { SpecimenRow as Specimen } from '@/app/actions/types';
import { payoutService } from './payout-service';
import { RAIS_CONSTITUTION } from '../rais-constitution';
import { MarineAlert, MarineRegion } from '@/types/marine';

export interface InsurancePolicy {
  policyId: string;
  specimenId: string;
  coverageAmount: number;
  premiumPaid: number;
  expiryDate: Date;
}

export class InsuranceService {
  private insurancePoolBalance: number = 250000; // Initial Pool Seed (USD equivalent)

  /**
   * Triggers a claim for specimen mortality (death).
   * v2.1.1: Enforces Constitutional Hard Caps and Geohash deduplication.
   */
  async claimMortalityPayout(specimen: Specimen, evidenceHash: string): Promise<boolean> {
    if (!specimen.is_insured || !specimen.insurance_policy_id) {
      logger.error('Insurance', `CLAIM DENIED: Specimen ${specimen.id} is not insured.`);
      return false;
    }

    logger.info('Insurance', `CLAIM RECEIVED: Specimen ${specimen.id} (Evidence: ${evidenceHash}). Verifying mortality...`);
    
    // Simulation: Verify mortality via DAO/Validator consensus
    const isVerified = evidenceHash.startsWith('DEATH_CONFIRM_0x');
    
    if (isVerified) {
      // Phase 102/1: Mortality events MUST be bucketed by location to prevent pool drainage via cluster-poisoning.
      // v2.1.1: Absolute Sovereign Enforced.
      const lat = specimen.lat || 0;
      const lon = specimen.lon || 0;
      const region = (specimen.region as MarineRegion) || 'MALDIVES';

      const pseudoAlert: MarineAlert = {
        id: `MORTALITY_${specimen.id}`,
        stationId: 'V_STATION_INS',
        region,
        severity: 'CRITICAL',
        reason: 'Verified Specimen Mortality',
        zScore: 3.0
      };

      // Force checkout through the hardened PayoutService
      const authorized = await payoutService.processParametricPayout(pseudoAlert, 1.0, false, lat, lon);

      if (!authorized) {
        logger.error('Insurance', `CLAIM_VETO: Mortality payout for ${specimen.id} blocked by Geohash-Incident Cap (v2.1.1).`);
        return false;
      }

      const payoutAmount = Math.min((specimen.last_valuation || 0) * 0.90, RAIS_CONSTITUTION.MAX_INCIDENT_PAYOUT); 
      this.insurancePoolBalance -= payoutAmount;
      
      logger.info('Insurance', `CLAIM APPROVED: Disbursing ${payoutAmount} $GC for mortality of ${specimen.id}.`);
      metrics.track('insurance_payout', payoutAmount, { specimenId: specimen.id });
      return true;
    }

    logger.warn('Insurance', `CLAIM REJECTED: Evidence ${evidenceHash} for Specimen ${specimen.id} is inconclusive.`);
    return false;
  }

  /**
   * Enriches the insurance pool from validator slashing.
   */
  async fundPool(amount: number, source: string): Promise<void> {
    this.insurancePoolBalance += amount;
    logger.debug('Insurance', `Pool replenished with ${amount} from ${source}. New Balance: ${this.insurancePoolBalance}`);
    metrics.track('insurance_pool_funding', amount, { source });
  }

  /**
   * Returns the current solvency of the insurance pool.
   */
  async getPoolSolvency(): Promise<number> {
    return this.insurancePoolBalance;
  }
}

export const insuranceService = new InsuranceService();
