/**
 * User Statistics and Dashboard Data API
 * Provides comprehensive stats for dashboard and profile pages
 */

import { supabase } from '../supabase/client';
import type { User } from '../supabase/types';

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  // User Info
  userId: string;
  username: string;
  avatarEmoji: string;
  isEducator: boolean;

  // XP & Leveling
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgress: number; // 0-100 percentage

  // Streaks
  currentStreak: number;
  longestStreak: number;

  // Course Stats
  coursesEnrolled: number;
  coursesInProgress: number;
  coursesCompleted: number;

  // Lesson Stats
  lessonsCompleted: number;

  // Achievements
  badgesEarned: number;

  // Activity Stats
  thisWeekXp: number;
  thisMonthXp: number;
  lastActivityDate: string;

  // Leaderboard
  leaderboardRank: number | null;
  xpToNextRank: number | null;
}

export type ActivityType =
  | 'lesson_completed'
  | 'badge_earned'
  | 'course_enrolled'
  | 'course_completed'
  | 'level_up';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakHistory: Array<{
    date: string;
    hasActivity: boolean;
    activitiesCount: number;
  }>;
}

export interface XPHistoryPoint {
  date: string;
  xpEarned: number;
  cumulativeXp: number;
}

export interface LeaderboardPosition {
  rank: number;
  totalUsers: number;
  percentile: number;
  xpToNextRank: number | null;
  nextRankXp: number | null;
}

// ============================================================================
// XP and Level Calculations
// ============================================================================

/**
 * Calculate XP required for a given level
 * Formula: XP = 100 * level^1.5
 */
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/**
 * Calculate XP needed to reach next level
 */
export function getXpToNextLevel(totalXp: number, currentLevel: number): number {
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  return nextLevelXp - totalXp;
}

/**
 * Calculate progress percentage to next level
 */
export function getLevelProgress(totalXp: number, currentLevel: number): number {
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));
}

// ============================================================================
// Main Stats Functions
// ============================================================================

/**
 * Get comprehensive user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    // Fetch enrollment counts
    const [enrolledResult, inProgressResult, completedResult] = await Promise.all([
      supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('completed_at', null)
        .not('started_at', 'is', null),

      supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
    ]);

    // Fetch lessons completed count
    const { count: lessonsCompleted } = await supabase
      .from('lesson_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Fetch badges earned count
    const { count: badgesEarned } = await supabase
      .from('user_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate this week's XP
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: weekXpData } = await supabase
      .from('lesson_completions')
      .select('xp_earned')
      .eq('user_id', userId)
      .gte('completed_at', oneWeekAgo.toISOString());

    const thisWeekXp = weekXpData?.reduce((sum, row) => sum + (row.xp_earned || 0), 0) || 0;

    // Calculate this month's XP
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: monthXpData } = await supabase
      .from('lesson_completions')
      .select('xp_earned')
      .eq('user_id', userId)
      .gte('completed_at', oneMonthAgo.toISOString());

    const thisMonthXp = monthXpData?.reduce((sum, row) => sum + (row.xp_earned || 0), 0) || 0;

    // Get leaderboard position
    const leaderboardPos = await getLeaderboardPosition(userId);

    // Calculate XP progress - use calculated level from XP, not database value
    const actualLevel = getLevelFromXp(user.total_xp);
    const xpToNextLevel = getXpToNextLevel(user.total_xp, actualLevel);
    const levelProgress = getLevelProgress(user.total_xp, actualLevel);

    return {
      userId: user.id,
      username: user.username,
      avatarEmoji: user.avatar_emoji,
      isEducator: user.is_educator || false,

      totalXp: user.total_xp,
      currentLevel: actualLevel,
      xpToNextLevel,
      levelProgress,

      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,

      coursesEnrolled: enrolledResult.count || 0,
      coursesInProgress: inProgressResult.count || 0,
      coursesCompleted: completedResult.count || 0,

      lessonsCompleted: lessonsCompleted || 0,
      badgesEarned: badgesEarned || 0,

      thisWeekXp,
      thisMonthXp,
      lastActivityDate: user.last_activity_date,

      leaderboardRank: leaderboardPos.rank,
      xpToNextRank: leaderboardPos.xpToNextRank,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Get recent user activity
 */
export async function getRecentActivity(userId: string, limit: number = 10): Promise<Activity[]> {
  try {
    const activities: Activity[] = [];

    // Fetch recent lesson completions
    const { data: lessons } = await supabase
      .from('lesson_completions')
      .select(`
        id,
        lesson_id,
        xp_earned,
        completed_at,
        lessons:lesson_id (
          title
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (lessons) {
      lessons.forEach(lesson => {
        activities.push({
          id: `lesson-${lesson.id}`,
          type: 'lesson_completed',
          title: 'Lesson Completed',
          description: `Completed "${(lesson.lessons as any)?.title || 'Unknown Lesson'}" (+${lesson.xp_earned} XP)`,
          timestamp: lesson.completed_at,
          metadata: {
            lessonId: lesson.lesson_id,
            xpEarned: lesson.xp_earned
          }
        });
      });
    }

    // Fetch recent achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achievement_id,
        earned_at,
        achievements:achievement_id (
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(5);

    if (achievements) {
      achievements.forEach(achievement => {
        activities.push({
          id: `achievement-${achievement.id}`,
          type: 'badge_earned',
          title: 'Badge Earned',
          description: (achievement.achievements as any)?.name || 'Achievement unlocked!',
          timestamp: achievement.earned_at,
          metadata: {
            achievementId: achievement.achievement_id
          }
        });
      });
    }

    // Fetch recent enrollments
    const { data: enrollments } = await supabase
      .from('user_progress')
      .select(`
        id,
        course_id,
        enrollment_date,
        completed_at,
        courses:course_id (
          title
        )
      `)
      .eq('user_id', userId)
      .order('enrollment_date', { ascending: false })
      .limit(5);

    if (enrollments) {
      enrollments.forEach(enrollment => {
        if (enrollment.completed_at) {
          activities.push({
            id: `course-complete-${enrollment.id}`,
            type: 'course_completed',
            title: 'Course Completed',
            description: `Completed "${(enrollment.courses as any)?.title || 'Unknown Course'}"`,
            timestamp: enrollment.completed_at,
            metadata: {
              courseId: enrollment.course_id
            }
          });
        } else {
          activities.push({
            id: `enrollment-${enrollment.id}`,
            type: 'course_enrolled',
            title: 'Course Enrolled',
            description: `Enrolled in "${(enrollment.courses as any)?.title || 'Unknown Course'}"`,
            timestamp: enrollment.enrollment_date,
            metadata: {
              courseId: enrollment.course_id
            }
          });
        }
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

/**
 * Get user's leaderboard position
 */
export async function getLeaderboardPosition(userId: string): Promise<LeaderboardPosition> {
  try {
    // Get user's XP
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();

    if (!user) {
      return {
        rank: 0,
        totalUsers: 0,
        percentile: 0,
        xpToNextRank: null,
        nextRankXp: null
      };
    }

    // Count users with more XP (this gives us the rank)
    const { count: usersAhead } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gt('total_xp', user.total_xp)
      .eq('show_on_leaderboard', true);

    const rank = (usersAhead || 0) + 1;

    // Get total users on leaderboard
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('show_on_leaderboard', true);

    // Get next rank's XP
    const { data: nextRankUsers } = await supabase
      .from('users')
      .select('total_xp')
      .gt('total_xp', user.total_xp)
      .eq('show_on_leaderboard', true)
      .order('total_xp', { ascending: true })
      .limit(1);

    const nextRankUser = nextRankUsers?.[0] || null;

    const nextRankXp = nextRankUser?.total_xp || null;
    const xpToNextRank = nextRankXp ? nextRankXp - user.total_xp : null;

    const percentile = totalUsers ? ((totalUsers - rank + 1) / totalUsers) * 100 : 0;

    return {
      rank,
      totalUsers: totalUsers || 0,
      percentile,
      xpToNextRank,
      nextRankXp
    };
  } catch (error) {
    console.error('Error fetching leaderboard position:', error);
    return {
      rank: 0,
      totalUsers: 0,
      percentile: 0,
      xpToNextRank: null,
      nextRankXp: null
    };
  }
}

/**
 * Get user's learning streak data
 */
export async function getLearningStreak(userId: string): Promise<StreakData> {
  try {
    // Get user's current streak
    const { data: user } = await supabase
      .from('users')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .single();

    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        streakHistory: []
      };
    }

    // Get last 30 days of activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await supabase
      .from('lesson_completions')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    // Build streak history
    const streakHistory: StreakData['streakHistory'] = [];
    const activityByDate = new Map<string, number>();

    // Count activities per day
    activities?.forEach(activity => {
      const date = new Date(activity.completed_at).toISOString().split('T')[0];
      activityByDate.set(date, (activityByDate.get(date) || 0) + 1);
    });

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      streakHistory.push({
        date: dateStr,
        hasActivity: activityByDate.has(dateStr),
        activitiesCount: activityByDate.get(dateStr) || 0
      });
    }

    return {
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      streakHistory
    };
  } catch (error) {
    console.error('Error fetching learning streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: []
    };
  }
}

/**
 * Get XP history for chart
 */
export async function getXPHistory(userId: string, days: number = 30): Promise<XPHistoryPoint[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: completions } = await supabase
      .from('lesson_completions')
      .select('xp_earned, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    if (!completions || completions.length === 0) {
      return [];
    }

    // Group XP by date
    const xpByDate = new Map<string, number>();
    completions.forEach(completion => {
      const date = new Date(completion.completed_at).toISOString().split('T')[0];
      xpByDate.set(date, (xpByDate.get(date) || 0) + completion.xp_earned);
    });

    // Build history with cumulative XP
    const history: XPHistoryPoint[] = [];
    let cumulativeXp = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const xpEarned = xpByDate.get(dateStr) || 0;
      cumulativeXp += xpEarned;

      history.push({
        date: dateStr,
        xpEarned,
        cumulativeXp
      });
    }

    return history;
  } catch (error) {
    console.error('Error fetching XP history:', error);
    return [];
  }
}
