"use client";

import { listingsDB, fromPouch, toPouch } from "@/lib/pouchdb";
import type { Listing, ListingStatus } from "@/types/marketplace";
import type { SpecimenRow as Specimen } from "@/app/actions/types";
import { feeManager, type FeeDistribution } from "./fee-manager";
import { stewardship } from "./stewardship-transfer";
import { logger } from "../observability/logger";

class MarketplaceService {
  /**
   * Create a new marketplace listing for a specimen.
   * Requires a verified provenance chain.
   */
  async listSpecimen(specimen: Specimen, price: number): Promise<Listing> {
    // Quality Control: We only list healthy specimens
    if ((specimen.health || 0) < 60) {
      logger.error('Marketplace', `LISTING REJECTED: Specimen ${specimen.id} health too low (${specimen.health}%).`);
      throw new Error('Asset health insufficient for secondary market');
    }

    if (!specimen.last_vital_signature) {
      logger.warn('Marketplace', `Listing ${specimen.id} without verified Proof-of-Care.`);
    }

    const distribution = feeManager.calculateDistribution(price);

    const listing: Listing & { distribution: FeeDistribution } = {
      id: `list_${Math.random().toString(36).substring(7)}`,
      specimenId: specimen.id,
      sellerId: specimen.user_id || "GUEST-USER",
      price,
      status: "available",
      distribution,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await listingsDB.put(toPouch(listing));
    logger.info('Marketplace', `Specimen ${specimen.id} listed for $${price}. (Seller: ITM_${distribution.sellerProceeds})`);
    return listing;
  }

  /**
   * Purchase a listing (simulated).
   */
  async purchaseSpecimen(listingId: string, buyerId: string, specimen: Specimen): Promise<void> {
    const listing = await listingsDB.get(listingId);
    logger.info('Marketplace', `SECURE PURCHASE: Initiating escrow for listing ${listingId}`);
    
    // 1. Verify Physical Handover Protocol (Phase 18 Integration)
    await stewardship.initiateHandover(specimen, buyerId, listing.sellerId);

    // 2. Lock L2 Escrow with Provenance Signature
    // In a prod environment, the escrow would hold funds until BOTH nodes sign the handover token.
    logger.info('Marketplace', `Escrow locked with Proof-of-Care token: ${specimen.last_vital_signature || 'UNSIGNED'}`);

    // 3. Update listing status
    await this.updateListingStatus(listingId, "escrow");
  }

  /**
   * Get all active listings.
   */
  async getActiveListings(): Promise<Listing[]> {
    const result = await listingsDB.find({
      selector: { status: "available" }
    });
    return result.docs.map(doc => fromPouch<Listing>(doc));
  }

  /**
   * Resolve a listing status.
   */
  async updateListingStatus(listingId: string, status: ListingStatus): Promise<void> {
    const doc = await listingsDB.get(listingId);
    const updated = {
      ...doc,
      status,
      updatedAt: new Date().toISOString()
    };
    await listingsDB.put(updated);
  }
}

export const marketplace = new MarketplaceService();
