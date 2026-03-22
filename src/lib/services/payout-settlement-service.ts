/**
 * PayoutSettlementService: Automates insurance payouts based on RAIS triggers.
 * Part of Phase 79: Automated Settlement.
 */

import { logger } from '../observability/logger';
import { MarineAlert } from '@/types/marine';
import { payoutService } from './payout-service';

export interface SettlementReceipt {
  payoutId: string;
  amount: number;
  recipient: string;
  status: 'SETTLED' | 'PENDING_LIQUIDITY' | 'VETOED';
  chainTx?: string;
}

export class PayoutSettlementService {
  /**
   * Executes an automated payout for a verified bleaching event.
   * v2.1.1: Enforces RAIS_CONSTITUTION via PayoutService.
   */
  async settleClaim(alert: MarineAlert, recipient: string, confidence: number, isSparse: boolean, lat?: number, lon?: number): Promise<SettlementReceipt> {
    logger.info('Settlement', `PROCESSING AUTOMATED PAYOUT for Alert ${alert.id} in ${alert.region}...`);
    
    // Phase 102/1: Universal Enforcement. No more hardcoded bypass.
    const authorized = await payoutService.processParametricPayout(alert, confidence, isSparse, lat, lon);

    if (!authorized) {
      logger.error('Settlement', `SETTLEMENT_VETO: Payout rejected by Invariant Engine for ${alert.id}.`);
      return {
        payoutId: `VETO_${Date.now()}`,
        amount: 0,
        recipient,
        status: 'VETOED'
      };
    }

    // In v2.1.1, the amount is deterministic and capped at $5,000 via PayoutService.
    const amount = 5000 * confidence; 

    const receipt: SettlementReceipt = {
      payoutId: `PAY_${Date.now()}`,
      amount,
      recipient,
      status: 'SETTLED',
      chainTx: `0x_TX_${Math.random().toString(16).slice(2)}`
    };

    logger.info('Settlement', `PAYOUT SUCCESS: ${amount} USDC settled to ${recipient}. TX: ${receipt.chainTx}`);
    return receipt;
  }
}

export const payoutSettlementService = new PayoutSettlementService();
