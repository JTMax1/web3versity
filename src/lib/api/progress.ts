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
    // Step 1: Check if already completed (idempotent)
    const { data: existing, error: checkError } = await supabase
      .from('lesson_completions')
      .select('xp_earned')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      // Already completed, return without awarding XP again
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      const { data: userData } = await supabase
        .from('users')
        .select('current_level')
        .eq('id', userId)
        .single();

      return {
        success: true,
        xpEarned: 0, // No XP for duplicate completion
        newLevel: userData?.current_level || 1,
        courseComplete: (currentProgress?.progress_percentage || 0) === 100,
      };
    }

    // Ignore "no rows" error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing completion:', checkError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Failed to check completion status',
      };
    }

    // Step 2: Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('lesson_type, completion_xp, perfect_score_xp')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      console.error('Error fetching lesson:', lessonError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Lesson not found',
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

    const { error: insertError } = await supabase
      .from('lesson_completions')
      .insert(completionData);

    if (insertError) {
      console.error('Error inserting lesson completion:', insertError);
      return {
        success: false,
        xpEarned: 0,
        newLevel: 1,
        courseComplete: false,
        error: 'Failed to save completion',
      };
    }

    // Step 4: Award XP using database function
    let newLevel = 1;
    if (xpEarned > 0) {
      const { error: xpError } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_xp_amount: xpEarned,
      });

      if (xpError) {
        console.error('Error awarding XP:', xpError);
      }

      // Get updated level
      const { data: userData } = await supabase
        .from('users')
        .select('current_level')
        .eq('id', userId)
        .single();

      newLevel = userData?.current_level || 1;
    }

    // Step 5: Update user_progress
    // Get current progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lessons_completed, total_lessons')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (progressData) {
      const newLessonsCompleted = progressData.lessons_completed + 1;
      const newProgressPercentage = Math.round(
        (newLessonsCompleted / progressData.total_lessons) * 100
      );

      // Update progress
      await supabase
        .from('user_progress')
        .update({
          lessons_completed: newLessonsCompleted,
          progress_percentage: newProgressPercentage,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      // Step 6: Check if course is complete
      const courseComplete = newProgressPercentage === 100;

      // Step 7: Award course completion bonus
      if (courseComplete) {
        // Mark course as complete
        await supabase
          .from('user_progress')
          .update({
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);

        // Award 100 XP bonus
        await supabase.rpc('award_xp', {
          p_user_id: userId,
          p_xp_amount: 100,
        });

        // Increment user's courses_completed count
        await supabase.rpc('sql', {
          query: `
            UPDATE users
            SET courses_completed = courses_completed + 1
            WHERE id = $1
          `,
          params: [userId],
        });

        // Get updated level after bonus
        const { data: updatedUser } = await supabase
          .from('users')
          .select('current_level')
          .eq('id', userId)
          .single();

        newLevel = updatedUser?.current_level || newLevel;
      }

      return {
        success: true,
        xpEarned: xpEarned + (courseComplete ? 100 : 0),
        newLevel,
        courseComplete,
      };
    }

    return {
      success: true,
      xpEarned,
      newLevel,
      courseComplete: false,
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
      .single();

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
 * Get course progress for a user
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Progress data
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressData | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(
        'progress_percentage, lessons_completed, total_lessons, current_lesson_id, completed_at'
      )
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching course progress:', error);
    return null;
  }
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
    const { error } = await supabase
      .from('user_progress')
      .update({
        current_lesson_id: lessonId,
        last_accessed_at: new Date().toISOString(),
        started_at: supabase.raw('COALESCE(started_at, NOW())'),
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
    return false;
  }
}
