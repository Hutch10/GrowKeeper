import { useState, useEffect, useCallback } from "react";
import { getSpecimens, addSpecimen as addSpecimenAction, deleteSpecimen as deleteSpecimenAction } from "@/app/actions/specimen-actions";
import { SpecimenRow } from "@/app/actions/types";

export function useSpecimenData(initialData?: SpecimenRow[]) {
  const [specimens, setSpecimens] = useState<SpecimenRow[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getSpecimens();
    
    if (result.success) {
      setSpecimens(result.data || []);
    } else {
      // REGISTRY_SENTINEL: Trigger local fallback if cloud transmission fails
      const isNetworkError = result.error?.includes("fetch failed") || 
                             result.error?.includes("ENOTFOUND") || 
                             result.error?.includes("uplink");
      
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    specimens,
    loading,
    refresh,
    addSpecimen: addSpecimenAction,
    deleteSpecimen: deleteSpecimenAction,
    isGuest: false
  };
}
