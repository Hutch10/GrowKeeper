import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, ClipboardCheck, Activity } from 'lucide-react';
import { DashboardKPIs } from '@/lib/services/dashboard-stats';

interface KPIStripProps {
  kpis: DashboardKPIs;
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export function KPIStrip({ kpis, onFilterChange, activeFilter }: KPIStripProps) {
  const items = [
    { 
      id: 'due', 
      label: 'Watering Needed', 
      value: `${kpis.dueToday} Plants`, 
      icon: Droplets, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-100' 
    },
    { 
      id: 'tasks', 
      label: 'New Tasks', 
      value: `${kpis.totalSpecimens > 0 ? 1 : 0} Task`, 
      icon: ClipboardCheck, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-100' 
    },
    { 
      id: 'health', 
      label: 'Humidity Level', 
      value: '58%', 
      subValue: 'Good',
      icon: Activity, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-100' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {items.map((kpi) => (
        <motion.button
          key={kpi.id}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange(kpi.id)}
          className={`flex flex-col gap-6 p-8 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group shadow-sm ${
            activeFilter === kpi.id 
              ? `${kpi.bgColor} ${kpi.borderColor} dark:bg-emerald-900/40 dark:border-white/20` 
              : 'bg-white border-slate-50 dark:bg-white/5 dark:border-white/5 hover:border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-2xl ${kpi.bgColor} dark:bg-white/10 border ${kpi.borderColor} dark:border-white/10`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color} dark:text-white`} />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                {kpi.value.split(' ')[0]}
              </span>
              <span className="text-sm font-bold text-slate-400 dark:text-white/40 ml-1">
                {kpi.value.split(' ').slice(1).join(' ')}
              </span>
              {kpi.subValue && (
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {kpi.subValue}
                </span>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-white/20 group-hover:text-slate-600 transition-colors mt-2">
              {kpi.label}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
