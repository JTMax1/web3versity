import React from 'react';
import { useEngagementMetrics, useLearningMetrics } from '../../../hooks/use-admin-analytics';
import { Activity, BookOpen, Target, TrendingUp } from 'lucide-react';

export function AnalyticsTab() {
  const { data: engagement } = useEngagementMetrics();
  const { data: learning } = useLearningMetrics();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="DAU" value={engagement?.dau.toLocaleString() || '0'} icon={Activity} />
          <MetricCard title="WAU" value={engagement?.wau.toLocaleString() || '0'} icon={Activity} />
          <MetricCard title="MAU" value={engagement?.mau.toLocaleString() || '0'} icon={Activity} />
          <MetricCard title="Avg Session (min)" value={engagement?.avgSessionDuration.toString() || '0'} icon={TrendingUp} />
        </div>
      </div>

      {/* Learning Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Lessons Completed" value={learning?.totalLessonsCompleted.toLocaleString() || '0'} icon={BookOpen} />
          <MetricCard title="Courses Completed" value={learning?.totalCoursesCompleted.toLocaleString() || '0'} icon={Target} />
          <MetricCard title="Quiz Attempts" value={learning?.totalQuizAttempts.toLocaleString() || '0'} icon={Target} />
          <MetricCard title="Avg Quiz Score" value={`${learning?.averageQuizScore || 0}%`} icon={TrendingUp} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-[#0084C7]" />
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
