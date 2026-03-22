"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signUpWithPassword } from "@/app/actions/auth";

type Mode = "sign_in" | "sign_up";

interface AuthFormProps {
  redirectTo?: string;
}

export function AuthForm({ redirectTo = "/" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result =
      mode === "sign_up"
        ? await signUpWithPassword(email, password)
        : await signInWithPassword(email, password);

    setIsSubmitting(false);

    if (!result.success) {
      setMessage({ type: "error", text: result.error });
      return;
    }

    if (mode === "sign_in") {
      // Session is established — navigate to the intended destination.
      router.push(redirectTo);
      return;
    }

    // Sign-up: show the result message, which may include email confirmation
    // instructions. Do not redirect until the user actually has a session.
    setMessage({ type: "success", text: result.data.message });
    form.reset();
  }

  return (
    <div className="rounded-xl border border-brand-pink/30 bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("sign_in")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            mode === "sign_in"
              ? "bg-brand-green text-white shadow-md"
              : "border border-brand-pink/20 bg-brand-pink-light/30 text-brand-dark/60 hover:bg-brand-pink-light/50"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign_up")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            mode === "sign_up"
              ? "bg-brand-green text-white shadow-md"
              : "border border-brand-pink/20 bg-brand-pink-light/30 text-brand-dark/60 hover:bg-brand-pink-light/50"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brand-dark/70">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-dark"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-brand-dark/70">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className="mt-1 block w-full rounded-md border border-brand-pink-dark px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green bg-white text-brand-dark"
            placeholder="At least 6 characters"
          />
        </div>

        {message ? (
          <div
            className={`rounded-md p-3 text-sm font-medium ${
              message.type === "error" 
                ? "bg-red-50 text-red-700 border border-red-100" 
                : "bg-brand-pink-light/30 text-brand-green border border-brand-pink/20"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-brand-green px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-green-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : mode === "sign_up" ? "Create Account" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
