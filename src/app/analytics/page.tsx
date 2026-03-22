import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { subDays, format, eachDayOfInterval } from 'date-fns';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Fetch analytics data
  const [plantsResult, careEventsResult, tasksResult] = await Promise.all([
    supabase.from('plants').select('id, nickname, created_at').eq('user_id', user.id),
    supabase
      .from('plant_events')
      .select('id, event_type, created_at, plant_id')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('tasks')
      .select('id, completed, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ]);

  const plants = plantsResult.data || [];
  const careEvents = careEventsResult.data || [];
  const tasks = tasksResult.data || [];

  // Calculate care events by day
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const careByDay = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = careEvents.filter(e => 
      format(new Date(e.created_at), 'yyyy-MM-dd') === dayStr
    ).length;
    return {
      date: format(day, 'EEE'),
      fullDate: dayStr,
      count,
    };
  });

  // Care events by type
  const careByType = careEvents.reduce((acc: Record<string, number>, event) => {
    const type = event.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const careTypeData = Object.entries(careByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Task completion rate
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  // Plants added over time
  const plantsByMonth = plants.reduce((acc, plant) => {
    const month = format(new Date(plant.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const analyticsData = {
    summary: {
      totalPlants: plants.length,
      totalCareEvents: careEvents.length,
      totalTasks: tasks.length,
      completedTasks,
      taskCompletionRate,
    },
    careByDay,
    careByType: careTypeData,
    plantsByMonth: Object.entries(plantsByMonth).map(([month, count]) => ({ month, count })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Analytics Dashboard
      </h1>
      <AnalyticsDashboard data={analyticsData} />
    </div>
  );
}
