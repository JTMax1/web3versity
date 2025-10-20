/**
 * Badges and Achievements API
 * Functions for fetching and managing user badges/achievements
 */

import { supabase } from '../supabase/client';
import type { Achievement, UserAchievement } from '../supabase/types';

// ============================================================================
// Types
// ============================================================================

export interface BadgeWithEarnedStatus extends Achievement {
  earned: boolean;
  earned_at?: string;
  nft_token_id?: string | null;
  nft_minted_at?: string | null;
}

export interface EarnedBadge extends Achievement {
  earned_at: string;
  nft_token_id: string | null;
  nft_minted_at: string | null;
  nft_transaction_id: string | null;
  user_achievement_id: string;
}

// ============================================================================
// Badge Functions
// ============================================================================

/**
 * Get all available badges/achievements
 */
export async function getAllBadges(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: true })
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
}

/**
 * Get all badges earned by a user
 */
export async function getUserEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        earned_at,
        nft_token_id,
        nft_minted_at,
        nft_transaction_id,
        achievements:achievement_id (
          id,
          name,
          description,
          icon_emoji,
          category,
          rarity,
          criteria,
          xp_reward,
          nft_collection_id,
          nft_metadata_uri,
          times_earned,
          created_at,
          is_active
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    // Flatten the structure
    const earnedBadges: EarnedBadge[] = (data || []).map(ua => {
      const achievement = (ua.achievements as any) as Achievement;
      return {
        ...achievement,
        earned_at: ua.earned_at,
        nft_token_id: ua.nft_token_id,
        nft_minted_at: ua.nft_minted_at,
        nft_transaction_id: ua.nft_transaction_id,
        user_achievement_id: ua.id
      };
    });

    return earnedBadges;
  } catch (error) {
    console.error('Error fetching user earned badges:', error);
    throw error;
  }
}

/**
 * Get all badges with earned status for a user
 * Shows both earned and unearned badges
 */
export async function getUserBadgesWithStatus(userId: string): Promise<BadgeWithEarnedStatus[]> {
  try {
    // Get all active badges
    const allBadges = await getAllBadges();

    // Get user's earned badges
    const earnedBadges = await getUserEarnedBadges(userId);
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));

    // Create a map for quick lookup of earned badge details
    const earnedBadgeMap = new Map(earnedBadges.map(b => [b.id, b]));

    // Combine into single array with earned status
    const badgesWithStatus: BadgeWithEarnedStatus[] = allBadges.map(badge => {
      const earned = earnedBadgeIds.has(badge.id);
      const earnedDetails = earnedBadgeMap.get(badge.id);

      return {
        ...badge,
        earned,
        earned_at: earnedDetails?.earned_at,
        nft_token_id: earnedDetails?.nft_token_id,
        nft_minted_at: earnedDetails?.nft_minted_at
      };
    });

    // Sort: earned first, then by rarity, then by category
    badgesWithStatus.sort((a, b) => {
      // Earned badges first
      if (a.earned !== b.earned) return a.earned ? -1 : 1;

      // Then by rarity
      const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
      const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;

      // Then alphabetically by category
      return a.category.localeCompare(b.category);
    });

    return badgesWithStatus;
  } catch (error) {
    console.error('Error fetching user badges with status:', error);
    throw error;
  }
}

/**
 * Get badges by category
 */
export async function getBadgesByCategory(category: string): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('rarity', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges by category:', error);
    throw error;
  }
}

/**
 * Get badges by rarity
 */
export async function getBadgesByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary'): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('rarity', rarity)
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges by rarity:', error);
    throw error;
  }
}

/**
 * Get single badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<Achievement | null> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching badge:', error);
    return null;
  }
}

/**
 * Check if user has earned a specific badge
 */
export async function hasUserEarnedBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', badgeId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking badge status:', error);
    return false;
  }
}
