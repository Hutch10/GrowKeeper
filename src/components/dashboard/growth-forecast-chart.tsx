"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { DataPoint } from "@/lib/services/forecasting-engine";

interface GrowthForecastChartProps {
  data: DataPoint[];
  color?: string;
}

export function GrowthForecastChart({ data, color = "#10b981" }: GrowthForecastChartProps) {
  return (
    <div className="w-full h-48 bg-black/20 rounded-[1.5rem] border border-white/5 p-4 animate-in fade-in duration-1000">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            hide 
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-brand-dark/90 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl">
                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                      {new Date(payload[0].payload.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-black text-white">
                      Vitality: {payload[0].value?.toString().split('.')[0]}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-3 flex items-center justify-between px-2">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">12-Month Simulation Locked</span>
         </div>
         <span className="text-[8px] font-black text-white/40 uppercase">Sovereign Predict: v4.1</span>
      </div>
    </div>
  );
}
