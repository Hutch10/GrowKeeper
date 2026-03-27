"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  ArrowUpRight, 
  FileCheck,
  BrainCircuit,
  Scale,
  Activity
} from "lucide-react";
import { creditLineService, type CreditLine } from "@/lib/services/credit-line";
import { aiGovernanceService } from "@/lib/services/ai-governance";
import { toast } from "sonner";

export function UnderwritingPanel() {
  const [creditLines, setCreditLines] = useState<CreditLine[]>([]);
  const [kingdomRisks, setKingdomRisks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [lines, risks] = await Promise.all([
        creditLineService.getActiveCreditLines(),
        aiGovernanceService.getKingdomRiskScores()
      ]);
      setCreditLines(lines);
      setKingdomRisks(risks);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleRequestIncrease = async (line: CreditLine) => {
    const newLimit = line.limit * 1.25; // Request 25% increase
    const result = await creditLineService.requestCreditIncrease(line, newLimit);
    
    if (result.success) {
      toast.success("Credit Request Synchronized", {
        description: result.message,
      });
    } else {
      toast.error("Request Rejected", {
        description: result.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="w-8 h-8 border-4 border-white/10 border-t-brand-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/50 mb-2">Institutional Underwriting</h3>
            <p className="text-3xl font-black text-white tracking-tighter">Sovereign Credit Engine</p>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">RAIS Compliant</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sentient Risk Scoring</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-pink/10 border border-brand-pink/20 p-8 rounded-[2.5rem]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-pink mb-4">Registry Volatility</h4>
          <div className="space-y-4">
            {Object.entries(kingdomRisks).map(([kingdom, score]) => (
              <div key={kingdom} className="flex items-center justify-between">
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{kingdom}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-pink" 
                      style={{ width: `${score}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/80">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Lines Table */}
      <div className="bg-black/20 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Credit Facilities</h3>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-white/20" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">LTV Optimized</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Facility ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Utilization</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Credit Limit</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {creditLines.map((line) => (
                <tr key={line.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-white tracking-widest">{line.id}</p>
                    <p className="text-[9px] text-white/20 font-mono uppercase mt-1">{line.holderId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${line.utilization / line.limit > 0.9 ? 'bg-red-500' : 'bg-brand-green'}`} 
                          style={{ width: `${(line.utilization / line.limit) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-white/60">
                        {((line.utilization / line.limit) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-white">{line.limit.toLocaleString()} GC</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      line.status === 'ACTIVE' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {line.status === 'ACTIVE' ? <FileCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {line.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleRequestIncrease(line)}
                      className="p-3 bg-white/5 hover:bg-brand-green hover:text-black rounded-xl transition-all text-white/40"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center gap-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Health Impact</p>
            <p className="text-xs font-black text-white leading-relaxed">
              Autonomous collateral yields are up <span className="text-brand-green">+14.2%</span> this epoch due to high Care Consistency scores.
            </p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center gap-6">
          <div className="p-4 bg-brand-pink/10 rounded-2xl text-brand-pink">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Risk Projection</p>
            <p className="text-xs font-black text-white leading-relaxed">
              Fungal Registry volatility is stabilizing. Projected credit expansion: <span className="text-brand-pink">400,000 GC</span> next quarter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
