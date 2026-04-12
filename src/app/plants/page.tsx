import { redirect } from "next/navigation";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { SpecimensClient } from "@/components/plants/specimens-client";

export const dynamic = "force-dynamic";

export default async function PlantsPage() {
  const isLockdown = process.env.NEXT_PUBLIC_ALPHA_LOCKDOWN === 'true';
  
  if (isLockdown) {
    redirect("/dashboard?tab=inventory");
  }

  const result = await getSpecimens();
  // ... rest (legacy fallback)
  const specimens = result.data || [];
  return <SpecimensClient initialSpecimens={specimens} />;
}
