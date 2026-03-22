"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenTask } from "@/app/actions/tasks";
import type { TaskType } from "@/types/database";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "watered", label: "watered" },
  { value: "fertilized", label: "fertilized" },
  { value: "prune", label: "prune" },
  { value: "repot", label: "repot" },
  { value: "inspect", label: "inspect" },
];

interface AddTaskFormProps {
  specimenId: string;
}

export function AddTaskForm({ specimenId }: AddTaskFormProps) {
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

    const result = await addSpecimenTask({
      specimen_id: specimenId,
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
        <label htmlFor="task_type" className="block text-sm font-medium text-brand-green">
          Task Type
        </label>
        <select
          id="task_type"
          name="task_type"
          required
          className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
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
        <label htmlFor="due_date" className="block text-sm font-medium text-brand-green">
          Due Date
        </label>
        <input
          id="due_date"
          name="due_date"
          type="datetime-local"
          className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
      </div>

      {message ? (
        <div
          className={`rounded-md p-3 text-sm font-medium ${
            message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-brand-pink-light text-brand-green border border-brand-pink/30"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-green-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}
