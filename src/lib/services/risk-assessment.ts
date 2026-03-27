/**
 * GrowKeeper Automated Risk Assessment
 * Identifies negative trend-lines and predicts critical health failures.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface HandoverRecord {
  specimenId: string;
  fromNode: string;
  toNode: string;
  timestamp: string;
  billOfSaleHash: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface RiskAnalysis {
  riskLevel: RiskLevel;
  healthOutlook: 'EXCELLENT' | 'STABLE' | 'DEGRADING' | 'CRITICAL';
  primaryThreat: string | null;
  probability: number;
  recommendation: string;
}

export class RiskService {
  /**
   * Performs an automated 'Health Crash' prediction.
   */
  async assessRisk(specimen: Specimen): Promise<RiskAnalysis> {
    const healthScore = specimen.health || 85;
    const mortalityRisk = Math.max(0, 100 - healthScore) / 100;
    
    let riskLevel: RiskLevel = 'LOW';
    let healthOutlook: 'EXCELLENT' | 'STABLE' | 'DEGRADING' | 'CRITICAL' = 'EXCELLENT';
    let threat: string | null = null;
    let recommendation = 'Continue existing care protocol.';

    if (healthScore < 30) {
      riskLevel = 'CRITICAL';
      healthOutlook = 'CRITICAL';
      threat = 'Sustained Vital Failure';
      recommendation = 'IMMEDIATE INTERVENTION REQUIRED: Check moisture and substrate pH.';
    } else if (healthScore < 60) {
      riskLevel = 'HIGH';
      healthOutlook = 'DEGRADING';
      threat = 'Environmental Drift';
      recommendation = 'Calibrate sensor array and adjust humidity levels.';
    } else if (healthScore < 85) {
      riskLevel = 'LOW';
      healthOutlook = 'STABLE';
      recommendation = 'Growth trajectory is nominal. Maintain current regimen.';
    }

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      metrics.track('high_risk_asset_detected', 1, { specimenId: specimen.id });
      logger.warn('Risk', `PREDICTIVE ALERT: High failure probability for ${specimen.id} (${(mortalityRisk * 100).toFixed(1)}% mortality risk)`);
    }

    return {
      riskLevel,
      healthOutlook,
      primaryThreat: threat,
      probability: mortalityRisk,
      recommendation
    };
  }
}

export const riskService = new RiskService();
