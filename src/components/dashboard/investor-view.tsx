"use client";

import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  PieChart,
  ShieldCheck,
  Zap,
  LucideIcon,
  ArrowUpRight
} from "lucide-react";
import type { SpecimenRow } from "@/app/actions/types";
import { useMemo } from "react";
import { valuationEngine } from '@/lib/services/valuation-engine';
import { forecasting } from '@/lib/services/forecasting-engine';


interface InvestorViewProps {
  specimens: SpecimenRow[];
}

export function InvestorView({ specimens }: InvestorViewProps) {
  // Real Financial Metrics calculated from Specimen Collection
  const metricsData = useMemo(() => {
    const totalAssets = specimens.length;
    const portfolioValue = specimens.reduce((sum, s) => sum + valuationEngine.calculateValuation(s).totalValuation, 0);
    const averageEfficiency = specimens.length > 0
      ? specimens.reduce((sum, s) => sum + forecasting.calculateEfficiency(s), 0) / specimens.length
      : 0;

    const projectedROA = (averageEfficiency * 15).toFixed(1); // Simulated 15% alpha scaling
    const projectedValue = specimens.reduce((sum, s) => {
      return sum + valuationEngine.projectAppreciation(s, 12);
    }, 0);

    const roa = portfolioValue > 0 ? ((projectedValue - portfolioValue) / portfolioValue) * 100 : 0;

    return {
      totalAssets,
      portfolioValue,
      roa: roa.toFixed(1),
      marketLiquidity: (portfolioValue * 0.8).toLocaleString() + " GC",
      averageEfficiency,
      projectedROA
    };
  }, [specimens]);

  const { portfolioValue, roa, marketLiquidity, averageEfficiency, projectedROA } = metricsData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem
          icon={DollarSign}
          label="Portfolio Value"
          value={`$${portfolioValue.toLocaleString()}`}
          trend="+12.4%"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KPIItem
          icon={TrendingUp}
          label="Botanical ROA"
          value={`${roa}%`}
          trend="Institutional"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KPIItem
          icon={Globe}
          label="L2 Liquidity"
          value={marketLiquidity}
          trend="Active"
          color="text-brand-pink-dark"
          bg="bg-brand-pink/10"
        />
        <KPIItem
          icon={ShieldCheck}
          label="Assurance Level"
          value="AAA"
          trend="Insured"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-brand-dark text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
            <p className="text-zinc-500 text-sm font-medium mb-1">Portfolio Alpha</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-white">{projectedROA}%</h3>
              <span className="text-green-400 text-sm font-bold flex items-center gap-1 mb-1">
                <ArrowUpRight size={16} />
                {(averageEfficiency * 2).toFixed(1)}%
              </span>
            </div>
            <p className="text-zinc-600 text-xs mt-2 font-mono uppercase">Target ROA (12m Forecast)</p>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black mb-1">Asset Appreciation</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Biological Growth vs Market Value</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-tighter">12 Months</span>
                <span className="px-3 py-1 bg-brand-green text-white rounded-lg text-[10px] font-black uppercase tracking-tighter">Projections</span>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-64 flex items-end gap-2 border-b border-white/10 pb-4 mb-4">
              {[40, 45, 38, 55, 65, 60, 80, 85, 95, 100].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-gradient-to-t from-brand-green/20 to-brand-green rounded-t-lg transition-all hover:scale-105"
                  style={{ height: `${h}%` } as React.CSSProperties}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>Q1 2025</span>
              <span>Q4 2025</span>
              <span>Projected Q1 2026</span>
            </div>
          </div>
        </div>

        {/* Asset Diversification */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-8">
            {/* Mock Donut Chart */}
            <div className="absolute inset-0 border-[16px] border-emerald-500 rounded-full" />
            <div className="absolute inset-0 border-[16px] border-amber-500 rounded-full border-t-transparent border-l-transparent -rotate-45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <PieChart className="w-8 h-8 text-brand-dark mb-1" />
              <span className="text-2xl font-black text-brand-dark">94.2%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Diversified</span>
            </div>
          </div>
          <div className="w-full space-y-4">
            <DiversificationItem label="Rare Botany" percentage={65} color="bg-emerald-500" />
            <DiversificationItem label="Premium Fungi" percentage={25} color="bg-amber-500" />
            <DiversificationItem label="L2 Escrow" percentage={10} color="bg-brand-pink" />
          </div>
        </div>
      </div>

      {/* Investor Quick Actions */}
      <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/30">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-1">Institutional Liquification</h3>
            <p className="text-white/80 font-bold text-sm">Convert your entire laboratory into L2 Digital Assets with 1-click verification.</p>
          </div>
        </div>
        <button className="relative z-10 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all shadow-xl">
          Execute Batch Exit
        </button>
      </div>
    </div>
  );
}

function KPIItem({ icon: Icon, label, value, trend, color, bg }: { icon: LucideIcon, label: string, value: string, trend: string, color: string, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-slate-50 rounded-lg ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-brand-dark group-hover:scale-105 transition-transform origin-left">{value}</div>
    </div>
  );
}

function DiversificationItem({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="flex-1 text-left text-xs font-bold text-brand-dark/60">{label}</span>
      <span className="text-xs font-black text-brand-dark">{percentage}%</span>
    </div>
  );
}
