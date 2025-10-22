/**
 * Leaderboard API Client
 *
 * Provides real-time leaderboard data with:
 * - All-time rankings (from cache)
 * - Weekly rankings (calculated)
 * - Monthly rankings (calculated)
 * - User rank lookup
 * - Leaderboard statistics
 */

import { supabase } from '../supabase/client';

export type LeaderboardTimeframe = 'all' | 'week' | 'month';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_emoji: string;
  level: number;
  total_xp: number;
  lessons_completed: number;
  courses_completed: number;
  streak_days: number;
  last_active: string;
  // Highlight if this is the current user
  is_current_user?: boolean;
}

export interface UserRankInfo {
  rank: number;
  total_xp: number;
  users_above: number;
  users_below: number;
  percentile: number;
}

export interface LeaderboardStats {
  total_users: number;
  total_xp_earned: number;
  most_completed_course: {
    title: string;
    completions: number;
  } | null;
  top_performer_this_week: {
    username: string;
    xp_gained: number;
  } | null;
}

/**
 * Get leaderboard entries for specified timeframe
 *
 * @param timeframe - 'all' (from cache), 'week', or 'month'
 * @param limit - Number of entries to return (default 100)
 * @returns Array of leaderboard entries with rankings
 */
export async function getLeaderboard(
  timeframe: LeaderboardTimeframe = 'all',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    if (timeframe === 'all') {
      // Use cached all-time rankings (fast)
      const { data, error } = await supabase
        .from('leaderboard_cache')
        .select(`
          all_time_rank,
          user_id,
          total_xp,
          lessons_completed,
          courses_completed,
          users!inner (
            username,
            avatar_emoji,
            current_level,
            current_streak,
            last_login_at
          )
        `)
        .order('all_time_rank', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((entry: any) => ({
        rank: entry.all_time_rank,
        user_id: entry.user_id,
        username: entry.users.username,
        avatar_emoji: entry.users.avatar_emoji || '👤',
        level: entry.users.current_level,
        total_xp: entry.total_xp,
        lessons_completed: entry.lessons_completed,
        courses_completed: entry.courses_completed,
        streak_days: entry.users.current_streak || 0,
        last_active: entry.users.last_login_at || new Date().toISOString(),
      }));
    } else {
      // Calculate weekly or monthly rankings
      const daysBack = timeframe === 'week' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      // Call database function for performance
      const { data, error } = await supabase.rpc(
        timeframe === 'week' ? 'get_weekly_leaderboard' : 'get_monthly_leaderboard',
        { entry_limit: limit }
      );

      if (error) {
        console.error(`Error fetching ${timeframe} leaderboard:`, error);
        throw error;
      }

      return (data || []).map((entry: any, index: number) => ({
        rank: index + 1,
        user_id: entry.user_id,
        username: entry.username,
        avatar_emoji: entry.avatar_emoji || '👤',
        level: entry.level,
        total_xp: entry.period_xp,
        lessons_completed: entry.period_lessons,
        courses_completed: entry.period_courses || 0,
        streak_days: entry.current_streak || 0,
        last_active: entry.last_active_at || new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's rank and position info for specified timeframe
 *
 * @param userId - User ID to look up
 * @param timeframe - 'all', 'week', or 'month'
 * @returns User's rank information
 */
export async function getUserRank(
  userId: string,
  timeframe: LeaderboardTimeframe = 'all'
): Promise<UserRankInfo | null> {
  try {
    if (timeframe === 'all') {
      // Get from cache
      const { data, error } = await supabase
        .from('leaderboard_cache')
        .select('all_time_rank, total_xp')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing rows

      // If no cache entry, user hasn't earned any XP yet
      if (error) {
        console.error('Error fetching user rank from cache:', error);
        return null;
      }

      if (!data) {
        // User not in cache - likely no XP earned yet
        return {
          rank: 0,
          total_xp: 0,
          users_above: 0,
          users_below: 0,
          percentile: 0,
        };
      }

      // Get total users for percentile
      const { count } = await supabase
        .from('leaderboard_cache')
        .select('*', { count: 'exact', head: true });

      return {
        rank: data.all_time_rank || 0,
        total_xp: data.total_xp || 0,
        users_above: (data.all_time_rank || 1) - 1,
        users_below: (count || 0) - (data.all_time_rank || 0),
        percentile: count ? Math.round((1 - (data.all_time_rank || 0) / count) * 100) : 0,
      };
    } else {
      // Calculate from recent activity
      const { data, error } = await supabase.rpc(
        timeframe === 'week' ? 'get_user_weekly_rank' : 'get_user_monthly_rank',
        { p_user_id: userId }
      );

      if (error || !data || data.length === 0) return null;

      // RPC functions return arrays, get first element
      const rankData = Array.isArray(data) ? data[0] : data;

      if (!rankData || !rankData.rank) return null;

      return {
        rank: rankData.rank,
        total_xp: rankData.period_xp || 0,
        users_above: (rankData.rank || 1) - 1,
        users_below: (rankData.total_users || 0) - (rankData.rank || 0),
        percentile: rankData.total_users ? Math.round((1 - rankData.rank / rankData.total_users) * 100) : 0,
      };
    }
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }
}

/**
 * Get users around a specific rank (for showing context)
 *
 * @param rank - Center rank
 * @param timeframe - 'all', 'week', or 'month'
 * @param range - Number of users above and below (default 5)
 * @returns Array of leaderboard entries around the rank
 */
export async function getLeaderboardContext(
  rank: number,
  timeframe: LeaderboardTimeframe = 'all',
  range: number = 5
): Promise<LeaderboardEntry[]> {
  try {
    const startRank = Math.max(1, rank - range);
    const endRank = rank + range;

    if (timeframe === 'all') {
      const { data, error } = await supabase
        .from('leaderboard_cache')
        .select(`
          all_time_rank,
          user_id,
          total_xp,
          lessons_completed,
          courses_completed,
          users!inner (
            username,
            avatar_emoji,
            current_level,
            current_streak,
            last_login_at
          )
        `)
        .gte('all_time_rank', startRank)
        .lte('all_time_rank', endRank)
        .order('all_time_rank', { ascending: true });

      if (error) throw error;

      return (data || []).map((entry: any) => ({
        rank: entry.all_time_rank,
        user_id: entry.user_id,
        username: entry.users.username,
        avatar_emoji: entry.users.avatar_emoji || '👤',
        level: entry.users.current_level,
        total_xp: entry.total_xp,
        lessons_completed: entry.lessons_completed,
        courses_completed: entry.courses_completed,
        streak_days: entry.users.current_streak || 0,
        last_active: entry.users.last_login_at || new Date().toISOString(),
      }));
    } else {
      // For weekly/monthly, get full leaderboard and slice
      const fullLeaderboard = await getLeaderboard(timeframe, endRank);
      return fullLeaderboard.slice(startRank - 1, endRank);
    }
  } catch (error) {
    console.error('Error fetching leaderboard context:', error);
    return [];
  }
}

/**
 * Get leaderboard statistics
 *
 * @returns Global leaderboard stats
 */
export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total XP earned
    const { data: xpData } = await supabase
      .from('users')
      .select('total_xp');

    const totalXP = (xpData || []).reduce((sum, user) => sum + (user.total_xp || 0), 0);

    // Get most completed course
    const { data: courseData } = await supabase
      .from('user_progress')
      .select('course_id, courses!inner(title)')
      .not('completed_at', 'is', null);

    const courseCounts = (courseData || []).reduce((acc: any, progress: any) => {
      const courseTitle = progress.courses?.title;
      if (courseTitle) {
        acc[courseTitle] = (acc[courseTitle] || 0) + 1;
      }
      return acc;
    }, {});

    const mostCompletedCourse = Object.entries(courseCounts).length > 0
      ? Object.entries(courseCounts).reduce((max: any, [title, count]: any) =>
          count > (max.completions || 0) ? { title, completions: count } : max
        , { title: '', completions: 0 })
      : null;

    // Get top performer this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weeklyTopData } = await supabase.rpc('get_weekly_leaderboard', {
      entry_limit: 1
    });

    const topPerformerThisWeek = weeklyTopData && weeklyTopData.length > 0
      ? {
          username: weeklyTopData[0].username,
          xp_gained: weeklyTopData[0].period_xp,
        }
      : null;

    return {
      total_users: totalUsers || 0,
      total_xp_earned: totalXP,
      most_completed_course: mostCompletedCourse,
      top_performer_this_week: topPerformerThisWeek,
    };
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    return {
      total_users: 0,
      total_xp_earned: 0,
      most_completed_course: null,
      top_performer_this_week: null,
    };
  }
}

/**
 * Refresh leaderboard cache (admin function)
 *
 * Recalculates all rankings and updates the cache table
 *
 * @returns Success status
 */
export async function refreshLeaderboardCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('refresh_leaderboard');

    if (error) {
      console.error('Error refreshing leaderboard cache:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error refreshing leaderboard cache:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
