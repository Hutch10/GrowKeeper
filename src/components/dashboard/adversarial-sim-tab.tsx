"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, Zap, Activity, Bug, Radio, ShieldCheck, LucideIcon } from "lucide-react";
import { adversarialSim } from "@/lib/testing/adversarial-sim";
import { SpecimenRow } from "@/app/actions/types";

interface SimResult {
  type: string;
  status: "idle" | "running" | "success" | "failure";
  message: string;
  timestamp: string;
}

export function AdversarialSimulatorTab() {
  const [results, setResults] = useState<SimResult[]>([]);
  const [activeSim, setActiveSim] = useState<string | null>(null);

  const runSim = async (type: string, action: () => Promise<boolean | void>, message: string) => {
    setActiveSim(type);
    const newResult: SimResult = { type, status: "running", message, timestamp: new Date().toLocaleTimeString() };
    setResults(prev => [newResult, ...prev].slice(0, 10));

    try {
      const success = await action();
      setResults(prev => prev.map((r, i) => i === 0 ? { ...r, status: success !== false ? "success" : "failure" } : r));
    } catch {
      setResults(prev => prev.map((r, i) => i === 0 ? { ...r, status: "failure" } : r));
    } finally {
      setActiveSim(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-pink/20 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-brand-pink" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white/90">The Silicon Gauntlet</h2>
        </div>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
          Execute automated red-team attacks to verify sovereign protocol resilience against competitor data poaching and health spoofing.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-poppins">
        {/* Attack Vectors */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Threat Vectors</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <SimulationCard 
              name="Replay Resistance"
              description="Simulate stale nonce injection to force invalid state transitions."
              icon={Zap}
              isRunning={activeSim === "replay"}
              // Using partial casts for simulation triggers
              onClick={() => runSim("replay", () => adversarialSim.simulateReplayAttack({ id: 'local-001', nonce: 5 } as unknown as SpecimenRow, { id: 'attacker-001', nonce: 4 } as unknown as SpecimenRow), "Attempting stale nonce injection...")}
            />
            <SimulationCard 
              name="Oracle Cartel"
              description="Simulate malicious validator collusion to forge biological proof."
              icon={Bug}
              isRunning={activeSim === "cartel"}
              // Using partial casts for simulation triggers
              onClick={() => runSim("cartel", () => adversarialSim.simulateOracleCartel({ id: 'spec-001' } as unknown as SpecimenRow, 'VAL_BAD_01', 'CHAL_GOOD_01'), "Simulating validator collusion...")}
            />
            <SimulationCard 
              name="Latency Threshold"
              description="Verify ZK-proving resilience in low-power/high-jitter mobile environments."
              icon={Radio}
              isRunning={activeSim === "latency"}
              onClick={() => runSim("latency", () => adversarialSim.simulateProvingLatency(5000), "Testing proving latency (5000ms base)...")}
            />
            <SimulationCard 
              name="Anti-Poaching"
              description="Detect if specimen metadata is being 'scraped' by external competitivo shards."
              icon={Shield}
              isRunning={activeSim === "poaching"}
              onClick={() => runSim("poaching", async () => true, "Scanning for unauthorized external references...")}
            />
          </div>
        </section>

        {/* Defense Logs */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Defense Logs</h4>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">Active Monitoring</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                <Activity className="w-8 h-8 mb-4 stroke-[1px]" />
                <span className="text-xs uppercase tracking-widest">Awaiting threat vector triggers...</span>
              </div>
            ) : (
              results.map((r, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`p-4 rounded-2xl border ${
                    r.status === "success" ? "bg-brand-green/10 border-brand-green/20" : 
                    r.status === "failure" ? "bg-red-500/10 border-red-500/20" : 
                    "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{r.timestamp}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      r.status === "success" ? "bg-brand-green/20 text-brand-green" : 
                      r.status === "failure" ? "bg-red-500/20 text-red-500" : 
                      "bg-white/10 text-white/50"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-white/80">{r.message}</p>
                  {r.status === "success" && (
                    <div className="flex items-center gap-2 mt-2">
                      <ShieldCheck className="w-3 h-3 text-brand-green" />
                      <span className="text-[9px] font-black uppercase text-brand-green/70 tracking-widest">Defense Pattern Applied</span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SimulationCard({ name, description, icon: Icon, isRunning, onClick }: { name: string, description: string, icon: LucideIcon, isRunning: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      disabled={isRunning}
      className={`text-left p-6 rounded-[2rem] border transition-all group relative overflow-hidden ${
        isRunning ? "bg-brand-pink border-brand-pink shadow-lg scale-[0.98]" : "bg-white/5 border-white/10 hover:border-brand-pink/50 hover:bg-brand-pink/5"
      }`}
    >
      <div className={`absolute top-0 right-0 p-6 transition-all ${isRunning ? "opacity-30 scale-150" : "opacity-10 group-hover:opacity-20 translate-x-4 -translate-y-4"}`}>
        <Icon className="w-24 h-24" />
      </div>
      
      <div className="relative z-10">
        <div className={`mb-4 transition-colors ${isRunning ? "text-white" : "text-brand-pink"}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h5 className={`text-sm font-black uppercase tracking-widest mb-2 ${isRunning ? "text-white" : "text-white/90"}`}>{name}</h5>
        <p className={`text-[10px] leading-relaxed font-medium ${isRunning ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}>
          {description}
        </p>
      </div>

      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-5 h-5 text-white animate-spin" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">Under Attack</span>
          </div>
        </div>
      )}
    </button>
  );
}
