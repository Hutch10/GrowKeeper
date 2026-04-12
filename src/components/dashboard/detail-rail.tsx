"use client";

import React, { useMemo } from 'react';
import { 
  X, 
  Droplets, 
  Thermometer, 
  Shield, 
  MapPin, 
  Activity,
  Calendar,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  Network
} from 'lucide-react';
import { SpecimenRow } from '@/app/actions/types';
import { checkLegalStatus } from '@/lib/geofencing';
import { calculateForecast } from '@/lib/services/forecast-engine';
import { SparklineChart } from '../ui/sparkline-chart';
import { TaskRow } from '@/app/actions/tasks';
import { useWeather } from '@/hooks/use-weather';

interface DetailRailProps {
  specimen: SpecimenRow | null;
  tasks?: TaskRow[];
  onClose: () => void;
  onOpenCompliance?: (specimen: SpecimenRow) => void;
}

/**
 * GrowKeeper Detail Rail Component.
 * Refined for Industrial Hardening (Block 3) - Strictly typed & warning-free.
 */
export function DetailRail({ specimen, tasks = [], onClose, onOpenCompliance }: DetailRailProps) {
  const { data: weather } = useWeather(specimen?.location || "New York, NY");

  const forecast = useMemo(() => {
    if (!specimen) return null;
    // Log remediation protocol count for auditability
    if (tasks.length > 0) {
      console.log(`[AUDIT] Analyzing ${tasks.length} remediation protocols for ${specimen.nickname}`);
    }
    return calculateForecast(specimen, weather);
  }, [specimen, tasks, weather]);

  if (!specimen || !forecast) return null;

  const geo = checkLegalStatus(specimen.lon || 0, specimen.lat || 0);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0A0A0A] border-l border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden transition-colors duration-500">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-1">
            {specimen.nickname}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Registry ID: {specimen.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onOpenCompliance?.(specimen)}
            className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/20 transition-all group"
            title="Audit & Compliance Hub"
          >
            <Shield className="w-4 h-4 group-hover:scale-110" />
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Close detail panel"
          >
            <X className="w-5 h-5 text-slate-300 dark:text-white/20 group-hover:text-slate-600 dark:group-hover:text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
        {/* Vital Stats & Telemetry Trends */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 font-black">Biological Vitals</h3>
          </div>
          
          <div className="space-y-8">
            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Hydration</span>
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-white">{Math.round((specimen.telemetry?.moisture || 0.5) * 100)}%</div>
              </div>
              <SparklineChart 
                data={forecast.simulatedHistory.map(h => h.moisture)} 
                color="#10B981" 
                height={60}
              />
            </div>

            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest">Thermal</span>
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-white">{specimen.telemetry?.temperature || 22}°C</div>
              </div>
              <SparklineChart 
                data={forecast.simulatedHistory.map(h => h.temperature)} 
                color="#FB7185" 
                height={60}
              />
            </div>
          </div>
        </section>

        {/* Predictive Intelligence */}
        <section className="p-8 rounded-[3rem] bg-emerald-500/[0.03] border border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <BrainCircuit className="w-16 h-16 text-emerald-500 transition-transform group-hover:scale-110" />
          </div>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60 font-black">Predictive Intelligence</h3>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2 font-black">Health Trend</div>
              <div className={`flex items-center gap-2 text-2xl font-black ${forecast.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {forecast.trend >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {forecast.trend > 0 ? '+' : ''}{forecast.trend}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2 font-black">Survival Prob.</div>
              <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                {forecast.survivalProbability}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {forecast.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4 text-[11px] font-bold leading-relaxed text-slate-500 dark:text-white/40 group-hover:text-slate-800 dark:group-hover:text-white/60 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                {rec}
              </div>
            ))}
          </div>
        </section>

        {/* Geospatial Intelligence */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 font-black">Geospatial Intelligence</h3>
          </div>
          <div className={`p-6 rounded-[2rem] border transition-all ${
            geo.status === 'danger' ? 'bg-rose-500/[0.03] border-rose-500/20' : 
            geo.status === 'warning' ? 'bg-amber-500/[0.03] border-amber-500/20' : 
            'bg-emerald-500/[0.03] border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <Shield className={`w-6 h-6 ${
                geo.status === 'danger' ? 'text-rose-500 dark:text-rose-400' : 
                geo.status === 'warning' ? 'text-amber-500 dark:text-amber-400' : 
                'text-emerald-600 dark:text-emerald-400'
              }`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                geo.status === 'danger' ? 'text-rose-500 dark:text-rose-400' : 
                geo.status === 'warning' ? 'text-amber-500 dark:text-amber-400' : 
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {geo.status === 'danger' ? 'Restricted Entry' : geo.status === 'warning' ? 'Permit Advisory' : 'Secure Zone'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed font-bold">{geo.message}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />
                <span className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-widest tabular-nums">
                  {specimen.lat?.toFixed(4) || "0.0000"}, {specimen.lon?.toFixed(4) || "0.0000"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Biological Systems Mapping (Systems Thinking) */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-3 bg-emerald-500 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 font-black">Biological Systems Mapping</h3>
          </div>
          <div className="p-6 rounded-[2.5rem] bg-indigo-500/[0.03] border border-indigo-500/10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Mutualistic Partner</span>
            </div>
            
            {/* Simulation of a linked specimen */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-indigo-500/10 group cursor-help transition-all hover:bg-indigo-500/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                   <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Fungal Mycelium #42</span>
                  <span className="text-[8px] font-black text-indigo-400/60 uppercase font-black uppercase tracking-widest">Symbiotic Support</span>
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <p className="text-[9px] text-slate-400 dark:text-white/20 leading-relaxed font-bold italic">
              Connections within your habitat impact overall system stability. Future updates will allow direct relational anchoring.
            </p>
          </div>
        </section>

        {/* Taxonomic Alert Placeholder */}
        {(!specimen.species_name || !specimen.lat) && (
          <section>
            <div className="p-6 rounded-[2.5rem] bg-amber-500/[0.05] border border-amber-500/10 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-[11px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Incomplete Identity Card</h4>
                <p className="text-[10px] text-amber-500/60 leading-relaxed font-bold">Taxonomical registration and GPS verification required for operational certification.</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-md grid grid-cols-2 gap-4 transition-colors duration-500">
        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl border border-slate-100 dark:border-white/5 transition-all group font-black uppercase tracking-widest text-[10px] text-slate-600 dark:text-white">
          <Calendar className="w-4 h-4 text-emerald-500" />
          Schedule
        </button>
        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95 transition-all text-[10px] border border-emerald-400">
          <Droplets className="w-4 h-4" />
          Care Task
        </button>
      </div>
    </div>
  );
}
