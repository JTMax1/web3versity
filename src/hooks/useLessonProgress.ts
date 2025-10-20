/**
 * Lesson Progress Hooks
 *
 * React Query hooks for managing lesson completion and progress tracking.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LessonCompletion } from '../lib/supabase/types';
import {
  markLessonComplete,
  getLessonCompletion,
  getCourseProgress,
  getCompletedLessons,
  updateCurrentLesson,
  type LessonCompleteResult,
  type CourseProgressData,
} from '../lib/api/progress';

// ============================================================================
// Query Keys
// ============================================================================

export const progressKeys = {
  all: ['progress'] as const,
  courseProgress: (userId: string, courseId: string) =>
    [...progressKeys.all, 'course', userId, courseId] as const,
  lessonCompletion: (userId: string, lessonId: string) =>
    [...progressKeys.all, 'lesson', userId, lessonId] as const,
  completedLessons: (userId: string, courseId: string) =>
    [...progressKeys.all, 'completed', userId, courseId] as const,
};

// ============================================================================
// Course Progress Hook
// ============================================================================

export interface UseCourseProgressResult {
  progress: CourseProgressData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch course progress for a user
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Course progress data with loading states
 */
export function useCourseProgress(
  userId: string | null | undefined,
  courseId: string
): UseCourseProgressResult {
  const query = useQuery({
    queryKey: progressKeys.courseProgress(userId || '', courseId),
    queryFn: () => getCourseProgress(userId!, courseId),
    enabled: !!userId && !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute - progress changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    progress: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Lesson Completion Status Hook
// ============================================================================

export interface UseLessonCompletionResult {
  completion: LessonCompletion | null;
  isCompleted: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Check if a lesson is completed
 *
 * @param userId - User UUID
 * @param lessonId - Lesson ID
 * @returns Completion status
 */
export function useLessonCompletion(
  userId: string | null | undefined,
  lessonId: string
): UseLessonCompletionResult {
  const query = useQuery({
    queryKey: progressKeys.lessonCompletion(userId || '', lessonId),
    queryFn: () => getLessonCompletion(userId!, lessonId),
    enabled: !!userId && !!lessonId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    completion: query.data || null,
    isCompleted: !!query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Completed Lessons Hook
// ============================================================================

export interface UseCompletedLessonsResult {
  completedLessonIds: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Get all completed lessons for a course
 *
 * @param userId - User UUID
 * @param courseId - Course ID
 * @returns Array of completed lesson IDs
 */
export function useCompletedLessons(
  userId: string | null | undefined,
  courseId: string
): UseCompletedLessonsResult {
  const query = useQuery({
    queryKey: progressKeys.completedLessons(userId || '', courseId),
    queryFn: () => getCompletedLessons(userId!, courseId),
    enabled: !!userId && !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    completedLessonIds: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Complete Lesson Mutation Hook
// ============================================================================

export interface UseCompleteLessonResult {
  complete: (
    userId: string,
    lessonId: string,
    courseId: string,
    score?: number,
    timeSpentSeconds?: number
  ) => Promise<LessonCompleteResult>;
  isCompleting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Mark a lesson as complete with optimistic updates
 *
 * @returns Mutation functions and state
 */
export function useCompleteLesson(): UseCompleteLessonResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      userId,
      lessonId,
      courseId,
      score,
      timeSpentSeconds,
    }: {
      userId: string;
      lessonId: string;
      courseId: string;
      score?: number;
      timeSpentSeconds?: number;
    }) => markLessonComplete(userId, lessonId, courseId, score, timeSpentSeconds),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: progressKeys.courseProgress(variables.userId, variables.courseId),
        });
        queryClient.invalidateQueries({
          queryKey: progressKeys.lessonCompletion(variables.userId, variables.lessonId),
        });
        queryClient.invalidateQueries({
          queryKey: progressKeys.completedLessons(variables.userId, variables.courseId),
        });

        // Invalidate user data (XP and level updated)
        queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });

        // Invalidate enrollment data
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      }
    },
  });

  return {
    complete: (userId, lessonId, courseId, score, timeSpentSeconds) =>
      mutation.mutateAsync({ userId, lessonId, courseId, score, timeSpentSeconds }),
    isCompleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ============================================================================
// Update Current Lesson Mutation Hook
// ============================================================================

export interface UseUpdateCurrentLessonResult {
  updateLesson: (userId: string, courseId: string, lessonId: string) => Promise<boolean>;
  isUpdating: boolean;
}

/**
 * Update the current lesson position
 *
 * @returns Mutation functions and state
 */
export function useUpdateCurrentLesson(): UseUpdateCurrentLessonResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      userId,
      courseId,
      lessonId,
    }: {
      userId: string;
      courseId: string;
      lessonId: string;
    }) => updateCurrentLesson(userId, courseId, lessonId),
    onSuccess: (_, variables) => {
      // Invalidate course progress to reflect new current lesson
      queryClient.invalidateQueries({
        queryKey: progressKeys.courseProgress(variables.userId, variables.courseId),
      });
    },
  });

  return {
    updateLesson: (userId, courseId, lessonId) =>
      mutation.mutateAsync({ userId, courseId, lessonId }),
    isUpdating: mutation.isPending,
  };
}
