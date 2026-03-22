/**
 * GrowKeeper Valuation Engine
 * Calculates specimen value based on health history, rarity, and Proof-of-Care signals.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface ValuationMetrics {
  baseValue: number;
  healthPremium: number;
  provenanceBonus: number;
  totalValuation: number;
}

export class ValuationEngine {
  private readonly SCALE_FACTOR = 1000;

  /**
   * Calculates the current market valuation of a specimen.
   */
  calculateValuation(specimen: Specimen): ValuationMetrics {
    const baseValue = this.SCALE_FACTOR;
    
    // Health Premium (Happiness score multiplier)
    const healthPremium = Math.floor(baseValue * ((specimen.happiness_score || 50) / 100));
    
    // Provenance Bonus (Verified records increase value by 20%)
    const provenanceBonus = specimen.lastVitalSignature ? Math.floor(baseValue * 0.2) : 0;
    
    const totalValuation = baseValue + healthPremium + provenanceBonus;

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

    logger.debug('Economics', `Valuation for ${specimen.id}: $${totalValuation}`);

    return {
      baseValue,
      healthPremium,
      provenanceBonus,
      totalValuation
    };
  }

  /**
   * Projects future valuation based on growth rates.
   */
  projectAppreciation(specimen: Specimen, months: number): number {
    const current = this.calculateValuation(specimen).totalValuation;
    const growthRate = 1.05; // 5% monthly compounding appreciation
    return Math.floor(current * Math.pow(growthRate, months));
  }
}

export const valuationEngine = new ValuationEngine();
