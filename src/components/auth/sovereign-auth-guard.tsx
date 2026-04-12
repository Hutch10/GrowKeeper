"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { ShieldCheck, Loader2 } from "lucide-react";

export function SovereignAuthGuard() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("[SENTINEL] Active session detected. Forcing handover to Registry Operations...");
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/5 rounded-[2rem] border border-black/5 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Synchronizing Identity...</span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <p className="text-[11px] font-bold text-black/60">
          Sovereign identity detected. Establishing mission-mode uplink.
        </p>
      </div>
    </div>
  );
}
