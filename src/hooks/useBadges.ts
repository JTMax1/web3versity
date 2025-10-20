/**
 * React Query hooks for badges/achievements
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAllBadges,
  getUserEarnedBadges,
  getUserBadgesWithStatus,
  getBadgesByCategory,
  getBadgesByRarity,
  getBadgeById,
  hasUserEarnedBadge,
  type BadgeWithEarnedStatus,
  type EarnedBadge
} from '../lib/api/badges';
import type { Achievement } from '../lib/supabase/types';

// ============================================================================
// Query Keys
// ============================================================================

export const badgeKeys = {
  all: ['badges'] as const,
  lists: () => [...badgeKeys.all, 'list'] as const,
  list: (filters: string) => [...badgeKeys.lists(), { filters }] as const,
  details: () => [...badgeKeys.all, 'detail'] as const,
  detail: (id: string) => [...badgeKeys.details(), id] as const,
  user: (userId: string) => [...badgeKeys.all, 'user', userId] as const,
  userEarned: (userId: string) => [...badgeKeys.user(userId), 'earned'] as const,
  userWithStatus: (userId: string) => [...badgeKeys.user(userId), 'withStatus'] as const,
  category: (category: string) => [...badgeKeys.all, 'category', category] as const,
  rarity: (rarity: string) => [...badgeKeys.all, 'rarity', rarity] as const,
  hasEarned: (userId: string, badgeId: string) => [...badgeKeys.user(userId), 'has', badgeId] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch all active badges
 */
export function useAllBadges() {
  return useQuery<Achievement[], Error>({
    queryKey: badgeKeys.lists(),
    queryFn: () => getAllBadges(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch user's earned badges
 */
export function useUserEarnedBadges(userId: string | undefined) {
  return useQuery<EarnedBadge[], Error>({
    queryKey: badgeKeys.userEarned(userId || ''),
    queryFn: () => getUserEarnedBadges(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all badges with earned status for user
 * Shows both earned and unearned badges
 */
export function useUserBadgesWithStatus(userId: string | undefined) {
  return useQuery<BadgeWithEarnedStatus[], Error>({
    queryKey: badgeKeys.userWithStatus(userId || ''),
    queryFn: () => getUserBadgesWithStatus(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch badges by category
 */
export function useBadgesByCategory(category: string) {
  return useQuery<Achievement[], Error>({
    queryKey: badgeKeys.category(category),
    queryFn: () => getBadgesByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch badges by rarity
 */
export function useBadgesByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary') {
  return useQuery<Achievement[], Error>({
    queryKey: badgeKeys.rarity(rarity),
    queryFn: () => getBadgesByRarity(rarity),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch single badge by ID
 */
export function useBadge(badgeId: string | undefined) {
  return useQuery<Achievement | null, Error>({
    queryKey: badgeKeys.detail(badgeId || ''),
    queryFn: () => getBadgeById(badgeId!),
    enabled: !!badgeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Check if user has earned a specific badge
 */
export function useHasEarnedBadge(userId: string | undefined, badgeId: string | undefined) {
  return useQuery<boolean, Error>({
    queryKey: badgeKeys.hasEarned(userId || '', badgeId || ''),
    queryFn: () => hasUserEarnedBadge(userId!, badgeId!),
    enabled: !!userId && !!badgeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
