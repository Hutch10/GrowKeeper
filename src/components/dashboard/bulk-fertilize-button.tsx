"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenEvent } from "@/app/actions/specimen-events";
import { markTaskComplete } from "@/app/actions/tasks";
import { toast } from "sonner";

interface Task {
  id: string;
  specimen_id: string;
  task_type: string;
}

interface BulkFertilizeButtonProps {
  tasksToFertilize: Task[];
}

export function BulkFertilizeButton({ tasksToFertilize }: BulkFertilizeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  if (tasksToFertilize.length === 0) {
    return null;
  }

  const handleBulkFertilize = () => {
    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;

      for (const task of tasksToFertilize) {
        try {
          // Log the care event
          const eventResult = await addSpecimenEvent(task.specimen_id, {
            event_type: "fertilized",
          });

          if (eventResult.success) {
            // Mark the task complete
            await markTaskComplete(task.id, task.specimen_id);
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      setShowConfirm(false);

      if (successCount > 0) {
        toast.success(`Fertilized ${successCount} specimen${successCount > 1 ? "s" : ""}!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to fertilize ${errorCount} specimen${errorCount > 1 ? "s" : ""}`);
      }

      router.refresh();
    });
  };

  if (showConfirm) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/50">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          Fertilize {tasksToFertilize.length} specimen{tasksToFertilize.length > 1 ? "s" : ""}?
        </p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          This will log fertilization events and mark tasks complete.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleBulkFertilize}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Fertilizing...
              </>
            ) : (
              <>🌱 Yes, Fertilize All</>
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900"
    >
      <span className="text-lg">🌱</span>
      Fertilize All Due ({tasksToFertilize.length})
    </button>
  );
}
