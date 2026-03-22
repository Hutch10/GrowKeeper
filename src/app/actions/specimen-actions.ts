"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { ActionResult, SpecimenRow } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

// Simple in-memory storage for Guest Mode session persistence
import { GUEST_ID, guestSpecimensMemory } from "./shared-memory";

import { z } from "zod";

const baseSpecimenSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(100),
  species_name: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  hardware_attestation_statement: z.string().optional().nullable(),
});

const plantSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Plantae"),
  light: z.string().max(100).optional().nullable(),
  watering: z.string().max(100).optional().nullable(),
  fertilizer: z.string().max(100).optional().nullable(),
});

const fungalSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Fungi"),
  substrate: z.string().max(100).optional().nullable(),
  misting_schedule: z.string().max(100).optional().nullable(),
  fertilizer: z.string().max(100).optional().nullable(),
});

const animaliaSchema = baseSpecimenSchema.extend({
  kingdom: z.literal("Animalia"),
  heart_rate: z.number().int().optional().nullable(),
  activity_level: z.number().int().optional().nullable(),
  dietary_notes: z.string().max(1000).optional().nullable(),
});

const addSpecimenSchema = z.discriminatedUnion("kingdom", [
  plantSchema,
  fungalSchema,
  animaliaSchema,
  baseSpecimenSchema.extend({ kingdom: z.literal("Other") }),
]);

const updateSpecimenSchema = z.intersection(
  z.object({ id: z.string().uuid().or(z.string().startsWith("guest-specimen-")) }),
  addSpecimenSchema
);

export type AddSpecimenInput = z.infer<typeof addSpecimenSchema> & { image?: FormData };
export type UpdateSpecimenInput = z.infer<typeof updateSpecimenSchema> & { image?: FormData };

type SpecimenInsert = Database["public"]["Tables"]["plants"]["Insert"];
type SpecimenUpdate = Database["public"]["Tables"]["plants"]["Update"];

export async function addSpecimen(data: AddSpecimenInput): Promise<ActionResult<SpecimenRow>> {
  const validated = addSpecimenSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const commonData = {
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || null,
    location: data.location?.trim() || null,
    notes: data.notes?.trim() || null,
    happiness_score: 100,
    health_status: "Newbie",
    moisture_level: 50,
    light_level: 5,
    temp_c: 21,
    created_at: new Date().toISOString(),
  };

  if (auth.data.id === GUEST_ID) {
    const newSpecimen = {
      ...commonData,
      id: "guest-specimen-" + Date.now(),
      user_id: GUEST_ID,
      kingdom: data.kingdom,
      image_url: null,
      hardware_attestation_statement: data.hardware_attestation_statement || null,
      ...(data.kingdom === "Plantae" ? {
        light: data.light?.trim() || null,
        watering: data.watering?.trim() || null,
        fertilizer: data.fertilizer?.trim() || null,
      } : data.kingdom === "Fungi" ? {
        substrate: data.substrate?.trim() || null,
        misting_schedule: data.misting_schedule?.trim() || null,
        fertilizer: data.fertilizer?.trim() || null,
        light: null,
        watering: null,
      } : data.kingdom === "Animalia" ? {
        heart_rate: data.heart_rate || null,
        activity_level: data.activity_level || null,
        dietary_notes: data.dietary_notes?.trim() || null,
        light: null,
        watering: null,
        fertilizer: null,
      } : {}),
    } as SpecimenRow;
    
    guestSpecimensMemory.push(newSpecimen);
    return { success: true, data: newSpecimen, error: null };
  }

  const supabase = createClient();

  let imageUrl = null;
  if (data.image) {
    const file = data.image.get("file") as File;
    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${auth.data.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { success: false, data: null, error: "Failed to upload image" };
      }

      const { data: publicUrlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(filePath);
      
      imageUrl = publicUrlData.publicUrl;
    }
  }

  const payload: SpecimenInsert = {
    user_id: auth.data.id,
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || null,
    location: data.location?.trim() || null,
    kingdom: data.kingdom,
    notes: data.notes?.trim() || null,
    image_url: imageUrl,
    hardware_attestation_statement: data.hardware_attestation_statement || null,
    happiness_score: 100,
    health_status: "Newbie",
    moisture_level: 50,
    light_level: 5,
    temp_c: 21,
    ...(data.kingdom === "Plantae" ? {
      light: data.light?.trim() || null,
      watering: data.watering?.trim() || null,
      fertilizer: data.fertilizer?.trim() || null,
    } : data.kingdom === "Fungi" ? {
      substrate: data.substrate?.trim() || null,
      misting_schedule: data.misting_schedule?.trim() || null,
      fertilizer: data.fertilizer?.trim() || null,
    } : data.kingdom === "Animalia" ? {
      heart_rate: data.heart_rate || null,
      activity_level: data.activity_level || null,
      dietary_notes: data.dietary_notes?.trim() || null,
    } : {}),
  };

  try {
    const { data: specimen, error } = await supabase
      .from("plants")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding specimen:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to add specimen" };
  }
}

export async function getSpecimens(): Promise<ActionResult<SpecimenRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();

  try {
    if (auth.data.id === GUEST_ID) {
      return {
        success: true,
        data: [...guestSpecimensMemory].reverse() as SpecimenRow[],
        error: null,
      };
    }

    const { data: specimens, error } = await supabase
      .from("plants")
      .select("id, user_id, nickname, species_name, notes, created_at, location, light, watering, fertilizer, image_url, happiness_score, health_status, moisture_level, light_level, temp_c, hardware_attestation_statement")
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching specimens:", error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: (specimens ?? []) as unknown as SpecimenRow[], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to fetch specimens" };
  }
}

export async function getSpecimenById(id: string): Promise<ActionResult<SpecimenRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createClient();

  if (!id.trim()) {
    return { success: false, data: null, error: "Specimen not found" };
  }

  try {
    if (auth.data.id === GUEST_ID) {
      const specimen = guestSpecimensMemory.find((p: SpecimenRow) => p.id === id);
      if (!specimen) {
        return { success: false, data: null, error: "Specimen not found" };
      }
      return {
        success: true,
        data: specimen as SpecimenRow,
        error: null,
      };
    }

    const { data: specimen, error } = await supabase
      .from("plants")
      .select("id, user_id, nickname, species_name, notes, created_at, location, kingdom, light, watering, fertilizer, substrate, misting_schedule, heart_rate, activity_level, dietary_notes, image_url, happiness_score, health_status, moisture_level, light_level, temp_c, hardware_attestation_statement")
      .eq("id", id)
      .eq("user_id", auth.data.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching specimen by id:", error);
      return { success: false, data: null, error: "Database connection error" };
    }

    if (!specimen) {
      return { success: false, data: null, error: "Specimen not found" };
    }

    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Database connection error" };
  }
}

export async function updateSpecimen(data: UpdateSpecimenInput): Promise<ActionResult<SpecimenRow>> {
  const validated = updateSpecimenSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!data.id.trim()) {
    return { success: false, data: null, error: "Specimen not found" };
  }

  if (auth.data.id === GUEST_ID) {
    const index = guestSpecimensMemory.findIndex((p: SpecimenRow) => p.id === data.id);
    if (index === -1) {
      return { success: false, data: null, error: "Specimen not found" };
    }
    const updatedSpecimen = {
      ...guestSpecimensMemory[index],
      nickname: data.nickname.trim(),
      species_name: data.species_name?.trim() || null,
      location: data.location?.trim() || null,
      notes: data.notes?.trim() || null,
      kingdom: data.kingdom,
      ...(data.kingdom === "Plantae" ? {
        light: data.light?.trim() || null,
        watering: data.watering?.trim() || null,
        fertilizer: data.fertilizer?.trim() || null,
        substrate: null,
        misting_schedule: null,
      } : data.kingdom === "Fungi" ? {
        substrate: data.substrate?.trim() || null,
        misting_schedule: data.misting_schedule?.trim() || null,
        fertilizer: data.fertilizer?.trim() || null,
        light: null,
        watering: null,
      } : data.kingdom === "Animalia" ? {
        heart_rate: data.heart_rate || null,
        activity_level: data.activity_level || null,
        dietary_notes: data.dietary_notes?.trim() || null,
        light: null,
        watering: null,
        fertilizer: null,
        substrate: null,
        misting_schedule: null,
      } : {
        light: null,
        watering: null,
        fertilizer: null,
        substrate: null,
        misting_schedule: null,
      }),
    } as SpecimenRow;
    guestSpecimensMemory[index] = updatedSpecimen;
    return { success: true, data: updatedSpecimen, error: null };
  }

  const supabase = createClient();

  let imageUrl = undefined;
  if (data.image) {
    const file = data.image.get("file") as File;
    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${auth.data.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { success: false, data: null, error: "Failed to upload image" };
      }

      const { data: publicUrlData } = supabase.storage
        .from("plant-images")
        .getPublicUrl(filePath);
      
      imageUrl = publicUrlData.publicUrl;
    }
  }

  const payload: SpecimenUpdate = {
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || null,
    location: data.location?.trim() || null,
    notes: data.notes?.trim() || null,
    kingdom: data.kingdom,
    hardware_attestation_statement: data.hardware_attestation_statement || null,
    ...(data.kingdom === "Plantae" ? {
      light: data.light?.trim() || null,
      watering: data.watering?.trim() || null,
      fertilizer: data.fertilizer?.trim() || null,
      substrate: null,
      misting_schedule: null,
    } : data.kingdom === "Fungi" ? {
      substrate: data.substrate?.trim() || null,
      misting_schedule: data.misting_schedule?.trim() || null,
      fertilizer: data.fertilizer?.trim() || null,
      light: null,
      watering: null,
    } : data.kingdom === "Animalia" ? {
      heart_rate: data.heart_rate || null,
      activity_level: data.activity_level || null,
      dietary_notes: data.dietary_notes?.trim() || null,
      light: null,
      watering: null,
      fertilizer: null,
      substrate: null,
      misting_schedule: null,
    } : {}),
    ...(imageUrl !== undefined && { image_url: imageUrl }),
  };

  try {
    const { data: specimen, error } = await supabase
      .from("plants")
      .update(payload)
      .eq("id", data.id)
      .eq("user_id", auth.data.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating specimen:", error);
      return { success: false, data: null, error: error.message };
    }

    if (!specimen) {
      return { success: false, data: null, error: "Specimen not found" };
    }

    revalidatePath("/plants");
    revalidatePath(`/plants/${data.id}`);
    revalidatePath("/dashboard");
    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to update specimen" };
  }
}

export async function deleteSpecimen(id: string): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!id.trim()) {
    return { success: false, data: null, error: "Specimen not found" };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("plants")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.data.id);

    if (error) {
      console.error("Error deleting specimen:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/plants");
    revalidatePath("/dashboard");
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to delete specimen" };
  }
}
