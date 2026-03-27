/**
 * Stewardship Transfer Protocol
 * Handles the secure handover of biological assets between institutional nodes.
 */

import { SpecimenRow as Specimen } from '@/app/actions/types';
import { provenance } from '../crypto-provenance';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';
import { generateSecureId } from '../crypto-utils';
import { rbac, UserRole } from './rbac-service';

export interface VitalSignSnapshot {
  [key: string]: string | number | boolean | null | undefined; 
  specimenId: string;
  timestamp: string;
  moisture?: number;
  uvIndex?: number;
  temp?: number;
  isHardwareAnchored?: boolean;
}

export interface HandoverRecord {
  specimenId: string;
  fromNode: string;
  toNode: string;
  timestamp: string;
  billOfSaleHash: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'PENDING_APPROVAL';
  requiresComplianceSignature?: boolean;
}

export class StewardshipService {
  /**
   * Initiates a formal handover of a specimen.
   * Generates a "Digital Bill of Sale" and validates provenance.
   */
  async initiateHandover(
    specimen: Specimen, 
    toNodeId: string, 
    fromNodeId: string,
    initiatorRole: UserRole = 'FIELD_AGENT'
  ): Promise<HandoverRecord> {
    logger.info('Stewardship', `Initiating handover of ${specimen.id} to ${toNodeId}`);

    // New: Check Role Permission
    if (!rbac.hasPermission(initiatorRole, 'canTransfer')) {
      logger.error('Security', `UNAUTHORIZED: ${initiatorRole} cannot initiate transfer.`);
      throw new Error('Permission Denied: Stewardship transfer requires Admin or Compliance role.');
    }

    // New: Multi-Sig Requirement for High-Value Assets
    const valuation = specimen.last_valuation || 0;
    if (valuation > 5000 && initiatorRole !== 'ADMIN') {
      logger.info('Stewardship', `MULTI-SIG REQUIRED: Specimen ${specimen.id} value exceeds threshold ($${valuation})`);
      
      return {
        specimenId: specimen.id,
        fromNode: fromNodeId,
        toNode: toNodeId,
        timestamp: new Date().toISOString(),
        billOfSaleHash: generateSecureId('BOS_PENDING'),
        requiresComplianceSignature: true,
        status: 'PENDING_APPROVAL'
      };
    }
    
    // 1. Validate latest Proof-of-Care signature
    if (specimen.last_vital_signature && specimen.public_key) {
      const publicJwk = JSON.parse(specimen.public_key);
      const isValid = await provenance.verifyVitals(
        { specimenId: specimen.id, timestamp: specimen.created_at || new Date().toISOString() }, 
        specimen.last_vital_signature,
        publicJwk
      );
      if (!isValid) {
        logger.critical('Stewardship', `CAUTION: PROVENANCE FORGERY DETECTED logic triggered on ${specimen.id}`);
        throw new Error('Asset integrity validation failed. Asymmetric signature mismatch.');
      }
    } else if (specimen.last_vital_signature && !specimen.public_key) {
      logger.error('Stewardship', `Integrity Error: Signature exists but public key is missing for ${specimen.id}`);
      throw new Error('Missing public key for provenance verification.');
    }

    // 2. Generate handover record
    const record: HandoverRecord = {
      specimenId: specimen.id,
      fromNode: fromNodeId,
      toNode: toNodeId,
      timestamp: new Date().toISOString(),
      billOfSaleHash: generateSecureId('BOS'),
      status: 'COMPLETED'
    };

    metrics.track('stewardship_handover_initiated', 1, { specimenId: specimen.id });
    logger.info('Stewardship', `Handover record generated: ${record.billOfSaleHash}`);
    
    return record;
  }

  private generateBaseRecord(specimen: Specimen, fromNodeId: string, toNodeId: string): HandoverRecord {
    return {
      specimenId: specimen.id,
      fromNode: fromNodeId,
      toNode: toNodeId,
      timestamp: new Date().toISOString(),
      billOfSaleHash: `BOS_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      status: 'COMPLETED'
    };
  }
}

export const stewardship = new StewardshipService();
