import { BiologicalSpecimen } from "@/types/biological-intelligence";
import { createClient } from "@/lib/supabase-server";
import { recordAuditEntry } from "@/lib/services/audit-ledger";
import { AuditSentinel } from "@/lib/agents/audit-sentinel";
import { EnvironmentalService } from "@/lib/services/environmental-service";

/**
 * Environmental Sentinel Agent
 * Autonomous risk monitoring agent that orchestrates evaluation runs and manages signal lifecycles.
 */

export class EnvironmentalSentinel {
  private static instance: EnvironmentalSentinel;

  static getInstance() {
    if (!EnvironmentalSentinel.instance) {
      EnvironmentalSentinel.instance = new EnvironmentalSentinel();
    }
    return EnvironmentalSentinel.instance;
  }

  /**
   * Evaluates specimen risk by orchestrating the EnvironmentalService 
   * and managing the overall signal lifecycle (expiration/supersession).
   */
  async evaluate(specimen: BiologicalSpecimen): Promise<void> {
    const service = EnvironmentalService.getInstance();
    
    // 1. Run Evaluation via the Unified Service
    // This handles Data Acquisition, Rule Execution, and Persistence (with Sync)
    const activeSignal = await service.evaluateSpecimenRisk(specimen);

    // 2. Lifecycle Maintenance
    // If no signal was generated, or the result was "NO_COVERAGE", 
    // we ensure any existing active signals for this specimen are expired.
    if (!activeSignal || activeSignal.status === 'NO_COVERAGE') {
      await this.expireSignals(specimen.id, activeSignal?.status === 'NO_COVERAGE' ? 'NO_COVERAGE' : 'NOMINAL');
    }
  }

  /**
   * Marks signals as superseded or expired based on forecast windows or system state changes.
   */
  async expireSignals(specimen_id: string, reason: string): Promise<void> {
    const supabase = createClient();
    const now = new Date().toISOString();

    // 1. Expire based on forecast window end (Deterministic transition)
    AuditSentinel.validateTransition('ACTIVE', 'EXPIRED', 'ENV_SENTINEL_EXPIRATION');
    const { data: expired } = await supabase
      .from('environmental_signals')
      .update({ status: 'EXPIRED', updated_at: now })
      .eq('specimen_id', specimen_id)
      .eq('status', 'ACTIVE')
      .lt('forecast_window_end', now)
      .select();

    if (expired && expired.length > 0) {
      await recordAuditEntry({
        action: "UPDATE",
        target: "registry",
        targetId: specimen_id,
        metadata: { type: "ENV_SIGNAL_EXPIRED", count: expired.length, reason: "WINDOW_END" },
        provenance: "ENVIRONMENTAL_AGENT"
      });
    }

    // 2. Mark as superseded if system return to nominal state
    if (reason === "NOMINAL") {
      AuditSentinel.validateTransition('ACTIVE', 'SUPERSEDED', 'ENV_SENTINEL_SUPERSESSION');
      await supabase
        .from('environmental_signals')
        .update({ status: 'SUPERSEDED', updated_at: now })
        .eq('specimen_id', specimen_id)
        .eq('status', 'ACTIVE');
    }
  }
}
