import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { AddSpecimenForm } from "@/components/plants/add-specimen-form";
import { getAuthenticatedUser } from "@/lib/auth-server";

export default async function NewSpecimenPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    redirect("/auth?next=/plants/new");
  }

  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell
        title="Add New Specimen"
        subtitle="Add a new specimen to your collection"
      >
        <nav className="mb-2">
          <Link
            href="/plants"
            className="inline-flex items-center gap-1.5 text-sm text-brand-dark/60 transition-colors hover:text-brand-green"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to Specimens
          </Link>
        </nav>

        <div className="mx-auto max-w-lg mt-8">
          <AddSpecimenForm />
        </div>
      </PageShell>
    </main>
  );
}
