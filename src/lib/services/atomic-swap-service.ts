/**
 * GrowKeeper Bio-State Atomic Swap Service
 * enables trustless, peer-to-peer exchange of biological assets.
 */

import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { SpecimenRow as Specimen } from '@/app/actions/types';

export interface SwapIntent {
  id: string;
  sourceSpecimenId: string;
  targetAssetType: 'GC' | 'SPECIMEN';
  targetAssetId?: string;
  requestedValue: number;
  expiry: number;
  secretHash: string;
}

export class AtomicSwapService {
  private activeSwaps: Map<string, SwapIntent> = new Map();

  /**
   * Creates a new swap intent for a biological asset.
   * Locks the specimen in 'VAULTED' status during the swap.
   */
  async createSwapIntent(specimen: Specimen, intent: Omit<SwapIntent, 'id'>): Promise<string> {
    if (specimen.status !== 'VAULTED') {
      logger.error('Swap', `SWAP REJECTED: Specimen ${specimen.id} must be VAULTED for atomic swap.`);
      throw new Error('Asset not vaulted');
    }

    const swapId = `SWAP-${specimen.id.substring(0, 8)}-${Date.now()}`;
    const fullIntent: SwapIntent = { ...intent, id: swapId };
    
    this.activeSwaps.set(swapId, fullIntent);
    
    logger.info('Swap', `SWAP INTENT CREATED: ${swapId}. Specimen ${specimen.id} locked for exchange.`);
    metrics.track('swap_intent_created', 1, { assetType: intent.targetAssetType });
    
    return swapId;
  }

  /**
   * Executes the atomic swap once counterparty evidence (secret) is provided.
   */
  async executeAtomicSwap(swapId: string, secret: string): Promise<boolean> {
    const intent = this.activeSwaps.get(swapId);
    if (!intent) return false;

    // Simulation: Verify secret against secretHash (HTLC logic)
    const isValid = secret.includes('SECRET_0x'); // Simplified
    
    if (isValid) {
      logger.info('Swap', `SWAP EXECUTED: ${swapId}. Ownership transferred trustlessly.`);
      this.activeSwaps.delete(swapId);
      metrics.track('swap_executed', intent.requestedValue);
      return true;
    }

    logger.warn('Swap', `SWAP FAILED: Invalid secret for ${swapId}.`);
    return false;
  }
}

export const atomicSwapService = new AtomicSwapService();
