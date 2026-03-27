"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Terminal, Zap } from "lucide-react";
import { type SovereignAction } from "@/lib/services/sovereign-protocol-enforcer";

interface SovereignAuditLogProps {
  actions: SovereignAction[];
}

export function SovereignAuditLog({ actions }: SovereignAuditLogProps) {
  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-pink/10 rounded-xl">
             <Shield className="w-4 h-4 text-brand-pink" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Autonomous Audit Trail</h4>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Real-time Sentient Self-Regulation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
           <span className="text-[9px] font-black text-brand-pink uppercase tracking-widest">Enforcer Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
        <AnimatePresence initial={false}>
          {actions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-brand-pink/30 hover:bg-brand-pink/5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest bg-brand-pink/10 px-1.5 py-0.5 rounded">
                      {action.protocolType}
                    </span>
                    <span className="text-[9px] text-white/20 uppercase font-black">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-white/90 font-bold leading-relaxed">
                    <span className="text-brand-green">{action.specimenNickname}</span>: {action.actionTaken}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white/40">
                    <Zap className="w-3 h-3 text-brand-pink/60" />
                    Impact: <span className="text-white/70 italic">{action.impact}</span>
                  </div>
                </div>
                {action.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-1" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {actions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/20 opacity-40 py-20 translate-y-20 scale-110">
            <Terminal className="w-12 h-12 mb-4 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for telemetry...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Encrypted Audit Chain</span>
        <div className="flex items-center gap-4 text-[9px] font-black text-white/40 uppercase tracking-tighter">
           <span>Lat: 0.1ms</span>
           <span>Sync: 100%</span>
        </div>
      </div>
    </div>
  );
}
