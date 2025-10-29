/**
 * Badge Auto-Award System
 *
 * Automatically checks and awards badges based on user achievements.
 * Supports multiple criteria types:
 * - lessons_completed: Complete X lessons
 * - courses_completed: Complete X courses
 * - perfect_scores: Get X perfect quiz scores (100%)
 * - streak_days: Maintain X day streak
 * - total_xp: Reach X total XP
 * - level_reached: Reach level X
 * - first_lesson: Complete first lesson
 * - first_course: Complete first course
 */

import { supabase } from '../supabase/client';
import type { Achievement } from '../supabase/types';

// ============================================================================
// Types
// ============================================================================

export interface BadgeCriteria {
  type: 'lessons_completed' | 'courses_completed' | 'perfect_scores' | 'streak_days' | 'total_xp' | 'level_reached' | 'first_lesson' | 'first_course';
  value: number;
  description?: string;
}

export interface BadgeAwardResult {
  awarded: boolean;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  badgeRarity?: 'common' | 'rare' | 'epic' | 'legendary';
  badgeDescription?: string;
  xpEarned?: number;
  error?: string;
}

export interface UserStats {
  userId: string;
  lessons_completed: number;
  courses_completed: number;
  perfect_scores: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  current_level: number;
}

// ============================================================================
// Get User Stats
// ============================================================================

/**
 * Fetch current user statistics for badge checking
 */
async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    // Get main stats from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('lessons_completed, courses_completed, current_streak, longest_streak, total_xp, current_level')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !userData) {
      console.error('[getUserStats] Error fetching user data:', userError);
      return null;
    }

    // Count perfect quiz scores (100% scores)
    const { count: perfectScoreCount, error: scoreError } = await supabase
      .from('lesson_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('score_percentage', 100);

    if (scoreError) {
      console.warn('[getUserStats] Error counting perfect scores:', scoreError);
    }

    return {
      userId,
      lessons_completed: userData.lessons_completed || 0,
      courses_completed: userData.courses_completed || 0,
      perfect_scores: perfectScoreCount || 0,
      current_streak: userData.current_streak || 0,
      longest_streak: userData.longest_streak || 0,
      total_xp: userData.total_xp || 0,
      current_level: userData.current_level || 1
    };
  } catch (error) {
    console.error('[getUserStats] Unexpected error:', error);
    return null;
  }
}

// ============================================================================
// Check Badge Criteria
// ============================================================================

/**
 * Check if user meets the criteria for a specific badge
 */
function doesUserMeetCriteria(stats: UserStats, criteria: BadgeCriteria): boolean {
  switch (criteria.type) {
    case 'lessons_completed':
      return stats.lessons_completed >= criteria.value;

    case 'courses_completed':
      return stats.courses_completed >= criteria.value;

    case 'perfect_scores':
      return stats.perfect_scores >= criteria.value;

    case 'streak_days':
      return stats.current_streak >= criteria.value || stats.longest_streak >= criteria.value;

    case 'total_xp':
      return stats.total_xp >= criteria.value;

    case 'level_reached':
      return stats.current_level >= criteria.value;

    case 'first_lesson':
      return stats.lessons_completed >= 1;

    case 'first_course':
      return stats.courses_completed >= 1;

    default:
      console.warn('[doesUserMeetCriteria] Unknown criteria type:', criteria.type);
      return false;
  }
}

// ============================================================================
// Award Badge
// ============================================================================

/**
 * Get badge details for result
 */
function getBadgeDetails(achievement: Achievement) {
  return {
    badgeName: achievement.name,
    badgeIcon: achievement.icon_emoji || '🏆',
    badgeRarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    badgeDescription: achievement.description
  };
}

/**
 * Award a badge to a user (idempotent - won't award twice)
 */
async function awardBadgeToUser(userId: string, achievement: Achievement): Promise<BadgeAwardResult> {
  try {
    // Check if user already has this badge
    const { data: existing, error: existingError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .maybeSingle();

    if (existingError) {
      console.error('[awardBadgeToUser] Error checking existing badge:', existingError);
    }

    if (existing) {
      // Already has badge, skip
      const details = getBadgeDetails(achievement);
      return {
        awarded: false,
        badgeId: achievement.id,
        ...details,
        error: 'Badge already earned'
      };
    }

    // Award the badge
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('[awardBadgeToUser] Error awarding badge:', insertError);
      const details = getBadgeDetails(achievement);
      return {
        awarded: false,
        badgeId: achievement.id,
        ...details,
        error: insertError.message
      };
    }

    // Award XP bonus
    const xpReward = achievement.xp_reward || 50;
    try {
      await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: xpReward
      });
    } catch (xpError) {
      console.warn('[awardBadgeToUser] Failed to award XP, using fallback:', xpError);

      // Fallback: Direct update
      const { data: currentUser } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .maybeSingle();

      if (currentUser) {
        const newTotalXP = currentUser.total_xp + xpReward;
        const calculatedLevel = Math.min(Math.floor(Math.sqrt(newTotalXP / 100)), 100);

        await supabase
          .from('users')
          .update({
            total_xp: newTotalXP,
            current_level: calculatedLevel
          })
          .eq('id', userId);
      }
    }

    // Increment badges_earned counter
    const { data: currentUserData } = await supabase
      .from('users')
      .select('badges_earned')
      .eq('id', userId)
      .maybeSingle();

    if (currentUserData) {
      await supabase
        .from('users')
        .update({
          badges_earned: (currentUserData.badges_earned || 0) + 1
        })
        .eq('id', userId);
    }

    // Increment times_earned on achievement
    await supabase
      .from('achievements')
      .update({
        times_earned: (achievement.times_earned || 0) + 1
      })
      .eq('id', achievement.id);

    console.log(`✅ Badge awarded: ${achievement.name} (+${xpReward} XP) to user ${userId}`);

    const details = getBadgeDetails(achievement);
    return {
      awarded: true,
      badgeId: achievement.id,
      ...details,
      xpEarned: xpReward
    };
  } catch (error) {
    console.error('[awardBadgeToUser] Unexpected error:', error);
    return {
      awarded: false,
      badgeId: achievement.id,
      badgeName: achievement.name,
      error: 'Unexpected error awarding badge'
    };
  }
}

// ============================================================================
// Main Auto-Award Function
// ============================================================================

/**
 * Check and award all eligible badges for a user
 *
 * This function is IDEMPOTENT - safe to call multiple times.
 * It will only award badges the user doesn't already have.
 *
 * @param userId - User UUID
 * @returns Array of awarded badges
 *
 * @example
 * ```typescript
 * // After lesson completion
 * const awarded = await checkAndAwardBadges(userId);
 * if (awarded.length > 0) {
 *   console.log('Badges earned:', awarded.map(b => b.badgeName));
 * }
 * ```
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeAwardResult[]> {
  try {
    console.log(`[checkAndAwardBadges] Checking badges for user ${userId}`);

    // Step 1: Get user stats
    const stats = await getUserStats(userId);
    if (!stats) {
      console.error('[checkAndAwardBadges] Failed to fetch user stats');
      return [];
    }

    console.log('[checkAndAwardBadges] User stats:', stats);

    // Step 2: Get all active achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError || !achievements) {
      console.error('[checkAndAwardBadges] Error fetching achievements:', achievementsError);
      return [];
    }

    console.log(`[checkAndAwardBadges] Found ${achievements.length} active badges to check`);

    // Step 3: Check each badge's criteria
    const awardedBadges: BadgeAwardResult[] = [];

    for (const achievement of achievements) {
      try {
        // Parse criteria from JSONB
        const criteria = achievement.criteria as BadgeCriteria;

        if (!criteria || !criteria.type) {
          console.warn(`[checkAndAwardBadges] Badge ${achievement.id} has invalid criteria`);
          continue;
        }

        // Check if user meets criteria
        const meetsCriteria = doesUserMeetCriteria(stats, criteria);

        if (meetsCriteria) {
          console.log(`[checkAndAwardBadges] User meets criteria for badge: ${achievement.name}`);

          // Award the badge (idempotent)
          const result = await awardBadgeToUser(userId, achievement);

          if (result.awarded) {
            awardedBadges.push(result);
          }
        }
      } catch (error) {
        console.error(`[checkAndAwardBadges] Error checking badge ${achievement.id}:`, error);
      }
    }

    if (awardedBadges.length > 0) {
      console.log(`✅ Awarded ${awardedBadges.length} badge(s) to user ${userId}`);
    } else {
      console.log(`[checkAndAwardBadges] No new badges to award`);
    }

    return awardedBadges;
  } catch (error) {
    console.error('[checkAndAwardBadges] Unexpected error:', error);
    return [];
  }
}

/**
 * Check and award a specific badge by ID
 * Useful for special/manual badge awards
 */
export async function awardSpecificBadge(userId: string, badgeId: string): Promise<BadgeAwardResult> {
  try {
    // Get badge details
    const { data: achievement, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', badgeId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !achievement) {
      return {
        awarded: false,
        badgeId,
        error: 'Badge not found or inactive'
      };
    }

    return await awardBadgeToUser(userId, achievement);
  } catch (error) {
    console.error('[awardSpecificBadge] Unexpected error:', error);
    return {
      awarded: false,
      badgeId,
      error: 'Unexpected error'
    };
  }
}
