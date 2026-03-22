import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface NodeMetrics {
  nodeId: string;
  reputation: number;
  totalRewards: number;
  uptime: number; // percentage
}

export class DepinController {
  private nodeStats: Map<string, NodeMetrics> = new Map();
  private readonly REWARD_PER_VERIFIED_SIGN = 0.05; // $GC

  /**
   * Records a data submission and calculates rewards.
   * High-fidelity (Hardware-anchored) signatures earn 2x rewards.
   */
  async processSubmission(nodeId: string, isHardwareAnchored: boolean): Promise<number> {
    const stats = this.getOrCreateStats(nodeId);
    
    let reward = this.REWARD_PER_VERIFIED_SIGN;
    if (isHardwareAnchored) {
      reward *= 2; // Institutional hardware bonus
      stats.reputation = Math.min(1.0, stats.reputation + 0.01);
    }

    stats.totalRewards += reward;
    this.nodeStats.set(nodeId, stats);

    // New: Difficulty Adjustment (Sybil Resistance)
    // As reputation decreases or network load increases, rewards are throttled.
    const difficultyFactor = Math.max(0.1, stats.reputation);
    const finalReward = reward * difficultyFactor;

    metrics.track('depin_reward_minted', finalReward, { nodeId, hardware: isHardwareAnchored.toString() });
    logger.debug('DePIN', `Node ${nodeId} rewarded ${finalReward.toFixed(4)} $GC (Difficulty Factor: ${difficultyFactor.toFixed(2)})`);

    return finalReward;
  }

  private getOrCreateStats(nodeId: string): NodeMetrics {
    if (!this.nodeStats.has(nodeId)) {
      this.nodeStats.set(nodeId, {
        nodeId,
        reputation: 0.5,
        totalRewards: 0,
        uptime: 100
      });
    }
    return this.nodeStats.get(nodeId)!;
  }

  getNodeStats(nodeId: string): NodeMetrics | undefined {
    return this.nodeStats.get(nodeId);
  }
}

export const depinController = new DepinController();
