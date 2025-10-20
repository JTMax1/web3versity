/**
 * React Query hooks for user statistics and dashboard data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getUserStats,
  getRecentActivity,
  getLeaderboardPosition,
  getLearningStreak,
  getXPHistory,
  type UserStats,
  type Activity,
  type LeaderboardPosition,
  type StreakData,
  type XPHistoryPoint
} from '../lib/api/stats';

// Query keys for React Query
export const statsKeys = {
  all: ['stats'] as const,
  user: (userId: string) => [...statsKeys.all, 'user', userId] as const,
  activity: (userId: string, limit?: number) => [...statsKeys.all, 'activity', userId, limit] as const,
  leaderboard: (userId: string) => [...statsKeys.all, 'leaderboard', userId] as const,
  streak: (userId: string) => [...statsKeys.all, 'streak', userId] as const,
  xpHistory: (userId: string, days?: number) => [...statsKeys.all, 'xp-history', userId, days] as const,
};

/**
 * Hook to fetch comprehensive user statistics
 */
export function useUserStats(userId: string | undefined): UseQueryResult<UserStats> {
  return useQuery({
    queryKey: statsKeys.user(userId || ''),
    queryFn: () => getUserStats(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch recent user activity
 */
export function useRecentActivity(
  userId: string | undefined,
  limit: number = 10
): UseQueryResult<Activity[]> {
  return useQuery({
    queryKey: statsKeys.activity(userId || '', limit),
    queryFn: () => getRecentActivity(userId!, limit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to fetch user's leaderboard position
 */
export function useLeaderboardPosition(
  userId: string | undefined
): UseQueryResult<LeaderboardPosition> {
  return useQuery({
    queryKey: statsKeys.leaderboard(userId || ''),
    queryFn: () => getLeaderboardPosition(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch user's learning streak data
 */
export function useLearningStreak(userId: string | undefined): UseQueryResult<StreakData> {
  return useQuery({
    queryKey: statsKeys.streak(userId || ''),
    queryFn: () => getLearningStreak(userId!),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch XP history for charts
 */
export function useXPHistory(
  userId: string | undefined,
  days: number = 30
): UseQueryResult<XPHistoryPoint[]> {
  return useQuery({
    queryKey: statsKeys.xpHistory(userId || '', days),
    queryFn: () => getXPHistory(userId!, days),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
