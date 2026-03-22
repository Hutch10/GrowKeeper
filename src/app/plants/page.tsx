import { redirect } from "next/navigation";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { SpecimensClient } from "@/components/plants/specimens-client";

export const dynamic = "force-dynamic";

export default async function PlantsPage() {
  const result = await getSpecimens();

  if (!result.success) {
    if (result.error === "Not signed in") {
      redirect("/auth?next=/plants");
    }
  }

  const specimens = result.data || [];

  return <SpecimensClient initialSpecimens={specimens} />;
}
