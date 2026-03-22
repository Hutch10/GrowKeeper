'use client';

import { HealthScore, getHealthColor, getHealthEmoji } from '@/lib/services/specimen-health';

interface HealthScoreCardProps {
  health: HealthScore;
  compact?: boolean;
}

export function HealthScoreCard({ health, compact = false }: HealthScoreCardProps) {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium ${getHealthColor(health.status)}`}>
        <span>{getHealthEmoji(health.status)}</span>
        <span>{health.overall}%</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Health Score</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getHealthColor(health.status)}`}>
          {getHealthEmoji(health.status)} {health.status}
        </div>
      </div>

      {/* Overall Score Circle */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${health.overall * 2.51} 251`}
              className={health.overall >= 60 ? 'text-green-500' : health.overall >= 40 ? 'text-yellow-500' : 'text-red-500'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{health.overall}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Watering</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${health.watering}%` }}
              />
            </div>
            <span className="text-gray-900 dark:text-white font-medium w-8">{health.watering}%</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Consistency</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${health.consistency}%` }}
              />
            </div>
            <span className="text-gray-900 dark:text-white font-medium w-8">{health.consistency}%</span>
          </div>
        </div>
      </div>

      {/* Streak */}
      {health.streak > 0 && (
        <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
          <span className="text-lg">🔥</span>
          <span className="text-sm text-orange-700 dark:text-orange-300">
            {health.streak} care streak!
          </span>
        </div>
      )}

      {/* Last Care */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {health.lastCareDate ? (
          <>Last care: {health.daysSinceLastCare === 0 ? 'Today' : `${health.daysSinceLastCare} days ago`}</>
        ) : (
          <>No care recorded yet</>
        )}
      </div>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="space-y-2">
          {health.recommendations.map((rec, i) => (
            <div key={i} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-700 dark:text-gray-300">
              💡 {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
