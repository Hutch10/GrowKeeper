"use server";

import type { CareEventType, TaskType } from "@/types/database";
import type { ActionResult } from "@/app/actions/types";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface DashboardUpcomingTask {
  id: string;
  user_id: string | null;
  plant_id: string;
  task_type: TaskType;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  plant:
    | {
        nickname: string;
      }
    | {
        nickname: string;
      }[]
    | null;
}

export interface DashboardRecentEvent {
  id: string;
  user_id: string | null;
  event_type: CareEventType;
  notes: string | null;
  created_at: string;
  plant:
    | {
        nickname: string;
      }
    | {
        nickname: string;
      }[]
    | null;
}

export interface DashboardSummary {
  totalPlants: number;
  totalIncompleteTasks: number;
  totalCareEvents: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingTasks: DashboardUpcomingTask[];
  recentActivity: DashboardRecentEvent[];
}

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const supabase = createServerSupabaseClient();

  try {
    const [
      plantsCountResult,
      incompleteTasksCountResult,
      careEventsCountResult,
      upcomingTasksResult,
      recentActivityResult,
    ] = await Promise.all([
      supabase.from("plants").select("*", { count: "exact", head: true }).eq("user_id", auth.data.id),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.data.id)
        .eq("completed", false),
      supabase.from("plant_events").select("*", { count: "exact", head: true }).eq("user_id", auth.data.id),
      supabase
        .from("tasks")
        .select("id, user_id, plant_id, task_type, due_date, completed, created_at, plant:plants(nickname)")
        .eq("user_id", auth.data.id)
        .eq("completed", false)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("plant_events")
        .select("id, user_id, event_type, notes, created_at, plant:plants(nickname)")
        .eq("user_id", auth.data.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (plantsCountResult.error) {
      console.error("Dashboard plants count error:", plantsCountResult.error);
      return { success: false, data: null, error: "dashboard query failure" };
    }

    if (incompleteTasksCountResult.error) {
      console.error("Dashboard tasks count error:", incompleteTasksCountResult.error);
      return { success: false, data: null, error: "dashboard query failure" };
    }

    if (careEventsCountResult.error) {
      console.error("Dashboard events count error:", careEventsCountResult.error);
      return { success: false, data: null, error: "dashboard query failure" };
    }

    if (upcomingTasksResult.error) {
      console.error("Dashboard upcoming tasks error:", upcomingTasksResult.error);
      return { success: false, data: null, error: "dashboard query failure" };
    }

    if (recentActivityResult.error) {
      console.error("Dashboard recent activity error:", recentActivityResult.error);
      return { success: false, data: null, error: "dashboard query failure" };
    }

    const summary: DashboardSummary = {
      totalPlants: plantsCountResult.count ?? 0,
      totalIncompleteTasks: incompleteTasksCountResult.count ?? 0,
      totalCareEvents: careEventsCountResult.count ?? 0,
    };

    return {
      success: true,
      error: null,
      data: {
        summary,
        upcomingTasks: (upcomingTasksResult.data ?? []) as DashboardUpcomingTask[],
        recentActivity: (recentActivityResult.data ?? []) as DashboardRecentEvent[],
      },
    };
  } catch (error) {
    console.error("Unexpected dashboard data error:", error);
    return { success: false, data: null, error: "dashboard query failure" };
  }
}
