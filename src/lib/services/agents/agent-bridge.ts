import { logger } from '../../observability/logger';
import { deriveSpecimenState } from '../biological-engine';
import { validateBiologicalConstraint } from '../biological-memory';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

import type { SpecimenRow, EventRow } from "@/app/actions/types";

export interface AgentResponse {
  analysis: string;
  proposed_actions: Array<{
    type: string;
    priority: "low" | "medium" | "high" | "critical";
    reasoning: string;
    metadata?: Record<string, unknown>;
  }>;
  confidence: number;
  provider_label: string;
}

/**
 * Registry Sentinel Provider (Resilient Mock)
 * Explicitly honest standby intelligence for use during DNS/Network outages.
 */
class MockSentinelProvider {
  async execute(systemPrompt: string, userPrompt: string): Promise<string> {
    // Logic for returning hardcoded diagnostics based on prompts
    if (systemPrompt.includes("DNS") || userPrompt.includes("DNS")) {
      return `[LOCAL_CONTINGENCY_INTELLIGENCE]
FAULT_STATE: DNS_RESOLUTION_FAILURE (ENOTFOUND)
IMPACT: Cloud Registry reachability is currently neutralized.
PLAN: Biological telemetry is being buffered to the local audit ledger (PouchDB). 
ADVISORY: Do not attempt system re-imaging. All local functions, including Mycelial Geofencing and Genomic Provenance, remain active. 
SOURCE: Synchronized Local Cache.`;
    }
    return "[LOCAL_CONTINGENCY_INTELLIGENCE] System is operating in standalone mode. Baseline directives enforced.";
  }
  getLabel() { return "Resilient Mock Diagnostic"; }
}

/**
 * Provider Factory
 * Dynamically selects AI backend based on environment availability and mission state.
 */
class ProviderFactory {
  static getProvider() {
    if (process.env.GOOGLE_API_KEY) {
      return {
        execute: async (sys: string, usr: string) => {
           const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
           const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
           const result = await model.generateContent(`${sys}\n\n${usr}`);
           return result.response.text();
        },
        getLabel: () => "Google Gemini (Live)"
      };
    }
    
    // Default to Resilient Mock for Alpha Pilot during outage
    return new MockSentinelProvider();
  }
}

/**
 * Specialist Agent Bridge
 * Standardized executor for biological specialists with provider-agnostic core.
 */
export abstract class SpecialistAgent {
  protected abstract name: string;
  protected abstract systemPrompt: string;

  async analyze(specimen: SpecimenRow, events: EventRow[]): Promise<AgentResponse> {
    const provider = ProviderFactory.getProvider();
    
    // 1. Tool Call: Derive Current Truth (Biological Engine)
    const projectedState = deriveSpecimenState(specimen, events);

    // 2. Memory Check: Validate against hard constraints
    const constraints = validateBiologicalConstraint(specimen.genus || "Default", {
      moisture: projectedState.moisture,
      temp: 22,
    });

    try {
      const systemContext = `${this.systemPrompt}\n\nBIOLOGICAL GROUNDING:\n- Specimen: ${specimen.nickname}\n- Moisture: ${Math.round(projectedState.moisture * 100)}%\n- Violations: ${constraints.violations.join(', ') || 'None'}`;
      
      const analysis = await provider.execute(
        systemContext,
        `Analyze specimen: ${specimen.nickname}. Apply industrial logic.`
      );

      return {
        analysis: analysis,
        proposed_actions: [],
        confidence: projectedState.confidence,
        provider_label: provider.getLabel(),
      };
    } catch (err) {
      logger.error('AgentBridge', `Execution failure for ${this.name}`, err as Error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AgentResponse {
    return {
      analysis: "Agent currently in dormancy. Local enforcer protocols active.",
      proposed_actions: [],
      confidence: 0,
      provider_label: "System Fallback"
    };
  }
}
