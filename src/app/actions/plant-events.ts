"use server";

import { addSpecimenEvent, getSpecimenEvents } from "@/app/actions/specimen-events";
import type { ActionResult } from "@/app/actions/types";
import type { Database, CareEventType } from "@/types/database";

type SpecimenEventRow = Database["public"]["Tables"]["specimen_events"]["Row"];

export async function addPlantEvent(data: {
  plant_id: string;
  event_type: CareEventType;
  notes?: string;
}): Promise<ActionResult<SpecimenEventRow>> {
  return addSpecimenEvent(data.plant_id, {
    event_type: data.event_type,
    notes: data.notes,
  }) as Promise<ActionResult<SpecimenEventRow>>;
}

export async function getPlantEvents(plantId: string): Promise<ActionResult<SpecimenEventRow[]>> {
  return getSpecimenEvents(plantId) as Promise<ActionResult<SpecimenEventRow[]>>;
}
