import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";

export interface StakingPosition {
  id: string;
  custodianId: string;
  amount: number;
  stakedAt: string;
  yieldEarned: number;
}

export interface PoolMetrics {
  totalValueLocked: number;
  reserveRatio: number; // 0-1
  currentAPY: number; // Percentage
  totalParticipants: number;
}

export interface PoolTransaction {
  id: string;
  type: "SETTLEMENT" | "STAKE" | "WITHDRAWAL";
  amount: number;
  asset: string;
  status: "FINALIZED" | "PENDING" | "FAILED";
  target: string;
  timestamp: string;
  reason: string;
}

class LiquidityPoolService {

  private positions: Map<string, StakingPosition[]> = new Map();
  private tvl: number = 2500000; // Simulated starting TVL (2.5M GC)
  private reserveTarget: number = 0.4; // 40% reserve target

  /**
   * Stakes capital into the institutional reserve.
   */
  async stake(custodianId: string, amount: number): Promise<StakingPosition> {
    const position: StakingPosition = {
      id: `pos_${Math.random().toString(36).substring(7)}`,
      custodianId,
      amount,
      stakedAt: new Date().toISOString(),
      yieldEarned: 0
    };

    const currentPositions = this.positions.get(custodianId) || [];
    this.positions.set(custodianId, [...currentPositions, position]);
    
    this.tvl += amount;
    logger.info('Finance', `INSTITUTIONAL STAKE: ${custodianId} committed ${amount} GC. New TVL: ${this.tvl}`);
    metrics.track('liquidity_pool_stake', amount, { custodianId });

    return position;
  }

  /**
   * Calculates current APY based on Registry Health and TVL.
   */
  async getMetrics(): Promise<PoolMetrics> {
    // Simulated dynamic calculation
    const baseAPY = 8.5; 
    const volatility = Math.sin(Date.now() / 100000) * 0.5;
    const currentAPY = baseAPY + volatility;
    
    // Total Value Locked is the sum of institutional positions + system reserve
    const totalValueLocked = this.tvl;
    const reserveRatio = Math.min(0.95, 0.4 + (totalValueLocked / 10000000));
    
    return {
      totalValueLocked,
      reserveRatio,
      currentAPY,
      totalParticipants: 42 + Math.floor(totalValueLocked / 100000)
    };
  }

  /**
   * Fetches recent transactions (settlements, stakes, withdrawals).
   */
  async getTransactions(): Promise<PoolTransaction[]> {

    return [
      {
        id: "tx_8812",
        type: "SETTLEMENT",
        amount: 2500,
        asset: "GK",
        status: "FINALIZED",
        target: "ETH-BASE-1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reason: "PARAMETRIC_BREACH: MONSTERA_01"
      },
      {
        id: "tx_8811",
        type: "STAKE",
        amount: 50000,
        asset: "GK",
        status: "FINALIZED",
        target: "RESERVE_ENCLAVE",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        reason: "INSTITUTIONAL_COMMITMENT"
      },
      {
        id: "tx_8810",
        type: "SETTLEMENT",
        amount: 1500,
        asset: "GK",
        status: "FINALIZED",
        target: "SOL-MAIN-1",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        reason: "PARAMETRIC_BREACH: OYSTER_MUSHROOM_04"
      }
    ];
  }

  /**
   * Fetches positions for a specific custodian.
   */
  async getCustodianPositions(custodianId: string): Promise<StakingPosition[]> {
    return this.positions.get(custodianId) || [];
  }

  /**
   * Authorizes a withdrawal from the reserve.
   */
  async withdraw(positionId: string, custodianId: string): Promise<boolean> {
    const current = this.positions.get(custodianId) || [];
    const position = current.find(p => p.id === positionId);
    
    if (!position) return false;

    this.positions.set(custodianId, current.filter(p => p.id !== positionId));
    this.tvl -= position.amount;
    
    logger.info('Finance', `WITHDRAWAL: ${custodianId} reclaimed ${position.amount} GC.`);
    metrics.track('liquidity_pool_withdrawal', position.amount, { custodianId });
    
    return true;
  }
}


export const liquidityPool = new LiquidityPoolService();
