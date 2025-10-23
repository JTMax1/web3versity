import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseCard } from '../CourseCard';
import { Flame, TrendingUp, Award, BookOpen, Trophy, BarChart3, Activity, Star } from 'lucide-react';
import { useUserEnrollments, useCompletedCourses } from '../../hooks/useEnrollment';
import { adaptCourseForComponent } from '../../lib/adapters/courseAdapter';
import { useUserStats, useLeaderboardPosition } from '../../hooks/useStats';
import { ActivityFeed } from '../dashboard/ActivityFeed';
import { StreakCalendar } from '../dashboard/StreakCalendar';
import { ProgressChart } from '../dashboard/ProgressChart';
import { useWallet } from '../../contexts/WalletContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activity'>('overview');

  // Fetch real data from database
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: leaderboardPos } = useLeaderboardPosition(user?.id);
  const { enrollments: allEnrollments, isLoading: enrollmentsLoading } = useUserEnrollments(user?.id);
  const { enrollments: completed } = useCompletedCourses(user?.id);

  // Filter in-progress courses (not completed)
  const inProgress = allEnrollments.filter(e => !e.completed_at);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <p className="text-gray-600">Please connect your wallet to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = statsLoading || enrollmentsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-full flex items-center justify-center text-3xl shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              {stats?.avatarEmoji || '👤'}
            </div>
            <div>
              <h1 className="mb-1">Welcome back, {stats?.username || user.username}! 👋</h1>
              <p className="text-gray-600">Continue your Web3 learning journey</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-full p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)] max-w-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Level Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <TrendingUp className="w-6 h-6 text-[#0084C7]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Level</div>
                    <div className="text-2xl text-[#0084C7]">
                      {isLoading ? '...' : stats?.currentLevel || 1}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-[#0084C7]">
                      {isLoading ? '...' : Math.round(stats?.levelProgress || 0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500"
                      style={{ width: `${stats?.levelProgress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {isLoading ? 'Loading...' : `${stats?.xpToNextLevel || 0} XP to next level`}
                  </div>
                </div>
              </div>

              {/* Total XP Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total XP</div>
                    <div className="text-2xl text-yellow-600">
                      {isLoading ? '...' : (stats?.totalXp || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                {stats && stats.thisWeekXp > 0 && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    +{stats.thisWeekXp} this week
                  </div>
                )}
              </div>

              {/* Streak Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Streak</div>
                    <div className="text-2xl text-orange-500">
                      {isLoading ? '...' : `${stats?.currentStreak || 0} days`}
                    </div>
                  </div>
                </div>
                {stats && stats.longestStreak > 0 && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Best: {stats.longestStreak} days
                  </div>
                )}
              </div>

              {/* Leaderboard Rank Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <Trophy className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Rank</div>
                    <div className="text-2xl text-purple-500">
                      {isLoading ? '...' : `#${leaderboardPos?.rank || 0}`}
                    </div>
                  </div>
                </div>
                {leaderboardPos && leaderboardPos.percentile > 0 && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Top {Math.round(100 - leaderboardPos.percentile)}%
                  </div>
                )}
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatsCard
                icon={BookOpen}
                label="Courses Enrolled"
                value={isLoading ? '...' : stats?.coursesEnrolled || 0}
                color="blue"
              />
              <StatsCard
                icon={Activity}
                label="In Progress"
                value={isLoading ? '...' : stats?.coursesInProgress || 0}
                color="green"
              />
              <StatsCard
                icon={Award}
                label="Completed"
                value={isLoading ? '...' : stats?.coursesCompleted || 0}
                color="purple"
              />
            </div>

            {/* Continue Learning */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                  <BookOpen className="w-5 h-5 text-[#0084C7]" />
                </div>
                <h2>Continue Learning</h2>
              </div>

              {isLoading ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="text-gray-600">Loading your courses...</p>
                </div>
              ) : inProgress && inProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.slice(0, 3).map((enrollment) => {
                    if (!enrollment.course) return null;
                    const componentCourse = adaptCourseForComponent(enrollment.course);

                    return (
                      <CourseCard
                        key={enrollment.id}
                        course={componentCourse}
                        enrolled={true}
                        progress={enrollment.progress_percentage || 0}
                        onEnroll={() => navigate(`/courses/${enrollment.course_id}`)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <BookOpen className="w-10 h-10 text-[#0084C7]" />
                  </div>
                  <h3 className="mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white px-8 py-3 rounded-full shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] transition-all"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>

            {/* Completed Courses */}
            {completed && completed.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6">Completed Courses ({completed.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completed.slice(0, 3).map((enrollment) => {
                    if (!enrollment.course) return null;
                    const componentCourse = adaptCourseForComponent(enrollment.course);

                    return (
                      <CourseCard
                        key={enrollment.id}
                        course={componentCourse}
                        enrolled={true}
                        progress={100}
                        isCompleted={true}
                        onEnroll={() => navigate(`/courses/${enrollment.course_id}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && user?.id && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* XP Progress Chart */}
              <div>
                <h2 className="mb-6">XP Progress</h2>
                <ProgressChart userId={user.id} days={30} />
              </div>

              {/* Streak Calendar */}
              <div>
                <h2 className="mb-6">Learning Streak</h2>
                <StreakCalendar userId={user.id} />
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && user?.id && (
          <div className="max-w-3xl">
            <h2 className="mb-6">Recent Activity</h2>
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <ActivityFeed userId={user.id} limit={15} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-100 to-blue-200 text-blue-600',
    green: 'from-green-100 to-green-200 text-green-600',
    purple: 'from-purple-100 to-purple-200 text-purple-600',
    orange: 'from-orange-100 to-orange-200 text-orange-600',
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
}
