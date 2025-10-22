/**
 * Progress & Lesson Completion API
 *
 * Handles lesson completion tracking, XP calculation, and progress updates.
 * Implements idempotent operations and proper XP reward logic.
 */

import { supabase } from '../supabase/client';
import type {
  LessonCompletion,
  LessonCompletionInsert,
  UserProgress,
  Lesson,
  LessonType,
} from '../supabase/types';

// ============================================================================
// Types
// ============================================================================

export interface LessonCompleteResult {
  success: boolean;
  xpEarned: number;
  newLevel: number;
  courseComplete: boolean;
  error?: string;
}

export interface CourseProgressData {
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  current_lesson_id: string | null;
  completed_at: string | null;
}

// ============================================================================
// XP Calculation
// ============================================================================

/**
 * Calculate XP based on lesson type and quiz score
 *
 * Business Rules:
 * - Text lesson: 10 XP
 * - Interactive lesson: 10 XP
 * - Quiz (70-99%): 20 XP
 * - Quiz (100%): 30 XP (bonus for perfect score)
 * - Practical lesson: 50 XP
 *
 * @param lessonType - Type of lesson
 * @param score - Quiz score percentage (0-100)
 * @returns XP amount
 */
function calculateLessonXP(lessonType: LessonType, score?: number): number {
  switch (lessonType) {
    case 'text':
      return 10;
    case 'interactive':
      return 10;
    case 'quiz':
      if (score === undefined) return 0; // Quiz needs score
      if (score < 70) return 0; // Failed quiz, no XP
      if (score === 100) return 30; // Perfect score bonus
      return 20; // Passing score
    case 'practical':
      return 50;
    default:
      return 0;
  }
}

// ============================================================================
// Lesson Completion Functions
// ============================================================================

/**
 * Mark a lesson as complete and award XP
 *
 * This function is IDEMPOTENT - completing the same lesson twice won't
 * award XP again. It will return the original completion data.
 *
 * Steps:
 * 1. Check if already completed (return existing data)
 * 2. Get lesson details to determine XP
 * 3. Insert into lesson_completions
 * 4. Award XP using database function
 * 5. Update user_progress (percentage, current_lesson)
 * 6. Check if course is complete
 * 7. Award course completion bonus if complete
 *
 * @param userId - User UUID
 * @param lessonId - Lesson ID
 * @param courseId - Course ID
 * @param score - Quiz score percentage (optional)
 * @param timeSpentSeconds - Time spent on lesson (optional)
 * @returns Completion result with XP and level info
 */
export async function markLessonComplete(
  userId: string,
  lessonId: string,
  courseId: string,
  score?: number,
  timeSpentSeconds?: number
): Promise<LessonCompleteResult> {
  try {
    console.log('[markLessonComplete] Starting:', { userId, lessonId, courseId, score });

    // Step 1: Check if already completed (idempotent)
    const { data: existing, error: existingError } = await supabase
      .from('lesson_completions')
      .select('xp_earned')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (existingError) {
      console.error('[markLessonComplete] Error checking existing completion:', existingError);
    }

    if (existing) {
      console.log('[markLessonComplete] Lesson already completed, returning cached result');
      // Already completed, return without awarding XP again
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      const { data: userData } = await supabase
        .from('users')
        .select('current_level')
        .eq('id', userId)
        .maybeSingle();

      return {
        success: true,
        xpEarned: 0, // No XP for duplicate completion
        newLevel: userData?.current_level || 1,
        courseComplete: (currentProgress?.progress_percentage || 0) === 100,
      };
    }

    // Step 2: Get lesson details and validate it belongs to this course
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('lesson_type, completion_xp, perfect_score_xp, course_id')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      console.error('[markLessonComplete] Error fetching lesson:', lessonError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Lesson not found',
      };
    }

    // Validate lesson belongs to the specified course
    const lessonCourseId = (lesson as any).course_id;
    if (lessonCourseId !== courseId) {
      console.error(`[markLessonComplete] Lesson ${lessonId} does not belong to course ${courseId}, it belongs to ${lessonCourseId}`);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Lesson does not belong to this course',
      };
    }

    // Calculate XP based on lesson type and score
    const xpEarned = calculateLessonXP(lesson.lesson_type, score);

    // For quizzes, check minimum passing score
    if (lesson.lesson_type === 'quiz' && (score === undefined || score < 70)) {
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Quiz score below 70% - not marked as complete',
      };
    }

    // Step 3: Insert into lesson_completions
    const completionData: LessonCompletionInsert = {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds || null,
      score_percentage: score || null,
      attempts: 1,
      xp_earned: xpEarned,
    };

    console.log('[markLessonComplete] Inserting lesson completion:', completionData);
    const { error: insertError } = await supabase
      .from('lesson_completions')
      .insert(completionData);

    if (insertError) {
      console.error('[markLessonComplete] Error inserting lesson completion:', insertError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: `Failed to save completion: ${insertError.message}`,
      };
    }
    console.log('[markLessonComplete] Lesson completion inserted successfully');

    // Step 4: Award XP and update level
    let newLevel = 1;
    if (xpEarned > 0) {
      try {
        // Try using award_xp function first
        const { error: xpError } = await supabase.rpc('award_xp', {
          p_user_id: userId,
          p_xp_amount: xpEarned,
        });

        if (xpError) {
          console.warn('award_xp function failed, using direct update:', xpError);

          // Fallback: Direct SQL update
          const { data: currentUser } = await supabase
            .from('users')
            .select('total_xp')
            .eq('id', userId)
            .maybeSingle();

          if (currentUser) {
            const newTotalXP = currentUser.total_xp + xpEarned;
            const calculatedLevel = Math.min(Math.floor(Math.sqrt(newTotalXP / 100)), 100);

            // Get current lessons_completed count
            const { data: userData } = await supabase
              .from('users')
              .select('lessons_completed')
              .eq('id', userId)
              .maybeSingle();

            await supabase
              .from('users')
              .update({
                total_xp: newTotalXP,
                current_level: calculatedLevel,
                lessons_completed: (userData?.lessons_completed || 0) + 1,
              })
              .eq('id', userId);

            newLevel = calculatedLevel;
          }
        } else {
          // Get updated level after award_xp
          const { data: userData } = await supabase
            .from('users')
            .select('current_level')
            .eq('id', userId)
            .maybeSingle();

          newLevel = userData?.current_level || 1;
        }
      } catch (err) {
        console.error('Error in XP award process:', err);
      }
    }

    // Step 5: Update user_progress
    // Get current progress with retry logic (handles race conditions)
    console.log('[markLessonComplete] Fetching user progress for course:', courseId);

    let progressData = null;
    let progressError = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await supabase
        .from('user_progress')
        .select('lessons_completed, total_lessons')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      progressData = result.data;
      progressError = result.error;

      if (progressData) {
        console.log(`[markLessonComplete] Found user progress on attempt ${attempt + 1}`);
        break;
      }

      if (progressError) {
        console.error('[markLessonComplete] Error fetching user progress:', progressError);
        break;
      }

      // No data and no error - record doesn't exist yet, retry with backoff
      if (attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
        console.log(`[markLessonComplete] User progress not found, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    if (progressError) {
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Failed to fetch user progress',
      };
    }

    if (!progressData) {
      console.error('[markLessonComplete] No user_progress record found after retries! User may not be enrolled.');
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'User not enrolled in course. Please enroll first.',
      };
    }

    // Validate total_lessons to prevent division by zero
    if (!progressData.total_lessons || progressData.total_lessons === 0) {
      console.error('[markLessonComplete] Course has 0 lessons!');
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Course has no lessons',
      };
    }

    console.log('[markLessonComplete] Current progress:', progressData);

    const newLessonsCompleted = progressData.lessons_completed + 1;
    const newProgressPercentage = Math.round(
      (newLessonsCompleted / progressData.total_lessons) * 100
    );

    console.log('[markLessonComplete] Updating progress:', { newLessonsCompleted, newProgressPercentage });

    // Update progress
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        lessons_completed: newLessonsCompleted,
        progress_percentage: newProgressPercentage,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (updateError) {
      console.error('[markLessonComplete] Error updating user progress:', updateError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Failed to update progress',
      };
    }

    // Step 6: Check if course is complete
    const courseComplete = newProgressPercentage === 100;

    // Step 7: Award course completion bonus
    if (courseComplete) {
      console.log('[markLessonComplete] Course completed! Awarding bonus XP');
      // Mark course as complete
      await supabase
        .from('user_progress')
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      // Award 100 XP bonus
      try {
        const { error: bonusError } = await supabase.rpc('award_xp', {
          p_user_id: userId,
          p_xp_amount: 100,
        });

        if (bonusError) {
          console.warn('Bonus XP award failed:', bonusError);
        }
      } catch (err) {
        console.error('Error awarding bonus XP:', err);
      }

      // Increment user's courses_completed count
      const { data: currentUserData } = await supabase
        .from('users')
        .select('courses_completed')
        .eq('id', userId)
        .maybeSingle();

      if (currentUserData) {
        await supabase
          .from('users')
          .update({
            courses_completed: currentUserData.courses_completed + 1,
          })
          .eq('id', userId);
      }

      // Get updated level after bonus
      const { data: updatedUser } = await supabase
        .from('users')
        .select('current_level')
        .eq('id', userId)
        .maybeSingle();

      newLevel = updatedUser?.current_level || newLevel;
    }

    console.log('[markLessonComplete] Success!', { xpEarned, newLevel, courseComplete });
    return {
      success: true,
      xpEarned: xpEarned + (courseComplete ? 100 : 0),
      newLevel,
      courseComplete,
    };
  } catch (error) {
    console.error('Unexpected error marking lesson complete:', error);
    return {
      success: false,
      xpEarned: 0,
      newLevel: 1,
      courseComplete: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get lesson completion status
 *
 * @param userId - User UUID
 * @param lessonId - Lesson ID
 * @returns Completion record or null
 */
export async function getLessonCompletion(
  userId: string,
  lessonId: string
): Promise<LessonCompletion | null> {
  try {
    const { data, error } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching lesson completion:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching lesson completion:', error);
    return null;
  }
}

/**
 * Get course progress for a user (with retry logic for flaky connections)
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Progress data
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressData | null> {
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(
          'progress_percentage, lessons_completed, total_lessons, current_lesson_id, completed_at'
        )
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        lastError = error;
        // Only retry on network/connection errors
        if (error.message?.includes('NetworkError') ||
            error.message?.includes('Content-Length') ||
            error.message?.includes('fetch')) {
          if (attempt < maxRetries - 1) {
            console.warn(`[getCourseProgress] Network error, retrying (${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
        console.error('Error fetching course progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        console.warn(`[getCourseProgress] Exception caught, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      console.error('Unexpected error fetching course progress:', error);
      return null;
    }
  }

  // If we get here, all retries failed
  console.error('[getCourseProgress] All retries exhausted');
  return null;
}

/**
 * Get all completed lessons for a course
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Array of completed lesson IDs
 */
export async function getCompletedLessons(
  userId: string,
  courseId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error fetching completed lessons:', error);
      return [];
    }

    return data?.map((item) => item.lesson_id) || [];
  } catch (error) {
    console.error('Unexpected error fetching completed lessons:', error);
    return [];
  }
}

/**
 * Update current lesson position in course
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @param lessonId - Current lesson ID
 * @returns Success boolean
 */
export async function updateCurrentLesson(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean> {
  try {
    // First check if user_progress exists and get current lesson
    const { data: existing, error: fetchError } = await supabase
      .from('user_progress')
      .select('started_at, current_lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user progress:', fetchError);
      // Check if this is a network/CORS error
      if (fetchError.message?.includes('NetworkError') || fetchError.message?.includes('CORS')) {
        console.error('⚠️ SUPABASE CONNECTION ISSUE: Check if project is paused or CORS is misconfigured');
        console.error('⚠️ Go to: https://supabase.com/dashboard/project/xlbnfetefknsqsdbngvp');
      }
      return false;
    }

    if (!existing) {
      console.error('User progress not found - user may not be enrolled in this course');
      console.error(`User: ${userId}, Course: ${courseId}`);
      return false;
    }

    // IDEMPOTENT: Only update if lesson has actually changed
    if (existing.current_lesson_id === lessonId) {
      // Lesson hasn't changed, no need to update database
      return true;
    }

    // Update with started_at only if it's null
    const { error } = await supabase
      .from('user_progress')
      .update({
        current_lesson_id: lessonId,
        last_accessed_at: new Date().toISOString(),
        started_at: existing.started_at || new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error updating current lesson:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating current lesson:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('⚠️ NETWORK ERROR: Cannot connect to Supabase. Check:');
      console.error('  1. Is your Supabase project paused? (https://supabase.com/dashboard)');
      console.error('  2. Is your internet connection working?');
      console.error('  3. Are you behind a firewall blocking Supabase?');
    }
    return false;
  }
}
