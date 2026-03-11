"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "@/app/actions/tasks";
import type { TaskType } from "@/types/database";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "watered", label: "watered" },
  { value: "fertilized", label: "fertilized" },
  { value: "prune", label: "prune" },
  { value: "repot", label: "repot" },
  { value: "inspect", label: "inspect" },
];

interface AddTaskFormProps {
  plantId: string;
}

export function AddTaskForm({ plantId }: AddTaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(form);
    const taskType = formData.get("task_type") as TaskType;
    const dueDate = formData.get("due_date") as string;

    const result = await addTask({
      plant_id: plantId,
      task_type: taskType,
      due_date: dueDate || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setMessage({ type: "error", text: `Task insert failure: ${result.error}` });
      return;
    }

    setMessage({ type: "success", text: "Task added." });
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task_type" className="block text-sm font-medium text-slate-700">
          Task Type
        </label>
        <select
          id="task_type"
          name="task_type"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">Select task type</option>
          {TASK_TYPES.map((task) => (
            <option key={task.value} value={task.value}>
              {task.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-slate-700">
          Due Date
        </label>
        <input
          id="due_date"
          name="due_date"
          type="datetime-local"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {message ? (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
