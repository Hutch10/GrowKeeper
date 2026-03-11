import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getPlantById } from "@/app/actions/plants";
import { getPlantEvents } from "@/app/actions/plant-events";
import { getPlantTasks } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import { AddCareEventForm } from "@/components/care-events/add-care-event-form";
import { CareEventList } from "@/components/care-events/care-event-list";
import { AddTaskForm } from "@/components/tasks/add-task-form";
import { TaskList } from "@/components/tasks/task-list";

export const dynamic = "force-dynamic";

type PlantDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const result = await getPlantById(params.id);

  if (!result.success && result.error === "Not signed in") {
    redirect(`/auth?next=/plants/${params.id}`);
  }

  if (!result.success && result.error === "Database connection error") {
    return (
      <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
        <PageShell title="Plant Details" subtitle="View plant information.">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Database connection error
          </div>
          <Link href="/" className="text-sm text-slate-700 underline hover:text-slate-900">
            Back to plants
          </Link>
        </PageShell>
      </main>
    );
  }

  if (!result.success) {
    return (
      <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
        <PageShell title="Plant Details" subtitle="View plant information.">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            {result.error}
          </div>
          <Link href="/" className="text-sm text-slate-700 underline hover:text-slate-900">
            Back to plants
          </Link>
        </PageShell>
      </main>
    );
  }

  const plant = result.data;
  
  // Fetch care events for this plant
  const eventsResult = await getPlantEvents(params.id);
  const tasksResult = await getPlantTasks(params.id);
  const events = eventsResult.success ? eventsResult.data : [];
  const tasks = tasksResult.success ? tasksResult.data : [];

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
      <PageShell title={plant.nickname} subtitle="Plant details and care history">
        {/* Plant Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Nickname</dt>
              <dd className="text-base text-slate-900">{plant.nickname}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Species</dt>
              <dd className="text-base text-slate-900">{plant.species_name ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Notes</dt>
              <dd className="text-base text-slate-900 whitespace-pre-wrap">{plant.notes ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
              <dd className="text-base text-slate-900">{formatDate(plant.created_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Log Care Event Form */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Log Care Event
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AddCareEventForm plantId={params.id} />
          </div>
        </section>

        {/* Care Event History */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Care History
          </h2>
          {!eventsResult.success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load care events: {eventsResult.error}
            </div>
          ) : (
            <CareEventList events={events} />
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Tasks</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AddTaskForm plantId={params.id} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Task List</h2>
          {!tasksResult.success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {tasksResult.error === "Not signed in"
                ? "You are not signed in."
                : `Task query failure: ${tasksResult.error}`}
            </div>
          ) : (
            <TaskList tasks={tasks} plantId={params.id} />
          )}
        </section>

        <Link href="/" className="text-sm text-slate-700 underline hover:text-slate-900">
          ← Back to plants
        </Link>
      </PageShell>
    </main>
  );
}
