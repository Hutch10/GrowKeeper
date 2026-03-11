"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPlant } from "@/app/actions/plants";

export function AddPlantForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(form);
    const nickname = formData.get("nickname") as string;
    const species_name = formData.get("species_name") as string;
    const notes = formData.get("notes") as string;

    const result = await addPlant({
      nickname,
      species_name: species_name || undefined,
      notes: notes || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: "success", text: "Plant added successfully!" });
      form.reset();
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-slate-700">
          Nickname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="My Favorite Plant"
        />
      </div>

      <div>
        <label htmlFor="species_name" className="block text-sm font-medium text-slate-700">
          Species Name
        </label>
        <input
          type="text"
          id="species_name"
          name="species_name"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Monstera Deliciosa"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Any additional information about your plant..."
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
        {isSubmitting ? "Adding Plant..." : "Add Plant"}
      </button>
    </form>
  );
}
