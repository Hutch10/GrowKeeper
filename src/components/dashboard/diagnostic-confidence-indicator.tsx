"use client";

import React from 'react';
import { motion } from 'framer-motion';

export interface DiagnosticConfidenceIndicatorProps {
  confidence: number; // 0-1
  label?: string;
  className?: string;
}

/**
 * Truth-First UI Indicator (Phase 9)
 * High-fidelity visual gauge for system certainty.
 * Refined for Industrial Hardening (Block 3) - Removed inline styles.
 */
export const DiagnosticConfidenceIndicator: React.FC<DiagnosticConfidenceIndicatorProps> = ({ 
  confidence, 
  label = "System Certainty",
  className = "" 
}) => {
  const percentage = Math.round(confidence * 100);
  
  // Dynamic color logic (Red-Yellow-Green gradient transition)
  const getStatusColor = () => {
    if (confidence > 0.8) return "text-emerald-400 border-emerald-500/20";
    if (confidence > 0.5) return "text-amber-400 border-amber-500/20";
    return "text-rose-400 border-rose-500/20";
  };

  const getStatusBg = () => {
    if (confidence > 0.8) return "bg-emerald-500/10";
    if (confidence > 0.5) return "bg-amber-500/10";
    return "bg-rose-500/10";
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${getStatusColor()} ${getStatusBg()} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest opacity-70">
          {label}
        </span>
        <span className="text-lg font-mono font-black italic">
          {percentage}%
        </span>
      </div>
      
      {/* Precision Progress Bar */}
      <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${
            confidence > 0.8 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
            confidence > 0.5 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
            'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
          }`}
        />
      </div>

      <p className="mt-2 text-[10px] leading-tight opacity-60 uppercase font-medium">
        {confidence > 0.8 ? "Deterministic Biological Signal Verified" :
         confidence > 0.5 ? "Inferred Bayesian Probability (Likely)" :
         "Uncertain Biological Signal - Visual Audit Recommended"}
      </p>
    </div>
  );
};
