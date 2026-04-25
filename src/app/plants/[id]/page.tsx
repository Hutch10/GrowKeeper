import Link from "next/link";
import Image from "next/image";
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
import { HealthSparkline } from "@/components/plants/health-sparkline";
import { CareSchedule } from "@/components/plants/care-schedule";
import { getPlantWeatherAlert } from "@/app/actions/weather-alert";

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
  const eventsResult = await getPlantEvents(params.id);
  const tasksResult = await getPlantTasks(params.id);
  const events = eventsResult.success ? eventsResult.data : [];
  const tasks = tasksResult.success ? tasksResult.data : [];

  // Ascending order for sparkline; events come in descending by default
  const eventsAsc = [...events].reverse();

  const weatherAlert = await getPlantWeatherAlert(plant.lat, plant.lon);

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
      <PageShell title={plant.nickname} subtitle="Plant details and care history">

        {/* Weather alert banner */}
        {weatherAlert && (
          <div className={`rounded-xl border px-5 py-4 flex items-start gap-3 ${
            weatherAlert.level === "frost"
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-orange-50 border-orange-200 text-orange-900"
          }`}>
            <span className="text-2xl">{weatherAlert.level === "frost" ? "🌨️" : "🌡️"}</span>
            <div>
              <p className="font-bold text-sm">{weatherAlert.message}</p>
              <p className="text-sm mt-0.5 opacity-75">{weatherAlert.recommendation}</p>
            </div>
          </div>
        )}

        {/* Hero: photo + core stats */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {plant.image_url ? (
            <div className="relative w-full h-56 bg-slate-100">
              <Image
                src={plant.image_url}
                alt={plant.nickname}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-green-50 to-emerald-100">
              <span className="text-5xl">🌿</span>
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Core details */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400 font-medium">Nickname</dt>
                <dd className="text-base font-semibold text-slate-900 mt-0.5">{plant.nickname}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400 font-medium">Species</dt>
                <dd className="text-base font-semibold text-slate-900 mt-0.5">{plant.species_name ?? "Unknown"}</dd>
              </div>
              {plant.location && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400 font-medium">Location</dt>
                  <dd className="text-base font-semibold text-slate-900 mt-0.5">{plant.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400 font-medium">Added</dt>
                <dd className="text-base font-semibold text-slate-900 mt-0.5">{formatDate(plant.created_at)}</dd>
              </div>
            </dl>

            {plant.notes && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{plant.notes}</p>
              </div>
            )}

            {/* Health sparkline */}
            <div className="pt-2 border-t border-slate-100">
              <HealthSparkline
                events={eventsAsc}
                createdAt={plant.created_at}
                currentHealth={plant.health ?? 100}
              />
            </div>
          </div>
        </div>

        {/* Care schedule intelligence */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Care Schedule</h2>
          <CareSchedule events={events} />
        </section>

        {/* Log Care Event */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Log Care Event</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AddCareEventForm plantId={params.id} />
          </div>
        </section>

        {/* Care History */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Care History
            {events.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({events.length} events)</span>
            )}
          </h2>
          {!eventsResult.success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load care events: {eventsResult.error}
            </div>
          ) : (
            <CareEventList events={events} />
          )}
        </section>

        {/* Tasks */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Add Task</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AddTaskForm plantId={params.id} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Tasks
            {tasks.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({tasks.length})</span>
            )}
          </h2>
          {!tasksResult.success ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {tasksResult.error === "Not signed in"
                ? "You are not signed in."
                : `Task query failure: ${tasksResult.error}`}
            </div>
          ) : (
            <TaskList tasks={tasks} specimenId={params.id} />
          )}
        </section>

        <Link href="/" className="text-sm text-slate-700 underline hover:text-slate-900">
          ← Back to plants
        </Link>
      </PageShell>
    </main>
  );
}
