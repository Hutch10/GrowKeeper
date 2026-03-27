"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { markTaskComplete } from "@/app/actions/tasks";
import { useSyncMutation } from "@/hooks/use-mutation";
import { formatDate } from "@/lib/date";
import { CheckCircle2 } from "lucide-react";
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
  const { mutate: completeTask, isPending: isCompleting } = useSyncMutation(
    (args: { taskId: string; specimenId: string }) => markTaskComplete(args.taskId, args.specimenId)
  );
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-brand-pink/20 bg-white p-12 text-center group transition-all hover:border-brand-pink/40">
        <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <CheckCircle2 className="w-8 h-8 text-brand-pink" />
        </div>
        <h3 className="text-xl font-black text-brand-dark mb-2">Operational Calm</h3>
        <p className="text-sm text-brand-dark/40 font-bold mb-6">No pending care actions detected in your registry.</p>
        <Link 
          href="/plants" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-forest text-white text-sm font-black hover:bg-brand-forest/90 transition-all shadow-lg active:scale-95"
        >
          View Specimens to Assign Tasks
        </Link>
      </div>
    );
  }

  async function handleMarkComplete(taskId: string, plantId: string) {
    setActiveTaskId(taskId);
    const result = await completeTask({ taskId, specimenId: plantId });
    setActiveTaskId(null);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">

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
                    disabled={isCompleting}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCompleting && activeTaskId === task.id ? "Saving..." : "Mark complete"}
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
