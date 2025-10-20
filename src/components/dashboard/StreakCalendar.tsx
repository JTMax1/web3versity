import React, { useState } from 'react';
import { format, startOfWeek } from 'date-fns';
import { Flame, Loader2 } from 'lucide-react';
import { useLearningStreak } from '../../hooks/useStats';

interface StreakCalendarProps {
  userId: string;
}

export function StreakCalendar({ userId }: StreakCalendarProps) {
  const { data: streakData, isLoading, error } = useLearningStreak(userId);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#0084C7] animate-spin" />
      </div>
    );
  }

  if (error || !streakData) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-red-600">Failed to load streak data</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, streakHistory } = streakData;

  // Get intensity color based on activity count
  const getIntensityColor = (activitiesCount: number): string => {
    if (activitiesCount === 0) return 'bg-gray-100';
    if (activitiesCount === 1) return 'bg-green-200';
    if (activitiesCount <= 3) return 'bg-green-400';
    if (activitiesCount <= 5) return 'bg-green-500';
    return 'bg-green-600';
  };

  // Group days by week
  const weeks: typeof streakHistory[][] = [];
  for (let i = 0; i < streakHistory.length; i += 7) {
    weeks.push(streakHistory.slice(i, i + 7));
  }

  // Get day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2)]">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-600">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {currentStreak} <span className="text-lg">days</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2)]">
              <span className="text-white text-sm">🏆</span>
            </div>
            <span className="text-sm text-gray-600">Longest Streak</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {longestStreak} <span className="text-lg">days</span>
          </p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Last 30 Days</h4>
          <p className="text-xs text-gray-500">Your learning activity</p>
        </div>

        {/* Day names */}
        <div className="flex gap-1 mb-2">
          <div className="w-8" /> {/* Spacer for alignment */}
          {dayNames.map(day => (
            <div key={day} className="flex-1 text-center">
              <span className="text-xs text-gray-500">{day[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1 relative">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {/* Week number */}
              <div className="w-8 flex items-center">
                <span className="text-xs text-gray-400">
                  W{weekIndex + 1}
                </span>
              </div>

              {/* Days */}
              {week.map((day, dayIndex) => {
                const isToday = day.date === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={dayIndex}
                    className="flex-1 aspect-square relative"
                    onMouseEnter={() => setHoveredDay({ date: day.date, count: day.activitiesCount })}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      className={`w-full h-full rounded-lg ${getIntensityColor(
                        day.activitiesCount
                      )} transition-all hover:scale-110 hover:shadow-md ${
                        isToday ? 'ring-2 ring-[#0084C7] ring-offset-1' : ''
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {/* Hover tooltip */}
          {hoveredDay && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="font-medium">{format(new Date(hoveredDay.date), 'MMM d, yyyy')}</div>
                <div className="text-gray-300">
                  {hoveredDay.count === 0
                    ? 'No activity'
                    : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'activity' : 'activities'}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs text-gray-500">Less</span>
          {[0, 1, 3, 5, 7].map(count => (
            <div
              key={count}
              className={`w-4 h-4 rounded ${getIntensityColor(count)}`}
            />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}
