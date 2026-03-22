'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalPlants: number;
    totalCareEvents: number;
    totalTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
  };
  careByDay: { date: string; fullDate: string; count: number }[];
  careByType: { name: string; value: number }[];
  plantsByMonth: { month: string; count: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Plants"
          value={data.summary.totalPlants}
          icon="🌱"
          color="bg-green-500"
        />
        <SummaryCard
          title="Care Events (30d)"
          value={data.summary.totalCareEvents}
          icon="💧"
          color="bg-blue-500"
        />
        <SummaryCard
          title="Tasks Created"
          value={data.summary.totalTasks}
          icon="📋"
          color="bg-purple-500"
        />
        <SummaryCard
          title="Completion Rate"
          value={`${data.summary.taskCompletionRate}%`}
          icon="✅"
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Care Events by Day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Care Activity (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.careByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Care Events by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Care Types Distribution
          </h3>
          <div className="h-64">
            {data.careByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.careByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  >
                    {data.careByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No care events recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plant Growth Chart */}
      {data.plantsByMonth.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Plant Collection Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.plantsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          💡 Insights
        </h3>
        <div className="space-y-3">
          {data.summary.totalCareEvents > 0 && (
            <InsightCard
              text={`You've logged ${data.summary.totalCareEvents} care events in the last 30 days!`}
              type="success"
            />
          )}
          {data.summary.taskCompletionRate >= 80 && (
            <InsightCard
              text={`Excellent! Your task completion rate is ${data.summary.taskCompletionRate}%`}
              type="success"
            />
          )}
          {data.summary.taskCompletionRate < 50 && data.summary.totalTasks > 0 && (
            <InsightCard
              text="Try to complete more tasks to keep your plants healthy!"
              type="warning"
            />
          )}
          {data.summary.totalPlants === 0 && (
            <InsightCard
              text="Add your first plant to start tracking!"
              type="info"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ text, type }: { text: string; type: 'success' | 'warning' | 'info' }) {
  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[type]}`}>
      {text}
    </div>
  );
}
