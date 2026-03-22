"use server";

import { revalidatePath } from "next/cache";
import type { Database, TaskType } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { GUEST_ID } from "./shared-memory";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const TASK_TYPES: TaskType[] = ["watered", "fertilized", "prune", "repot", "inspect"];

type SpecimenOwnershipCheckResult =
  | { ok: true }
  | { ok: false; error: string };

async function verifySpecimenOwnership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  specimenId: string,
): Promise<SpecimenOwnershipCheckResult> {
  if (userId === GUEST_ID) return { ok: true };

  const { data: specimen, error } = await supabase
    .from("plants")
    .select("id")
    .eq("id", specimenId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error verifying task specimen ownership:", error);
    return { ok: false, error: "Unable to verify specimen ownership." };
  }

  if (!specimen) {
    return { ok: false, error: "Specimen not found or not owned by the current user." };
  }

  return { ok: true };
}

export interface AddTaskInput {
  specimen_id: string;
  task_type: TaskType;
  due_date?: string;
}

export async function addSpecimenTask(input: AddTaskInput): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (auth.data.id === GUEST_ID) {
    const mockTask: TaskRow = {
      id: `guest-task-${Math.random().toString(36).substr(2, 9)}`,
      user_id: GUEST_ID,
      plant_id: input.specimen_id,
      task_type: input.task_type,
      due_date: input.due_date ? new Date(input.due_date).toISOString() : null,
      completed: false,
      created_at: new Date().toISOString(),
    };
    return { success: true, data: mockTask, error: null };
  }

  if (!input.specimen_id.trim()) {
    return { success: false, data: null, error: "Invalid specimen id." };
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
    plant_id: input.specimen_id,
    task_type: input.task_type,
    due_date: dueDate,
    completed: false,
  };

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, input.specimen_id);

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
    revalidatePath(`/plants/${input.specimen_id}`);
    return { success: true, data: task as TaskRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to create task." };
  }
}

export async function getSpecimenTasks(specimenId: string): Promise<ActionResult<TaskRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (auth.data.id === GUEST_ID) {
    return {
      success: true,
      data: [
        {
          id: "guest-task-1",
          user_id: GUEST_ID,
          plant_id: specimenId,
          task_type: "watered",
          due_date: new Date().toISOString(),
          completed: false,
          created_at: new Date().toISOString(),
        } as TaskRow,
      ],
      error: null,
    };
  }

  if (!specimenId.trim()) {
    return { success: false, data: null, error: "Invalid specimen id." };
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, user_id, created_at, plant_id, task_type, due_date, completed")
      .eq("plant_id", specimenId)
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

export async function getTasks(): Promise<ActionResult<TaskRow[]>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (auth.data.id === GUEST_ID) {
    return {
      success: true,
      data: [
        {
          id: "guest-task-1",
          user_id: GUEST_ID,
          plant_id: "guest-specimen-1",
          task_type: "watered",
          due_date: new Date().toISOString(),
          completed: false,
          created_at: new Date().toISOString(),
        } as TaskRow,
        {
          id: "guest-task-2",
          user_id: GUEST_ID,
          plant_id: "guest-specimen-2",
          task_type: "fertilized",
          due_date: new Date(Date.now() + 86400000).toISOString(),
          completed: false,
          created_at: new Date().toISOString(),
        } as TaskRow,
      ],
      error: null,
    };
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, user_id, created_at, plant_id, task_type, due_date, completed")
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

export async function markTaskComplete(taskId: string, specimenId: string): Promise<ActionResult<TaskRow>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (auth.data.id === GUEST_ID) {
    return {
      success: true,
      data: {
        id: taskId,
        user_id: GUEST_ID,
        plant_id: specimenId,
        task_type: "watered",
        due_date: new Date().toISOString(),
        completed: true,
        created_at: new Date().toISOString(),
      } as TaskRow,
      error: null,
    };
  }

  if (!taskId.trim() || !specimenId.trim()) {
    return { success: false, data: null, error: "Invalid task update request." };
  }

  const supabase = createClient();
  const ownership = await verifySpecimenOwnership(supabase, auth.data.id, specimenId);

  if (!ownership.ok) {
    return { success: false, data: null, error: ownership.error };
  }

  try {
    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq("plant_id", specimenId)
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
    revalidatePath(`/plants/${specimenId}`);
    return { success: true, data: updatedTask as TaskRow, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, data: null, error: "Failed to mark task complete." };
  }
}
