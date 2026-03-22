"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSpecimen } from "@/app/actions/specimen-actions";
import type { SpecimenRow } from "@/app/actions/types";

interface EditSpecimenFormProps {
  specimen: SpecimenRow;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditSpecimenForm({ specimen, onCancel, onSuccess }: EditSpecimenFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nickname, setNickname] = useState(specimen.nickname);
  const [speciesName, setSpeciesName] = useState(specimen.species_name || "");
  const [notes, setNotes] = useState(specimen.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError("Please enter a nickname for your specimen.");
      return;
    }

    startTransition(async () => {
      const result = await updateSpecimen({
        id: specimen.id,
        nickname: nickname.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kingdom: specimen.kingdom as any,
        species_name: speciesName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        onSuccess();
        router.refresh();
      } else {
        setError(result.error || "Failed to update specimen.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="edit-nickname" className="block text-sm font-medium text-slate-700">
          Nickname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="edit-nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="edit-species" className="block text-sm font-medium text-slate-700">
          Species Name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          type="text"
          id="edit-species"
          value={speciesName}
          onChange={(e) => setSpeciesName(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-700">
          Notes <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1.5 block w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
