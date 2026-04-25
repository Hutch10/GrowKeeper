"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Cpu, LucideIcon } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  status: 'pending' | 'completed';
}

import { useRouter } from 'next/navigation';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  status: 'pending' | 'completed';
}

export function SystemSuggestions({ onStartWizard }: { onStartWizard: () => void }) {
  const router = useRouter();
  const suggestions: Suggestion[] = [
    {
      id: 'first-specimen',
      title: 'Initialize First Culture',
      description: 'The registry requires biological telemetry to begin system analysis.',
      action: 'Add Specimen',
      icon: Zap,
      status: 'pending'
    },
    {
      id: 'sensor-calibration',
      title: 'Calibrate Regional Sensors',
      description: 'Sync with global satellite nodes to verify environmental data integrity.',
      action: 'Enter Platform',
      icon: Cpu,
      status: 'pending'
    },
    {
      id: 'sovereign-protocols',
      title: 'Activate Sovereign Protocols',
      description: 'Ensure hardware-level security is active for proprietary genetic data.',
      action: 'View Compliance',
      icon: ShieldCheck,
      status: 'pending'
    }
  ];

  const handleSuggestionClick = (id: string) => {
    if (id === 'first-specimen') onStartWizard();
    if (id === 'sensor-calibration') router.push('/telemetry');
    if (id === 'sovereign-protocols') {
       // Assuming it triggers a tab change if handled in parent, 
       // but here we can just push if it was a route
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6 px-4">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em]">Strategic Directives</h4>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-brand-pink rounded-full animate-pulse" />
           <span className="text-[9px] font-black text-brand-pink uppercase tracking-widest">Action Required</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] hover:border-brand-pink/30 hover:bg-brand-pink/5 transition-all cursor-pointer"
            onClick={() => handleSuggestionClick(suggestion.id)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-white/10 rounded-2xl group-hover:bg-brand-pink/10 transition-colors">
                <suggestion.icon className="w-5 h-5 text-slate-400 group-hover:text-brand-pink transition-colors" />
              </div>
              <h5 className="text-xs font-black uppercase text-slate-700 dark:text-white/80 tracking-widest">{suggestion.title}</h5>
            </div>
            
            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-white/40 font-medium mb-6">
              {suggestion.description}
            </p>

            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-pink opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
              <span>{suggestion.action}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
