"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions/types";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type AuthResultData = {
  email: string | null;
  message: string;
};

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<ActionResult<AuthResultData>> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return {
      success: false,
      data: null,
      error: "Email and password are required.",
    };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return { success: false, data: null, error: `Auth failure: ${error.message}` };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    return {
      success: true,
      data: { email: data.user?.email ?? null, message: "Account created." },
      error: null,
    };
  }

  return {
    success: true,
    data: {
      email: data.user?.email ?? trimmedEmail,
      message: "Check your email to confirm your account.",
    },
    error: null,
  };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<ActionResult<AuthResultData>> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return {
      success: false,
      data: null,
      error: "Email and password are required.",
    };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error || !data.session) {
    return {
      success: false,
      data: null,
      error: `Auth failure: ${error?.message ?? "Unable to sign in."}`,
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    data: { email: data.user.email ?? null, message: "Signed in." },
    error: null,
  };
}

export async function signOut(): Promise<ActionResult<{ message: string }>> {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return {
    success: true,
    data: { message: "Signed out." },
    error: null,
  };
}
