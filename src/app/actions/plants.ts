"use server";

import { getSpecimenById } from "@/app/actions/specimen-actions";
import type { ActionResult } from "@/app/actions/types";
import type { SpecimenRow } from "@/app/actions/types";

export async function getPlantById(id: string): Promise<ActionResult<SpecimenRow>> {
  return getSpecimenById(id);
}
