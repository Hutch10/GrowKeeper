import { useState, useEffect } from 'react';
import { IntelligenceMemoryManager } from '@/lib/memory/intelligence-memory';
import { IntelligenceMemoryDoc } from '@/lib/pouchdb';
import { AuditNarrative, NarrativeSummary } from '@/lib/skills/audit-narrative';
import { getAuditTrail } from '@/lib/services/audit-ledger';

/**
 * useIntegrityMemory Hook
 * Orchestrates the retrieval of per-specimen integrity data and narrative summaries.
 */

export function useIntegrityMemory(specimenId?: string) {
  const [timeline, setTimeline] = useState<IntelligenceMemoryDoc[]>([]);
  const [narrative, setNarrative] = useState<NarrativeSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!specimenId) return;

    async function loadIntegrity() {
      setLoading(true);
      try {
        // 1. Fetch Local Timeline
        const localTimeline = await IntelligenceMemoryManager.getIntegrityTimeline(specimenId);
        
        // 2. Fetch Audit Trail (Cloud Canonical) for deeper context
        // This ensures the narrative is generated from the most complete record.
        const audit = await getAuditTrail(specimenId);
        const cloudEvents = audit.success ? audit.data : [];

        // 3. Generate Narrative via Skill
        // We merge local and cloud events for the skill to interpret
        const combined = [...localTimeline, ...(cloudEvents as any[])]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const summary = AuditNarrative.generate(combined);
        
        setTimeline(localTimeline);
        setNarrative(summary);
      } catch (err) {
        console.error("[INTEGRITY_HOOK_FAULT]", err);
      } finally {
        setLoading(false);
      }
    }

    loadIntegrity();
  }, [specimenId]);

  return { timeline, narrative, loading };
}
