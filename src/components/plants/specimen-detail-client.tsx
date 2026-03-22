"use client";

import { useState } from "react";
import type { SpecimenRow } from "@/app/actions/types";
import { EditSpecimenForm } from "./edit-specimen-form";
import { DeleteSpecimenButton } from "./delete-specimen-button";

interface SpecimenDetailClientProps {
  specimen: SpecimenRow;
}

export function SpecimenDetailClient({ specimen }: SpecimenDetailClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit Specimen</h2>
        <EditSpecimenForm
          specimen={specimen}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
        </svg>
        Edit
      </button>
      <DeleteSpecimenButton specimenId={specimen.id} specimenNickname={specimen.nickname} />
    </div>
  );
}
