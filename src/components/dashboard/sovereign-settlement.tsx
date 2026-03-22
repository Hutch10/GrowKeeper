"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Activity, ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getAuditLogs } from "@/app/actions/audit";

interface AuditLog {
  id: string;
  created_at: string;
  event_type: string;
  decision: string;
  approval_status: string;
  raw_data: {
    alert_id: string;
    region: string;
    tempDelta: number;
    phDelta: number;
    treaty_version: number;
  };
}

export function SovereignSettlement() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const res = await getAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data as AuditLog[]);
      }
      setLoading(false);
    }
    fetchLogs();
    
    // Polling for simulation (real-time)
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-[2rem] border border-brand-dark/5 shadow-sm">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
        <span className="ml-3 font-bold text-brand-dark/40 uppercase tracking-widest text-xs">Syncing Ledger...</span>
      </div>
    );
  }

  return (
    <div className="bg-brand-dark rounded-[2.5rem] border border-brand-dark/10 shadow-2xl overflow-hidden text-white relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] group-hover:bg-emerald-500/20 transition-all" />
      
      <div className="p-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Sovereign Settlement</h3>
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Enforcement Active • v4.6.18</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Mainnet Link</span>
          </div>
        </div>

        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group/item">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${log.approval_status === 'AUTO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {log.approval_status === 'AUTO' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm uppercase tracking-tight">
                          {log.raw_data.region} Settlement
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-black text-white/40 uppercase tracking-widest">
                          TREATY v{log.raw_data.treaty_version}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Activity className="w-3 h-3 text-pink-400" />
                          ΔT: {log.raw_data.tempDelta?.toFixed(2)}°C
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Activity className="w-3 h-3 text-blue-400" />
                          ΔpH: {log.raw_data.phDelta?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1 mb-1">
                      {log.approval_status === 'AUTO' ? 'ENFORCED' : 'HALTED'}
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
              <ShieldCheck className="w-12 h-12 mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">No active enforcement events</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">
            Protocol Latency: 42ms
          </div>
          <button className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors flex items-center gap-2">
            View Ledger
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
