import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { NavBar } from "./nav-bar";

export async function AppNav() {
  const auth = await getAuthenticatedUser();

  if (!auth.success) {
    return <NavBar overdueCount={0} />;
  }

  const supabase = createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", auth.data.id)
    .eq("completed", false)
    .lt("due_date", todayStart.toISOString());

  return <NavBar overdueCount={count ?? 0} />;
}
