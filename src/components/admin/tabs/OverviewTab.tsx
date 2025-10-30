import React from 'react';
import {
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Activity,
  Award,
  GraduationCap,
  Zap,
} from 'lucide-react';
import {
  usePlatformMetrics,
  useUserGrowthData,
  useTopCourses,
  useUserRoleDistribution,
  useRecentAdminActions,
} from '../../../hooks/use-admin-analytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0084C7', '#00a8e8', '#7c3aed', '#ec4899', '#f59e0b'];

export function OverviewTab() {
  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();
  const { data: growthData } = useUserGrowthData();
  const { data: topCourses } = useTopCourses(5);
  const { data: roleDistribution } = useUserRoleDistribution();
  const { data: recentActions } = useRecentAdminActions(10);

  if (metricsLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
      </div>
    );
  }

  const growthPercentage =
    metrics.totalUsers > 0
      ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          subtitle={`${metrics.activeUsers} active (7d)`}
          icon={Users}
          color="blue"
          trend={`+${growthPercentage}%`}
        />
        <MetricCard
          title="Total Courses"
          value={metrics.totalCourses.toLocaleString()}
          subtitle={`${metrics.pendingReviewCourses} pending review`}
          icon={BookOpen}
          color="purple"
        />
        <MetricCard
          title="XP Distributed"
          value={metrics.totalXPDistributed.toLocaleString()}
          subtitle={`${metrics.totalLessonsCompleted} lessons completed`}
          icon={Zap}
          color="yellow"
        />
        <MetricCard
          title="Certificates"
          value={metrics.totalCertificatesMinted.toLocaleString()}
          subtitle={`${metrics.totalCoursesCompleted} courses completed`}
          icon={Award}
          color="green"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
          {growthData && growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0084C7"
                  strokeWidth={2}
                  dot={{ fill: '#0084C7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No growth data available
            </div>
          )}
        </div>

        {/* User Role Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
          {roleDistribution && roleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count, percent }) => `${role}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No distribution data available
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Performing Courses</h3>
        {topCourses && topCourses.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCourses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="title" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={100} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="enrollment_count" name="Enrollments" fill="#0084C7" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completion_count" name="Completions" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No course data available
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Actions</h3>
        {recentActions && recentActions.length > 0 ? (
          <div className="space-y-3">
            {recentActions.map((action: any) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Activity className="w-5 h-5 text-[#0084C7] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{action.admin?.username || 'Admin'}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{action.action_type.replace('_', ' ')}</span>
                  </div>
                  {action.action_details && (
                    <p className="text-sm text-gray-600 truncate">
                      {JSON.stringify(action.action_details)}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(action.performed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No recent actions</div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'yellow' | 'green';
  trend?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}
