/**
 * GrowKeeper Fee Manager
 * Handles the calculation and distribution of royalties and marketplace commissions.
 */

import { logger } from '@/lib/observability/logger';

export interface FeeDistribution {
  totalPrice: number;
  sellerProceeds: number;
  stewardRoyalty: number; // 5% to original creator
  platformCommission: number; // 2.5% to GrowKeeper network
}

export class FeeManager {
  private readonly ROYALTY_RATE = 0.05;
  private readonly COMMISSION_RATE = 0.025;

  /**
   * Calculates the distribution of funds for a specimen sale.
   */
  calculateDistribution(price: number): FeeDistribution {
    const stewardRoyalty = Math.floor(price * this.ROYALTY_RATE);
    const platformCommission = Math.floor(price * this.COMMISSION_RATE);
    const sellerProceeds = price - stewardRoyalty - platformCommission;

    logger.debug('Economics', `Calculated distribution for $${price}: Royalty: $${stewardRoyalty}, Commission: $${platformCommission}`);

    return {
      totalPrice: price,
      sellerProceeds,
      stewardRoyalty,
      platformCommission
    };
  }

  /**
   * Generates a payment record for auditing.
   */
  generatePaymentManifest(distribution: FeeDistribution, sellerId: string, stewardId: string): string {
    const manifest = {
      ...distribution,
      sellerId,
      stewardId,
      timestamp: new Date().toISOString(),
      network: 'GROWKEEPER_L2_MAINNET'
    };
    return btoa(JSON.stringify(manifest));
  }
}

export const feeManager = new FeeManager();
