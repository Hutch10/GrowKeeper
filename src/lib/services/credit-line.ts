import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { SpecimenRow as Specimen } from '@/app/actions/types';
import { calculateHealthScore, CareEvent } from './specimen-health';
import { aiGovernanceService } from './ai-governance';
import { RAIS_CONSTITUTION } from '../rais-constitution';

export interface CreditLine {
  id: string;
  holderId: string;
  limit: number;
  utilization: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVIEW_REQUIRED';
  lastUnderwrittenAt: string;
}

export class CreditLineService {
  private readonly INSTITUTIONAL_MAX_LTV = 0.70; // 70% for institutions

  /**
   * Calculates a health-indexed credit limit for an institutional holder.
   */
  async calculateCreditLimit(holderId: string, specimens: Specimen[], careEvents: Record<string, CareEvent[]>): Promise<number> {
    let totalCapacity = 0;

    for (const specimen of specimens) {
      const health = calculateHealthScore(careEvents[specimen.id] || []);
      const riskScore = await aiGovernanceService.getSpecimenRiskScore(specimen.id);
      
      // Capacity = Valuation * Max_LTV * (Health / 100) / RiskMultiplier
      // LTV is higher for healthy specimens, risk multiplier penalizes volatile assets.
      const valuation = specimen.last_valuation || 0;
      const capacity = (valuation * this.INSTITUTIONAL_MAX_LTV * (health.overall / 100)) / riskScore;
      
      totalCapacity += capacity;
    }

    logger.info('Finance', `CREDIT UNDERWRITING: Calculated ${totalCapacity.toFixed(0)} GC limit for ${holderId} across ${specimens.length} specimens.`);
    return Math.round(totalCapacity);
  }

  /**
   * Requests a credit increase, requiring DAO-governance threshold check.
   */
  async requestCreditIncrease(currentLine: CreditLine, requestedAmount: number): Promise<{ success: boolean; message: string }> {
    const limitCeiling = RAIS_CONSTITUTION.MAX_INCIDENT_PAYOUT * 50; // Constitutional ceiling
    
    if (requestedAmount > limitCeiling) {
      return { success: false, message: "REQUEST_REJECTED: Exceeds constitutional ceiling." };
    }

    // Logic: If increase is > 20% of current limit, it requires a DAO proposal.
    const increasePercent = (requestedAmount - currentLine.limit) / currentLine.limit;
    
    if (increasePercent > 0.20) {
      logger.warn('Governance', `DAO REVIEW REQUIRED: Credit increase of ${(increasePercent * 100).toFixed(1)}% for ${currentLine.id} exceeds autonomous threshold.`);
      return { success: true, message: "PROPOSAL_SUBMITTED: DAO governance review required." };
    }

    logger.info('Finance', `CREDIT INCREASE APPROVED: ${currentLine.id} limit adjusted to ${requestedAmount} GC.`);
    metrics.track('credit_limit_increased', requestedAmount - currentLine.limit, { holderId: currentLine.holderId });
    
    return { success: true, message: "APPROVED: Autonomous adjustment synchronization complete." };
  }

  /**
   * Mock fetch for active credit lines.
   */
  async getActiveCreditLines(): Promise<CreditLine[]> {
    return [
      {
        id: "CL-INST-001",
        holderId: "custodian_001",
        limit: 250000,
        utilization: 145200,
        status: "ACTIVE",
        lastUnderwrittenAt: new Date().toISOString()
      },
      {
        id: "CL-INST-002",
        holderId: "custodian_002",
        limit: 500000,
        utilization: 489000,
        status: "REVIEW_REQUIRED",
        lastUnderwrittenAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
}

export const creditLineService = new CreditLineService();
