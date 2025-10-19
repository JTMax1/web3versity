/**
 * Supabase Module Entry Point
 *
 * Re-exports all Supabase functionality for easy importing.
 *
 * Usage:
 *   import { supabase, getUserByWallet, User } from '@/lib/supabase';
 */

// Export the client and helper functions
export { supabase, table, getSession, getCurrentUser, signOut, query, checkConnection, supabaseUtils } from './client';

// Export all types
export type * from './types';

// Export error handling utilities
export {
  SupabaseError,
  ERROR_CODES,
  handleSupabaseError,
  parsePostgrestError,
  getErrorMessage,
  isErrorType,
  logError,
  retryOnError,
  hasError,
  assertNoError,
  safeQuery,
  getErrorInfo,
} from './errors';

// Export all API functions
export {
  // User operations
  getUserByWallet,
  getUserByHederaId,
  createUser,
  updateUser,
  getLeaderboard,

  // Course operations
  getCourses,
  getCourseById,
  getCoursePrerequisites,

  // Lesson operations
  getLessonsByCourse,
  getLessonById,

  // User progress operations
  getUserProgress,
  getUserCourseProgress,
  startCourse,

  // Lesson completion operations
  getUserLessonCompletions,
  completLesson,

  // Achievement operations
  getAchievements,
  getUserAchievements,

  // Streak operations
  getUserStreak,

  // Discussion operations
  getDiscussions,
  getDiscussionReplies,

  // Faucet operations
  getUserFaucetRequests,
  getLastFaucetRequest,

  // Transaction operations
  getUserTransactions,

  // NFT certificate operations
  getUserNFTCertificates,

  // Platform settings operations
  getPlatformSetting,
  getAllPlatformSettings,

  // Helper functions
  hasCompletedCourse,
  canAccessCourse,
  getCourseCompletionPercentage,
} from './api';
