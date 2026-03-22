/**
 * SequencerService: Manages L2 transaction sequencing and L1 escape hatches.
 * Part of Phase 61: Sequencer Decentralization.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface ForcedIntent {
  id: string;
  payload: unknown;
  timestamp: number;
  status: 'PENDING_SEQUENCER' | 'L1_FORCED' | 'SETTLED';
}

export class SequencerService {
  private activeSequencer: string = 'canonical-sequencer-01';
  private pendingIntents: Map<string, ForcedIntent> = new Map();

  /**
   * Submits a transaction intent to the active L2 sequencer.
   */
  async submitIntent(): Promise<void> {
    logger.info('Sequencer', `Submitting intent to ${this.activeSequencer}...`);
    // Simulation: Normal L2 processing
  }

  /**
   * Triggers an L1 Escape Hatch if the sequencer is non-responsive or censoring.
   * This forces the transaction directly on the L1 (Ethereum/Base).
   */
  async triggerL1EscapeHatch(intentId: string): Promise<boolean> {
    const intent = this.pendingIntents.get(intentId);
    if (!intent) return false;

    logger.warn('Sequencer', `ESCAPE HATCH TRIGGERED: Forcing intent ${intentId} on L1.`);
    
    // In production, this would use a 'forceInclusion' call on the Bridge contract.
    intent.status = 'L1_FORCED';
    metrics.track('l1_forced_inclusion', 1);
    
    return true;
  }

  /**
   * Switches the active sequencer in case of partition or malicious behavior.
   */
  async switchSequencer(newSequencer: string): Promise<void> {
    logger.warn('Sequencer', `Switching active sequencer to ${newSequencer}.`);
    this.activeSequencer = newSequencer;
  }
}

export const sequencerService = new SequencerService();
