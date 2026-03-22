"use client";

import Link from "next/link";
import type { SpecimenRow } from "@/app/actions/types";

interface SpecimenCardProps {
  specimen: SpecimenRow;
}

export function SpecimenCard({ specimen }: SpecimenCardProps) {
  return (
    <Link
      href={`/plants/${specimen.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
          {specimen.kingdom === "Fungi" ? "🍄" : "🌿"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-slate-900 group-hover:text-green-700">
            {specimen.nickname}
          </h3>
          {specimen.species_name && (
            <p className="mt-0.5 truncate text-sm italic text-slate-500">
              {specimen.species_name}
            </p>
          )}
          {specimen.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {specimen.notes}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
