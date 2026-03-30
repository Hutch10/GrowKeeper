import { Suspense } from "react";
import { CommandCenter } from "@/components/dashboard/command-center";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { getTasks } from "@/app/actions/tasks";
import { SpecimenListSkeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function DashboardRegistry() {
  const [specimenResult, taskResult] = await Promise.all([
    getSpecimens(),
    getTasks()
  ]);

  const specimens = specimenResult.success ? specimenResult.data : [];
  const tasks = taskResult.success ? taskResult.data : [];
  
  return (
    <CommandCenter 
      initialSpecimens={specimens || []} 
      initialTasks={tasks || []} 
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardRegistry />
    </Suspense>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="p-8 space-y-8 bg-[#050505] min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-emerald-500/10 rounded-lg animate-pulse" />
          <div className="h-3 w-40 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
      <SpecimenListSkeleton />
    </div>
  );
}
