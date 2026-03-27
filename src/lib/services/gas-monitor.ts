import { metrics } from "../observability/metrics";

export interface GasSnapshot {
  chain: string;
  gwei: number;
  marketStatus: "LOW" | "STABLE" | "VOLATILE" | "CRITICAL";
  timestamp: string;
}

class GasMonitorService {
  private lastSnapshot: Map<string, GasSnapshot> = new Map();

  /**
   * Returns simulated gas prices for cross-chain settlement.
   */
  async getSnapshot(chain: string = "BASE"): Promise<GasSnapshot> {
    const baseGwei = chain === "ETH-MAIN" ? 45 : 0.05; // Base is much cheaper
    const variance = Math.random() * 10;
    const currentGwei = baseGwei + variance;
    
    let marketStatus: GasSnapshot["marketStatus"] = "STABLE";
    if (currentGwei > baseGwei * 2) marketStatus = "VOLATILE";
    if (currentGwei > baseGwei * 5) marketStatus = "CRITICAL";
    if (currentGwei < baseGwei * 0.8) marketStatus = "LOW";

    const snapshot: GasSnapshot = {
      chain,
      gwei: currentGwei,
      marketStatus,
      timestamp: new Date().toISOString()
    };

    this.lastSnapshot.set(chain, snapshot);
    metrics.track('gas_price', currentGwei, { chain });

    return snapshot;
  }

  /**
   * Heuristic to determine if a settlement should be executed now.
   */
  async isOptimalWindow(chain: string): Promise<boolean> {
    const snapshot = await this.getSnapshot(chain);
    return snapshot.marketStatus !== "CRITICAL";
  }

  /**
   * Recommends the cheapest chain for institutional settlement.
   */
  async getRecommendedChain(): Promise<string> {
    const base = await this.getSnapshot("BASE");
    const sol = await this.getSnapshot("SOL");
    
    return base.gwei < sol.gwei ? "BASE" : "SOL";
  }
}

export const gasMonitorService = new GasMonitorService();
