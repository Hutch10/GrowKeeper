"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult, SpecimenRow } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { trackAlphaEvent } from "@/lib/services/alpha-telemetry";
import { normalizeActionError } from "@/lib/error-normalization";

// Simple in-memory storage for Guest Mode session persistence
// Removed shared-memory guest mode imports for strict auth enforcement

import { RAIS_CONSTITUTION } from "@/lib/rais-constitution";
import {
  addSpecimenSchema,
  updateSpecimenSchema,
  type UpdateSpecimenInput as BaseUpdateInput,
} from "@/lib/validations/specimen";
import { type Kingdom } from "@/types/specimen";


export type UpdateSpecimenInput = BaseUpdateInput & { image?: FormData };




export async function addSpecimen(formData: FormData): Promise<ActionResult<SpecimenRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required. Please sign in." };
  }

  // Extract data from FormData
  const nickname = (formData.get("nickname") as string) || "";
  const species_name = (formData.get("species_name") as string) || "Unknown";
  const notes = (formData.get("notes") as string) || "";
  const kingdom = (formData.get("kingdom") as Kingdom) || "Plantae";
  const location = (formData.get("location") as string) || "Living Room";
  const hardware_attestation_statement = (formData.get("hardware_attestation_statement") as string) || null;
  const last_vital_signature = (formData.get("last_vital_signature") as string) || null;
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lon = formData.get("lon") ? Number(formData.get("lon")) : null;

  const validated = addSpecimenSchema.safeParse({
    nickname,
    species_name,
    notes,
    kingdom,
    location,
    hardware_attestation_statement,
    last_vital_signature,
    lat,
    lon,
  });

  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }

  // Phase 1: Mutation Guard (Idempotency & Throttling)
  const guard = await checkMutationGuard(auth.data.id, "addSpecimen", { nickname, kingdom });
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  const supabase = createClient();
  const file = formData.get("file") as File;
  
  let imageUrl = null;
  if (file && file.size > 0) {
    // 2. Upload to Storage (Robust Approach)
    const fileExt = file.name.split(".").pop();
    const filePath = `${auth.data.id}/${Date.now()}-${nameNormalization(file.name)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("specimen-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { success: false, data: null, error: "Failed to upload image: " + uploadError.message };
    }

    // Track Image Upload
    await trackAlphaEvent("specimen_image_uploaded", { 
      path: filePath, 
      type: file.type,
      size: file.size 
    }, "/plants/add");

    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/specimen-images/${filePath}`;
  }

  // Phase 2: Create Database Record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    user_id: auth.data.id,
    nickname: nickname.trim(),
    species_name: species_name.trim(),
    kingdom,
    location,
    notes: notes.trim() || null,
    image_url: imageUrl,
    hardware_attestation_statement,
    last_vital_signature,
    health: 100,
    telemetry: {
      moisture: 0.5,
      light: 0.5,
      temperature: 21,
    },
    lat,
    lon,
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    last_action_type: "CREATE",
  };

  const raisResult = RAIS_CONSTITUTION.validateSpecimen(payload as Partial<SpecimenRow>);
  payload.compliance_status = raisResult.status;

  try {
    const { data: specimen, error: dbError } = await supabase
      .from("specimens")
      .insert(payload)
      .select()
      .single();

    if (dbError) {
      // Rollback image upload if DB insert fails
      if (imageUrl) {
        const pathPart = imageUrl.split("/").pop();
        if (pathPart) {
          await supabase.storage.from("specimen-images").remove([`${auth.data.id}/${pathPart}`]);
        }
      }
      return { success: false, data: null, error: normalizeActionError(dbError).message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/plants");
    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

// Helper to normalize file names
function nameNormalization(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 50);
}

export async function getSpecimens(): Promise<ActionResult<SpecimenRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  const supabase = createClient();

  try {
    const { data: specimens, error } = await supabase
      .from("specimens")
      .select("*")
      .eq("user_id", auth.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    return { success: true, data: (specimens ?? []) as unknown as SpecimenRow[], error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function getSpecimenById(id: string): Promise<ActionResult<SpecimenRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  const supabase = createClient();

  if (!id.trim()) {
    return { success: false, data: null, error: "Specimen not found" };
  }

  try {
    const { data: specimen, error } = await supabase
      .from("specimens")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.data.id)
      .maybeSingle();

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    if (!specimen) {
      return { success: false, data: null, error: "The requested specimen was not found." };
    }

    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function updateSpecimen(data: UpdateSpecimenInput): Promise<ActionResult<SpecimenRow>> {
  const validated = updateSpecimenSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  // Phase 1: Mutation Guard
  const guard = await checkMutationGuard(auth.data.id, "updateSpecimen", data);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Update restricted." };
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
        .from("specimen-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { success: false, data: null, error: "Failed to upload image" };
      }

      const { data: publicUrlData } = supabase.storage
        .from("specimen-images")
        .getPublicUrl(filePath);
      
      imageUrl = publicUrlData.publicUrl;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || "Unknown",
    notes: data.notes?.trim() || null,
    kingdom: data.kingdom,
    hardware_attestation_statement: data.hardware_attestation_statement || null,
    lat: data.lat ?? null,
    lon: data.lon ?? null,
    ...(imageUrl !== undefined && { image_url: imageUrl }),
    last_modified: new Date().toISOString(),
    last_action_type: "UPDATE",
  };

  const raisResult = RAIS_CONSTITUTION.validateSpecimen(payload as Partial<SpecimenRow>);
  payload.compliance_status = raisResult.status;

  try {
    const { data: specimen, error } = await supabase
      .from("specimens")
      .update(payload)
      .eq("id", data.id)
      .eq("user_id", auth.data.id)
      .select()
      .maybeSingle();

    if (error) {
      if (imageUrl) {
        const filePath = imageUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("specimen-images").remove([`${auth.data.id}/${filePath}`]);
        }
      }
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    if (!specimen) {
      return { success: false, data: null, error: "Specimen not found or access denied." };
    }

    revalidatePath("/plants");
    revalidatePath(`/plants/${data.id}`);
    revalidatePath("/dashboard");
    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}

export async function deleteSpecimen(id: string): Promise<ActionResult<null>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required." };
  }

  if (!id.trim()) {
    return { success: false, data: null, error: "Specimen not found" };
  }

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("specimens")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.data.id);

    if (error) {
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    revalidatePath("/plants");
    revalidatePath("/dashboard");
    return { success: true, data: null, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
}
