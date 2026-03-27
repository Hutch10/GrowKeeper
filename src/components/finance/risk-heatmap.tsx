"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Zap,
  Activity,
  ChevronRight,
  BrainCircuit
} from "lucide-react";
import { aiGovernanceService, type RiskProposal } from "@/lib/services/ai-governance";

export function RiskHeatmap() {
  const [proposals, setProposals] = useState<RiskProposal[]>([]);
  const [kingdomRisks, setKingdomRisks] = useState<Record<string, number>>({});
  const [vitality, setVitality] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const [p, r, v] = await Promise.all([
        aiGovernanceService.generateRiskProposals(),
        aiGovernanceService.getKingdomRiskScores(),
        aiGovernanceService.calculateVitalityScore()
      ]);
      setProposals(p);
      setKingdomRisks(r);
      setVitality(v);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Vitality Gauge */}
      <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
          <BrainCircuit className="w-16 h-16 text-brand-green" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Global Registry Vitality</span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          </div>
          <div className="flex items-end gap-3">
            <p className="text-5xl font-black text-white tracking-tighter">{vitality.toFixed(1)}%</p>
            <p className={`text-xs font-black mb-2 uppercase ${vitality > 85 ? 'text-brand-green' : 'text-brand-pink'}`}>
              {vitality > 85 ? "Optimal" : "Stable-Drift"}
            </p>
          </div>
          <p className="text-[10px] text-white/20 mt-2 uppercase tracking-[0.2em]">Sentient AI Probability Distribution</p>
        </div>
      </div>

      {/* Kingdom Risk Grid */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(kingdomRisks).map(([kingdom, risk]) => (
          <div key={kingdom} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{kingdom}</span>
              <Activity className={`w-3 h-3 ${risk > 20 ? 'text-brand-pink' : 'text-brand-green'}`} />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${risk > 20 ? 'bg-brand-pink' : 'bg-brand-green'}`} 
                  style={{ width: `${risk}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono text-white/60">{risk}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Proposals */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3 text-brand-pink" />
          Sentient Risk Recommendations
        </h4>
        
        {proposals.length === 0 ? (
          <div className="p-8 border border-dashed border-white/5 rounded-3xl text-center opacity-40">
            <p className="text-[9px] font-black uppercase tracking-widest">Analyzing Biological Variance...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(prop => (
              <div key={prop.id} className="bg-brand-pink/10 border border-brand-pink/20 p-5 rounded-3xl group hover:bg-brand-pink/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-pink" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{prop.type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[9px] font-black text-brand-pink px-2 py-0.5 bg-brand-pink/20 rounded-full">{(prop.confidence * 100).toFixed(0)}% CONFIDENCE</span>
                </div>
                <p className="text-[10px] text-white/60 mb-3 leading-relaxed">{prop.reason}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-white/20 uppercase">Adjustment</span>
                    <p className="text-xs font-black text-white">{prop.currentValue} → {prop.proposedValue}</p>
                  </div>
                  <button className="p-2 bg-brand-pink text-white rounded-xl shadow-xl shadow-brand-pink/20 hover:scale-105 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
