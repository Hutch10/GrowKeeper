"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markTaskComplete } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskListProps {
  tasks: Task[];
  plantId: string;
}

export function TaskList({ tasks, plantId }: TaskListProps) {
  const router = useRouter();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        No tasks yet
      </div>
    );
  }

  async function handleMarkComplete(taskId: string) {
    setCompletionError(null);
    setCompletingTaskId(taskId);

    const result = await markTaskComplete(taskId, plantId);

    setCompletingTaskId(null);

    if (!result.success) {
      setCompletionError(`Task completion failure: ${result.error}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      {completionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {completionError}
        </div>
      ) : null}

      {tasks.map((task) => {
        const isCompleted = Boolean(task.completed);

        return (
          <article
            key={task.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{task.task_type}</p>
                <p className="text-xs text-slate-500">
                  Due: {task.due_date ? formatDate(task.due_date) : "No due date"}
                </p>
                <p className="text-xs text-slate-500">Created: {formatDate(task.created_at)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isCompleted ? "Completed" : "Pending"}
                </span>

                {!isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(task.id)}
                    disabled={completingTaskId !== null}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {completingTaskId === task.id ? "Saving..." : "Mark complete"}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
