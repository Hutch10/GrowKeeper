import { redirect } from "next/navigation";
import { getTasks } from "@/app/actions/tasks";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { TasksClient } from "@/components/tasks/tasks-client";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasksResult, specimensResult] = await Promise.all([
    getTasks(),
    getSpecimens()
  ]);

  if (!tasksResult.success || !specimensResult.success) {
    if (tasksResult.error === "Not signed in" || specimensResult.error === "Not signed in") {
      redirect("/auth?next=/tasks");
    }
    // Fallback to empty states if other error
  }

  const tasks = tasksResult.data || [];
  const specimens = specimensResult.data || [];

  return <TasksClient initialTasks={tasks} specimens={specimens} />;
}
