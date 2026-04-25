type CareEvent = { created_at: string | null; event_type: string };

const CARE_BOOST: Record<string, number> = {
  watered: 15,
  fertilized: 10,
  pruned: 5,
  repotted: 20,
};

const DAILY_DECAY = 0.5;
const W = 200;
const H = 56;

function computePoints(
  events: CareEvent[],
  createdAt: string,
  currentHealth: number,
): Array<{ t: number; h: number }> {
  const sorted = events
    .filter((e) => e.created_at)
    .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());

  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const points: Array<{ t: number; h: number }> = [];

  let health = 90;
  let lastT = start;
  points.push({ t: start, h: health });

  for (const ev of sorted) {
    const evT = new Date(ev.created_at!).getTime();
    const days = Math.max(0, (evT - lastT) / 86400000);
    health = Math.max(20, health - days * DAILY_DECAY);
    health = Math.min(100, health + (CARE_BOOST[ev.event_type] ?? 5));
    points.push({ t: evT, h: health });
    lastT = evT;
  }

  const daysToNow = Math.max(0, (now - lastT) / 86400000);
  const finalH = Math.max(20, health - daysToNow * DAILY_DECAY);
  // Use actual health for the last point, but blend so the trend ends at reality
  points.push({ t: now, h: Math.round((finalH + currentHealth) / 2) });

  return points;
}

export function HealthSparkline({
  events,
  createdAt,
  currentHealth,
}: {
  events: CareEvent[];
  createdAt: string;
  currentHealth: number;
}) {
  const color =
    currentHealth >= 70 ? "#22c55e" : currentHealth >= 40 ? "#f59e0b" : "#ef4444";

  const points = computePoints(events, createdAt, currentHealth);

  if (points.length < 2) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${currentHealth}%`, backgroundColor: color }} />
        </div>
        <span className="text-sm font-bold" style={{ color }}>{currentHealth}%</span>
      </div>
    );
  }

  const minT = points[0].t;
  const maxT = points[points.length - 1].t;
  const tRange = Math.max(1, maxT - minT);

  const x = (t: number) => ((t - minT) / tRange) * W;
  const y = (h: number) => H - (h / 100) * H;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.h).toFixed(1)}`)
    .join(" ");

  const fillPath =
    linePath +
    ` L${x(maxT).toFixed(1)},${H} L${x(minT).toFixed(1)},${H} Z`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Health trend</span>
        <span className="text-sm font-bold" style={{ color }}>{currentHealth}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="overflow-visible">
        <defs>
          <linearGradient id={`hg-${currentHealth}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#hg-${currentHealth})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Terminal dot */}
        <circle
          cx={x(maxT).toFixed(1)}
          cy={y(points[points.length - 1].h).toFixed(1)}
          r="3"
          fill={color}
        />
      </svg>
    </div>
  );
}
