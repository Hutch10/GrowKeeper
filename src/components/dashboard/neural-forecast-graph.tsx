"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, AlertCircle, Sparkles, Activity } from "lucide-react";
import { type HealthForecast } from "@/lib/services/health-forecast-service";

interface NeuralForecastGraphProps {
  forecast: HealthForecast;
}

export function NeuralForecastGraph({ forecast }: NeuralForecastGraphProps) {
  const maxVitality = 100;
  
  return (
    <div className="space-y-6 group/graph">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-brand-pink/10 flex items-center justify-center border border-brand-pink/20">
            <Sparkles className="w-3 h-3 text-brand-pink animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 leading-none">Neural Prophecy</h4>
            <p className="text-[8px] font-medium text-white/20 uppercase tracking-widest mt-1">Stochastic Drift Analysis</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
            forecast.criticalFailureRisk > 0.5 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-brand-green/10 text-brand-green border border-brand-green/20'
          }`}>
            {forecast.criticalFailureRisk > 0.5 ? <AlertCircle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {forecast.criticalFailureRisk > 0.5 ? 'Critical Prophecy' : 'Stable Prophecy'}
          </div>
          <div className="text-[8px] font-black text-white/10 uppercase tracking-tighter">Confidence: {forecast.points[0].confidence}%</div>
        </div>
      </div>

      <div className="h-32 flex items-baseline justify-between gap-2 px-2 relative">
        {/* Glow Mesh Background */}
        <div className="absolute inset-x-0 -bottom-4 h-24 bg-brand-pink/5 blur-3xl rounded-full opacity-0 group-hover/graph:opacity-100 transition-opacity duration-1000" />
        
        {/* Background Grid */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
           {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-white" />)}
        </div>

        {forecast.points.map((point, index) => (
          <div key={point.day} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
            <div className="flex-1 w-full bg-white/[0.02] rounded-t-xl relative overflow-hidden border-x border-t border-white/5 group-hover:border-white/10 transition-colors">
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: `${(point.vitality / maxVitality) * 100}%` }}
                 transition={{ delay: index * 0.05, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                 className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                   point.vitality < 30 ? 'bg-gradient-to-t from-red-500/60 via-red-500/30 to-red-400/10' : 
                   point.vitality < 50 ? 'bg-gradient-to-t from-orange-500/60 via-orange-500/30 to-orange-400/10' :
                   'bg-gradient-to-t from-brand-green/50 via-brand-green/20 to-brand-green/5'
                 }`}
               >
                 {/* Internal pulse line */}
                 <div className="absolute top-0 left-0 right-0 h-px bg-white/40 shadow-[0_0_10px_white]" />
               </motion.div>
               
               {/* Reflection/Neural line */}
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5 group-hover:bg-brand-pink/30 transition-all" />
            </div>
            
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter group-hover:text-white/60 transition-colors">
                {point.day}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-brand-pink/40 transition-colors" />
            </div>
            
            {/* Tooltip on hover */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-2xl backdrop-blur-xl ${
              point.vitality < 50 ? 'bg-red-950/80' : 'bg-black/80'
            }`}>
               <div className="flex flex-col items-center gap-0.5">
                 <span className="text-[9px] font-black text-white">{point.vitality}% Vitality</span>
                 <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{point.confidence}% CONF</span>
               </div>
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit border-b border-r border-white/10 rotate-45" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-brand-pink/5 border border-brand-pink/10 rounded-2xl relative overflow-hidden group/insight hover:border-brand-pink/30 transition-all col-span-2 md:col-span-1">
          <div className="flex items-start gap-3">
            <TrendingDown className={`w-4 h-4 mt-0.5 ${forecast.criticalFailureRisk > 0.5 ? 'text-red-400 animate-pulse' : 'text-brand-pink/60'}`} />
            <div className="space-y-1">
              <h5 className="text-[9px] font-black text-brand-pink uppercase tracking-widest">Neural Insight</h5>
              <p className="text-[11px] text-white/80 font-bold leading-relaxed">
                {forecast.neuralInsight}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-pink/20 blur-2xl rounded-full opacity-0 group-hover/insight:opacity-100 transition-opacity" />
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between group/entropy hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Entropy Level</span>
            <Activity className={`w-3 h-3 ${forecast.criticalFailureRisk > 0.5 ? 'text-red-400' : 'text-brand-green'}`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-white tabular-nums leading-none">
                {(forecast.criticalFailureRisk * 100).toFixed(1)}%
              </span>
              <span className="text-[8px] font-bold text-white/20 uppercase mb-1">Decay Prob.</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${forecast.criticalFailureRisk * 100}%` }}
                 className={`h-full rounded-full ${forecast.criticalFailureRisk > 0.5 ? 'bg-red-500' : 'bg-brand-green'}`}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
