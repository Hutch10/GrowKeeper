"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPlantEvent } from "@/app/actions/plant-events";
import type { CareEventType } from "@/types/database";

interface AddCareEventFormProps {
  plantId: string;
}

const EVENT_TYPES: { value: CareEventType; label: string }[] = [
  { value: "watered", label: "Watered" },
  { value: "fertilized", label: "Fertilized" },
  { value: "pruned", label: "Pruned" },
  { value: "repotted", label: "Repotted" },
];

export function AddCareEventForm({ plantId }: AddCareEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(form);
    const event_type = formData.get("event_type") as CareEventType;
    const notes = formData.get("notes") as string;

    const result = await addPlantEvent({
      plant_id: plantId,
      event_type,
      notes: notes || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: "success", text: "Care event logged successfully!" });
      form.reset();
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="event_type" className="block text-sm font-medium text-slate-700">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          id="event_type"
          name="event_type"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">Select event type</option>
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Add any additional details..."
        />
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Logging Event..." : "Log Care Event"}
      </button>
    </form>
  );
}
