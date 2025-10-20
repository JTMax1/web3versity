/**
 * Enrollment API Functions
 *
 * This module provides functions to manage course enrollments.
 * All functions are type-safe and handle errors gracefully.
 *
 * Features:
 * - Enroll in courses with prerequisite checking
 * - Track user progress
 * - Manage enrollment state
 * - Atomic operations to prevent race conditions
 */

import { supabase } from '../supabase/client';
import type { UserProgress, Course } from '../supabase/types';
import { getCourseById, getCoursePrerequisites, getCourseLessons } from './courses';

// ============================================================================
// Error Types
// ============================================================================

export class EnrollmentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EnrollmentError';
  }
}

// ============================================================================
// Types
// ============================================================================

export interface EnrollmentResult {
  success: boolean;
  enrollment?: UserProgress;
  error?: string;
}

export interface PrerequisiteCheck {
  canEnroll: boolean;
  missingPrerequisites: Course[];
  message?: string;
}

export interface UserEnrollment extends UserProgress {
  course?: Course;
}

// ============================================================================
// Enrollment Functions
// ============================================================================

/**
 * Enroll a user in a course
 *
 * @param userId - The user ID
 * @param courseId - The course ID to enroll in
 * @returns Enrollment result with UserProgress record
 *
 * @example
 * ```typescript
 * const result = await enrollInCourse(userId, 'course_001');
 * if (result.success) {
 *   console.log('Enrolled successfully!', result.enrollment);
 * } else {
 *   console.error('Enrollment failed:', result.error);
 * }
 * ```
 */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<EnrollmentResult> {
  try {
    // 1. Check if already enrolled
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: 'Already enrolled in this course',
      };
    }

    // 2. Check prerequisites
    const prereqCheck = await checkPrerequisites(userId, courseId);
    if (!prereqCheck.canEnroll) {
      return {
        success: false,
        error: prereqCheck.message || 'Prerequisites not met',
      };
    }

    // 3. Get course details
    const course = await getCourseById(courseId);
    if (!course) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    // 4. Get lesson count
    const lessons = await getCourseLessons(courseId);
    const totalLessons = lessons.length;

    // 5. Create enrollment record
    const now = new Date().toISOString();
    const { data: enrollment, error: enrollError } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrollment_date: now,
        total_lessons: totalLessons,
        lessons_completed: 0,
        progress_percentage: 0,
        started_at: null,
        completed_at: null,
        last_accessed_at: null,
        current_lesson_id: null,
        total_quiz_attempts: 0,
        average_quiz_score: null,
        certificate_nft_id: null,
        certificate_minted_at: null,
      })
      .select()
      .maybeSingle();

    if (enrollError) {
      throw new EnrollmentError(
        `Failed to create enrollment: ${enrollError.message}`,
        enrollError.code,
        enrollError.details
      );
    }

    // 6. Increment course enrollment count (atomic operation)
    const { error: updateError } = await supabase.rpc('increment_enrollment_count', {
      course_id_param: courseId,
    });

    // If RPC doesn't exist, fall back to manual increment
    if (updateError && updateError.code === '42883') {
      // Function doesn't exist, do manual increment
      const { data: courseData } = await supabase
        .from('courses')
        .select('enrollment_count')
        .eq('id', courseId)
        .maybeSingle();

      if (courseData) {
        await supabase
          .from('courses')
          .update({ enrollment_count: courseData.enrollment_count + 1 })
          .eq('id', courseId);
      }
    } else if (updateError) {
      console.error('Failed to increment enrollment count:', updateError);
      // Don't fail the enrollment if count update fails
    }

    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    if (error instanceof EnrollmentError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all enrollments for a user
 *
 * @param userId - The user ID
 * @returns Array of user enrollments with course details
 *
 * @example
 * ```typescript
 * const enrollments = await getUserEnrollments(userId);
 * console.log(`Enrolled in ${enrollments.length} courses`);
 * ```
 */
export async function getUserEnrollments(userId: string): Promise<UserEnrollment[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch enrollments: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error fetching enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Get enrollment status for a specific course
 *
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns UserProgress or null if not enrolled
 *
 * @example
 * ```typescript
 * const enrollment = await getEnrollmentStatus(userId, 'course_001');
 * if (enrollment) {
 *   console.log(`Progress: ${enrollment.progress_percentage}%`);
 * }
 * ```
 */
export async function getEnrollmentStatus(
  userId: string,
  courseId: string
): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch enrollment status: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error fetching enrollment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Check if user can enroll in a course (prerequisites check)
 *
 * @param userId - The user ID
 * @param courseId - The course ID to check
 * @returns Prerequisite check result
 *
 * @example
 * ```typescript
 * const check = await checkPrerequisites(userId, 'course_003');
 * if (!check.canEnroll) {
 *   console.log('Missing prerequisites:', check.missingPrerequisites);
 * }
 * ```
 */
export async function checkPrerequisites(
  userId: string,
  courseId: string
): Promise<PrerequisiteCheck> {
  try {
    // 1. Get course prerequisites
    const prerequisites = await getCoursePrerequisites(courseId);

    // If no prerequisites, user can enroll
    if (prerequisites.length === 0) {
      return {
        canEnroll: true,
        missingPrerequisites: [],
      };
    }

    // 2. Get user's completed courses
    const { data: completedCourses, error } = await supabase
      .from('user_progress')
      .select('course_id, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch completed courses: ${error.message}`,
        error.code,
        error.details
      );
    }

    const completedCourseIds = new Set(
      (completedCourses || []).map((c) => c.course_id)
    );

    // 3. Check which prerequisites are missing
    const missingPrerequisites = prerequisites.filter(
      (prereq) => !completedCourseIds.has(prereq.id)
    );

    // 4. Return result
    if (missingPrerequisites.length === 0) {
      return {
        canEnroll: true,
        missingPrerequisites: [],
      };
    }

    const message =
      missingPrerequisites.length === 1
        ? `You must complete "${missingPrerequisites[0].title}" before enrolling in this course.`
        : `You must complete ${missingPrerequisites.length} prerequisite courses before enrolling.`;

    return {
      canEnroll: false,
      missingPrerequisites,
      message,
    };
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error checking prerequisites: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Unenroll from a course (optional feature)
 *
 * @param userId - The user ID
 * @param courseId - The course ID to unenroll from
 * @returns Success boolean
 *
 * @example
 * ```typescript
 * const success = await unenrollFromCourse(userId, 'course_001');
 * if (success) {
 *   console.log('Unenrolled successfully');
 * }
 * ```
 */
export async function unenrollFromCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    // For MVP, we don't allow unenrollment
    // In the future, you could implement soft delete:
    // - Add is_active column to user_progress
    // - Set is_active = false instead of deleting

    // For now, throw an error
    throw new EnrollmentError(
      'Unenrollment is not supported in this version',
      'NOT_SUPPORTED'
    );

    // Future implementation:
    // const { error } = await supabase
    //   .from('user_progress')
    //   .update({ is_active: false })
    //   .eq('user_id', userId)
    //   .eq('course_id', courseId);
    //
    // if (error) {
    //   throw new EnrollmentError(
    //     `Failed to unenroll: ${error.message}`,
    //     error.code,
    //     error.details
    //   );
    // }
    //
    // return true;
  } catch (error) {
    console.error('Unenroll error:', error);
    return false;
  }
}

/**
 * Get enrolled course IDs for a user (lightweight)
 *
 * @param userId - The user ID
 * @returns Array of course IDs
 *
 * @example
 * ```typescript
 * const enrolledIds = await getEnrolledCourseIds(userId);
 * console.log('Enrolled in:', enrolledIds);
 * ```
 */
export async function getEnrolledCourseIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('course_id')
      .eq('user_id', userId);

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch enrolled course IDs: ${error.message}`,
        error.code,
        error.details
      );
    }

    return (data || []).map((item) => item.course_id);
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error fetching enrolled course IDs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Update user's current lesson in a course
 *
 * @param userId - The user ID
 * @param courseId - The course ID
 * @param lessonId - The lesson ID to set as current
 * @returns Success boolean
 *
 * @example
 * ```typescript
 * await updateCurrentLesson(userId, 'course_001', 'lesson_5');
 * ```
 */
export async function updateCurrentLesson(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    // First check if user_progress exists and get started_at
    const { data: existing } = await supabase
      .from('user_progress')
      .select('started_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (!existing) {
      console.error('User progress not found');
      return false;
    }

    const { error } = await supabase
      .from('user_progress')
      .update({
        current_lesson_id: lessonId,
        last_accessed_at: now,
        started_at: existing.started_at || now, // Set started_at if null
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      throw new EnrollmentError(
        `Failed to update current lesson: ${error.message}`,
        error.code,
        error.details
      );
    }

    return true;
  } catch (error) {
    console.error('Update current lesson error:', error);
    return false;
  }
}

/**
 * Get in-progress courses for a user
 *
 * @param userId - The user ID
 * @returns Array of in-progress enrollments
 *
 * @example
 * ```typescript
 * const inProgress = await getInProgressCourses(userId);
 * console.log(`${inProgress.length} courses in progress`);
 * ```
 */
export async function getInProgressCourses(userId: string): Promise<UserEnrollment[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId)
      .is('completed_at', null)
      .not('started_at', 'is', null)
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch in-progress courses: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error fetching in-progress courses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Get completed courses for a user
 *
 * @param userId - The user ID
 * @returns Array of completed enrollments
 *
 * @example
 * ```typescript
 * const completed = await getCompletedCourses(userId);
 * console.log(`${completed.length} courses completed`);
 * ```
 */
export async function getCompletedCourses(userId: string): Promise<UserEnrollment[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new EnrollmentError(
        `Failed to fetch completed courses: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof EnrollmentError) {
      throw error;
    }
    throw new EnrollmentError(
      `Unexpected error fetching completed courses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}
