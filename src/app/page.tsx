import { PageShell } from "@/components/layout/page-shell";
import { SpecimenList } from "@/components/plants/specimen-list";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { ConnectionStatus } from "@/components/diagnostics/connection-status";
import { testSupabaseConnection } from "@/lib/diagnostics";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { SovereignAuthGuard } from "@/components/auth/sovereign-auth-guard";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Diagnostics run only in development — the query is unnecessary overhead
  // in production where Supabase is known to be configured.
  const diagnostic =
    process.env.NODE_ENV === "development" ? await testSupabaseConnection() : null;

  // Attempt to fetch specimens (will fail gracefully if connection issues exist)
  const specimensResult = await getSpecimens();
  const auth = await getAuthenticatedUser();
  
  // ENTRANCE HARDENING: Redirect authenticated users to the hardened Dashboard
  // This must happen regardless of whether getSpecimens succeeds, to ensure
  // the hardened narrative is never bypassed during failure.
  if (auth.success) {
    redirect("/dashboard");
  }

  const isNotSignedIn = specimensResult.error === "Not signed in";

  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell
        title="My Specimens"
        subtitle="Track your specimens and keep them healthy with GrowKeeper."
      >
        {/* Connection Diagnostic — development only */}
        {diagnostic !== null ? <ConnectionStatus diagnostic={diagnostic} /> : null}

        {/* Main Content - show if connection is good OR if we have data */}
        {isNotSignedIn ? (
          <div className="rounded-xl border border-brand-pink/30 bg-white p-8 text-center shadow-sm">
            <p className="text-brand-dark">You are not signed in.</p>
            <p className="mt-2 text-sm text-brand-dark/60 font-medium">
              Sign in to start tracking your specimens and care tasks.
            </p>
            <Link
              href="/auth"
              className="mt-4 inline-block rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* SOVEREIGN ACCESS HANDOVER */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="p-12 rounded-[3.5rem] bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tighter mb-4">Registry Access Required.</h2>
                    <p className="text-lg font-bold text-black/60 max-w-lg mb-8">
                      Your operator identity has been detected. The legacy interface is deprecated—handing over control to the High-Fidelity Command Center.
                    </p>
                    <SovereignAuthGuard />
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                     <ShieldCheck className="w-32 h-32" />
                  </div>
               </div>
            </section>

            {/* FALLBACK DIAGNOSTICS */}
            <section className="opacity-40 grayscale pointer-events-none blur-[1px]">
               <h2 className="mb-4 text-xl font-semibold text-brand-dark flex items-center gap-2">
                 Your Specimens <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Legacy View</span>
               </h2>
               {!specimensResult.success ? (
                 <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                   [TRANSITION_ALERT] Registry is locked. Redirecting to Command Center.
                 </div>
               ) : null}
               <SpecimenList specimens={[]} />
            </section>
          </div>
        )}
      </PageShell>
    </main>
  );
}
