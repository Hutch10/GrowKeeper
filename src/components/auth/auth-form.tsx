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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("sign_in")}
          className={`rounded-md px-3 py-2 text-sm ${
            mode === "sign_in"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign_up")}
          className={`rounded-md px-3 py-2 text-sm ${
            mode === "sign_up"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="At least 6 characters"
          />
        </div>

        {message ? (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : mode === "sign_up" ? "Create Account" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
