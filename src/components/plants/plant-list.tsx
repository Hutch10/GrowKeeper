import Link from "next/link";
import { formatDate } from "@/lib/date";
import type { Database } from "@/types/database";

type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface PlantListProps {
  plants: Plant[];
}

export function PlantList({ plants }: PlantListProps) {
  if (plants.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No plants yet. Add your first plant above!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plants.map((plant) => (
        <Link href={`/plants/${plant.id}`} key={plant.id} className="block">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">{plant.nickname}</h3>

            {plant.species_name && (
              <p className="mt-1 text-sm italic text-slate-600">{plant.species_name}</p>
            )}

            {plant.notes && (
              <p className="mt-3 text-sm text-slate-700">{plant.notes}</p>
            )}

            <p className="mt-4 text-xs text-slate-400">
              Added {formatDate(plant.created_at)}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}
