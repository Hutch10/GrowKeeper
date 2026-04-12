"use client";

import { useState } from "react";
import { addSpecimen } from "@/app/actions/specimen-actions";
import { ShieldCheck, Loader2, Activity, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GenesisPage() {
  const [isInjecting, setIsInjecting] = useState(false);
  const router = useRouter();

  const handleInjection = async () => {
    setIsInjecting(true);
    console.log("[SENTINEL] Project Seed: Initializing injection sequence...");

    const formData = new FormData();
    formData.append("nickname", "SENTINEL_ALPHA");
    formData.append("species_name", "Monstera Deliciosa (Variegated)");
    formData.append("kingdom", "Plantae");
    formData.append("location", "Command Center");
    formData.append("notes", "Registry Genesis Specimen. Primary monitoring node for Sovereign Operations.");
    formData.append("hardware_attestation_statement", "GENESIS_NODE_PROVENANCE_CERTIFIED_v1.0");

    try {
      const result = await addSpecimen(formData);
      if (result.success) {
        toast.success("REGISTRY_SUCCESS: SENTINEL_ALPHA anchored.");
        router.push("/dashboard");
      } else {
        toast.error(`Injection Failed: ${result.error}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(`Critical Fault: ${message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="p-20 rounded-[4rem] bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 relative overflow-hidden border border-emerald-400">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/10 rounded-full border border-black/5">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Project Seed // Alpha Phase</span>
            </div>
            
            <h1 className="text-7xl font-black tracking-tighter leading-none mb-4">
              Initialize <br /> Sovereign Registry.
            </h1>
            
            <p className="text-xl font-bold text-black/60 max-w-lg">
              The platform is certified. Ready to anchor the first biological asset (SENTINEL_ALPHA) to the global backbone.
            </p>

            <button
              onClick={handleInjection}
              disabled={isInjecting}
              className="group flex items-center gap-6 px-12 py-6 bg-black text-white rounded-[2rem] font-black shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span className="text-sm uppercase tracking-[0.4em]">
                {isInjecting ? "Anchoring Data..." : "Commence Injection"}
              </span>
              {isInjecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              )}
            </button>
          </div>
          
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <ShieldCheck className="w-64 h-64" />
          </div>
          
          <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-black/5 rounded-full blur-3xl" />
        </div>
        
        <div className="mt-8 flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          <span>Sovereign Mode: Enabled</span>
          <span className="text-emerald-500/40">•</span>
          <span>Cloud Backbone: Active</span>
          <span className="text-emerald-500/40">•</span>
          <span>Alpha Lockdown: Enforced</span>
        </div>
      </div>
    </main>
  );
}
