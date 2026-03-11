import { formatDate } from "@/lib/date";
import type { Database } from "@/types/database";

type PlantEvent = Database["public"]["Tables"]["plant_events"]["Row"];

interface CareEventListProps {
  events: PlantEvent[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  watered: "💧 Watered",
  fertilized: "🌱 Fertilized",
  pruned: "✂️ Pruned",
  repotted: "🪴 Repotted",
};

export function CareEventList({ events }: CareEventListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No care events logged yet. Add your first event above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </h3>
              
              {event.notes && (
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {event.notes}
                </p>
              )}
            </div>
            
            <time className="ml-4 text-xs text-slate-400 whitespace-nowrap">
              {formatDate(event.created_at)}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}
