"use server";

import { revalidatePath } from "next/cache";
import type { Database, TaskType } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const TASK_TYPES: TaskType[] = ["watered", "fertilized", "prune", "repot", "inspect"];

type PlantOwnershipCheckResult =
  | { ok: true }
  | { ok: false; error: string };

async function verifyPlantOwnership(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  plantId: string,
): Promise<PlantOwnershipCheckResult> {
  const { data: plant, error } = await supabase
    .from("plants")
    .select("id")
    .eq("id", plantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error verifying task plant ownership:", error);
    return { ok: false, error: "Unable to verify plant ownership." };
  }

  if (!plant) {
    return { ok: false, error: "Plant not found or not owned by the current user." };
  }

  return { ok: true };
}

export interface AddTaskInput {
  plant_id: string;
  task_type: TaskType;
  due_date?: string;
}

export async function addTask(input: AddTaskInput): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!input.plant_id.trim()) {
    return { success: false, data: null, error: "Invalid plant id." };
  }

  if (!TASK_TYPES.includes(input.task_type)) {
    return { success: false, data: null, error: "Invalid task type." };
  }

  let dueDate: string | null = null;

  if (input.due_date?.trim()) {
    const parsed = new Date(input.due_date);

    if (Number.isNaN(parsed.getTime())) {
      return { success: false, data: null, error: "Invalid due date." };
    }

    dueDate = parsed.toISOString();
  }

  const payload: TaskInsert = {
    user_id: auth.data.id,
    plant_id: input.plant_id,
    task_type: input.task_type,
    due_date: dueDate,
    completed: false,
  };

  const supabase = createServerSupabaseClient();

  const ownership = await verifyPlantOwnership(supabase, auth.data.id, input.plant_id);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select("id, created_at, plant_id, task_type, due_date, completed")
      .single();

    if (error) {
      console.error("Error adding task:", error);
      return { success: false, data: null, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${input.plant_id}`);
    return { success: true, data: task as TaskRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to create task." };
  }
}

export async function getPlantTasks(plantId: string): Promise<ActionResult<TaskRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!plantId.trim()) {
    return { success: false, data: null, error: "Invalid plant id." };
  }

  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, user_id, created_at, plant_id, task_type, due_date, completed")
      .eq("plant_id", plantId)
      .eq("user_id", auth.data.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return { success: false, data: null, error: "Failed to load tasks." };
    }

    return { success: true, data: (data ?? []) as TaskRow[], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to load tasks." };
  }
}

export async function markTaskComplete(taskId: string, plantId: string): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!taskId.trim() || !plantId.trim()) {
    return { success: false, data: null, error: "Invalid task update request." };
  }

  const supabase = createServerSupabaseClient();

  const ownership = await verifyPlantOwnership(supabase, auth.data.id, plantId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq("plant_id", plantId)
      .eq("user_id", auth.data.id)
      .select("id, user_id, created_at, plant_id, task_type, due_date, completed")
      .maybeSingle();

    if (error) {
      console.error("Error completing task:", error);
      return { success: false, data: null, error: error.message };
    }

    if (!updatedTask) {
      return { success: false, data: null, error: "Task not found." };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/plants/${plantId}`);
    return { success: true, data: updatedTask as TaskRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to mark task complete." };
  }
}
