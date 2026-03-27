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
