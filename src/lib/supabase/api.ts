/**
 * Supabase API Functions
 *
 * This module provides high-level API functions for interacting with the database.
 * All functions include proper error handling and type safety.
 *
 * Usage:
 *   import { getUserByWallet, getCourses } from '@/lib/supabase/api';
 *   const user = await getUserByWallet('0x1234...');
 */

import { supabase, table } from './client';
import { handleSupabaseError, safeQuery } from './errors';
import type {
  User,
  UserInsert,
  UserUpdate,
  Course,
  CourseFilters,
  Lesson,
  UserProgress,
  UserProgressWithCourse,
  LessonCompletion,
  Achievement,
  UserAchievement,
  UserStreak,
  LeaderboardCache,
  Discussion,
  DiscussionFilters,
  Reply,
  DiscussionVote,
  FaucetRequest,
  Transaction,
  NFTCertificate,
  PlatformSetting,
  UUID,
} from './types';

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get a user by their EVM wallet address
 *
 * @param evmAddress - The EVM wallet address (0x...)
 * @returns The user record or null if not found
 */
export async function getUserByWallet(evmAddress: string): Promise<User | null> {
  try {
    const { data, error } = await table('users')
      .select('*')
      .eq('evm_address', evmAddress.toLowerCase())
      .single();

    if (error) {
      // If not found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get a user by their Hedera account ID
 *
 * @param hederaAccountId - The Hedera account ID (0.0.xxxxx)
 * @returns The user record or null if not found
 */
export async function getUserByHederaId(hederaAccountId: string): Promise<User | null> {
  try {
    const { data, error } = await table('users')
      .select('*')
      .eq('hedera_account_id', hederaAccountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Create a new user
 *
 * @param userData - Partial user data (evm_address is required)
 * @returns The created user record
 */
export async function createUser(userData: UserInsert): Promise<User> {
  try {
    // Normalize EVM address to lowercase
    const normalizedData = {
      ...userData,
      evm_address: userData.evm_address.toLowerCase(),
    };

    const { data, error } = await table('users')
      .insert(normalizedData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create user');

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Update a user's data
 *
 * @param userId - The user's UUID
 * @param updates - Partial user data to update
 * @returns The updated user record
 */
export async function updateUser(userId: UUID, updates: UserUpdate): Promise<User> {
  try {
    const { data, error } = await table('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('User not found');

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get users for leaderboard (sorted by total XP)
 *
 * @param limit - Maximum number of users to return
 * @returns Array of users sorted by XP
 */
export async function getLeaderboard(limit: number = 100): Promise<User[]> {
  try {
    const { data, error } = await table('users')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

/**
 * Get all courses with optional filtering
 *
 * @param filters - Optional filters (track, difficulty, search)
 * @returns Array of courses matching the filters
 */
export async function getCourses(filters?: CourseFilters): Promise<Course[]> {
  try {
    let query = table('courses').select('*');

    // Apply filters if provided
    if (filters?.track) {
      query = query.eq('track', filters.track);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Always order by created_at
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get a single course by ID
 *
 * @param courseId - The course ID
 * @returns The course record or null if not found
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await table('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get course prerequisites
 *
 * @param courseId - The course ID
 * @returns Array of prerequisite course IDs
 */
export async function getCoursePrerequisites(courseId: string): Promise<string[]> {
  try {
    const { data, error } = await table('course_prerequisites')
      .select('prerequisite_course_id')
      .eq('course_id', courseId);

    if (error) throw error;
    return data?.map(p => p.prerequisite_course_id) || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

/**
 * Get all lessons for a course
 *
 * @param courseId - The course ID
 * @returns Array of lessons ordered by order_index
 */
export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  try {
    const { data, error } = await table('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get a single lesson by ID
 *
 * @param lessonId - The lesson UUID
 * @returns The lesson record or null if not found
 */
export async function getLessonById(lessonId: UUID): Promise<Lesson | null> {
  try {
    const { data, error } = await table('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// USER PROGRESS OPERATIONS
// ============================================================================

/**
 * Get user's progress across all courses
 *
 * @param userId - The user's UUID
 * @returns Array of user progress records
 */
export async function getUserProgress(userId: UUID): Promise<UserProgress[]> {
  try {
    const { data, error } = await table('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get user's progress for a specific course
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns The progress record or null if not started
 */
export async function getUserCourseProgress(
  userId: UUID,
  courseId: string
): Promise<UserProgress | null> {
  try {
    const { data, error } = await table('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Start a new course for a user
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns The created progress record
 */
export async function startCourse(userId: UUID, courseId: string): Promise<UserProgress> {
  try {
    const { data, error } = await table('user_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to start course');

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// LESSON COMPLETION OPERATIONS
// ============================================================================

/**
 * Get user's completed lessons for a course
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns Array of lesson completion records
 */
export async function getUserLessonCompletions(
  userId: UUID,
  courseId: string
): Promise<LessonCompletion[]> {
  try {
    const { data, error } = await table('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Mark a lesson as completed
 *
 * @param userId - The user's UUID
 * @param lessonId - The lesson UUID
 * @param courseId - The course ID
 * @param score - Optional quiz score (0-100)
 * @returns The created completion record
 */
export async function completLesson(
  userId: UUID,
  lessonId: UUID,
  courseId: string,
  score?: number
): Promise<LessonCompletion> {
  try {
    const { data, error } = await table('lesson_completions')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        score: score || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to complete lesson');

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// ACHIEVEMENT OPERATIONS
// ============================================================================

/**
 * Get all available achievements
 *
 * @returns Array of all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await table('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get user's unlocked achievements
 *
 * @param userId - The user's UUID
 * @returns Array of user achievement records
 */
export async function getUserAchievements(userId: UUID): Promise<UserAchievement[]> {
  try {
    const { data, error } = await table('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// STREAK OPERATIONS
// ============================================================================

/**
 * Get user's current streak
 *
 * @param userId - The user's UUID
 * @returns The active streak record or null
 */
export async function getUserStreak(userId: UUID): Promise<UserStreak | null> {
  try {
    const { data, error } = await table('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// DISCUSSION OPERATIONS
// ============================================================================

/**
 * Get discussions with optional filtering
 *
 * @param filters - Optional filters (courseId, search, sortBy)
 * @returns Array of discussion records
 */
export async function getDiscussions(filters?: DiscussionFilters): Promise<Discussion[]> {
  try {
    let query = table('discussions').select('*');

    if (filters?.courseId) {
      query = query.eq('course_id', filters.courseId);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Default sort by created_at descending
    const sortBy = filters?.sortBy || 'created_at';
    query = query.order(sortBy, { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get replies for a discussion
 *
 * @param discussionId - The discussion UUID
 * @returns Array of reply records
 */
export async function getDiscussionReplies(discussionId: UUID): Promise<Reply[]> {
  try {
    const { data, error } = await table('replies')
      .select('*')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// FAUCET OPERATIONS
// ============================================================================

/**
 * Get user's faucet request history
 *
 * @param userId - The user's UUID
 * @returns Array of faucet request records
 */
export async function getUserFaucetRequests(userId: UUID): Promise<FaucetRequest[]> {
  try {
    const { data, error } = await table('faucet_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get user's most recent faucet request
 *
 * @param userId - The user's UUID
 * @returns The most recent faucet request or null
 */
export async function getLastFaucetRequest(userId: UUID): Promise<FaucetRequest | null> {
  try {
    const { data, error } = await table('faucet_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Get user's transaction history
 *
 * @param userId - The user's UUID
 * @returns Array of transaction records
 */
export async function getUserTransactions(userId: UUID): Promise<Transaction[]> {
  try {
    const { data, error } = await table('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// NFT CERTIFICATE OPERATIONS
// ============================================================================

/**
 * Get user's NFT certificates
 *
 * @param userId - The user's UUID
 * @returns Array of NFT certificate records
 */
export async function getUserNFTCertificates(userId: UUID): Promise<NFTCertificate[]> {
  try {
    const { data, error } = await table('nft_certificates')
      .select('*')
      .eq('user_id', userId)
      .order('minted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// PLATFORM SETTINGS OPERATIONS
// ============================================================================

/**
 * Get a platform setting by key
 *
 * @param key - The setting key
 * @returns The setting record or null if not found
 */
export async function getPlatformSetting(key: string): Promise<PlatformSetting | null> {
  try {
    const { data, error } = await table('platform_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Get all platform settings
 *
 * @returns Array of all platform settings
 */
export async function getAllPlatformSettings(): Promise<PlatformSetting[]> {
  try {
    const { data, error } = await table('platform_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user has completed a course
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns True if the course is completed
 */
export async function hasCompletedCourse(userId: UUID, courseId: string): Promise<boolean> {
  const progress = await getUserCourseProgress(userId, courseId);
  return progress?.completed_at !== null && progress?.completed_at !== undefined;
}

/**
 * Check if a user can access a course (prerequisites met)
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns True if the user can access the course
 */
export async function canAccessCourse(userId: UUID, courseId: string): Promise<boolean> {
  const prerequisites = await getCoursePrerequisites(courseId);

  if (prerequisites.length === 0) {
    return true; // No prerequisites
  }

  // Check if all prerequisites are completed
  for (const prereqId of prerequisites) {
    const completed = await hasCompletedCourse(userId, prereqId);
    if (!completed) {
      return false;
    }
  }

  return true;
}

/**
 * Get course completion percentage
 *
 * @param userId - The user's UUID
 * @param courseId - The course ID
 * @returns Completion percentage (0-100)
 */
export async function getCourseCompletionPercentage(
  userId: UUID,
  courseId: string
): Promise<number> {
  try {
    // Get total lessons in course
    const lessons = await getLessonsByCourse(courseId);
    const totalLessons = lessons.length;

    if (totalLessons === 0) {
      return 0;
    }

    // Get completed lessons
    const completions = await getUserLessonCompletions(userId, courseId);
    const completedLessons = completions.length;

    return Math.round((completedLessons / totalLessons) * 100);
  } catch (error) {
    throw handleSupabaseError(error);
  }
}
