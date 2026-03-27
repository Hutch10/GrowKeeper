import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";
import { omnichainService } from "./omnichain-service";
import type { SpecimenRow } from "@/app/actions/types";

export interface InsurancePolicy {
  id: string;
  specimenId: string;
  coverageAmount: number;
  premium: number;
  thresholds: {
    minVitalScore: number;
    maxRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  status: "active" | "triggered" | "expired";
  lastVerifiedAt: string;
}

export interface PayoutEvent {
  id: string;
  policyId: string;
  amount: number;
  reason: string;
  timestamp: string;
}

class InsuranceEngine {
  private policies: Map<string, InsurancePolicy> = new Map();
  private readonly BASE_MONTHLY_PREMIUM = 50;

  /**
   * Initializes a parametric policy for a specimen.
   */
  async activatePolicy(specimen: SpecimenRow, coverage: number): Promise<InsurancePolicy> {
    const policy: InsurancePolicy = {
      id: `pol_${Math.random().toString(36).substring(7)}`,
      specimenId: specimen.id,
      coverageAmount: coverage,
      premium: coverage * 0.05, // 5% premium for parametric coverage
      thresholds: {
        minVitalScore: 70,
        maxRiskLevel: "HIGH"
      },
      status: "active",
      lastVerifiedAt: new Date().toISOString()
    };

    this.policies.set(policy.id, policy);
    logger.info('Finance', `Parametric Policy ACTIVATED for ${specimen.nickname} [${policy.id}]`);
    metrics.track('insurance_policy_activated', 1, { specimenId: specimen.id });
    
    return policy;
  }

  /**
   * Evaluates current vitals against parametric thresholds.
   * If thresholds are breached, a payout is triggered.
   */
  async evaluateRisk(specimen: SpecimenRow, policyId: string): Promise<PayoutEvent | null> {
    const policy = this.policies.get(policyId);
    if (!policy || policy.status !== "active") return null;

    const health = specimen.health || 50;
    
    // Logic: Base Premium * (Inverse Health Factor) * Asset Velocity
    const premium = this.BASE_MONTHLY_PREMIUM * (1.5 - (health / 100));
    logger.debug('Finance', `Calculated current premium for policy ${policyId}: ${premium}`);
    
    const isBreached = health < policy.thresholds.minVitalScore;

    if (isBreached) {
      policy.status = "triggered";
      const payout: PayoutEvent = {
        id: `pay_${Math.random().toString(36).substring(7)}`,
        policyId: policy.id,
        amount: policy.coverageAmount,
        reason: `Vital health (${health}%) breached parametric floor (${policy.thresholds.minVitalScore}%)`,
        timestamp: new Date().toISOString()
      };

      logger.warn('Finance', `PARAMETRIC TRIGGER: ${payout.reason} for ${specimen.id}`);
      metrics.track('insurance_payout_triggered', payout.amount, { policyId: policy.id });
      
      // New: Execute Omnichain Settlement
      await omnichainService.bridgeCapitalToRecipient(
        payout.amount, 
        "GK", 
        "ETH-BASE-1", // Simulated target chain
        "0x_SYSTEM_RESERVE"
      );
      
      return payout;
    }

    policy.lastVerifiedAt = new Date().toISOString();
    return null;
  }

  /**
   * Fetches active policies for a specimen.
   */
  async getSpecimenPolicies(specimenId: string): Promise<InsurancePolicy[]> {
    return Array.from(this.policies.values()).filter(p => p.specimenId === specimenId);
  }
}

export const insuranceEngine = new InsuranceEngine();
