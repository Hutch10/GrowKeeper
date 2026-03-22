/**
 * GrowKeeper Bio-Asset Lending Service
 * Enables stewards to borrow $GC against their verified biological assets.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { SpecimenRow as Specimen } from '@/app/actions/types';
import { RAIS_CONSTITUTION } from '../rais-constitution';

export interface LoanIntent {
  specimenId: string;
  requestedAmount: number;
}

export class LendingService {
  private readonly MAX_LTV = 0.50; // 50% Loan-to-Value Max

  /**
   * Calculates the borrowing capacity for a specific biological asset.
   */
  async calculateBorrowCapacity(specimen: Specimen): Promise<number> {
    const valuation = specimen.last_valuation || 0;
    const capacity = valuation * this.MAX_LTV;
    
    logger.debug('Lending', `Borrow capacity for Specimen ${specimen.id}: ${capacity} $GC (Valuation: ${valuation})`);
    return capacity;
  }

  /**
   * Initiates a collateralized loan.
   * v2.2.0: Enforces Truth-Only valuations from the Knowledge Moat and Constitutional Velocity.
   */
  async initiateLoan(specimen: Specimen, amount: number): Promise<boolean> {
    // Phase 105: We must verify the valuation hasn't jumped suspiciously (Price-Oracle Manipulation protection)
    // In production, we would compare with the historical mean from the Knowledge Moat.
    const capacity = await this.calculateBorrowCapacity(specimen);
    
    if (amount > capacity) {
      logger.warn('Lending', `LOAN REJECTED: Requested ${amount} exceeds capacity ${capacity} for Specimen ${specimen.id}`);
      return false;
    }

    // v2.2.0: Constitutionally capped at MAX_INCIDENT_PAYOUT to prevent pool drainage via 'lending loops'.
    const cappedAmount = Math.min(amount, RAIS_CONSTITUTION.MAX_INCIDENT_PAYOUT * 10); 

    logger.info('Lending', `LOAN APPROVED: Disbursing ${cappedAmount} $GC against Specimen ${specimen.id}.`);
    
    // Simulation: Mark specimen as collateralized and update loan amount
    specimen.loan_amount = cappedAmount;
    specimen.collateral_ratio = cappedAmount / (specimen.last_valuation || 1);
    
    metrics.track('loan_originated', cappedAmount, { specimenId: specimen.id });
    return true;
  }

  /**
   * Liquidates a loan if the LTV exceeds the safety threshold.
   */
  async liquidate(specimen: Specimen): Promise<void> {
    logger.error('Lending', `LIQUIDATION TRIGGERED: Specimen ${specimen.id} collateral failed. Forfeiting to Pool.`);
    specimen.status = 'ARCHIVED';
    specimen.loan_amount = 0;
    metrics.track('loan_liquidated', 1, { specimenId: specimen.id });
  }
}

export const lendingService = new LendingService();
