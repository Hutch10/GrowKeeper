import { logger } from '../observability/logger';
import { marineOracleService } from './marine-oracle-service';

export interface StakingPool {
  oracleId: string;
  stakedAmount: number;
  reputation: number;
  slashedCount: number;
}

export class MarineStakingService {
  private pools: Map<string, StakingPool> = new Map();
  private readonly MINIMUM_STAKE = 1000;
  private readonly SLASH_PENALTY = 0.15;

  /**
   * Slashes an oracle for reporting anomalous/false data (Circuit-Breaker Hardened).
   */
  async slashOracle(oracleId: string, regionalDivergence: number = 0): Promise<number> {
    // Phase 8.1: Global Divergence Circuit-Breaker
    if (marineOracleService.getSlashingStatus() || regionalDivergence > 0.30) {
      logger.info('Staking', `SLASHING SUPPRESSED: Divergence (${(regionalDivergence * 100).toFixed(2)}%) triggered circuit-breaker.`);
      return 0;
    }

    const pool = this.pools.get(oracleId);
    if (!pool) return 0;

    const penalty = pool.stakedAmount * this.SLASH_PENALTY;
    pool.stakedAmount -= penalty;
    pool.reputation *= 0.8;
    pool.slashedCount += 1;

    logger.warn('Staking', `SLASHING DETECTED: Oracle ${oracleId} penalized ${penalty.toFixed(2)} GC.`);
    return penalty;
  }

  /**
   * Rewards oracles for high-fidelity regional coverage.
   */
  async rewardOracle(oracleId: string, bonus: number): Promise<void> {
    const pool = this.pools.get(oracleId);
    if (!pool) return;

    pool.stakedAmount += bonus;
    pool.reputation = Math.min(2.0, pool.reputation + 0.05);
    logger.info('Staking', `Oracle ${oracleId} rewarded ${bonus} GC. Reputation: ${pool.reputation.toFixed(2)}`);
  }
}

export const marineStakingService = new MarineStakingService();
