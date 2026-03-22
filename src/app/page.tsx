import { PageShell } from "@/components/layout/page-shell";
import { AddSpecimenForm } from "@/components/plants/add-specimen-form";
import { SpecimenList } from "@/components/plants/specimen-list";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { ConnectionStatus } from "@/components/diagnostics/connection-status";
import { testSupabaseConnection } from "@/lib/diagnostics";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Diagnostics run only in development — the query is unnecessary overhead
  // in production where Supabase is known to be configured.
  const diagnostic =
    process.env.NODE_ENV === "development" ? await testSupabaseConnection() : null;

  // Attempt to fetch specimens (will fail gracefully if connection issues exist)
  const specimensResult = await getSpecimens();
  const specimens = specimensResult.success ? specimensResult.data : [];
  const isNotSignedIn = !specimensResult.success && specimensResult.error === "Not signed in";

  const showContent = diagnostic?.status === "success" || specimens.length > 0 || !diagnostic;

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
        ) : showContent ? (
          <>
            {/* Add Specimen Form */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-brand-dark">
                Add New Specimen
              </h2>
              <div className="rounded-xl border border-brand-pink/30 bg-white p-6 shadow-sm">
                <AddSpecimenForm />
              </div>
            </section>

            {/* Specimen List */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-brand-dark">
                Your Specimens
              </h2>
              {!specimensResult.success && specimens.length === 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Could not load specimens from Supabase: {specimensResult.error}
                </div>
              ) : null}
              <SpecimenList specimens={specimens} />
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Please configure Supabase to start tracking your specimens.
            </p>
          </div>
        )}
      </PageShell>
    </main>
  );
}
