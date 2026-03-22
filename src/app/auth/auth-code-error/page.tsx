import { PageShell } from "@/components/layout/page-shell";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell
        title="Authentication Error"
        subtitle="Something went wrong during the sign-in process."
      >
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
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
          </div>
          <h3 className="text-lg font-semibold text-brand-dark">
            Failed to exchange auth code
          </h3>
          <p className="mt-2 text-sm text-brand-dark/60">
            Your login link might have expired or was already used. Please try signing in again.
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-block rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </PageShell>
    </main>
  );
}
