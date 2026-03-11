import { PageShell } from "@/components/layout/page-shell";
import { getDashboardData } from "@/app/actions/dashboard";
import { formatDate } from "@/lib/date";
import { UpcomingTasksList } from "@/components/dashboard/upcoming-tasks-list";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  if (!dashboard.success && dashboard.error === "Not signed in") {
    redirect("/auth?next=/dashboard");
  }

  const summary = dashboard.success
    ? dashboard.data.summary
    : { totalPlants: 0, totalIncompleteTasks: 0, totalCareEvents: 0 };
  const upcomingTasks = dashboard.success ? dashboard.data.upcomingTasks : [];
  const recentActivity = dashboard.success ? dashboard.data.recentActivity : [];

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
      <PageShell
        title="Dashboard"
        subtitle="Monitor your plants, tasks, and latest care activity."
      >
        {!dashboard.success && dashboard.error !== "Not signed in" ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Dashboard query failure
          </div>
        ) : null}

        {dashboard.success ? (
          <>
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Collection Summary</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Plants</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{summary.totalPlants}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Incomplete Tasks</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {summary.totalIncompleteTasks}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Care Events</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{summary.totalCareEvents}</p>
            </article>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming Tasks</h2>
          <UpcomingTasksList tasks={upcomingTasks} />
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Recent Care Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No recent care activity
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((event) => {
                const eventEmoji: Record<string, string> = {
                  watered: "💧",
                  fertilized: "🌱",
                  pruned: "✂️",
                  repotted: "🪴",
                };
                const plantNickname = Array.isArray(event.plant)
                  ? (event.plant[0]?.nickname ?? "Unknown plant")
                  : (event.plant?.nickname ?? "Unknown plant");
                
                return (
                  <article
                    key={event.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{eventEmoji[event.event_type] || "📝"}</span>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-base font-semibold capitalize text-slate-900">
                            {event.event_type}
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(event.created_at)}</p>
                        </div>
                        <p className="text-sm text-slate-600">
                          {plantNickname}
                        </p>
                        {event.notes && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
          </>
        ) : null}
      </PageShell>
    </main>
  );
}
