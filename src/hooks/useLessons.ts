/**
 * Lessons Hook
 *
 * React Query hook for fetching course lessons from database
 */

import { useQuery } from '@tanstack/react-query';
import { getCourseLessons } from '../lib/api/courses';
import { adaptLessonsForComponent } from '../lib/adapters/lessonAdapter';
import { getLessonsForCourse } from '../lib/courseContent';
import type { LessonContent } from '../lib/courseContent';

// ============================================================================
// Query Keys
// ============================================================================

export const lessonsKeys = {
  all: ['lessons'] as const,
  byCourse: (courseId: string) => [...lessonsKeys.all, 'course', courseId] as const,
};

// ============================================================================
// Lessons Hook
// ============================================================================

export interface UseLessonsResult {
  lessons: LessonContent[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch lessons for a course from database with fallback to hardcoded
 *
 * @param courseId - Course ID
 * @returns Lessons data with loading states
 */
export function useLessons(courseId: string): UseLessonsResult {
  const query = useQuery({
    queryKey: lessonsKeys.byCourse(courseId),
    queryFn: async () => {
      try {
        // Try to fetch from database first
        const dbLessons = await getCourseLessons(courseId);

        if (dbLessons && dbLessons.length > 0) {
          // Database has lessons, use them
          return adaptLessonsForComponent(dbLessons);
        }

        // Fallback to hardcoded lessons if database is empty
        console.warn(`No lessons found in database for course ${courseId}, using hardcoded fallback`);
        return getLessonsForCourse(courseId);
      } catch (error) {
        // On error, fallback to hardcoded lessons
        console.error(`Error fetching lessons from database for course ${courseId}:`, error);
        console.warn('Using hardcoded lessons as fallback');
        return getLessonsForCourse(courseId);
      }
    },
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes - lessons don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    lessons: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
