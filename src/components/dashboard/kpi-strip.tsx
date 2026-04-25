import { Droplets, ClipboardList, Activity } from "lucide-react";
import { DashboardKPIs } from "@/lib/services/dashboard-stats";

interface KPIStripProps {
  kpis: DashboardKPIs;
}

export function KPIStrip({ kpis }: KPIStripProps) {
  const cards = [
    {
      label: "Watering Needed",
      value: kpis.dueToday,
      unit: "Plants",
      icon: Droplets,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "New Tasks",
      value: kpis.overdue,
      unit: "Task",
      icon: ClipboardList,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      label: "Humidity Level",
      value: "58%",
      unit: null,
      badge: "Good",
      icon: Activity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">{card.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800">{card.value}</span>
              {card.unit && (
                <span className="text-sm text-slate-400 font-medium">{card.unit}</span>
              )}
              {card.badge && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
