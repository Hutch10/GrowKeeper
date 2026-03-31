import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, LayoutGrid, Clock, ChevronRight } from 'lucide-react';
import { PriorityItem } from '@/lib/services/dashboard-stats';

interface PriorityQueueProps {
  items: PriorityItem[];
  onItemClick: (specimenId: string) => void;
}

export function PriorityQueue({ items, onItemClick }: PriorityQueueProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'OVERDUE': return Clock;
      case 'FLAGGED': return Shield;
      case 'INCOMPLETE': return Database;
      default: return LayoutGrid;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'danger': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/50">Priority Command Queue</h2>
        </div>
        <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
          {items.length} ACTIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.length > 0 ? (
            items.map((item) => {
              const Icon = getIcon(item.type);
              const severityStyle = getSeverityStyle(item.severity);

              return (
                <motion.button
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onItemClick(item.specimenId)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-left flex items-start gap-4 group relative overflow-hidden"
                >
                  <div className={`p-2.5 rounded-xl border ${severityStyle} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${item.severity === 'danger' ? 'text-rose-400' : item.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.type}
                      </span>
                      <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-[11px] font-black text-white/90 truncate mb-0.5">{item.title}</h3>
                    <p className="text-[10px] text-white/40 font-medium leading-tight line-clamp-2">{item.subtitle}</p>
                  </div>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/5 text-center px-8">
              <Shield className="w-8 h-8 text-white/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">All Systems Clear</p>
              <p className="text-[9px] font-medium text-white/10 mt-2">Autonomous protocols maintaining baseline stability.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
