"use client";

import { useState, useEffect } from "react";
import { GlobalRegistryMap } from "./global-registry-map";
import { SovereignStats } from "./sovereign-stats";
import { SovereignAuditLog } from "./sovereign-audit-log";
import { sovereignProtocolEnforcer, type SovereignAction } from "@/lib/services/sovereign-protocol-enforcer";
import { specimensDB, fromPouch } from "@/lib/pouchdb";
import type { SpecimenRow } from "@/app/actions/types";
import { Shield, Activity, Globe, Zap, LucideIcon } from "lucide-react";

export function SovereigntyHub() {
  const [specimens, setSpecimens] = useState<SpecimenRow[]>([]);
  const [actions, setActions] = useState<SovereignAction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch local specimens for stats
      const result = await specimensDB.allDocs({ include_docs: true });
      const docs = result.rows
        .filter(r => !!r.doc)
        .map(r => fromPouch<SpecimenRow>(r.doc));
      setSpecimens(docs);

      // Fetch audit log
      setActions(sovereignProtocolEnforcer.getActions());
    };
    fetchData();
  }, []);

  const triggerGlobalScan = async () => {
    setIsRefreshing(true);
    // Simulate real-time latency across shards
    await new Promise(r => setTimeout(r, 1500));
    
    await sovereignProtocolEnforcer.performAutonomousScan(specimens);
    setActions(sovereignProtocolEnforcer.getActions());
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-700">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Global Sovereignty Hub</h1>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">
            Tier-1 Decentralized Biodiversity Registry & Audit Propagation
          </p>
        </div>
        <button 
          onClick={triggerGlobalScan}
          disabled={isRefreshing}
          className="px-6 py-3 bg-brand-pink text-white rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-pink/20 disabled:opacity-50 disabled:scale-100"
        >
          {isRefreshing ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
          <span className="text-xs font-black uppercase tracking-widest">{isRefreshing ? "Scanning Shards..." : "Initiate Global Scan"}</span>
        </button>
      </div>

      {/* Aggregate Stats Layer */}
      <SovereignStats specimens={specimens} />

      {/* Main Grid: Map & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Map - Occupies 2/3 column space */}
        <div className="lg:col-span-2 tactical-panel p-6 border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden flex flex-col">
          <GlobalRegistryMap />
        </div>

        {/* Audit Trail - Occupies 1/3 column space */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <SovereignAuditLog actions={actions} />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HubFeature icon={Globe} label="Shard Propagation" value="Real-time (Active)" />
        <HubFeature icon={Shield} label="Merkle Proofs" value="Verified Protocol" />
        <HubFeature icon={Activity} label="Biosphere Health" value="88% (Nominal)" />
      </div>
    </div>
  );
}

function HubFeature({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
      <div className="p-2 bg-brand-green/10 rounded-xl">
        <Icon className="w-4 h-4 text-brand-green" />
      </div>
      <div>
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">{label}</span>
        <span className="text-xs font-black text-white uppercase tracking-tight">{value}</span>
      </div>
    </div>
  );
}
