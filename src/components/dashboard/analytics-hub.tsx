"use client";

import { DollarSign, Activity, ArrowUpRight, Target, Shield, Radio } from "lucide-react";

export function AnalyticsHub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {/* Sentient Resilience (Hegemony Metric) */}
      <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
          <Shield className="w-32 h-32 text-brand-pink" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-pink mb-4">
            <Radio className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sentient Resilience</span>
          </div>
          <h4 className="text-4xl font-black italic tracking-tight">99.8<span className="text-xl">%</span></h4>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Immune to standard Sybil spoofing
          </p>
        </div>
      </div>

      {/* Biological TVL (Total Value Locked) */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
          <DollarSign className="w-32 h-32 text-brand-green" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-green mb-4">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Biological TVL</span>
          </div>
          <div className="flex items-end gap-3">
            <h4 className="text-4xl font-black text-brand-dark italic tracking-tight">$825.4K</h4>
            <div className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black mb-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              HEGEMON
            </div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            Top 0.1% across major shards
          </p>
        </div>
      </div>

      {/* Competitive Dominance */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-pink mb-4">
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Competitive Dominance</span>
          </div>
          <h4 className="text-4xl font-black text-brand-dark italic tracking-tight">Tier-1</h4>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            Anti-Poaching Protocols ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
