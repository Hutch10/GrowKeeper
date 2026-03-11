import { supabase } from "@/lib/supabase";

interface Plant {
  id: string;
  nickname: string;
  species_name: string | null;
  notes: string | null;
  created_at: string;
}

export default async function TestConnectionPage() {
  let connectionStatus = {
    connected: false,
    error: null as string | null,
    plantCount: 0,
    plants: [] as Plant[],
  };

  try {
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    // Test 2: Try to fetch plants from the database
    const { data: plants, error } = await supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Success!
    connectionStatus = {
      connected: true,
      error: null,
      plantCount: plants?.length || 0,
      plants: (plants || []) as Plant[],
    };
  } catch (error) {
    connectionStatus.connected = false;
    connectionStatus.error = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Supabase Connection Test
        </h1>

        {/* Connection Status */}
        <div
          className={`mb-6 rounded-lg border-2 p-6 ${
            connectionStatus.connected
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full ${
                connectionStatus.connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <h2 className="text-xl font-semibold">
              {connectionStatus.connected
                ? "✅ Connected to Supabase"
                : "❌ Connection Failed"}
            </h2>
          </div>

          {connectionStatus.error && (
            <div className="mt-4 rounded bg-white p-4">
              <p className="font-semibold text-red-700">Error Details:</p>
              <code className="mt-2 block text-sm text-red-600">
                {connectionStatus.error}
              </code>
            </div>
          )}
        </div>

        {/* Database Info */}
        {connectionStatus.connected && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Database Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Table:</span>
                <span className="font-mono font-semibold">plants</span>
              </div>
              
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Total Plants:</span>
                <span className="font-semibold">{connectionStatus.plantCount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold text-green-600">
                  {connectionStatus.plantCount === 0
                    ? "Table exists (empty)"
                    : "Data retrieved successfully"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plants Preview */}
        {connectionStatus.connected && connectionStatus.plantCount > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Sample Data (First 3 Plants)
            </h3>
            <div className="space-y-3">
              {connectionStatus.plants.slice(0, 3).map((plant, index) => (
                <div
                  key={plant.id}
                  className="rounded border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {plant.nickname}
                      </p>
                      {plant.species_name && (
                        <p className="text-sm italic text-slate-600">
                          {plant.species_name}
                        </p>
                      )}
                    </div>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      ID: {plant.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {connectionStatus.connected && connectionStatus.plantCount === 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg text-slate-600">
              📭 No plants in the database yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Connection is working! Go to the{" "}
              <a href="/" className="font-semibold text-slate-900 underline">
                homepage
              </a>{" "}
              to add your first plant.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            ← Back to Homepage
          </a>
        </div>

        {/* Troubleshooting */}
        {!connectionStatus.connected && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
            <h3 className="mb-3 font-semibold text-amber-900">
              Troubleshooting Steps:
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-amber-800">
              <li>
                Verify <code className="rounded bg-amber-100 px-1">.env.local</code>{" "}
                has valid credentials
              </li>
              <li>
                Check <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                and <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              </li>
              <li>
                Run the migration in Supabase Dashboard (SQL Editor):{" "}
                <code className="rounded bg-amber-100 px-1">
                  supabase/migrations/001_create_plants_table.sql
                </code>
              </li>
              <li>Restart the dev server after changing environment variables</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
