import { useState, useEffect, useCallback, useRef } from "react";
import { getSpecimens, addSpecimen as addSpecimenAction, deleteSpecimen as deleteSpecimenAction } from "@/app/actions/specimen-actions";
import { SpecimenRow } from "@/app/actions/types";
import { useSystemLog } from "@/hooks/use-system-log";
import { operationsDB } from "@/lib/pouchdb";

export function useSpecimenData(initialData?: SpecimenRow[]) {
  const { addLog } = useSystemLog();
  const [specimens, setSpecimens] = useState<SpecimenRow[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [specimenLoadError, setSpecimenLoadError] = useState<string | null>(null);
  const [syncQueueSize, setSyncQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncRunning = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getSpecimens();
    
    if (result.success) {
      setSpecimens(result.data || []);
      setSpecimenLoadError(null);
    } else {
      setSpecimenLoadError(result.error ?? "Failed to load specimens.");
      console.error("[SENTINEL] Registry load failure. Clearing auth state if necessary.");
      
      // REGISTRY_SENTINEL: Trigger local fallback if cloud transmission fails
      const isNetworkError = result.error?.includes("fetch failed") || 
                             result.error?.includes("ENOTFOUND") || 
                             result.error?.includes("uplink") || 
                             result.error?.includes("Authentication required");
      
      if (isNetworkError) {
        console.warn("[SENTINEL] Registry transmission failed. Falling back to local audit ledger.");
        const { specimensDB, fromPouch } = await import("@/lib/pouchdb");
        try {
          const localDocs = await specimensDB.allDocs({ include_docs: true });
          const localSpecimens = localDocs.rows
            .map(row => row.doc ? fromPouch<SpecimenRow>(row.doc) : null)
            .filter(Boolean) as SpecimenRow[];
          
          if (localSpecimens.length > 0) {
            setSpecimens(localSpecimens);
          }
        } catch (pouchErr) {
          console.error("[SENTINEL] Local audit ledger retrieval failed:", pouchErr);
        }
      }
    }
    setLoading(false);
  }, []);

  const reconcile = useCallback(async () => {
    if (isSyncing || isSyncRunning.current) return;
    setIsSyncing(true);
    isSyncRunning.current = true;
    
    addLog("Initiating registry reconciliation heartbeat...", "sync");

    try {
      const queue = await operationsDB.allDocs({ include_docs: false });
      setSyncQueueSize(queue.total_rows);
      addLog("Sync check complete.", "sync");
    } catch (err) {
      console.error("[SENTINEL] Reconciliation failed:", err);
      addLog(`Reconciliation failed: ${(err as Error).message}`, "error");
    } finally {
      setIsSyncing(false);
      isSyncRunning.current = false;
    }
  }, [addLog, isSyncing]);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      reconcile();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh, reconcile]);

  return {
    specimens,
    loading,
    refresh,
    reconcile,
    syncQueueSize,
    isSyncing,
    errorMessage: specimenLoadError,
    addSpecimen: addSpecimenAction,
    deleteSpecimen: deleteSpecimenAction,
    isGuest: false
  };
}
