import { careAgent, healthAgent, sentinel } from "./specialists";
import { AgentResponse } from "./agent-bridge";
import type { SpecimenRow, EventRow } from "@/app/actions/types";
import { logger } from "../../observability/logger";

/**
 * Mycelial Orchestrator (Phase 12)
 * The unified intelligence layer that mediates between specialist agents.
 */
export class MycelialOrchestrator {
  /**
   * Performs a federated analysis of a specimen, synthesizing care, health, and registry alerts.
   */
  async orchestrate(specimen: SpecimenRow, events: EventRow[]): Promise<AgentResponse> {
    logger.info('Orchestrator', `INITIATING FEDERATED ANALYSIS for ${specimen.nickname}...`);

    // 1. Concurrent Specialist Analysis
    const [care, health, infra] = await Promise.all([
      careAgent.analyze(specimen, events),
      healthAgent.analyze(specimen, events),
      sentinel.analyze(specimen, events)
    ]);

    // 2. Conflict Resolution & Synthesis
    const synthesizedActions = [
      ...care.proposed_actions,
      ...health.proposed_actions,
      ...infra.proposed_actions
    ];

    // Priority deduplication and conflict handling
    const finalActions = this.deduplicateActions(synthesizedActions);

    const confidence = (care.confidence + health.confidence + infra.confidence) / 3;

    return {
      analysis: `[MYCELIAL_SYNTHESIS]
CORE_STATUS: ${health.analysis.split('\n')[0]}
CARE_GUIDANCE: ${care.analysis.split('\n')[0]}
INFRA_INTEGRITY: ${infra.analysis.split('\n')[0]}

FEDERATED_ADVISORY: The nexus has converged on a ${confidence > 0.8 ? 'HIGH_FAITH' : 'MITIGATED'} directive. 
Maintain ${specimen.nickname}'s local proximity and verify all pending care tasks.`,
      proposed_actions: finalActions,
      confidence,
      provider_label: "Mycelial Orchestrator (Federated)"
    };
  }

  /**
   * Deduplicates proposed actions based on type and priority.
   */
  private deduplicateActions(actions: AgentResponse['proposed_actions']): AgentResponse['proposed_actions'] {
    const seen = new Set<string>();
    return actions.filter(action => {
      if (seen.has(action.type)) return false;
      seen.add(action.type);
      return true;
    }).sort((a, b) => {
      const priorityMap: Record<string, number> = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }
}

export const mycelialOrchestrator = new MycelialOrchestrator();
