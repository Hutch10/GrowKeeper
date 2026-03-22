import { redirect } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard";
import { getSpecimens } from "@/app/actions/specimen-actions";
import { getWeatherData } from "@/app/actions/weather";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [dashboardData, specimensData, weatherData] = await Promise.all([
    getDashboardData(),
    getSpecimens(),
    getWeatherData(),
  ]);

  if (!dashboardData.success || !specimensData.success) {
    // If not signed in (and not in bypass mode), redirect to auth
    if (dashboardData.error === "Not signed in") {
      redirect("/auth?next=/dashboard");
    }
    
    // For other errors, we can still try to render what we can or show an error
    // In Guest Mode, success should be true.
  }

  const initialData = {
    specimens: specimensData.data || [],
    summary: dashboardData.data?.summary || { totalSpecimens: 0, totalIncompleteTasks: 0, totalCareEvents: 0 },
    weather: weatherData.data,
  };

  return <DashboardClient initialData={initialData} />;
}
