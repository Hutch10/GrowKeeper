"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";

interface UserMenuProps {
  email: string | null;
}

export function UserMenu({ email }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignOut() {
    setError(null);
    setIsSigningOut(true);

    const result = await signOut();

    setIsSigningOut(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {email ? <span className="text-sm text-brand-dark/60 font-medium">{email}</span> : null}
      <button
        type="button"
        onClick={onSignOut}
        disabled={isSigningOut}
        className="rounded-md border border-brand-pink/30 px-3 py-1.5 text-sm font-semibold text-brand-dark/70 hover:bg-brand-pink-light/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <Link href="/dashboard" className="text-sm font-semibold text-brand-dark/70 underline hover:text-brand-green transition-colors">
        Dashboard
      </Link>
    </div>
  );
}
