"use server";

import { logBiologicalEvent } from "./events";
import { trackAlphaEvent } from "@/lib/services/alpha-telemetry";
import { recordAuditEntry } from "@/lib/services/audit-ledger";
import type { CareEventType } from "@/types/database";

export interface AgentProposal {
  id: string;
  specimen_id: string;
  agent_id: string;
  action_type: CareEventType;
  priority: "low" | "medium" | "high" | "critical";
  reasoning: string;
  created_at: string;
}

// In-memory proposal store for alpha (Phase 5)
// In production, this would be a persistent table with 'REF' and 'NON-REPUDIATION'
const proposalQueue: AgentProposal[] = [];

/**
 * Submits a new agent proposal for review.
 */
export async function submitAgentProposal(proposal: Omit<AgentProposal, 'id' | 'created_at'>) {
  const newProposal: AgentProposal = {
    ...proposal,
    id: Math.random().toString(36).substring(7),
    created_at: new Date().toISOString()
  };

  proposalQueue.push(newProposal);

  // Telemetry & Audit
  await trackAlphaEvent("agent_proposal_submitted", { 
    agent_id: proposal.agent_id, 
    action: proposal.action_type,
    priority: Math.random() > 0.5 ? "HIGH" : "LOW" // Simplified for telemetry
  });

  await recordAuditEntry({
    action: "PROPOSAL",
    target: "specimen_event",
    targetId: newProposal.id,
    metadata: { 
      agent_id: proposal.agent_id,
      priority: proposal.priority,
      reasoning: proposal.reasoning
    },
    payload: newProposal
  });

  return { success: true, proposalId: newProposal.id };
}

/**
 * Accepts an agent proposal and commits it to the Biological Event Log.
 */
export async function acceptAgentProposal(proposalId: string, userId: string) {
  const index = proposalQueue.findIndex(p => p.id === proposalId);
  if (index === -1) return { success: false, error: "Proposal not found" };

  const proposal = proposalQueue[index];
  
  // 1. Commit to Event Log
  const result = await logBiologicalEvent({
    specimen_id: proposal.specimen_id,
    event_type: proposal.action_type,
    notes: `Proposal Accepted: ${proposal.reasoning}`,
    source_type: "agent",
    confidence: 0.9, 
    metadata: { 
      agent_id: proposal.agent_id, 
      accepted_by: userId 
    }
  });

  // 2. Remove from Queue
  proposalQueue.splice(index, 1);

  await trackAlphaEvent("agent_proposal_accepted", { proposal_id: proposalId, user_id: userId });

  // 3. Record Audit Authorization
  await recordAuditEntry({
    action: "AUTHORIZE",
    target: "specimen_event",
    targetId: proposalId,
    metadata: { 
      userId,
      agentId: proposal.agent_id
    }
  });

  return result;
}

/**
 * Retrieves all pending proposals for a specimen.
 */
export async function getPendingProposals(specimenId: string) {
  return proposalQueue.filter(p => p.specimen_id === specimenId);
}
