import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { formatDate } from "@/lib/date";

export const dynamic = "force-dynamic";

interface TaskWithPlant {
  id: string;
  plant_id: string;
  task_type: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  plant: { nickname: string } | null;
}

export default async function RemindersPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    redirect("/auth?next=/reminders");
  }

  const supabase = createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, plant_id, task_type, due_date, completed, created_at, plant:plants(nickname)")
    .eq("user_id", auth.data.id)
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reminders:", error);
  }

  const allTasks = (tasks ?? []) as TaskWithPlant[];

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const overdueTasks = allTasks.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < todayStart;
  });

  const todayTasks = allTasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    return due >= todayStart && due < tomorrowStart;
  });

  const thisWeekTasks = allTasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    return due >= tomorrowStart && due < weekEnd;
  });

  const laterTasks = allTasks.filter((t) => {
    if (!t.due_date) return true;
    return new Date(t.due_date) >= weekEnd;
  });

  const TASK_EMOJI: Record<string, string> = {
    watered: "💧",
    fertilized: "🌱",
    prune: "✂️",
    repot: "🪴",
    inspect: "🔍",
  };

  const TaskCard = ({ task, urgency }: { task: TaskWithPlant; urgency: "overdue" | "today" | "week" | "later" }) => {
    const urgencyStyles = {
      overdue: "border-red-200 bg-red-50",
      today: "border-amber-200 bg-amber-50",
      week: "border-slate-200 bg-white",
      later: "border-slate-200 bg-white",
    };

    const plantNickname = task.plant?.nickname ?? "Unknown plant";

    return (
      <Link
        href={`/plants/${task.plant_id}`}
        className={`block rounded-lg border p-4 transition-shadow hover:shadow-md ${urgencyStyles[urgency]}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{TASK_EMOJI[task.task_type] || "📋"}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold capitalize text-slate-900">{task.task_type}</p>
            <p className="text-sm text-slate-600">{plantNickname}</p>
            {task.due_date && (
              <p className={`mt-1 text-xs ${urgency === "overdue" ? "font-medium text-red-600" : "text-slate-500"}`}>
                {urgency === "overdue" ? "Overdue: " : "Due: "}
                {formatDate(task.due_date)}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] text-slate-900">
      <PageShell
        title="Reminders"
        subtitle="Stay on top of your plant care schedule"
      >
        {allTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✅
            </div>
            <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
            <p className="mt-1 text-sm text-slate-600">
              No pending tasks. Add tasks to your plants to get reminders.
            </p>
            <Link
              href="/plants"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              View Plants
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue */}
            {overdueTasks.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {overdueTasks.length}
                  </span>
                  <h2 className="text-lg font-semibold text-red-700">Overdue</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} urgency="overdue" />
                  ))}
                </div>
              </section>
            )}

            {/* Today */}
            {todayTasks.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {todayTasks.length}
                  </span>
                  <h2 className="text-lg font-semibold text-amber-700">Due Today</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} urgency="today" />
                  ))}
                </div>
              </section>
            )}

            {/* This Week */}
            {thisWeekTasks.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-slate-700">This Week</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {thisWeekTasks.map((task) => (
                    <TaskCard key={task.id} task={task} urgency="week" />
                  ))}
                </div>
              </section>
            )}

            {/* Later */}
            {laterTasks.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-slate-500">Later</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {laterTasks.map((task) => (
                    <TaskCard key={task.id} task={task} urgency="later" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </PageShell>
    </main>
  );
}
