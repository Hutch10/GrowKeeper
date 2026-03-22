'use client';

import { MonitoringDashboard } from '@/components/marine/MonitoringDashboard';

export default function MonitorPage() {
  return (
    <div className="bg-black min-h-screen py-24 px-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-30" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">SOVEREIGN_MONITOR</h1>
          <p className="text-emerald-500/50 uppercase text-[10px] tracking-widest">RAIS GENESIS // REAL_TIME_OBSERVABILITY</p>
        </div>
        <MonitoringDashboard />
      </div>
    </div>
  );
}
