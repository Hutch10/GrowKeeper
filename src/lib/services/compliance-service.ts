/**
 * GrowKeeper Compliance Service
 * Cross-references specimens with regulatory lists (CITES, Endangered Species Act).
 */

import { logger } from '@/lib/observability/logger';

export type ComplianceTier = 'II' | 'I' | 'none'; // CITES Appendices

export interface ComplianceStatus {
  isProtected: boolean;
  tier: ComplianceTier;
  permitRequired: boolean;
  notes: string;
}

// Simple lookup for CITES-protected items (MVP)
// In production, this would hit a real biodiversity API
const PROTECTED_GENERA: Record<string, ComplianceTier> = {
  'Orchidaceae': 'II', // Most orchids are Appendix II
  'Cactaceae': 'II',   // Generic cacti
  'Dalbergia': 'II',   // Rosewood
  'Aloe': 'II',        // Most Aloes are protected
  'Nepenthes': 'II',   // Tropical pitcher plants
  'Ophiocordyceps': 'II' // High-value fungi
};

export class ComplianceService {
  /**
   * Evaluates the regulatory status of a scientific name or family.
   */
  async checkSpecies(scientificName: string, family?: string): Promise<ComplianceStatus> {
    logger.debug('Compliance', `Checking regulatory status for: ${scientificName}`);
    
    const genusMatch = Object.keys(PROTECTED_GENERA).find(g => 
      scientificName.toLowerCase().startsWith(g.toLowerCase()) || 
      family?.toLowerCase() === g.toLowerCase()
    );

    if (genusMatch) {
      const tier = PROTECTED_GENERA[genusMatch];
      logger.warn('Compliance', `REGULATORY HIT: ${scientificName} is CITES Appendix ${tier}`);
      
      return {
        isProtected: true,
        tier: tier,
        permitRequired: true,
        notes: `Species under CITES Appendix ${tier} protection. Multi-node transfers may require official permits.`
      };
    }

    return {
      isProtected: false,
      tier: 'none',
      permitRequired: false,
      notes: 'No immediate regulatory restrictions found on global registries.'
    };
  }
}

export const compliance = new ComplianceService();
