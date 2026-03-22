/**
 * GrowKeeper RWA Vault Service
 * Enables fractional ownership ("Slicing") of high-value biological assets.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { valuationEngine } from './valuation-engine';
import { logger } from '../observability/logger';

export interface FractionalVault {
  specimenId: string;
  totalShares: number;
  availableShares: number;
  sharePrice: number; // In $GC
  lockedValue: number;
}

export class RWAVaultService {
  private vaults: Map<string, FractionalVault> = new Map();
  private readonly DEFAULT_SHARES = 1000;

  /**
   * Vaults a specimen and slices it into fractional shares.
   */
  async vaultSpecimen(specimen: Specimen): Promise<FractionalVault> {
    const valuation = valuationEngine.calculateValuation(specimen).totalValuation;
    const sharePrice = valuation / this.DEFAULT_SHARES;

    const vault: FractionalVault = {
      specimenId: specimen.id,
      totalShares: this.DEFAULT_SHARES,
      availableShares: this.DEFAULT_SHARES,
      sharePrice,
      lockedValue: valuation
    };

    this.vaults.set(specimen.id, vault);
    logger.info('Finance', `Specimen ${specimen.id} VAULTED. Total Value: ${valuation} GC. Shares: ${this.DEFAULT_SHARES} @ ${sharePrice} GC`);
    
    return vault;
  }

  /**
   * Simulates the purchase of fractional shares.
   */
  async purchaseShares(specimenId: string, amount: number): Promise<boolean> {
    const vault = this.vaults.get(specimenId);
    if (!vault || vault.availableShares < amount) {
      return false;
    }

    vault.availableShares -= amount;
    this.vaults.set(specimenId, vault);
    
    logger.info('Finance', `PURCHASE: ${amount} shares of ${specimenId} acquired. Remaining: ${vault.availableShares}`);
    return true;
  }

  getVault(specimenId: string): FractionalVault | undefined {
    return this.vaults.get(specimenId);
  }
}

export const rwaVault = new RWAVaultService();
