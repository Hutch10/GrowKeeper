"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface AddPlantInput {
  nickname: string;
  species_name?: string;
  notes?: string;
}

type PlantInsert = Database["public"]["Tables"]["plants"]["Insert"];
type PlantRow = Database["public"]["Tables"]["plants"]["Row"];

export async function addPlant(data: AddPlantInput): Promise<ActionResult<PlantRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createServerSupabaseClient();

  const payload: PlantInsert = {
    user_id: auth.data.id,
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || null,
    notes: data.notes?.trim() || null,
  };

  if (!payload.nickname) {
    return { success: false, data: null, error: "Nickname is required." };
  }

  try {
    const { data: plant, error } = await supabase
      .from("plants")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding plant:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: plant as PlantRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to add plant" };
  }
}

export async function getPlants(): Promise<ActionResult<PlantRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createServerSupabaseClient();

  try {
    const { data: plants, error } = await supabase
      .from("plants")
      .select("id, user_id, nickname, species_name, notes, created_at")
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plants:", error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: (plants ?? []) as PlantRow[], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to fetch plants" };
  }
}

export async function getPlantById(id: string): Promise<ActionResult<PlantRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createServerSupabaseClient();

  if (!id.trim()) {
    return { success: false, data: null, error: "Plant not found" };
  }

  try {
    const { data: plant, error } = await supabase
      .from("plants")
      .select("id, user_id, nickname, species_name, notes, created_at")
      .eq("id", id)
      .eq("user_id", auth.data.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching plant by id:", error);
      return { success: false, data: null, error: "Database connection error" };
    }

    if (!plant) {
      return { success: false, data: null, error: "Plant not found" };
    }

    return { success: true, data: plant as PlantRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Database connection error" };
  }
}
