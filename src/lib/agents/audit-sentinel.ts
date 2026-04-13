import { BiologicalSpecimen, SyncStatus } from '@/types/biological-intelligence';
import { recordAuditEntry } from '@/lib/services/audit-ledger';
import { IntelligenceMemoryManager } from '@/lib/memory/intelligence-memory';

/**
 * Audit Sentinel Agent
 * Enforces impossible state transitions and maintains registry integrity locks.
 */

export class AuditSentinel {
  /**
   * Validates a state transition against the locked Alpha Pilot rules.
   * Throws if the transition is illegal.
   */
  static validateTransition(
    currentStatus: string, 
    targetStatus: string, 
    context: string
  ): void {
    const illegalTransitions: Record<string, string[]> = {
      'EXPIRED': ['ACTIVE'],
      'FAILED': ['SYNCED_CLOUD'],
      'NO_COVERAGE': ['CERTIFIED'],
      'SUPPRESSED_DUPLICATE': ['CERTIFIED'],
      'CONFLICT': ['SYNCED_CLOUD'], // Requires explicit resolution
      'BUFFERED_LOCAL': ['SYNCED_CLOUD'], // Requires replay/certification
    };

    // ENFORCEMENT: Context-aware exceptions for legitimate recovery/resolution
    if (currentStatus === 'BUFFERED_LOCAL' && targetStatus === 'SYNCED_CLOUD' && context === 'REPLAY_CERTIFICATION') {
      return; // Authorized replay promotion
    }

    if (currentStatus === 'CONFLICT' && targetStatus === 'SYNCED_CLOUD' && context === 'OPERATOR_RESOLUTION') {
      return; // Authorized operator intervention
    }

    if (illegalTransitions[currentStatus]?.includes(targetStatus)) {
      const directive = `[INTEGRITY_LOCK] Illegal transition attempted: ${currentStatus} -> ${targetStatus} in context of ${context}. Action blocked by Audit Sentinel.`;
      
      // Log as a failure event
      recordAuditEntry({
        action: "UPDATE",
        target: "registry",
        targetId: "SYSTEM",
        metadata: { 
          type: "ILLEGAL_TRANSITION_BLOCKED", 
          current: currentStatus, 
          target: targetStatus,
          context
        },
        provenance: "AUDIT_SENTINEL"
      });

      throw new Error(directive);
    }
  }

  /**
   * Inspects a specimen for common integrity anomalies.
   */
  static async inspectSpecimen(specimen: BiologicalSpecimen): Promise<string[]> {
    const flags: string[] = [];

    // 1. Missing Provenance
    if (!specimen.source) {
      flags.push("NULL_PROVENANCE: Specimen authority is ambiguous.");
    }

    // 2. Conflict State
    if (specimen.compliance_status === 'CONFLICT') {
      flags.push("UNRESOLVED_CONFLICT: Local/Cloud divergence detected.");
    }

    // 3. Stale Hardware Attestation
    if (specimen.last_vital_signature && !specimen.hardware_attestation_statement) {
      flags.push("ATTESTATION_MISMATCH: Vital signature present without valid hardware attestation.");
    }

    if (flags.length > 0) {
      await IntelligenceMemoryManager.persist({
        doc_type: 'integrity_timeline_entry',
        specimen_id: specimen.id,
        provenance: 'AUDIT_SENTINEL',
        payload: {
          event_type: 'FAILURE',
          description: `Integrity anomalies detected: ${flags.join(' ')}`,
          significance_score: 80,
          metadata: { flags }
        }
      }, `audit_inspection_${Date.now()}`);
    }

    return flags;
  }
}
