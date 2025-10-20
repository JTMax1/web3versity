import React from 'react';
import { User, Badge as BadgeType } from '../../lib/mockData';
import { CourseCard } from '../CourseCard';
import { Flame, TrendingUp, Award, BookOpen } from 'lucide-react';
import { calculateLevelProgress, getRarityColor } from '../../lib/utils';
import { useUserEnrollments, useCompletedCourses } from '../../hooks/useEnrollment';
import { adaptCourseForComponent } from '../../lib/adapters/courseAdapter';

interface DashboardProps {
  user: User;
  badges: BadgeType[];
  onCourseClick: (courseId: string) => void;
  onNavigate: (page: string) => void;
}

export function Dashboard({ user, badges, onCourseClick, onNavigate }: DashboardProps) {
  // Fetch real enrollment data from database
  // Use useUserEnrollments to get ALL enrollments (including newly enrolled)
  const { enrollments: allEnrollments, isLoading } = useUserEnrollments(user?.id);
  const { enrollments: completed } = useCompletedCourses(user?.id);

  // Filter in-progress courses (not completed)
  const inProgress = allEnrollments.filter(e => !e.completed_at);
  const levelProgress = calculateLevelProgress(user.totalPoints);
  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2">Welcome back, {user.username}! 👋</h1>
          <p className="text-gray-600">Continue your Web3 learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Level Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <TrendingUp className="w-6 h-6 text-[#0084C7]" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Level</div>
                <div className="text-2xl text-[#0084C7]">{user.level}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="text-[#0084C7]">{Math.round(levelProgress.percentage)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                <div 
                  className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                {levelProgress.currentLevelPoints}/{levelProgress.nextLevelPoints} pts to Level {user.level + 1}
              </div>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Points</div>
                <div className="text-2xl text-yellow-600">{user.totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Streak</div>
                <div className="text-2xl text-orange-500">{user.streakDays} days</div>
              </div>
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Badges</div>
                <div className="text-2xl text-purple-500">{earnedBadges.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2>Your Badges</h2>
              <button
                onClick={() => onNavigate('profile')}
                className="text-[#0084C7] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {earnedBadges.slice(0, 8).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{badge.image}</span>
                  </div>
                  <div className="text-xs text-center text-gray-600 line-clamp-2">{badge.name}</div>
                  <div 
                    className="text-xs text-center mt-1 capitalize"
                    style={{ color: getRarityColor(badge.rarity) }}
                  >
                    {badge.rarity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    onEnroll={() => onCourseClick(enrollment.course_id)}
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
                onClick={() => onNavigate('courses')}
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
                    onEnroll={() => onCourseClick(enrollment.course_id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        <div>
          <h2 className="mb-6">Recommended for You</h2>
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="space-y-4">
              <RecommendedCourseItem
                emoji="🌐"
                title="Hedera Fundamentals"
                description="Perfect for getting started with Hedera blockchain"
                onClick={() => onNavigate('courses')}
              />
              <RecommendedCourseItem
                emoji="🪙"
                title="Introduction to Hedera Token Service"
                description="Learn to create tokens without smart contracts"
                onClick={() => onNavigate('courses')}
              />
              <RecommendedCourseItem
                emoji="🔒"
                title="Wallet Security Best Practices"
                description="Protect your crypto assets from threats"
                onClick={() => onNavigate('courses')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedCourseItem({ emoji, title, description, onClick }: { emoji: string; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform">
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="flex-1 text-left">
        <div className="text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div className="text-[#0084C7] group-hover:translate-x-1 transition-transform">→</div>
    </button>
  );
}
