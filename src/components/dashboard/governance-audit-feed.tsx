"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Activity, 
  DollarSign, 
  FileText,
  Cpu,
  Fingerprint,
  LucideIcon
} from "lucide-react";
import { treatmentProtocolService, type TreatmentTask } from "@/lib/services/treatment-protocol-service";

export function GovernanceAuditFeed() {
  const [tasks, setTasks] = useState<TreatmentTask[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PROTOCOL" | "FINANCIAL" | "ATTESTATION">("ALL");

  useEffect(() => {
    const fetchData = async () => {
      // In a real scenario, these would come from a unified audit log DB
      // For now, we aggregate from our tactical services
      const allTasks = await treatmentProtocolService.getPendingApprovals(); // Simplification
      setTasks(allTasks);
      
      // We'd also fetch historical policies/payouts here
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-green/20 rounded-xl border border-brand-green/30">
            <ShieldCheck className="w-5 h-5 text-brand-green" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sovereign Audit Feed</h2>
        </div>
        <p className="text-white/40 text-[11px] font-mono tracking-widest uppercase">Institutional Visibility Layer // Anchor: Hardware_Enclave_V4</p>
      </header>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
        <FilterTab label="All Events" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <FilterTab label="Protocols" active={filter === "PROTOCOL"} onClick={() => setFilter("PROTOCOL")} />
        <FilterTab label="Financial" active={filter === "FINANCIAL"} onClick={() => setFilter("FINANCIAL")} />
        <FilterTab label="Attestation" active={filter === "ATTESTATION"} onClick={() => setFilter("ATTESTATION")} />
      </div>

      {/* Audit List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
        {/* Synthetic Audit Logs for Demonstration */}
        <AuditItem 
          type="ATTESTATION"
          icon={Cpu}
          title="Hardware Attestation Verified"
          description="Specimen B-42: Silicon-layer cryptographically signed. Integrity confirmed."
          time="2m ago"
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        
        {tasks.map(task => (
          <AuditItem 
            key={task.id}
            type="PROTOCOL"
            icon={Activity}
            title={`Treatment Protocol: ${task.name}`}
            description={task.description}
            time="5m ago"
            color="text-brand-green"
            bg="bg-brand-green/10"
          />
        ))}

        <AuditItem 
          type="FINANCIAL"
          icon={DollarSign}
          title="Parametric Payout Authorized"
          description="Condition Breach: Humidity < 40% for 3 cycles. 500 GK distributed to Reserve."
          time="18m ago"
          color="text-amber-400"
          bg="bg-amber-400/10"
        />

        <AuditItem 
          type="ATTESTATION"
          icon={Fingerprint}
          title="Genetic Provenance Anchored"
          description="Fungal Colony C-09: DNA-hash recorded on-chain via ZK-Proof."
          time="1h ago"
          color="text-brand-pink"
          bg="bg-brand-pink/10"
        />
        
        <AuditItem 
          type="PROTOCOL"
          icon={FileText}
          title="Governance Rule Amended"
          description="Protocol R-701: Misting frequency threshold increased to 85%."
          time="4h ago"
          color="text-white/40"
          bg="bg-white/5"
        />
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
        active ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function AuditItem({ type, icon: Icon, title, description, time, color, bg }: { type: string, icon: LucideIcon, title: string, description: string, time: string, color: string, bg: string }) {
  return (
    <div className="flex items-start gap-6 p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/[0.07] hover:border-white/10 transition-all">
      <div className={`p-4 rounded-2xl ${bg} ${color} shadow-inner`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${color}`}>{type}</span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <h4 className="text-sm font-black text-white/90 uppercase tracking-tight">{title}</h4>
          </div>
          <span className="text-[10px] font-mono text-white/20">{time}</span>
        </div>
        <p className="text-[11px] text-white/40 font-mono leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
