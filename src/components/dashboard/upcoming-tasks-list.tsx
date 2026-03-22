"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { markTaskComplete } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import type { DashboardUpcomingTask } from "@/app/actions/dashboard";

interface UpcomingTasksListProps {
  tasks: DashboardUpcomingTask[];
}

type TaskUrgency = "overdue" | "due_today" | "upcoming" | "no_due_date";

function getTaskUrgency(dueDate: string | null): TaskUrgency {
  if (!dueDate) {
    return "no_due_date";
  }

  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    return "no_due_date";
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (due < todayStart) {
    return "overdue";
  }

  if (due >= todayStart && due < tomorrowStart) {
    return "due_today";
  }

  return "upcoming";
}

const urgencyStyles: Record<TaskUrgency, string> = {
  overdue: "bg-red-100 text-red-700",
  due_today: "bg-amber-100 text-amber-700",
  upcoming: "bg-sky-100 text-sky-700",
  no_due_date: "bg-slate-100 text-slate-700",
};

const urgencyLabels: Record<TaskUrgency, string> = {
  overdue: "Overdue",
  due_today: "Due Today",
  upcoming: "Upcoming",
  no_due_date: "No Due Date",
};

export function UpcomingTasksList({ tasks }: UpcomingTasksListProps) {
  const router = useRouter();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No upcoming tasks
      </div>
    );
  }

  async function handleMarkComplete(taskId: string, plantId: string) {
    setCompletionError(null);
    setCompletingTaskId(taskId);

    const result = await markTaskComplete(taskId, plantId);

    setCompletingTaskId(null);

    if (!result.success) {
      setCompletionError(`completion failure: ${result.error}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      {completionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {completionError}
        </div>
      ) : null}

      {tasks.map((task) => {
        const urgency = getTaskUrgency(task.due_date);
        const specimenNickname = Array.isArray(task.specimen)
          ? (task.specimen[0]?.nickname ?? "Unknown specimen")
          : (task.specimen?.nickname ?? "Unknown specimen");

        return (
          <article
            key={task.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-base font-semibold capitalize text-slate-900">{task.task_type}</p>
                <p className="text-sm text-slate-600">
                  Specimen:{" "}
                  <Link
                    href={`/plants/${task.specimen_id}`}
                    className="font-medium text-slate-900 underline hover:text-slate-700"
                  >
                    {specimenNickname}
                  </Link>
                </p>
                <p className="text-xs text-slate-500">
                  Due: {task.due_date ? formatDate(task.due_date) : "No due date"}
                </p>
                <Link
                  href={`/plants/${task.specimen_id}`}
                  className="inline-block text-xs text-slate-600 underline hover:text-slate-900"
                >
                  Open specimen details
                </Link>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyStyles[urgency]}`}
                >
                  {urgencyLabels[urgency]}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {task.completed ? "Completed" : "Pending"}
                </span>
                {!task.completed ? (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(task.id, task.specimen_id)}
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
