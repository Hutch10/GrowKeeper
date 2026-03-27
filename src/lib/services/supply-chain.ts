/**
 * GrowKeeper Supply Chain Service
 * Enables "Seed-to-Shelf" traceability for global biological trade.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { generateSecureId } from '../crypto-utils';

export interface TransitManifest {
  id: string;
  specimenId: string;
  carrierId: string;
  route: string[];
  status: 'PRE_TRANSIT' | 'IN_TRANSIT' | 'DELIVERED' | 'REJECTED';
  complianceVerified: boolean;
  qrCodeUri: string;
}

export class SupplyChainService {
  private manifests: Map<string, TransitManifest> = new Map();

  /**
   * Generates a transit manifest for institutional specimen movement.
   * Requires a 'CERTIFIED' compliance status to proceed.
   */
  async createManifest(specimen: Specimen, carrierId: string, route: string[]): Promise<TransitManifest | null> {
    logger.info('Logistics', `Initiating Supply Chain Manifest for ${specimen.id} via carrier ${carrierId}`);

    // Verify compliance before allowing transit
    const isCompliant = specimen.compliance_status === 'CERTIFIED';
    if (!isCompliant) {
      logger.error('Logistics', `REJECTED: ${specimen.id} is not compliant for transit.`);
      return null;
    }

    const manifest: TransitManifest = {
      id: generateSecureId('MANIFEST'),
      specimenId: specimen.id,
      carrierId,
      route,
      status: 'PRE_TRANSIT',
      complianceVerified: true,
      qrCodeUri: `https://api.growkeeper.app/trace/${generateSecureId('GK_TRACE', 12)}`
    };

    this.manifests.set(manifest.id, manifest);
    metrics.track('manifest_created', 1, { specimenId: specimen.id, carrierId });
    
    logger.info('Logistics', `Manifest ${manifest.id} generated. QR: ${manifest.qrCodeUri}`);
    return manifest;
  }

  /**
   * Updates the transit location of a manifest.
   */
  async updateLocation(manifestId: string, location: string): Promise<boolean> {
    const manifest = this.manifests.get(manifestId);
    if (!manifest) return false;

    manifest.route.push(location);
    this.manifests.set(manifestId, manifest);
    
    logger.debug('Logistics', `Transit update for ${manifestId}: Arrived at ${location}`);
    return true;
  }

  /**
   * Finalizes delivery and triggers ownership handover logic if applicable.
   */
  async finalizeDelivery(manifestId: string): Promise<boolean> {
    const manifest = this.manifests.get(manifestId);
    if (!manifest) return false;

    manifest.status = 'DELIVERED';
    this.manifests.set(manifestId, manifest);
    
    logger.info('Logistics', `DELIVERY SUCCESS for manifest ${manifestId}. Asset ${manifest.specimenId} is on-site.`);
    return true;
  }
}

export const supplyChainService = new SupplyChainService();
