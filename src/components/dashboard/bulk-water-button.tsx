"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenEvent } from "@/app/actions/specimen-events";
import { markTaskComplete } from "@/app/actions/tasks";
import { toast } from "sonner";

interface Task {
  id: string;
  plant_id: string;
  task_type: string;
}

interface BulkWaterButtonProps {
  tasksToWater: Task[];
}

export function BulkWaterButton({ tasksToWater }: BulkWaterButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  if (tasksToWater.length === 0) {
    return null;
  }

  const handleBulkWater = () => {
    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;

      for (const task of tasksToWater) {
        try {
          // Log the care event
          const eventResult = await addSpecimenEvent({
            specimen_id: task.plant_id,
            event_type: "watered",
          });

          if (eventResult.success) {
            // Mark the task complete
            await markTaskComplete(task.id, task.plant_id);
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
        toast.success(`Watered ${successCount} specimen${successCount > 1 ? "s" : ""}!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to water ${errorCount} specimen${errorCount > 1 ? "s" : ""}`);
      }

      router.refresh();
    });
  };

  if (showConfirm) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/50">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Water {tasksToWater.length} specimen{tasksToWater.length > 1 ? "s" : ""}?
        </p>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          This will log watering events and mark tasks complete.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleBulkWater}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
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
                Watering...
              </>
            ) : (
              <>💧 Yes, Water All</>
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
      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
    >
      <span className="text-lg">💧</span>
      Water All Due ({tasksToWater.length})
    </button>
  );
}
