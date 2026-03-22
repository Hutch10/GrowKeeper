"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/date";
import type { CareEventType } from "@/types/database";
import type { SpecimenEventRow } from "@/app/actions/types";
import { deleteSpecimenEvent, updateSpecimenEvent } from "@/app/actions/specimen-events";
import { useRouter } from "next/navigation";

interface CareEventListProps {
  events: SpecimenEventRow[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  watered: "💧 Watered",
  fertilized: "🌱 Fertilized",
  pruned: "✂️ Pruned",
  repotted: "🪴 Repotted",
};

const EVENT_TYPES: { value: CareEventType; label: string }[] = [
  { value: "watered", label: "Watered" },
  { value: "fertilized", label: "Fertilized" },
  { value: "pruned", label: "Pruned" },
  { value: "repotted", label: "Repotted" },
];

export function CareEventList({ events }: CareEventListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editType, setEditType] = useState<CareEventType>("watered");

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-brand-pink/30 bg-white p-8 text-center text-brand-dark/50 font-medium">
        No care events logged yet. Add your first event above!
      </div>
    );
  }

  const handleDelete = (eventId: string, specimenId: string) => {
    if (!confirm("Are you sure you want to delete this care event?")) return;
    
    startTransition(async () => {
      await deleteSpecimenEvent(eventId, specimenId);
      router.refresh();
    });
  };

  const startEditing = (event: SpecimenEventRow) => {
    setEditingId(event.id);
    setEditNotes(event.notes || "");
    setEditType(event.event_type as CareEventType);
  };

  const handleUpdate = (eventId: string, specimenId: string) => {
    startTransition(async () => {
      await updateSpecimenEvent(eventId, specimenId, {
        event_type: editType,
        notes: editNotes,
      });
      setEditingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <article
          key={event.id}
          className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
            editingId === event.id 
              ? "border-brand-green ring-1 ring-brand-green/20" 
              : "border-brand-pink/30 hover:shadow-md hover:border-brand-pink/60"
          }`}
        >
          {editingId === event.id ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as CareEventType)}
                  className="block w-full rounded-md border border-brand-pink-dark px-2 py-1 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-dark"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <time className="text-xs text-brand-dark/40 whitespace-nowrap font-medium">
                  {formatDate(event.created_at)}
                </time>
              </div>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="block w-full rounded-md border border-brand-pink-dark px-2 py-1 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-dark min-h-[60px]"
                placeholder="Notes..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 text-xs font-semibold text-brand-dark/50 hover:text-brand-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(event.id, event.specimen_id)}
                  disabled={isPending}
                  className="px-3 py-1 text-xs font-semibold bg-brand-green text-white rounded hover:bg-brand-green-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-dark flex items-center gap-2">
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </h3>
                  
                  {event.notes && (
                    <p className="mt-2 text-sm text-brand-dark/70 whitespace-pre-wrap font-medium">
                      {event.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <time className="text-xs text-brand-dark/40 whitespace-nowrap font-medium">
                    {formatDate(event.created_at)}
                  </time>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity article-hover-actions">
                    <button
                      onClick={() => startEditing(event)}
                      className="p-1 text-brand-dark/30 hover:text-brand-green transition-colors"
                      title="Edit event"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.specimen_id)}
                      disabled={isPending}
                      className="p-1 text-brand-dark/30 hover:text-red-500 transition-colors"
                      title="Delete event"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      ))}
      <style jsx>{`
        article:hover .article-hover-actions {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
