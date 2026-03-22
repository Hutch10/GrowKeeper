"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { 
  getGuestSpecimens, 
  saveGuestSpecimen, 
  deleteGuestSpecimen 
} from "@/lib/idb";
import { getSpecimens, addSpecimen, deleteSpecimen, type AddSpecimenInput } from "@/app/actions/specimen-actions";
import { specimensDB, fromPouch, toPouch } from "@/lib/pouchdb";
import { hardwareSecurity } from "@/lib/services/hardware-security";
import type { SpecimenRow, PlantSpecimen, FungalSpecimen, AnimaliaSpecimen, OtherSpecimen } from "@/app/actions/types";

export function useSpecimenData() {
  const { isGuest, loading: authLoading } = useAuth();
  const [specimens, setSpecimens] = useState<SpecimenRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    let allSpecimens: SpecimenRow[] = [];

    // 1. Fetch Guest Data (if applicable)
    if (isGuest) {
      const local = await getGuestSpecimens();
      allSpecimens = [...local];
    } else {
      // 2. Fetch Remote Data (if applicable)
      const result = await getSpecimens();
      if (result.success) {
        allSpecimens = [...result.data];
      }
    }

    // 3. Fetch PouchDB Local Drafts (Field Mode)
    try {
      const localDrafts = await specimensDB.allDocs({ include_docs: true });
      const drafts = localDrafts.rows.map(row => fromPouch<SpecimenRow>(row.doc));
      
      // Merge and remove duplicates (preferring remote if IDs match, or showing both)
      const existingIds = new Set(allSpecimens.map(s => s.id));
      const uniqueDrafts = drafts.filter(d => !existingIds.has(d.id));
      
      allSpecimens = [...allSpecimens, ...uniqueDrafts];
    } catch (err) {
      console.error("Failed to load PouchDB drafts:", err);
    }

    setSpecimens(allSpecimens);
    setLoading(false);
  }, [isGuest]);

  useEffect(() => {
    if (!authLoading) {
      refresh();
    }
  }, [authLoading, refresh]);

  const handleAddSpecimen = async (data: Partial<SpecimenRow> & { image?: FormData }) => {
    if (isGuest) {
      const common = {
        id: `guest-${Date.now()}`,
        user_id: "guest-user",
        nickname: data.nickname || "New Specimen",
        species_name: data.species_name || null,
        notes: data.notes || null,
        image_url: null,
        location: data.location || null,
        happiness_score: 100,
        health_status: "Healthy",
        created_at: new Date().toISOString(),
      };

      let newSpecimen: SpecimenRow;

      if (data.kingdom === "Fungi") {
        const d = data as Partial<FungalSpecimen>;
        newSpecimen = {
          ...common,
          kingdom: "Fungi",
          substrate: d.substrate || null,
          misting_schedule: d.misting_schedule || null,
          fertilizer: d.fertilizer || null,
        } as FungalSpecimen;
      } else if (data.kingdom === "Plantae") {
        const d = data as Partial<PlantSpecimen>;
        newSpecimen = {
          ...common,
          kingdom: "Plantae",
          light: d.light || null,
          watering: d.watering || null,
          fertilizer: d.fertilizer || null,
          moisture_level: 50,
          light_level: 50,
          temp_c: 22,
        } as PlantSpecimen;
      } else if (data.kingdom === "Animalia") {
        const d = data as Partial<AnimaliaSpecimen>;
        newSpecimen = {
          ...common,
          kingdom: "Animalia",
          heart_rate: d.heart_rate || null,
          activity_level: d.activity_level || null,
          dietary_notes: d.dietary_notes || null,
        } as AnimaliaSpecimen;
      } else {
        newSpecimen = {
          ...common,
          kingdom: "Other",
        } as OtherSpecimen;
      }

      await saveGuestSpecimen(newSpecimen);
      await refresh();
      return { success: true, data: newSpecimen };
    } else {
      // Check offline status or "Field Mode" flag
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      
      if (isOffline) {
        // Save to PouchDB as a local draft
        const draftId = `draft-${Date.now()}`;
        const draftSpecimen = {
          ...data,
          id: draftId,
          created_at: new Date().toISOString(),
          is_draft: true // Flag for UI
        } as unknown as SpecimenRow;
        
        await specimensDB.put(toPouch(draftSpecimen) as unknown as SpecimenRow);
        await refresh();
        return { success: true, data: draftSpecimen, message: "Saved as local field draft (Offline Mode)" };
      }

      // 1. Attempt Hardware Attestation (Phase 4: Provenance)
      const input = { ...data } as AddSpecimenInput;
      
      try {
        if (!hardwareSecurity.isEnrolled()) {
          await hardwareSecurity.enrollDevice("temp-user");
        }
        
        const { signature, attestation } = await hardwareSecurity.signWithHardware({
          nickname: data.nickname,
          timestamp: new Date().toISOString()
        });
        
        input.hardware_attestation_statement = `TEE_PROVENANCE_V1:${signature}:${attestation}`;
        console.log("Hardware Attestation anchored:", input.hardware_attestation_statement);
      } catch (err) {
        console.warn("Hardware Attestation failed, proceeding with software-only verification:", err);
      }

      const result = await addSpecimen(input);
      if (result.success) await refresh();
      return result;
    }
  };

  const handleDeleteSpecimen = async (id: string) => {
    if (isGuest) {
      await deleteGuestSpecimen(id);
      await refresh();
      return { success: true };
    } else {
      const result = await deleteSpecimen(id);
      if (result.success) await refresh();
      return result;
    }
  };

  return {
    specimens,
    loading: loading || authLoading,
    refresh,
    addSpecimen: handleAddSpecimen,
    deleteSpecimen: handleDeleteSpecimen,
    isGuest
  };
}
