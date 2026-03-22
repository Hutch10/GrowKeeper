import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { getAuthenticatedUser } from "@/lib/auth-server";

/**
 * Accepts a raw `?next` query parameter and returns a safe internal path.
 * Rejects absolute URLs, protocol-relative URLs, and any value that does
 * not resolve to the same localhost origin.
 */
function sanitizeNext(value: string | undefined): string {
  if (!value) return "/";
  // Must start with a single slash — rejects protocol-relative paths (//)
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "http://localhost");
    if (url.host !== "localhost") return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}

type AuthPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const auth = await getAuthenticatedUser();

  if (auth.success) {
    redirect("/");
  }

  const raw = searchParams.next;
  const redirectTo = sanitizeNext(typeof raw === "string" ? raw : undefined);

  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell
        title="Welcome to GrowKeeper"
        subtitle="Sign in or create an account to manage your plants."
      >
        <AuthForm redirectTo={redirectTo} />
      </PageShell>
    </main>
  );
}
