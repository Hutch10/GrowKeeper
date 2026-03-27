import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";
import { liquidityPool } from "./liquidity-pool";

export interface BridgeTransfer {
  id: string;
  sourceChain: string;
  targetChain: string;
  amount: number;
  status: "PENDING_AUTH" | "IN_FLIGHT" | "COMPLETED" | "FAILED";
  timestamp: string;
}

class LiquidityAggregatorService {
  private activeBridges: BridgeTransfer[] = [];
  private chainTVL: Record<string, number> = {
    "BASE": 12500000,
    "SOL": 4800000,
    "ETH-MAIN": 8200000
  };

  /**
   * Calculates yield spreads between chains.
   */
  async getArbitrageDelta(): Promise<{ chain: string; yieldDelta: number }[]> {
    return [
      { chain: "SOL", yieldDelta: 1.85 }, // SOL has 1.85% higher yield currently
      { chain: "BASE", yieldDelta: 0 },
      { chain: "ETH-MAIN", yieldDelta: -0.45 }
    ];
  }

  /**
   * Initiates a cross-chain liquidity bridge.
   */
  async bridgeLiquidity(amount: number, targetChain: string): Promise<BridgeTransfer> {
    const totalTVL = await liquidityPool.getMetrics().then(m => m.totalValueLocked);
    const threshold = totalTVL * 0.10; // 10% threshold for multi-sig

    const bridge: BridgeTransfer = {
      id: `brg_${Math.random().toString(36).substring(7)}`,
      sourceChain: "BASE",
      targetChain,
      amount,
      status: amount > threshold ? "PENDING_AUTH" : "IN_FLIGHT",
      timestamp: new Date().toISOString()
    };

    this.activeBridges.push(bridge);
    
    if (bridge.status === "PENDING_AUTH") {
      logger.warn('Finance', `MULTI-SIG REQUIRED: Large bridge of ${amount} to ${targetChain} triggered security threshold.`);
    } else {
      logger.info('Finance', `OMNICHAIN BRIDGE: Relaying ${amount} GC to ${targetChain} via LayerZero.`);
    }

    metrics.track('liquidity_bridge_initiated', amount, { targetChain, status: bridge.status });
    return bridge;
  }

  async getActiveBridges(): Promise<BridgeTransfer[]> {
    return this.activeBridges;
  }

  async getChainDistribution(): Promise<Record<string, number>> {
    return this.chainTVL;
  }
}

export const liquidityAggregator = new LiquidityAggregatorService();
