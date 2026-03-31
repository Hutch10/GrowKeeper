import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  label?: string;
  strokeWidth?: number;
}

export function SparklineChart({ 
  data, 
  color = '#10B981', 
  height = 60, 
  width = 200,
  label,
  strokeWidth = 2
}: SparklineChartProps) {
  const points = useMemo(() => {
    if (data.length === 0) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");
  }, [data, width, height]);

  const gradientId = useMemo(() => `spark-grad-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className="flex flex-col gap-2 group">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors uppercase">
            {label}
          </span>
          <span className="text-[10px] font-black text-white/10 group-hover:text-emerald-500/40 transition-colors">
            48H Telemetry
          </span>
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 p-2 transition-all group-hover:bg-white/[0.04]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full transition-all duration-700 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            d={`M0,${height} ${points} L${width},${height} Z`}
            fill={`url(#${gradientId})`}
          />

          {/* Line */}
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ 
              filter: `drop-shadow(0 0 4px ${color}44)` 
            }}
          />

          {/* Grid Intersect Markers (Subtle) */}
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="white" strokeOpacity="0.05" strokeDasharray="2,4" />
        </svg>
      </div>
    </div>
  );
}
