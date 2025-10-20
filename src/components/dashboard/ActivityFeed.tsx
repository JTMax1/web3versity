import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  Award,
  GraduationCap,
  Trophy,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useRecentActivity } from '../../hooks/useStats';
import type { Activity, ActivityType } from '../../lib/api/stats';

interface ActivityFeedProps {
  userId: string;
  limit?: number;
}

// Icon mapping for activity types
const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  lesson_completed: BookOpen,
  badge_earned: Award,
  course_enrolled: GraduationCap,
  course_completed: Trophy,
  level_up: TrendingUp,
};

// Color mapping for activity types
const activityColors: Record<ActivityType, string> = {
  lesson_completed: 'from-blue-100 to-blue-200 text-blue-600',
  badge_earned: 'from-yellow-100 to-yellow-200 text-yellow-600',
  course_enrolled: 'from-green-100 to-green-200 text-green-600',
  course_completed: 'from-purple-100 to-purple-200 text-purple-600',
  level_up: 'from-orange-100 to-orange-200 text-orange-600',
};

export function ActivityFeed({ userId, limit = 10 }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = useRecentActivity(userId, limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0084C7] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load activity</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">No recent activity</p>
        <p className="text-sm text-gray-500">
          Start learning to see your progress here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];
        const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
          addSuffix: true
        });

        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 group"
          >
            {/* Timeline connector */}
            <div className="relative flex flex-col items-center">
              {/* Icon circle */}
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] transition-transform group-hover:scale-110`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Connector line */}
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 to-transparent mt-2" />
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1 pb-6">
              <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)] transition-all group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
