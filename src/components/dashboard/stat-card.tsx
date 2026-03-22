"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subLabel: string;
  iconBg: string; // Tailwind color class e.g. "bg-emerald-100"
  iconColor: string; // Tailwind color class e.g. "text-emerald-600"
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  iconBg, 
  iconColor 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-[2rem] p-6 flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all hover:shadow-lg">
      <div className={`p-4 rounded-2xl ${iconBg}`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-brand-dark/50 mb-1">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-brand-dark leading-none">{value}</span>
          <span className={`text-sm font-bold ${iconColor === 'text-emerald-600' ? 'text-emerald-500' : 'text-brand-dark/30'}`}>
            {subLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
