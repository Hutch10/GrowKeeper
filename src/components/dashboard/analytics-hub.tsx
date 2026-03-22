"use client";

import { TrendingUp, DollarSign, Activity, ArrowUpRight, Target } from "lucide-react";

export function AnalyticsHub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {/* Portfolio Value */}
      <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
          <DollarSign className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-green mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Net Worth</span>
          </div>
          <h4 className="text-4xl font-black italic tracking-tight">$12,450.00</h4>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            +18% since last month
          </p>
        </div>
      </div>

      {/* Asset Velocity */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-pink mb-4">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Growth Velocity</span>
          </div>
          <div className="flex items-end gap-3">
            <h4 className="text-4xl font-black text-brand-dark italic tracking-tight">4.2x</h4>
            <div className="px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-full text-[10px] font-black mb-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              ELITE
            </div>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            Propagations ready: 12
          </p>
        </div>
      </div>

      {/* Market Domain */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-green mb-4">
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Market Influence</span>
          </div>
          <h4 className="text-4xl font-black text-brand-dark italic tracking-tight">92<span className="text-xl">th</span></h4>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
            Global Rank among Master Growers
          </p>
        </div>
      </div>
    </div>
  );
}
