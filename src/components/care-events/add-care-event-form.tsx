"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenEvent } from "@/app/actions/specimen-events";
import type { CareEventType } from "@/types/database";

interface AddCareEventFormProps {
  specimenId: string;
}

const EVENT_TYPES: { value: CareEventType; label: string }[] = [
  { value: "watered", label: "Watered" },
  { value: "fertilized", label: "Fertilized" },
  { value: "pruned", label: "Pruned" },
  { value: "repotted", label: "Repotted" },
];

export function AddCareEventForm({ specimenId }: AddCareEventFormProps) {
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

    const result = await addSpecimenEvent({
      specimen_id: specimenId,
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
        <label htmlFor="event_type" className="block text-sm font-medium text-brand-green">
          Event Type <span className="text-brand-pink-dark font-bold">*</span>
        </label>
        <select
          id="event_type"
          name="event_type"
          required
          className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 shadow-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-dark"
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
        <label htmlFor="notes" className="block text-sm font-medium text-brand-green">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 shadow-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-darkPlaceholder placeholder-brand-dark/30"
          placeholder="Add any additional details..."
        />
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm font-medium border ${
            message.type === "success"
              ? "bg-brand-pink-light text-brand-green border-brand-pink/30"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-green-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Logging Event..." : "Log Care Event"}
      </button>
    </form>
  );
}
