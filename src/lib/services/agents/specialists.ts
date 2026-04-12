"use client";

import { SpecialistAgent, AgentResponse } from "./agent-bridge";
import type { SpecimenRow, EventRow } from "@/app/actions/types";

/**
 * Care Planning Agent (Phase 5 & 11)
 * Specialist in growth optimization, task sequencing, and tactical irrigation.
 */
export class CarePlanningAgent extends SpecialistAgent {
  protected name = "CarePlanningAgent";
  protected systemPrompt = `You are the GrowKeeper Care Planning Agent, a specialist in industrial agronomy and biological lifecycle optimization.
Your goal is to sequence care events for maximum vitality and yield.

RULES:
1. Prioritize hydration and metabolic stability.
2. NEVER violate active biological constraints.
3. Use a tone of objective, industrial precision.
4. If the vitality trend is 'DECLINING', immediately propose remediation.`;

  async analyze(specimen: SpecimenRow, events: EventRow[]): Promise<AgentResponse> {
    const base = await super.analyze(specimen, events);
    
    // Specialize: Propose a watering task if moisture is low
    if (base.analysis.toLowerCase().includes('water') || base.analysis.toLowerCase().includes('hydrate')) {
      base.proposed_actions.push({
        type: "watered",
        priority: "medium",
        reasoning: "Biological engine detects moisture decay approaching critical threshold for genus.",
        metadata: { source: "agent", agent_id: this.name }
      });
    }

    return base;
  }
}

/**
 * Health Diagnosis Agent (Phase 11)
 * Specialist in biological pathology, disease detection, and stress analysis.
 */
export class HealthDiagnosisAgent extends SpecialistAgent {
  protected name = "HealthDiagnosisAgent";
  protected systemPrompt = `You are the GrowKeeper Health Diagnosis Agent, a specialist in biological pathology and taxonomical forensics.
Your goal is to detect symptoms, determine probable causes, and prescribe remediation protocols.

RULES:
1. Prioritize symptom identification over generic feedback.
2. Cross-reference all observations with the Diagnostic Registry.
3. Be brutally honest about disease progression.
4. Isolate specimens if pathological signals match designated 'CRITICAL' levels.`;

  async analyze(specimen: SpecimenRow, events: EventRow[]): Promise<AgentResponse> {
    const base = await super.analyze(specimen, events);
    
    // Specialize: Propose a diagnostic audit if health score is < 50
    if (specimen.health < 50) {
      base.proposed_actions.push({
        type: "diagnostic_audit",
        priority: "high",
        reasoning: "Observed health metrics indicate systemic metabolic failure. Immediate visual audit required.",
        metadata: { source: "agent", agent_id: this.name }
      });
    }

    return base;
  }
}

export const careAgent = new CarePlanningAgent();
export const healthAgent = new HealthDiagnosisAgent();
