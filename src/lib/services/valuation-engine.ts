/**
 * GrowKeeper Valuation Engine
 * Calculates specimen value based on health history, rarity, and Proof-of-Care signals.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { remediationController } from './remediation-controller';
import { RAIS_CONSTITUTION } from '../rais-constitution';

export interface ValuationMetrics {
  baseValue: number;
  healthPremium: number;
  provenanceBonus: number;
  driftPenalty: number;
  totalValuation: number;
}

export interface ValuationReport {
  totalWorthUSD: number;
  complianceRatio: number; // 0 to 1
  governedCount: number;
  provisionalCount: number;
  lastAuditTimestamp: string;
}

export class ValuationEngine {
  private readonly SCALE_FACTOR = 1000;

  /**
   * Aggregates valuation for a fleet of specimens.
   */
  static async calculateWorth(specimens: Specimen[]): Promise<ValuationReport> {
    const engine = new ValuationEngine();
    let totalWorth = 0;
    let governedCount = 0;
    let provisionalCount = 0;

    for (const specimen of specimens) {
      const metrics = await engine.calculateValuation(specimen);
      totalWorth += metrics.totalValuation;

      const audit = RAIS_CONSTITUTION.validateSpecimen(specimen);
      if (audit.isValid) {
        governedCount++;
      } else {
        provisionalCount++;
      }
    }

    return {
      totalWorthUSD: Math.round(totalWorth),
      complianceRatio: specimens.length > 0 ? governedCount / specimens.length : 1,
      governedCount,
      provisionalCount,
      lastAuditTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculates the current market valuation of a specimen.
   */
  async calculateValuation(specimen: Specimen): Promise<ValuationMetrics> {
    const baseValue = this.SCALE_FACTOR;
    
    // Health Premium (Happiness score multiplier)
    const health = (specimen.health || 85) / 100;
    const healthPremium = Math.floor(baseValue * health);
    
    // Provenance Bonus (Verified records increase value by 20%)
    const provenanceBonus = specimen.last_vital_signature ? Math.floor(baseValue * 0.2) : 0;
    
    // Protocol Drift Penalty (Stage 3 Integration)
    const remediationStatus = await remediationController.evaluateSpecimen(specimen);
    const driftPenalty = remediationStatus.hasDrift ? Math.floor(baseValue * (remediationStatus.warnings.length * 0.1)) : 0;
    
    const totalValuation = Math.max(0, baseValue + healthPremium + provenanceBonus - driftPenalty);

    // Update specimen's last valuation and check for margin calls
    specimen.last_valuation = totalValuation;

    // Check for Margin Calls (Phase 44)
    if (specimen.loan_amount && specimen.loan_amount > 0) {
      const currentLTV = specimen.loan_amount / totalValuation;
      specimen.collateral_ratio = currentLTV;

      if (currentLTV >= 0.90) {
        logger.error('Lending', `CRITICAL MARGIN CALL on Specimen ${specimen.id}. LTV: ${currentLTV.toFixed(2)}`);
        metrics.track('margin_call_triggered', 1, { specimenId: specimen.id, ltv: currentLTV.toString() });
      }
    }

    metrics.track('valuation_updated', totalValuation, { specimenId: specimen.id });

    logger.debug('Economics', `Valuation for ${specimen.id}: $${totalValuation} (Penalty: -$${driftPenalty})`);

    return {
      baseValue,
      healthPremium,
      provenanceBonus,
      driftPenalty,
      totalValuation
    };
  }

  /**
   * Projects future valuation based on growth rates.
   */
  async projectAppreciation(specimen: Specimen, months: number): Promise<number> {
    const metrics = await this.calculateValuation(specimen);
    const growthRate = 1.05; // 5% monthly compounding appreciation
    return Math.floor(metrics.totalValuation * Math.pow(growthRate, months));
  }
}

export const valuationEngine = new ValuationEngine();
