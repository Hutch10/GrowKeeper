import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { getSpecimenById } from "@/app/actions/specimen-actions";
import { getSpecimenEvents } from "@/app/actions/specimen-events";
import { getSpecimenTasks } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import { AddCareEventForm } from "@/components/care-events/add-care-event-form";
import { CareEventList } from "@/components/care-events/care-event-list";
import { AddTaskForm } from "@/components/tasks/add-task-form";
import { TaskList } from "@/components/tasks/task-list";

export const dynamic = "force-dynamic";

type SpecimenDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function SpecimenDetailPage({ params }: SpecimenDetailPageProps) {
  const result = await getSpecimenById(params.id);

  if (!result.success && result.error === "Not signed in") {
    redirect(`/auth?next=/plants/${params.id}`);
  }

  if (!result.success && result.error === "Database connection error") {
    return (
      <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
        <PageShell title="Specimen Details" subtitle="View specimen information.">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Database connection error
          </div>
          <Link href="/plants" className="text-sm text-slate-700 underline hover:text-slate-900">
            Back to specimens
          </Link>
        </PageShell>
      </main>
    );
  }

  if (!result.success) {
    return (
      <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
        <PageShell title="Specimen Details" subtitle="View specimen information.">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            {result.error}
          </div>
          <Link href="/plants" className="text-sm text-slate-700 underline hover:text-slate-900">
            Back to specimens
          </Link>
        </PageShell>
      </main>
    );
  }

  const specimen = result.data;
  
  // Fetch care events and tasks for this specimen
  const eventsResult = await getSpecimenEvents(params.id);
  const tasksResult = await getSpecimenTasks(params.id);
  const events = eventsResult.success ? eventsResult.data : [];
  const tasks = tasksResult.success ? tasksResult.data : [];

  return (
    <main className="min-h-screen bg-brand-warm font-[family-name:var(--font-geist-sans)] text-brand-dark">
      <PageShell title={specimen.nickname} subtitle="Specimen details and care history">
        {/* Specimen Details */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Specimen Image Card */}
          <div className="overflow-hidden rounded-xl border border-brand-pink/30 bg-white shadow-sm">
            <div className="aspect-square w-full bg-brand-pink-light">
              {specimen.image_url ? (
                <div className="relative h-full w-full">
                  <Image
                    src={specimen.image_url}
                    alt={specimen.nickname}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-brand-green/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-20 w-20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Specimen Information */}
          <div className="rounded-xl border border-brand-pink/30 bg-white p-6 shadow-sm">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-dark/50 font-bold">Nickname</dt>
                <dd className="text-base text-brand-dark font-medium">{specimen.nickname}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-dark/50 font-bold">Species</dt>
                <dd className="text-base text-brand-dark font-medium">{specimen.species_name ?? "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-dark/50 font-bold">Notes</dt>
                <dd className="text-base whitespace-pre-wrap text-brand-dark font-medium">{specimen.notes ?? "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-dark/50 font-bold">Created</dt>
                <dd className="text-base text-brand-dark font-medium">{formatDate(specimen.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Log Care Event Form */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-brand-dark">
            Log Care Event
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <AddCareEventForm specimenId={params.id} />
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
            <AddTaskForm specimenId={params.id} />
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
            <TaskList tasks={tasks} specimenId={params.id} />
          )}
        </section>

        <Link href="/plants" className="text-sm text-slate-700 underline hover:text-slate-900">
          ← Back to specimens
        </Link>
      </PageShell>
    </main>
  );
}
