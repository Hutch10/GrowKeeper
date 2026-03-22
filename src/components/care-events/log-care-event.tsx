"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addSpecimenEvent } from "@/app/actions/specimen-events";
import type { CareEventType } from "@/types/database";

interface LogCareEventProps {
  specimenId: string;
}

const CARE_EVENTS: { type: CareEventType; label: string; emoji: string }[] = [
  { type: "watered", label: "Water", emoji: "💧" },
  { type: "fertilized", label: "Fertilize", emoji: "🌱" },
  { type: "pruned", label: "Prune", emoji: "✂️" },
  { type: "repotted", label: "Repot", emoji: "🪴" },
];

export function LogCareEvent({ specimenId }: LogCareEventProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showNotes, setShowNotes] = useState(false);
  const [selectedType, setSelectedType] = useState<CareEventType | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleQuickLog = (type: CareEventType) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await addSpecimenEvent({
        specimen_id: specimenId,
        event_type: type,
      });

      if (result.success) {
        const eventLabel = CARE_EVENTS.find((e) => e.type === type)?.label || type;
        setSuccess(`${eventLabel} logged!`);
        setTimeout(() => setSuccess(null), 2000);
        router.refresh();
      } else {
        setError(result.error || "Failed to log care event.");
      }
    });
  };

  const handleLogWithNotes = () => {
    if (!selectedType) return;

    setError(null);
    startTransition(async () => {
      const result = await addSpecimenEvent({
        specimen_id: specimenId,
        event_type: selectedType,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        setShowNotes(false);
        setSelectedType(null);
        setNotes("");
        const eventLabel = CARE_EVENTS.find((e) => e.type === selectedType)?.label || selectedType;
        setSuccess(`${eventLabel} logged!`);
        setTimeout(() => setSuccess(null), 2000);
        router.refresh();
      } else {
        setError(result.error || "Failed to log care event.");
      }
    });
  };

  const openNotesModal = (type: CareEventType) => {
    setSelectedType(type);
    setNotes("");
    setShowNotes(true);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-dark">Log Care</h3>
        {success && (
          <span className="rounded-full bg-brand-pink-light border border-brand-pink/30 px-3 py-1 text-sm font-medium text-brand-green">
            {success}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CARE_EVENTS.map((event) => (
          <div key={event.type} className="flex flex-col gap-1">
            <button
              onClick={() => handleQuickLog(event.type)}
              disabled={isPending}
              className="flex flex-col items-center gap-1 rounded-lg border border-brand-pink/30 bg-white p-3 text-center shadow-sm transition-all hover:border-brand-green hover:bg-brand-pink-light disabled:opacity-60 group"
            >
              <span className="text-2xl transition-transform group-hover:scale-110">{event.emoji}</span>
              <span className="text-sm font-semibold text-brand-dark/70 group-hover:text-brand-green">{event.label}</span>
            </button>
            <button
              onClick={() => openNotesModal(event.type)}
              disabled={isPending}
              className="text-xs font-medium text-brand-dark/40 hover:text-brand-green"
            >
              + Add note
            </button>
          </div>
        ))}
      </div>

      {/* Notes modal */}
      {showNotes && selectedType && (
        <div className="rounded-lg border border-brand-pink/30 bg-white p-4 shadow-inner">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">
              {CARE_EVENTS.find((e) => e.type === selectedType)?.emoji}
            </span>
            <span className="font-semibold text-brand-dark">
              {CARE_EVENTS.find((e) => e.type === selectedType)?.label}
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            rows={2}
            className="mb-3 w-full resize-none rounded-lg border border-brand-pink-dark bg-brand-pink-light/30 px-3 py-2 text-sm text-brand-dark placeholder-brand-dark/30 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogWithNotes}
              disabled={isPending}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-green-dark hover:shadow-md disabled:opacity-60"
            >
              {isPending ? "Logging..." : "Log Event"}
            </button>
            <button
              onClick={() => setShowNotes(false)}
              disabled={isPending}
              className="rounded-lg border border-brand-pink-dark bg-white px-4 py-2 text-sm font-medium text-brand-green transition-all hover:bg-brand-pink-light disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
