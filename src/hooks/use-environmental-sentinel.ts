import { useState, useEffect, useCallback } from "react";
import { getEnvironmentalSignals, triggerSentinelRun } from "@/app/actions/environmental-actions";
import { EnvironmentalSentinelSignal } from "@/types/environmental";
import { useSystemLog } from "./use-system-log";

/**
 * Environmental Sentinel Hook (Agent #1)
 * Provides deterministic risk intelligence state for UI components.
 */
export function useEnvironmentalSentinel(specimenId?: string) {
  const [signals, setSignals] = useState<EnvironmentalSentinelSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const { addLog } = useSystemLog();

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    const result = await getEnvironmentalSignals(specimenId);
    if (result.success) {
      setSignals(result.data || []);
    }
    setLoading(false);
  }, [specimenId]);

  const triggerSentinel = useCallback(async (targetId: string) => {
    addLog(`Sentinel Pulse Triggered for ${targetId}`, "sync");
    const result = await triggerSentinelRun(targetId);
    
    if (result.success) {
      addLog(`Sentinel Run Certified: ${result.sentinel_diagnostic?.message}`, "event");
      await fetchSignals();
    } else {
      addLog(`Sentinel Fault: ${result.error}`, "error");
    }
    return result;
  }, [addLog, fetchSignals]);

  useEffect(() => {
    fetchSignals();
    // Sentinel Poll: Every 2 minutes for active risk monitoring
    const interval = setInterval(fetchSignals, 120000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return {
    signals,
    loading,
    fetchSignals,
    triggerSentinel,
    // Helper to get active risk for a specific specimen if using the global hook
    getSpecimenSignals: (id: string) => signals.filter(s => s.specimen_id === id)
  };
}
