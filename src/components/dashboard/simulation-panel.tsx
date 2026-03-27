"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  FastForward, 
  Leaf, 
  Wind, 
  Activity, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  LucideIcon
} from "lucide-react";
import { biosphereSimulatorService, type SimulationResult } from "@/lib/services/biosphere-simulator";

export function SimulationPanel() {
  const [dayOffset, setDayOffset] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = dayOffset >= 0 
        ? await biosphereSimulatorService.getSimulationData(dayOffset)
        : await biosphereSimulatorService.getHistoricalState(Math.abs(dayOffset));
      setResult(data);
    };
    
    const timeout = setTimeout(fetch, 100); // Debounce
    return () => clearTimeout(timeout);
  }, [dayOffset]);

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Time Context */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-pink/10 rounded-2xl group-hover:bg-brand-pink/20 transition-colors">
            <Clock className="w-5 h-5 text-brand-pink" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Biosphere Projection</h3>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">Temporal Drift Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
           <span className={`text-xl font-black tabular-nums transition-all duration-500 ${dayOffset === 0 ? 'text-white' : dayOffset > 0 ? 'text-brand-pink' : 'text-brand-green'}`}>
              {dayOffset > 0 ? `+${dayOffset}` : dayOffset} Days
           </span>
           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Temporal Offset</span>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SimMetric 
            icon={Activity} 
            label="Planetary Vitality" 
            value={result?.planetaryVitality.toFixed(1) + "%" || "0%"} 
            trend={dayOffset >= 0 ? "decline" : "stable"} 
          />
          <SimMetric 
            icon={Wind} 
            label="CO2 Sequestration" 
            value={result?.co2Sequestration.toFixed(1) + " ppm" || "0"} 
            trend={dayOffset > 0 ? "improve" : "stable"} 
          />
          <SimMetric 
            icon={Leaf} 
            label="Biomass Delta" 
            value={(result?.biomassDelta || 0) > 0 ? `+${result?.biomassDelta.toFixed(2)}k t` : `${result?.biomassDelta.toFixed(2)}k t`} 
            trend={dayOffset > 0 ? "improve" : "decline"} 
          />
        </div>

        {/* Alerts & Drift Insights */}
        <div className="p-6 bg-brand-pink/5 border border-brand-pink/10 rounded-[2.5rem] flex flex-col justify-between shadow-[0_10px_40px_rgba(236,72,153,0.1)]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-brand-pink" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Drift Insights</span>
            </div>
            
            <div className="space-y-3">
              {result?.driftAlerts.map((alert, i) => (
                <div key={i} className="flex gap-3 text-[11px] font-bold text-white/50 leading-tight">
                  <span className="text-brand-pink">•</span>
                  {alert}
                </div>
              ))}
              {result?.driftAlerts.length === 0 && (
                <p className="text-[11px] text-white/20 uppercase font-black italic">No critical drift detected.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
             <span>Probability Core: 89.2%</span>
             <span className="text-brand-pink/40 animate-pulse">Sim-Enclave Active</span>
          </div>
        </div>
      </div>

      {/* Time Travel Slider Control */}
      <div className="space-y-4 pt-4 mt-auto">
        <div className="flex justify-between items-center text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">
          <div className="flex items-center gap-2">
            <History className="w-3 h-3" />
            Historical Baseline
          </div>
          <div className="flex items-center gap-2">
            Future Projection
            <FastForward className="w-3 h-3" />
          </div>
        </div>

        <div className="relative group p-4 bg-white/5 rounded-3xl border border-white/5">
          <input 
            type="range"
            min="-365"
            max="365"
            value={dayOffset}
            onChange={(e) => setDayOffset(parseInt(e.target.value))}
            title="Time Travel Slider"
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-pink hover:accent-white transition-all shadow-glow"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {dayOffset === 0 && (
              <div className="px-2 py-0.5 bg-brand-pink text-white text-[8px] font-black uppercase rounded shadow-lg shadow-brand-pink/40">Current State</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimMetric({ icon: Icon, label, value, trend }: { icon: LucideIcon, label: string, value: string, trend: 'improve' | 'decline' | 'stable' }) {
  const isPositive = trend === 'improve';
  
  return (
    <div className={`p-5 bg-white/5 border border-white/5 rounded-3xl group transition-all hover:scale-[1.02] ${isPositive ? 'hover:border-brand-green/30 hover:bg-brand-green/5' : 'hover:border-brand-pink/30 hover:bg-brand-pink/5'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 transition-colors ${isPositive ? 'text-brand-green/50 group-hover:text-brand-green' : 'text-brand-pink/50 group-hover:text-brand-pink'}`} />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
        </div>
        {trend !== 'stable' && (
          trend === 'improve' ? <TrendingUp className="w-3 h-3 text-brand-green drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <TrendingDown className="w-3 h-3 text-brand-pink animate-bounce-slow" />
        )}
      </div>
      <div className={`text-2xl font-black tabular-nums tracking-tighter transition-colors ${isPositive ? 'text-white' : 'text-brand-pink'}`}>
        {value}
      </div>
    </div>
  );
}
