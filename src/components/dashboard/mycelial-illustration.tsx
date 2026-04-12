"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function MycelialIllustration() {
  return (
    <div className="relative w-full h-[300px] flex items-center justify-center overflow-hidden rounded-[3rem]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent blur-3xl opacity-30" />
      
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[500px]"
      >
        {/* Network Nodes */}
        <AnimateNode cx={200} cy={150} delay={0} size={8} />
        <AnimateNode cx={120} cy={100} delay={0.2} size={6} />
        <AnimateNode cx={300} cy={120} delay={0.4} size={5} />
        <AnimateNode cx={150} cy={220} delay={0.6} size={6} />
        <AnimateNode cx={280} cy={200} delay={0.8} size={7} />

        {/* Connections (Hyphae) */}
        <AnimateConnection x1={200} y1={150} x2={120} y2={100} delay={1} />
        <AnimateConnection x1={200} y1={150} x2={300} y2={120} delay={1.2} />
        <AnimateConnection x1={200} y1={150} x2={150} y2={220} delay={1.4} />
        <AnimateConnection x1={200} y1={150} x2={280} y2={200} delay={1.6} />
        <AnimateConnection x1={120} y1={100} x2={300} y2={120} delay={2} />
        <AnimateConnection x1={150} y1={220} x2={280} y2={200} delay={2.2} />

        {/* Pulse Effect Lines */}
        <motion.circle
          cx="200"
          cy="150"
          r="100"
          stroke="url(#pulseGradient)"
          strokeWidth="0.5"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <defs>
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>
          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      <div className="absolute bottom-8 text-center px-6">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">No Bio-Signals Detected</h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em]">Registry awaits first specimen injection</p>
      </div>
    </div>
  );
}

function AnimateNode({ cx, cy, delay, size }: { cx: number, cy: number, delay: number, size: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={size}
      fill="url(#nodeGradient)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 1, type: "spring" }}
      className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
    />
  );
}

function AnimateConnection({ x1, y1, x2, y2, delay }: { x1: number, y1: number, x2: number, y2: number, delay: number }) {
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#10b981"
      strokeWidth="1"
      strokeOpacity="0.2"
      strokeDasharray={length}
      initial={{ strokeDashoffset: length }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ delay, duration: 2, ease: "easeInOut" }}
    />
  );
}
