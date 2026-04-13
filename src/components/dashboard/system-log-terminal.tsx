"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Zap } from 'lucide-react';
import { useSystemLog, type LogEntry } from '@/hooks/use-system-log';

export function SystemLogTerminal() {
  const { logs, addLog } = useSystemLog();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial Boot Sequence
  useEffect(() => {
    if (isInitialized) return;
    
    const bootSequence = [
      { msg: "[SYSTEM] Initializing GrowKeeper Layer 1...", type: "system" },
      { msg: "[AUDIT] PROVENANCE_CHECK executed (16:21:24).", type: "system" },
      { msg: "[OK] Planetary Registry Initialized.", type: "system" },
      { msg: "[AUDIT] PROFINANCE_CHECK executed (16:31:58).", type: "system" },
      { msg: "[OK] Governance Audit Trace Active.", type: "system" },
      { msg: "[SYSTEM] Calibrating Mycelial Sensors...", type: "system" },
      { msg: "[OK] Core Integrity Certified.", type: "system" },
      { msg: "[SYSTEM] Syncing with Global Nodes...", type: "system" },
      { msg: "[OK] 12 Nodes Established. Latency: 24ms.", type: "system" },
      { msg: "[READY] Awaiting Operator Directives.", type: "system" }
    ];

    let delay = 0;
    bootSequence.forEach((step, i) => {
      setTimeout(() => {
        addLog(step.msg, step.type as LogEntry['type']);
        if (i === bootSequence.length - 1) setIsInitialized(true);
      }, (delay += Math.random() * 500 + 200));
    });
  }, [addLog, isInitialized]);

  // Periodic Heartbeat
  useEffect(() => {
    if (!isInitialized) return;

    const heartbeats = [
      "[INFO] Habitat humidity check completed. Nominal.",
      "[INFO] Alpha telemetry shard synchronized.",
      "[INFO] Sovereign enforcer performing routine scan...",
      "[OK] No genetic leakage detected."
    ];

    const interval = setInterval(() => {
       const msg = heartbeats[Math.floor(Math.random() * heartbeats.length)];
       addLog(msg, 'system');
    }, 15000 + Math.random() * 10000);

    return () => clearInterval(interval);
  }, [addLog, isInitialized]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-[200px] bg-black/90 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative group">
      {/* Terminal Glow Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Header */}
      <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <Terminal className="w-3.5 h-3.5 text-brand-pink" />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Autonomous System Log</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
            <span className="text-[8px] font-black text-brand-pink uppercase tracking-widest">Live Audit</span>
        </div>
      </div>

      {/* Log View */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono scrollbar-hide text-[10px] space-y-1.5"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 items-start leading-relaxed ${
                log.type === 'warn' ? 'text-amber-400' : 
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'event' ? 'text-emerald-400' : 
                log.type === 'audit' ? 'text-cyan-400 border-l-2 border-cyan-500/50 pl-2' :
                log.type === 'sync' ? 'text-brand-pink border-l-2 border-brand-pink/50 pl-2' :
                log.type === 'sentinel' ? 'text-white border-l-2 border-brand-pink pl-3 py-1 bg-brand-pink/5' :
                'text-emerald-500/80'
              }`}
              style={{ textShadow: (log.type === 'sentinel' || log.type === 'audit') ? 'none' : '0 0 10px currentColor' }}
            >
              <span className="opacity-30 shrink-0">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
              <div className="flex flex-col gap-1">
                {(log.type === 'sentinel' || log.type === 'audit') && (
                  <div className="flex gap-2 items-center mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${log.type === 'audit' ? 'text-cyan-500' : 'text-brand-pink'}`}>
                      {log.metadata?.provider_label || (log.type === 'audit' ? 'Audit Ledger' : 'Registry Sentinel')}
                    </span>
                    {log.metadata?.provenance && (
                      <span className="text-[7px] font-black bg-white/10 px-1.5 py-0.5 rounded text-white/50 uppercase">
                        Source: {log.metadata.provenance}
                      </span>
                    )}
                  </div>
                )}
                <span className="break-all whitespace-pre-wrap">
                  {log.message}
                  {log.metadata?.payload_hash && (
                    <span className="block text-[8px] opacity-30 mt-1 font-mono">HASH: {log.metadata.payload_hash.slice(0, 8)}...</span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Blinking Cursor */}
        <div className="flex gap-3 items-center">
          <span className="opacity-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-1.5 h-3 bg-emerald-500 shadow-[0_0_8px_#10b981]"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[7px] font-black text-white/20 uppercase tracking-widest">
           <span className="flex items-center gap-1"><Shield className="w-2 h-2" /> Encrypted Endpoint</span>
           <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> Alpha Finality</span>
        </div>
        <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.2em]">GrowKeeper v1.0.4-Sovereign</span>
      </div>
    </div>
  );
}
