import { 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ValuationEngine, type ValuationReport } from "@/lib/services/valuation-engine";
import type { SpecimenRow } from "@/app/actions/types";

interface SovereignStatsProps {
  specimens: SpecimenRow[];
  className?: string;
}

export function SovereignStats({ specimens, className }: SovereignStatsProps) {
  const [report, setReport] = useState<ValuationReport | null>(null);

  useEffect(() => {
    const fetchWorth = async () => {
      const result = await ValuationEngine.calculateWorth(specimens);
      setReport(result);
    };
    fetchWorth();
  }, [specimens]);

  if (!report) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="tactical-panel p-4 border-white/5 bg-black/40 h-24 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`}>
      {/* Total Valuation Card */}
      <div className="tactical-panel p-4 border-white/5 bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-12 h-12 text-brand-green" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-brand-green" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sovereign Asset Valuation</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-black text-brand-green">$</span>
          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
            {report.totalWorthUSD.toLocaleString()}
          </span>
          <span className="text-[10px] font-black text-white/30 uppercase ml-1">USD</span>
        </div>
      </div>

      {/* Compliance Ratio Card */}
      <div className="tactical-panel p-4 border-white/5 bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="w-12 h-12 text-brand-green" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-brand-green" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Fidelity</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
            {Math.round(report.complianceRatio * 100)}
          </span>
          <span className="text-[10px] font-black text-brand-green uppercase">% NOMINAL</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-brand-green transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            style={{ width: `${report.complianceRatio * 100}%` }}
          />
        </div>
      </div>

      {/* Governed Inventory Card */}
      <div className="tactical-panel p-4 border-white/5 bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-12 h-12 text-blue-400" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Governed Inventory</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
            {report.governedCount}
          </span>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">ANALYTES</span>
        </div>
      </div>

      {/* Drift Alert Card */}
      <div className={`tactical-panel p-4 border-white/5 bg-black/40 backdrop-blur-3xl relative overflow-hidden group ${report.provisionalCount > 0 ? 'border-red-500/20' : ''}`}>
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertCircle className={`w-12 h-12 ${report.provisionalCount > 0 ? 'text-red-400' : 'text-white/20'}`} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className={`w-4 h-4 ${report.provisionalCount > 0 ? 'text-red-400' : 'text-white/40'}`} />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Drift</span>
        </div>
        {report.provisionalCount > 0 ? (
          <div className="flex items-baseline gap-2 text-red-400 animate-pulse">
            <span className="text-2xl font-black tabular-nums tracking-tighter">
              {report.provisionalCount}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">NON-COMPLIANT</span>
          </div>
        ) : (
          <span className="text-[11px] font-black text-brand-green uppercase tracking-widest leading-none block mt-1">
            ALL RECORDS STABLE
          </span>
        )}
      </div>
    </div>
  );
}
