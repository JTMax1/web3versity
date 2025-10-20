/**
 * Enrollment Hooks
 *
 * React Query hooks for managing course enrollments.
 * Provides automatic caching, optimistic updates, and state management.
 *
 * Features:
 * - Enroll in courses with prerequisite checking
 * - Track enrollment status
 * - Manage user's enrolled courses
 * - Optimistic UI updates
 * - Cache invalidation on changes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProgress, Course } from '../lib/supabase/types';
import type { UserEnrollment, PrerequisiteCheck, EnrollmentResult } from '../lib/api/enrollment';
import {
  enrollInCourse,
  getUserEnrollments,
  getEnrollmentStatus,
  checkPrerequisites,
  getEnrolledCourseIds,
  getInProgressCourses,
  getCompletedCourses,
  updateCurrentLesson,
} from '../lib/api/enrollment';
import { courseKeys } from './useCourses';

// ============================================================================
// Query Keys
// ============================================================================

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (userId: string) => [...enrollmentKeys.lists(), userId] as const,
  ids: (userId: string) => [...enrollmentKeys.all, 'ids', userId] as const,
  status: (userId: string, courseId: string) =>
    [...enrollmentKeys.all, 'status', userId, courseId] as const,
  prerequisites: (userId: string, courseId: string) =>
    [...enrollmentKeys.all, 'prerequisites', userId, courseId] as const,
  inProgress: (userId: string) => [...enrollmentKeys.all, 'in-progress', userId] as const,
  completed: (userId: string) => [...enrollmentKeys.all, 'completed', userId] as const,
};

// ============================================================================
// User Enrollments Hook
// ============================================================================

export interface UseUserEnrollmentsResult {
  enrollments: UserEnrollment[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all enrollments for a user
 *
 * @param userId - The user ID
 * @param options - React Query options
 * @returns User enrollments with loading and error states
 *
 * @example
 * ```tsx
 * function MyEnrollments({ userId }: { userId: string }) {
 *   const { enrollments, isLoading } = useUserEnrollments(userId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {enrollments.map(enrollment => (
 *         <div key={enrollment.id}>
 *           {enrollment.course?.title} - {enrollment.progress_percentage}%
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserEnrollments(
  userId: string | null | undefined,
  options: { enabled?: boolean } = {}
): UseUserEnrollmentsResult {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: enrollmentKeys.list(userId || ''),
    queryFn: () => getUserEnrollments(userId!),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    enrollments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Enrolled Course IDs Hook (Lightweight)
// ============================================================================

export interface UseEnrolledCourseIdsResult {
  enrolledIds: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch enrolled course IDs for a user (lightweight, for checking enrollment status)
 *
 * @param userId - The user ID
 * @returns Array of enrolled course IDs
 *
 * @example
 * ```tsx
 * function CourseCard({ courseId, userId }: Props) {
 *   const { enrolledIds } = useEnrolledCourseIds(userId);
 *   const isEnrolled = enrolledIds.includes(courseId);
 *
 *   return <div>{isEnrolled ? 'Enrolled' : 'Not Enrolled'}</div>;
 * }
 * ```
 */
export function useEnrolledCourseIds(
  userId: string | null | undefined
): UseEnrolledCourseIdsResult {
  const query = useQuery({
    queryKey: enrollmentKeys.ids(userId || ''),
    queryFn: () => getEnrolledCourseIds(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    enrolledIds: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Enrollment Status Hook
// ============================================================================

export interface UseEnrollmentStatusResult {
  enrollment: UserProgress | null;
  isEnrolled: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Check enrollment status for a specific course
 *
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns Enrollment status with loading and error states
 *
 * @example
 * ```tsx
 * function CourseStatus({ userId, courseId }: Props) {
 *   const { isEnrolled, enrollment } = useEnrollmentStatus(userId, courseId);
 *
 *   if (isEnrolled) {
 *     return <div>Progress: {enrollment?.progress_percentage}%</div>;
 *   }
 *
 *   return <div>Not enrolled</div>;
 * }
 * ```
 */
export function useEnrollmentStatus(
  userId: string | null | undefined,
  courseId: string
): UseEnrollmentStatusResult {
  const query = useQuery({
    queryKey: enrollmentKeys.status(userId || '', courseId),
    queryFn: () => getEnrollmentStatus(userId!, courseId),
    enabled: !!userId && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    enrollment: query.data || null,
    isEnrolled: !!query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Prerequisites Check Hook
// ============================================================================

export interface UsePrerequisitesResult {
  canEnroll: boolean;
  missingPrerequisites: Course[];
  message?: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Check if user can enroll in a course (prerequisites check)
 *
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns Prerequisite check result
 *
 * @example
 * ```tsx
 * function EnrollButton({ userId, courseId }: Props) {
 *   const { canEnroll, missingPrerequisites } = usePrerequisites(userId, courseId);
 *
 *   if (!canEnroll) {
 *     return (
 *       <div>
 *         Must complete: {missingPrerequisites.map(c => c.title).join(', ')}
 *       </div>
 *     );
 *   }
 *
 *   return <button>Enroll Now</button>;
 * }
 * ```
 */
export function usePrerequisites(
  userId: string | null | undefined,
  courseId: string,
  options: { enabled?: boolean } = {}
): UsePrerequisitesResult {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: enrollmentKeys.prerequisites(userId || '', courseId),
    queryFn: () => checkPrerequisites(userId!, courseId),
    enabled: enabled && !!userId && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes - prerequisites don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const result = query.data || { canEnroll: false, missingPrerequisites: [] };

  return {
    canEnroll: result.canEnroll,
    missingPrerequisites: result.missingPrerequisites,
    message: result.message,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Enroll Mutation Hook
// ============================================================================

export interface UseEnrollResult {
  enroll: (userId: string, courseId: string) => Promise<EnrollmentResult>;
  isEnrolling: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Enroll in a course with optimistic updates
 *
 * @returns Enrollment mutation functions and state
 *
 * @example
 * ```tsx
 * function EnrollButton({ userId, courseId }: Props) {
 *   const { enroll, isEnrolling } = useEnroll();
 *   const { toast } = useToast();
 *
 *   const handleEnroll = async () => {
 *     const result = await enroll(userId, courseId);
 *     if (result.success) {
 *       toast.success('Enrolled successfully!');
 *     } else {
 *       toast.error(result.error || 'Enrollment failed');
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleEnroll} disabled={isEnrolling}>
 *       {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useEnroll(): UseEnrollResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      enrollInCourse(userId, courseId),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate enrollment queries
        queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: enrollmentKeys.ids(variables.userId)
        });
        queryClient.invalidateQueries({
          queryKey: enrollmentKeys.status(variables.userId, variables.courseId)
        });

        // Invalidate course queries to update enrollment count
        queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: courseKeys.detail(variables.courseId)
        });
      }
    },
  });

  return {
    enroll: (userId: string, courseId: string) =>
      mutation.mutateAsync({ userId, courseId }),
    isEnrolling: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// ============================================================================
// In-Progress Courses Hook
// ============================================================================

/**
 * Fetch courses that are in progress (started but not completed)
 *
 * @param userId - The user ID
 * @returns In-progress courses with loading and error states
 *
 * @example
 * ```tsx
 * function ContinueLearning({ userId }: { userId: string }) {
 *   const { enrollments, isLoading } = useInProgressCourses(userId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h3>Continue Learning</h3>
 *       {enrollments.map(enrollment => (
 *         <CourseCard key={enrollment.id} enrollment={enrollment} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInProgressCourses(
  userId: string | null | undefined
): UseUserEnrollmentsResult {
  const query = useQuery({
    queryKey: enrollmentKeys.inProgress(userId || ''),
    queryFn: () => getInProgressCourses(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    enrollments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Completed Courses Hook
// ============================================================================

/**
 * Fetch courses that have been completed
 *
 * @param userId - The user ID
 * @returns Completed courses with loading and error states
 *
 * @example
 * ```tsx
 * function CompletedCourses({ userId }: { userId: string }) {
 *   const { enrollments, isLoading } = useCompletedCourses(userId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h3>Completed Courses ({enrollments.length})</h3>
 *       {enrollments.map(enrollment => (
 *         <CourseCard key={enrollment.id} enrollment={enrollment} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCompletedCourses(
  userId: string | null | undefined
): UseUserEnrollmentsResult {
  const query = useQuery({
    queryKey: enrollmentKeys.completed(userId || ''),
    queryFn: () => getCompletedCourses(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - completed courses don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    enrollments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Update Current Lesson Mutation
// ============================================================================

export interface UseUpdateCurrentLessonResult {
  updateLesson: (userId: string, courseId: string, lessonId: string) => Promise<boolean>;
  isUpdating: boolean;
}

/**
 * Update the current lesson for a course
 *
 * @returns Mutation functions and state
 *
 * @example
 * ```tsx
 * function LessonViewer({ userId, courseId, lessonId }: Props) {
 *   const { updateLesson } = useUpdateCurrentLesson();
 *
 *   useEffect(() => {
 *     updateLesson(userId, courseId, lessonId);
 *   }, [lessonId]);
 *
 *   return <div>Viewing lesson {lessonId}</div>;
 * }
 * ```
 */
export function useUpdateCurrentLesson(): UseUpdateCurrentLessonResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      userId,
      courseId,
      lessonId
    }: {
      userId: string;
      courseId: string;
      lessonId: string;
    }) => updateCurrentLesson(userId, courseId, lessonId),
    onSuccess: (_, variables) => {
      // Invalidate enrollment status to reflect new current lesson
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.status(variables.userId, variables.courseId)
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.list(variables.userId)
      });
    },
  });

  return {
    updateLesson: (userId: string, courseId: string, lessonId: string) =>
      mutation.mutateAsync({ userId, courseId, lessonId }),
    isUpdating: mutation.isPending,
  };
}
