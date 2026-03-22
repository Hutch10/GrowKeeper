"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markTaskComplete } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import type { Database } from "@/types/database";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskListProps {
  tasks: TaskRow[];
  specimenId: string;
}

const TASK_CONFIG: Record<string, { emoji: string; label: string }> = {
  watered: { emoji: "💧", label: "Water" },
  fertilized: { emoji: "🌱", label: "Fertilize" },
  prune: { emoji: "✂️", label: "Prune" },
  repot: { emoji: "🪴", label: "Repot" },
  inspect: { emoji: "🔍", label: "Inspect" },
};

export function TaskList({ tasks, specimenId }: TaskListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleComplete = (taskId: string) => {
    startTransition(async () => {
      await markTaskComplete(taskId, specimenId);
      router.refresh();
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-pink-dark bg-brand-pink-light/30 p-6 text-center">
        <p className="text-sm text-brand-dark/60 font-medium">No tasks yet.</p>
        <p className="mt-1 text-xs text-brand-dark/40">
          Add a task to track upcoming care.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incompleteTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-brand-green uppercase tracking-wider">Upcoming</h4>
          {incompleteTasks.map((task) => {
            const config = TASK_CONFIG[task.task_type] || {
              emoji: "📋",
              label: task.task_type,
            };
            const isOverdue = task.due_date && new Date(task.due_date) < new Date();

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-all ${
                  isOverdue
                    ? "border-red-200 bg-red-50"
                    : "border-brand-pink/30 bg-white hover:border-brand-pink/60"
                }`}
              >
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={isPending}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-brand-pink-dark bg-white transition-all hover:border-brand-green hover:bg-brand-pink-light disabled:opacity-60"
                  title="Mark complete"
                >
                  {isPending ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
                  ) : null}
                </button>
                <span className="text-lg">{config.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-dark">{config.label}</p>
                  {task.due_date && (
                    <p
                      className={`text-xs ${
                        isOverdue ? "font-bold text-red-600" : "text-brand-dark/50 font-medium"
                      }`}
                    >
                      {isOverdue ? "Overdue: " : "Due: "}
                      {formatDate(task.due_date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-brand-dark/40 uppercase tracking-wider">Completed</h4>
          {completedTasks.slice(0, 3).map((task) => {
            const config = TASK_CONFIG[task.task_type] || {
              emoji: "📋",
              label: task.task_type,
            };

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-brand-pink/10 bg-brand-pink-light/50 p-3 opacity-60"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-brand-green bg-brand-green">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3 w-3 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-lg">{config.emoji}</span>
                <p className="font-medium text-brand-dark/60 line-through">
                  {config.label}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
