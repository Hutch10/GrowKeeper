"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks, markTaskComplete as markTaskCompleteAction } from "@/app/actions/tasks";
import { TaskRow } from "@/app/actions/tasks";

export function useTaskData(initialData?: TaskRow[]) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getTasks();
    if (result.success) {
      setTasks(result.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markComplete = async (taskId: string, specimenId: string) => {
    const result = await markTaskCompleteAction(taskId, specimenId);
    if (result.success) {
      refresh();
    }
    return result;
  };

  return {
    tasks,
    loading,
    refresh,
    markComplete
  };
}
