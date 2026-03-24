import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";
import type { SpecimenRow } from "./types";
import { getSpecimens } from "./specimen-actions";

export type PublicProfile = Database["public"]["Tables"]["profiles"]["Row"] & {
  nickname: string;
  avatar_url?: string;
  bio?: string;
  plants: SpecimenRow[];
  total_plants: number;
  thriving_count: number;
};

export async function getPublicProfile(id: string) {
  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    return { success: false, error: error?.message || "Profile not found" };
  }

  // Fetch specimen data for metrics
  const specimenResult = await getSpecimens();
  const plants = specimenResult.success ? specimenResult.data : [];
  
  const p = profile as Database["public"]["Tables"]["profiles"]["Row"];
  
  const publicProfile: PublicProfile = {
    id: p.id,
    email: p.email,
    created_at: p.created_at,
    nickname: (p as Record<string, unknown>).nickname as string || p.email?.split("@")[0] || "Collector",
    avatar_url: (p as Record<string, unknown>).avatar_url as string | undefined,
    bio: (p as Record<string, unknown>).bio as string | undefined,
    plants,
    total_plants: plants.length,
    thriving_count: plants.filter(plant => plant.health > 80).length,
  };

  return { success: true, data: publicProfile };
}

export async function updateProfile(id: string, updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
