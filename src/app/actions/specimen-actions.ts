"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult, SpecimenRow } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { checkMutationGuard } from "@/lib/mutation-utility";
import { normalizeActionError } from "@/lib/error-normalization";

// Simple in-memory storage for Guest Mode session persistence
// Removed shared-memory guest mode imports for strict auth enforcement

import { RAIS_CONSTITUTION } from "@/lib/rais-constitution";
import {
  addSpecimenSchema,
  updateSpecimenSchema,
  type AddSpecimenInput as BaseAddInput,
  type UpdateSpecimenInput as BaseUpdateInput,
} from "@/lib/validations/specimen";


export type AddSpecimenInput = BaseAddInput & { image?: FormData };
export type UpdateSpecimenInput = BaseUpdateInput & { image?: FormData };




export async function addSpecimen(data: AddSpecimenInput): Promise<ActionResult<SpecimenRow>> {
  const validated = addSpecimenSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, data: null, error: validated.error.issues[0].message };
  }
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Authentication required. Please sign in." };
  }

  // Phase 1: Mutation Guard (Idempotency & Throttling)
  const guard = await checkMutationGuard(auth.data.id, "addSpecimen", data);
  if (!guard.allowed) {
    return { success: false, data: null, error: guard.error || "Action restricted." };
  }

  const commonData = {
    nickname: data.nickname.trim(),
    species_name: data.species_name?.trim() || "Unknown",
    notes: data.notes?.trim() || null,
    health: 100,
    telemetry: {
      moisture: 0.5,
      light: 0.5,
      temperature: 21,
    },
    created_at: new Date().toISOString(),
  };

  const supabase = createClient();

  let imageUrl = null;
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
    user_id: auth.data.id,
    nickname: commonData.nickname,
    species_name: commonData.species_name,
    kingdom: data.kingdom,
    notes: commonData.notes,
    image_url: imageUrl,
    hardware_attestation_statement: data.hardware_attestation_statement || null,
    last_vital_signature: data.last_vital_signature || null,
    health: commonData.health,
    telemetry: commonData.telemetry,
    created_at: commonData.created_at,
    last_modified: commonData.created_at,
    last_action_type: "CREATE",
  };

  const raisResult = RAIS_CONSTITUTION.validateSpecimen(payload as Partial<SpecimenRow>);
  payload.compliance_status = raisResult.status;

  try {
    const { data: specimen, error } = await supabase
      .from("specimens")
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (imageUrl) {
        const filePath = imageUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("specimen-images").remove([`${auth.data.id}/${filePath}`]);
        }
      }
      return { success: false, data: null, error: normalizeActionError(error).message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: specimen as unknown as SpecimenRow, error: null };
  } catch (error) {
    return { success: false, data: null, error: normalizeActionError(error).message };
  }
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
