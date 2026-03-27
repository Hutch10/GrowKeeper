import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";

export interface StakingVoucher {
  id: string;
  amount: number;
  seniorityDate: string;
  vestingPeriod: number; // Days
  status: "ACTIVE" | "VESTED" | "COLD_STORAGE";
}

class StrategicReserveService {
  private vouchers: Map<string, StakingVoucher[]> = new Map();
  private totalPCV: number = 5000000; // Protocol Controlled Value (5M GC)

  /**
   * Vests capital for institutional stakers to gain governance seniority.
   */
  async vestCapital(custodianId: string, amount: number, duration: number): Promise<StakingVoucher> {
    const voucher: StakingVoucher = {
      id: `vch_${Math.random().toString(36).substring(7)}`,
      amount,
      seniorityDate: new Date().toISOString(),
      vestingPeriod: duration,
      status: "ACTIVE"
    };

    const current = this.vouchers.get(custodianId) || [];
    this.vouchers.set(custodianId, [...current, voucher]);
    
    logger.info('Finance', `STRATEGIC RESERVE: ${custodianId} locked ${amount} GC for ${duration} days.`);
    metrics.track('strategic_reserve_vesting', amount, { custodianId, duration: duration.toString() });

    return voucher;

  }

  async getMetrics(): Promise<{ totalPCV: number; coldStoragePercent: number; activeVesting: number }> {
    return {
      totalPCV: this.totalPCV,
      coldStoragePercent: 75, // 75% of PCV is in cold storage
      activeVesting: Array.from(this.vouchers.values()).flat().reduce((acc, v) => acc + v.amount, 0)
    };
  }

  async getVouchers(custodianId: string): Promise<StakingVoucher[]> {
    return this.vouchers.get(custodianId) || [];
  }
}

export const strategicReserve = new StrategicReserveService();
