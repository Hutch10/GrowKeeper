"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, DollarSign, Activity, AlertTriangle } from "lucide-react";
import { insuranceEngine, type InsurancePolicy } from "@/lib/services/insurance-engine";
import type { SpecimenRow } from "@/app/actions/types";
import { toast } from "sonner";

interface ParametricInsurancePanelProps {
  specimen: SpecimenRow;
}

export function ParametricInsurancePanel({ specimen }: ParametricInsurancePanelProps) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    insuranceEngine.getSpecimenPolicies(specimen.id).then(setPolicies);
  }, [specimen.id]);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const policy = await insuranceEngine.activatePolicy(specimen, 1000); // 1,000 unit coverage
      setPolicies(prev => [...prev, policy]);
      toast.success("Parametric Resilience ACTIVE", {
        description: `Threshold set at 70% Vitality for ${specimen.nickname}.`,
      });
    } catch {
      toast.error("Activation Failed", {
        description: "Institutional credit link synchronization error.",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const activePolicy = policies.find(p => p.status === "active");
  const triggeredPolicy = policies.find(p => p.status === "triggered");

  return (
    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Parametric Resilience</h4>
        </div>
        {activePolicy && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Monitoring Thresholds</span>
          </div>
        )}
      </div>

      {!activePolicy && !triggeredPolicy ? (
        <div className="text-center py-2">
          <p className="text-[10px] text-white/40 mb-3 leading-tight font-mono italic">
            Unlock protocol-enforced risk mediation for this biological asset.
          </p>
          <button 
            onClick={handleActivate}
            disabled={isActivating}
            className="w-full py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            {isActivating ? "Synchronizing..." : "Initialize Coverage [1000 GK]"}
          </button>
        </div>
      ) : activePolicy ? (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Coverage Value</span>
              <span className="text-xs font-black text-blue-400">1,000 GK</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Trigger Floor</span>
              <span className="text-xs font-black text-white/80">70% Vitality</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-white uppercase tracking-tight">Active Surveillance</p>
              <p className="text-[8px] text-white/40 leading-none">Last telemetry audit: {new Date(activePolicy.lastVerifiedAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      ) : triggeredPolicy ? (
        <div className="space-y-4">
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 flex flex-col items-center text-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Threshold Breach Detected</p>
              <p className="text-[9px] text-red-300/60 leading-tight">Remediation protocol engaged. Payout sequence initiated.</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-brand-green" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Authorized Payout</span>
            </div>
            <span className="text-xs font-black text-brand-green">1,000 GK</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
