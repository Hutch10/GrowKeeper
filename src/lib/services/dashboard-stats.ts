import { Specimen } from "@/types/specimen";
import { TaskRow } from "@/app/actions/tasks";
import { checkLegalStatus } from "@/lib/geofencing";

export interface DashboardKPIs {
  totalSpecimens: number;
  dueToday: number;
  overdue: number;
  flagged: number;
  incomplete: number;
}

export type PriorityItemType = 'OVERDUE' | 'FLAGGED' | 'INCOMPLETE' | 'RECENT';

export interface PriorityItem {
  id: string;
  type: PriorityItemType;
  title: string;
  subtitle: string;
  severity: 'danger' | 'warning' | 'info';
  timestamp: string;
  specimenId: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  priorityQueue: PriorityItem[];
  recentActivity: PriorityItem[];
}

/**
 * Aggregates specimens and tasks into actionable dashboard intelligence.
 */
export function aggregateDashboardStats(
  specimens: Specimen[],
  tasks: TaskRow[]
): DashboardStats {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  // 1. Compute KPIs
  const incomplete = specimens.filter(s => !s.species_name || s.lat === null || s.lon === null).length;
  const flaggedSpecimens = specimens.filter(s => {
    if (s.lat !== null && s.lat !== undefined && s.lon !== null && s.lon !== undefined) {
      return checkLegalStatus(s.lon, s.lat).status !== 'safe';
    }
    return false;
  });

  const dueTasks = tasks.filter(t => !t.completed && t.due_date);
  const overdueTasks = dueTasks.filter(t => new Date(t.due_date!) < todayStart);
  const dueTodayTasks = dueTasks.filter(t => {
    const d = new Date(t.due_date!);
    return d >= todayStart && d <= todayEnd;
  });

  const kpis: DashboardKPIs = {
    totalSpecimens: specimens.length,
    dueToday: dueTodayTasks.length,
    overdue: overdueTasks.length,
    flagged: flaggedSpecimens.length,
    incomplete
  };

  // 2. Build Priority Queue (Deterministic Ranking)
  const priorityQueue: PriorityItem[] = [];

  // 2.1 Overdue Tasks (Highest Priority)
  overdueTasks.forEach(task => {
    const specimen = specimens.find(s => s.id === task.specimen_id);
    priorityQueue.push({
      id: `task-${task.id}`,
      type: 'OVERDUE',
      title: `Overdue: ${task.task_type}`,
      subtitle: specimen?.nickname || 'Unknown Specimen',
      severity: 'danger',
      timestamp: task.due_date!,
      specimenId: task.specimen_id
    });
  });

  // 2.2 Flagged Specimens
  flaggedSpecimens.forEach(s => {
    const geo = checkLegalStatus(s.lon!, s.lat!);
    priorityQueue.push({
      id: `flag-${s.id}`,
      type: 'FLAGGED',
      title: 'Restricted Land Entry',
      subtitle: `${s.nickname}: ${geo.message.split('.')[0]}`,
      severity: geo.status === 'danger' ? 'danger' : 'warning',
      timestamp: s.created_at,
      specimenId: s.id
    });
  });

  // 2.3 Incomplete Data
  specimens.filter(s => !s.species_name || s.lat === null || s.lat === undefined).forEach(s => {
    priorityQueue.push({
      id: `inc-${s.id}`,
      type: 'INCOMPLETE',
      title: 'Missing Identity Data',
      subtitle: `${s.nickname} requires species identification or GPS anchoring.`,
      severity: 'info',
      timestamp: s.created_at,
      specimenId: s.id
    });
  });

  // 2.4 Recently Added
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  specimens.filter(s => new Date(s.created_at) > yesterday).forEach(s => {
    priorityQueue.push({
      id: `new-${s.id}`,
      type: 'RECENT',
      title: 'New Specimen Registered',
      subtitle: `Baseline health monitoring initiated for ${s.nickname}.`,
      severity: 'info',
      timestamp: s.created_at,
      specimenId: s.id
    });
  });

  // Sort Priority Queue: danger > warning > info, then by timestamp
  const severityMap = { danger: 0, warning: 1, info: 2 };
  priorityQueue.sort((a, b) => {
    if (a.severity !== b.severity) {
      return severityMap[a.severity] - severityMap[b.severity];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 3. Activity Feed (Merged Operational Events)
  const recentActivity: PriorityItem[] = tasks
    .filter(t => t.completed)
    .map(t => {
      const specimen = specimens.find(s => s.id === t.specimen_id);
      return {
        id: `act-${t.id}`,
        type: 'RECENT',
        title: `Protocol Completed: ${t.task_type}`,
        subtitle: `${specimen?.nickname || 'Unknown'} maintenance performed.`,
        severity: 'info',
        timestamp: t.created_at,
        specimenId: t.specimen_id
      } as PriorityItem;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    kpis,
    priorityQueue: priorityQueue.slice(0, 20),
    recentActivity
  };
}
