import type { DiagnosticResult } from "@/lib/diagnostics";
import { getStatusBadge } from "@/lib/diagnostics";

interface ConnectionStatusProps {
  diagnostic: DiagnosticResult;
}

export function ConnectionStatus({ diagnostic }: ConnectionStatusProps) {
  const badge = getStatusBadge(diagnostic.status);

  if (diagnostic.status === "success") {
    return null; // Don't show anything when everything is working
  }

  return (
    <div
      className={`mb-6 rounded-xl border-2 p-6 ${badge.bgColor} ${badge.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {diagnostic.status === "error" ? (
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${badge.color}`}>
            {diagnostic.status === "error"
              ? "Supabase Configuration Required"
              : "Configuration Warning"}
          </h3>

          <div className="mt-3 space-y-2">
            {diagnostic.messages.map((message, index) => (
              <p key={index} className={`text-sm ${badge.color}`}>
                {message}
              </p>
            ))}
          </div>

          {!diagnostic.checks.envVarsConfigured && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Quick Fix:
              </p>
              <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">
                <li>Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to <code className="rounded bg-slate-100 px-1">.env.local</code></li>
                <li>Get your Supabase URL and anon key from <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Update the values in <code className="rounded bg-slate-100 px-1">.env.local</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          )}

          {diagnostic.checks.envVarsConfigured &&
            !diagnostic.checks.tableAccessible && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  Database Setup Required:
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">
                  <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                  <li>Click <strong>SQL Editor</strong> in the sidebar</li>
                  <li>
                    Run <strong>all</strong> migration files in order:
                    <ul className="mt-1 list-inside list-disc space-y-0.5 pl-4">
                      <li><code className="rounded bg-slate-100 px-1">supabase/migrations/001_create_plants_table.sql</code></li>
                      <li><code className="rounded bg-slate-100 px-1">supabase/migrations/002_create_plant_events_table.sql</code></li>
                      <li><code className="rounded bg-slate-100 px-1">supabase/migrations/003_create_tasks_table.sql</code></li>
                      <li><code className="rounded bg-slate-100 px-1">supabase/migrations/004_auth_user_ownership.sql</code></li>
                      <li><code className="rounded bg-slate-100 px-1">supabase/migrations/005_auth_hardening_indexes_constraints.sql</code></li>
                    </ul>
                  </li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
