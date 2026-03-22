// Specimen Health Monitoring Service
// Calculates health scores based on care consistency

import { differenceInDays, subDays } from 'date-fns';

export interface CareEvent {
  id: string;
  specimen_id: string;
  event_type: string;
  event_date: string;
  notes?: string;
}

export interface HealthScore {
  overall: number; // 0-100
  watering: number;
  consistency: number;
  streak: number;
  lastCareDate: Date | null;
  daysSinceLastCare: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
}

export interface SpecimenHealthConfig {
  wateringFrequencyDays: number;
  toleranceDays: number;
}

const DEFAULT_CONFIG: SpecimenHealthConfig = {
  wateringFrequencyDays: 7,
  toleranceDays: 2,
};

export function calculateHealthScore(
  careEvents: CareEvent[],
  config: SpecimenHealthConfig = DEFAULT_CONFIG
): HealthScore {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  
  // Filter recent care events
  const recentEvents = careEvents
    .filter(e => new Date(e.event_date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const wateringEvents = recentEvents.filter(e => e.event_type === 'watering');
  
  // Calculate last care date
  const lastCareDate = recentEvents.length > 0 ? new Date(recentEvents[0].event_date) : null;
  const daysSinceLastCare = lastCareDate ? differenceInDays(now, lastCareDate) : 999;

  // Watering score (based on frequency adherence)
  const expectedWaterings = Math.floor(30 / config.wateringFrequencyDays);
  const actualWaterings = wateringEvents.length;
  const wateringScore = Math.min(100, (actualWaterings / expectedWaterings) * 100);

  // Consistency score (based on regular intervals)
  let consistencyScore = 100;
  if (wateringEvents.length >= 2) {
    const intervals: number[] = [];
    for (let i = 0; i < wateringEvents.length - 1; i++) {
      const days = differenceInDays(
        new Date(wateringEvents[i].event_date),
        new Date(wateringEvents[i + 1].event_date)
      );
      intervals.push(days);
    }
    
    // Calculate variance from expected frequency
    const variance = intervals.reduce((sum, i) => sum + Math.abs(i - config.wateringFrequencyDays), 0) / intervals.length;
    consistencyScore = Math.max(0, 100 - (variance * 10));
  }

  // Calculate streak
  let streak = 0;
  if (daysSinceLastCare <= config.wateringFrequencyDays + config.toleranceDays) {
    streak = 1;
    for (let i = 0; i < wateringEvents.length - 1; i++) {
      const days = differenceInDays(
        new Date(wateringEvents[i].event_date),
        new Date(wateringEvents[i + 1].event_date)
      );
      if (days <= config.wateringFrequencyDays + config.toleranceDays) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Timeliness penalty
  let timelinessPenalty = 0;
  if (daysSinceLastCare > config.wateringFrequencyDays) {
    const overdueDays = daysSinceLastCare - config.wateringFrequencyDays;
    timelinessPenalty = Math.min(40, overdueDays * 5);
  }

  // Calculate overall score
  const overall = Math.max(0, Math.min(100, 
    (wateringScore * 0.4 + consistencyScore * 0.4 + (streak * 5)) - timelinessPenalty
  ));

  // Determine status
  let status: HealthScore['status'];
  if (overall >= 80) status = 'excellent';
  else if (overall >= 60) status = 'good';
  else if (overall >= 40) status = 'fair';
  else if (overall >= 20) status = 'poor';
  else status = 'critical';

  // Generate recommendations
  const recommendations: string[] = [];
  if (daysSinceLastCare > config.wateringFrequencyDays) {
    recommendations.push(`Your specimen needs care! It's been ${daysSinceLastCare} days.`);
  }
  if (wateringScore < 50) {
    recommendations.push('Try to care for your specimen more regularly to improve its health.');
  }
  if (consistencyScore < 50) {
    recommendations.push('Maintain a consistent care schedule for best results.');
  }
  if (streak >= 4) {
    recommendations.push(`Great job! You're on a ${streak}-care streak! Keep it up!`);
  }

  return {
    overall: Math.round(overall),
    watering: Math.round(wateringScore),
    consistency: Math.round(consistencyScore),
    streak,
    lastCareDate,
    daysSinceLastCare,
    status,
    recommendations,
  };
}

export function getHealthColor(status: HealthScore['status']): string {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'good': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'fair': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'poor': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  }
}

export function getHealthEmoji(status: HealthScore['status']): string {
  switch (status) {
    case 'excellent': return '🌟';
    case 'good': return '😊';
    case 'fair': return '😐';
    case 'poor': return '😟';
    case 'critical': return '🆘';
  }
}
