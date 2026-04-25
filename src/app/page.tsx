import { PageShell } from "@/components/layout/page-shell";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { ConnectionStatus } from "@/components/diagnostics/connection-status";
import { testSupabaseConnection } from "@/lib/diagnostics";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Diagnostics run only in development — the query is unnecessary overhead
  // in production where Supabase is known to be configured.
  const diagnostic =
    process.env.NODE_ENV === "development" ? await testSupabaseConnection() : null;

  // Attempt to fetch specimens (will fail gracefully if connection issues exist)
  const auth = await getAuthenticatedUser();
  
  // ENTRANCE HARDENING: Redirect authenticated users to the hardened Dashboard
  // This must happen regardless of whether getSpecimens succeeds, to ensure
  // the hardened narrative is never bypassed during failure.
  if (auth.success) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell
        title="GrowKeeper"
        subtitle="Track your plants and keep them healthy."
      >
        {diagnostic !== null ? <ConnectionStatus diagnostic={diagnostic} /> : null}

        <div className="rounded-xl border border-brand-pink/30 bg-white p-8 text-center shadow-sm">
          <p className="text-brand-dark">You are not signed in.</p>
          <p className="mt-2 text-sm text-brand-dark/60 font-medium">
            Sign in to start tracking your plants and care tasks.
          </p>
          <Link
            href="/auth"
            className="mt-4 inline-block rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark transition-colors"
          >
            Sign In
          </Link>
        </div>
      </PageShell>
    </main>
  );
}
