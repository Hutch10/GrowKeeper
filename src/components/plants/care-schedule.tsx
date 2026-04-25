type CareEvent = { created_at: string | null; event_type: string };

const INTERVALS: Record<string, number> = {
  watered: 7,
  fertilized: 30,
  pruned: 90,
  repotted: 365,
  observation: 14,
};

const LABELS: Record<string, string> = {
  watered: "Watering",
  fertilized: "Fertilizing",
  pruned: "Pruning",
  repotted: "Repotting",
  observation: "Check-in",
};

const ICONS: Record<string, string> = {
  watered: "💧",
  fertilized: "🌱",
  pruned: "✂️",
  repotted: "🪴",
  observation: "👁️",
};

type ScheduleRow = {
  type: string;
  label: string;
  icon: string;
  lastDate: Date | null;
  daysUntil: number;
};

export function CareSchedule({ events }: { events: CareEvent[] }) {
  const now = new Date();

  const latestByType = new Map<string, Date>();
  for (const ev of events) {
    if (!ev.created_at) continue;
    const d = new Date(ev.created_at);
    const prev = latestByType.get(ev.event_type);
    if (!prev || d > prev) latestByType.set(ev.event_type, d);
  }

  const rows: ScheduleRow[] = Object.entries(INTERVALS).map(([type, interval]) => {
    const lastDate = latestByType.get(type) ?? null;
    const base = lastDate ?? new Date(now.getTime() - interval * 86400000);
    const next = new Date(base.getTime() + interval * 86400000);
    const daysUntil = Math.round((next.getTime() - now.getTime()) / 86400000);
    return { type, label: LABELS[type] ?? type, icon: ICONS[type] ?? "📋", lastDate, daysUntil };
  });

  rows.sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.type}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{row.icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{row.label}</p>
              <p className="text-xs text-slate-400">
                {row.lastDate
                  ? `Last: ${row.lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : "Never logged"}
              </p>
            </div>
          </div>
          <StatusBadge days={row.daysUntil} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        {Math.abs(days)}d overdue
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        Due today
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
        Due in {days}d
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
      {days}d
    </span>
  );
}
