"use client";

import Anthropic from "@anthropic-ai/sdk";
import { logger } from '../../observability/logger';
import { deriveSpecimenState } from '../biological-engine';
import { validateBiologicalConstraint } from '../biological-memory';

const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface AgentResponse {
  analysis: string;
  proposed_actions: Array<{
    type: string;
    priority: "low" | "medium" | "high" | "critical";
    reasoning: string;
    metadata?: Record<string, any>;
  }>;
  confidence: number;
}

/**
 * Specialist Agent Bridge (Phase 5)
 * Standardized executor for Anthropic-powered biological specialists.
 */
export abstract class SpecialistAgent {
  protected abstract name: string;
  protected abstract systemPrompt: string;

  /**
   * Executes an agentic analysis cycle with biological grounding.
   */
  async analyze(specimen: any, events: any[]): Promise<AgentResponse> {
    if (!anthropic) {
      logger.warn('AgentBridge', `Anthropic not initialized for ${this.name}. Falling back.`);
      return this.getFallbackResponse();
    }

    // 1. Tool Call: Derive Current Truth (Biological Engine)
    const projectedState = deriveSpecimenState(specimen, events);

    // 2. Memory Check: Validate against hard constraints
    const constraints = validateBiologicalConstraint(specimen.genus || "Default", {
      moisture: projectedState.moisture,
      temp: 22, // Placeholder for real-time sensor data
    });

    try {
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: `${this.systemPrompt}\n\nBIOLOGICAL GROUNDING:\n- Current Moisture: ${Math.round(projectedState.moisture * 100)}%\n- Vitality Trend: ${projectedState.vitalityTrend}\n- Active Constraints: ${constraints.violations.join(', ') || 'None'}`,
        messages: [{ role: "user", content: `Analyze the lifecycle of specimen: ${specimen.nickname}` }],
      });

      // Simple parsing logic (Phase 5 agents will return structured text to be parsed)
      // For now, we mock the structured output from the raw text
      const content = msg.content[0].type === 'text' ? msg.content[0].text : '';
      
      return {
        analysis: content,
        proposed_actions: [], // To be populated by specialist subclasses
        confidence: projectedState.confidence,
      };
    } catch (err) {
      logger.error('AgentBridge', `Execution failure for ${this.name}`, err as Error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AgentResponse {
    return {
      analysis: "Agent currently in dormancy. Please check system integrity.",
      proposed_actions: [],
      confidence: 0
    };
  }
}
