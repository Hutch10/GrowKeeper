import { useState, useEffect, useMemo } from 'react';
import { IntelligenceMemoryManager } from '@/lib/memory/intelligence-memory';
import { IntelligenceMemoryDoc } from '@/lib/pouchdb';
import { getAuditTrail } from '@/lib/services/audit-ledger';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

export interface NarrativeSummary {
  summary: string;
  confidence_label: 'HIGH' | 'MEDIUM' | 'LOW';
  timeline: IntelligenceMemoryDoc[];
}

/**
 * useIntegrityMemory Hook
 * Orchestrates the retrieval of per-specimen integrity data and narrative summaries.
 */

export function useIntegrityMemory(specimenId?: string) {
  const [timeline, setTimeline] = useState<IntelligenceMemoryDoc[]>([]);
  const [narrative, setNarrative] = useState<NarrativeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!specimenId) return;
    const id = specimenId;

    async function loadIntegrity() {
      setLoading(true);
      try {
        const localTimeline = await IntelligenceMemoryManager.getIntegrityTimeline(id);
        const audit = await getAuditTrail(id);
        const cloudEvents = audit.success ? audit.data : [];

        const combined = [...localTimeline, ...(cloudEvents as any[])]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const summary: NarrativeSummary = {
          summary: localTimeline.length > 0
            ? `${localTimeline.length} integrity events recorded. Most recent: ${localTimeline[0]?.doc_type.replace(/_/g, ' ') || 'N/A'}.`
            : 'No integrity events recorded yet.',
          confidence_label: localTimeline.length > 5 ? 'HIGH' : localTimeline.length > 1 ? 'MEDIUM' : 'LOW',
          timeline: combined,
        };
        
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
