import { BiologicalSpecimen } from '@/types/biological-intelligence';
import { EnvironmentalSentinel } from '@/lib/agents/environmental-sentinel';
import { IntelligenceMemoryManager } from '@/lib/memory/intelligence-memory';
import { recordAuditEntry } from '@/lib/services/audit-ledger';

/**
 * Environmental Intelligence Lifecycle Workflow
 * Orchestrates the full observation-to-narrative sequence for environmental risks.
 */

export class EnvironmentalLifecycle {
  /**
   * Triggers a high-fidelity monitoring run for a specimen.
   */
  static async execute(specimen: BiologicalSpecimen): Promise<void> {
    const sentinel = EnvironmentalSentinel.getInstance();
    
    try {
      // 1. Trigger Observation & Certification
      await sentinel.evaluate(specimen);

      // 2. Perform Post-Execution Integrity Check
      // This is a redundant confirmation to ensure the signal was persisted and audited.
      await recordAuditEntry({
        action: "PROPOSAL",
        target: "registry",
        targetId: specimen.id,
        metadata: { 
          type: "ENV_LIFECYCLE_COMPLETED", 
          specimen_nickname: specimen.nickname 
        },
        provenance: "ENVIRONMENTAL_AGENT"
      });

    } catch (err) {
      console.error("[ENV_LIFECYCLE_FAULT]", err);
      
      // Persist failure to integrity timeline
      await IntelligenceMemoryManager.persist({
        doc_type: 'integrity_timeline_entry',
        specimen_id: specimen.id,
        provenance: 'ENVIRONMENTAL_AGENT',
        payload: {
          event_type: 'FAILURE',
          description: "Environmental monitoring lifecycle encountered a terminal fault.",
          significance_score: 100,
          metadata: { error: String(err) }
        }
      }, `env_fault_${Date.now()}`);
    }
  }
}
