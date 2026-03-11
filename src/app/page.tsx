import { PageShell } from "@/components/layout/page-shell";
import { AddPlantForm } from "@/components/plants/add-plant-form";
import { PlantList } from "@/components/plants/plant-list";
import { getPlants } from "@/app/actions/plants";
import { ConnectionStatus } from "@/components/diagnostics/connection-status";
import { testSupabaseConnection } from "@/lib/diagnostics";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Diagnostics run only in development — the query is unnecessary overhead
  // in production where Supabase is known to be configured.
  const diagnostic =
    process.env.NODE_ENV === "development" ? await testSupabaseConnection() : null;

  // Attempt to fetch plants (will fail gracefully if connection issues exist)
  const plantsResult = await getPlants();
  const plants = plantsResult.success ? plantsResult.data : [];
  const isNotSignedIn = !plantsResult.success && plantsResult.error === "Not signed in";

  const showContent = diagnostic?.status === "success" || plants.length > 0 || !diagnostic;

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
      <PageShell
        title="My Plants"
        subtitle="Track your plants and keep them healthy with GrowKeeper."
      >
        {/* Connection Diagnostic — development only */}
        {diagnostic !== null ? <ConnectionStatus diagnostic={diagnostic} /> : null}

        {/* Main Content - show if connection is good OR if we have data */}
        {isNotSignedIn ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">You are not signed in.</p>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to start tracking your plants and care tasks.
            </p>
            <Link
              href="/auth"
              className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Go to Sign In
            </Link>
          </div>
        ) : showContent ? (
          <>
            {/* Add Plant Form */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Add New Plant
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <AddPlantForm />
              </div>
            </section>

            {/* Plant List */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Your Plants
              </h2>
              {!plantsResult.success && plants.length === 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Could not load plants from Supabase: {plantsResult.error}
                </div>
              ) : null}
              <PlantList plants={plants} />
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Please configure Supabase to start tracking your plants.
            </p>
          </div>
        )}
      </PageShell>
    </main>
  );
}
