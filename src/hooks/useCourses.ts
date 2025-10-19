/**
 * Course Query Hooks
 *
 * React Query hooks for fetching and managing course data.
 * Provides automatic caching, refetching, and state management.
 *
 * Features:
 * - Automatic caching with React Query
 * - Loading and error state management
 * - Auto-refetch on filter changes
 * - Optimized re-renders
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Course, CourseFilters, Lesson } from '../lib/supabase/types';
import type { CourseQueryOptions, CourseSortBy, SortOrder } from '../lib/api/courses';
import type { ComponentCourse } from '../lib/adapters/courseAdapter';
import { adaptCoursesForComponent, adaptCourseForComponent } from '../lib/adapters/courseAdapter';
import {
  getAllCourses,
  getCourseById,
  getCourseLessons,
  getCoursePrerequisites,
  getCourseCategories,
  getCourseCount,
  getFeaturedCourses,
  getPopularCourses,
  getTopRatedCourses,
  getNewestCourses,
} from '../lib/api/courses';

// ============================================================================
// Query Keys
// ============================================================================

export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: CourseQueryOptions) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  lessons: (id: string) => [...courseKeys.detail(id), 'lessons'] as const,
  prerequisites: (id: string) => [...courseKeys.detail(id), 'prerequisites'] as const,
  categories: () => [...courseKeys.all, 'categories'] as const,
  count: (filters: CourseFilters) => [...courseKeys.all, 'count', filters] as const,
  featured: () => [...courseKeys.all, 'featured'] as const,
  popular: () => [...courseKeys.all, 'popular'] as const,
  topRated: () => [...courseKeys.all, 'top-rated'] as const,
  newest: () => [...courseKeys.all, 'newest'] as const,
};

// ============================================================================
// Course List Hook
// ============================================================================

export interface UseCoursesOptions extends CourseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

export interface UseCoursesResult {
  courses: ComponentCourse[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all courses with filtering, searching, and sorting
 *
 * @param options - Query options including filters and React Query config
 * @returns Courses data with loading and error states
 *
 * @example
 * ```tsx
 * function CourseList() {
 *   const { courses, isLoading, isError } = useCourses({
 *     track: 'explorer',
 *     difficulty: 'beginner',
 *     sortBy: 'enrollment_count',
 *     sortOrder: 'desc'
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error loading courses</div>;
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function useCourses(options: UseCoursesOptions = {}): UseCoursesResult {
  const {
    enabled = true,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    ...queryOptions
  } = options;

  const query = useQuery({
    queryKey: courseKeys.list(queryOptions),
    queryFn: async () => {
      const courses = await getAllCourses(queryOptions);
      return adaptCoursesForComponent(courses);
    },
    enabled,
    refetchOnMount,
    refetchOnWindowFocus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Course Detail Hook
// ============================================================================

export interface UseCourseResult {
  course: Course | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch a single course by ID
 *
 * @param courseId - The course ID to fetch
 * @param options - React Query options
 * @returns Course data with loading and error states
 *
 * @example
 * ```tsx
 * function CourseDetail({ courseId }: { courseId: string }) {
 *   const { course, isLoading, isError } = useCourse(courseId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isError) return <div>Error loading course</div>;
 *   if (!course) return <div>Course not found</div>;
 *
 *   return <div>{course.title}</div>;
 * }
 * ```
 */
export function useCourse(
  courseId: string,
  options: { enabled?: boolean } = {}
): UseCourseResult {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseById(courseId),
    enabled: enabled && !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    course: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Course Lessons Hook
// ============================================================================

export interface UseCourseLessonsResult {
  lessons: Lesson[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch all lessons for a course
 *
 * @param courseId - The course ID to fetch lessons for
 * @param options - React Query options
 * @returns Lessons data with loading and error states
 *
 * @example
 * ```tsx
 * function CourseLessons({ courseId }: { courseId: string }) {
 *   const { lessons, isLoading } = useCourseLessons(courseId);
 *
 *   if (isLoading) return <div>Loading lessons...</div>;
 *
 *   return (
 *     <div>
 *       {lessons.map(lesson => (
 *         <div key={lesson.id}>{lesson.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCourseLessons(
  courseId: string,
  options: { enabled?: boolean } = {}
): UseCourseLessonsResult {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: courseKeys.lessons(courseId),
    queryFn: () => getCourseLessons(courseId),
    enabled: enabled && !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    lessons: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Course Prerequisites Hook
// ============================================================================

export interface UseCoursePrerequisitesResult {
  prerequisites: Course[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch prerequisite courses for a course
 *
 * @param courseId - The course ID to fetch prerequisites for
 * @param options - React Query options
 * @returns Prerequisites data with loading and error states
 *
 * @example
 * ```tsx
 * function CoursePrerequisites({ courseId }: { courseId: string }) {
 *   const { prerequisites, isLoading } = useCoursePrerequisites(courseId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (prerequisites.length === 0) return <div>No prerequisites</div>;
 *
 *   return (
 *     <div>
 *       <h3>Prerequisites:</h3>
 *       {prerequisites.map(course => (
 *         <div key={course.id}>{course.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCoursePrerequisites(
  courseId: string,
  options: { enabled?: boolean } = {}
): UseCoursePrerequisitesResult {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: courseKeys.prerequisites(courseId),
    queryFn: () => getCoursePrerequisites(courseId),
    enabled: enabled && !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    prerequisites: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Course Categories Hook
// ============================================================================

export interface UseCategoriesResult {
  categories: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch all unique course categories
 *
 * @returns Categories data with loading and error states
 *
 * @example
 * ```tsx
 * function CategoryFilter() {
 *   const { categories, isLoading } = useCourseCategories();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <select>
 *       <option value="">All Categories</option>
 *       {categories.map(cat => (
 *         <option key={cat} value={cat}>{cat}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useCourseCategories(): UseCategoriesResult {
  const query = useQuery({
    queryKey: courseKeys.categories(),
    queryFn: getCourseCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Course Count Hook
// ============================================================================

export interface UseCourseCountResult {
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Get count of courses matching filters
 *
 * @param filters - Course filters
 * @returns Count with loading and error states
 *
 * @example
 * ```tsx
 * function CourseStats({ filters }: { filters: CourseFilters }) {
 *   const { count, isLoading } = useCourseCount(filters);
 *
 *   if (isLoading) return <div>Counting...</div>;
 *
 *   return <div>Found {count} courses</div>;
 * }
 * ```
 */
export function useCourseCount(filters: CourseFilters = {}): UseCourseCountResult {
  const query = useQuery({
    queryKey: courseKeys.count(filters),
    queryFn: () => getCourseCount(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    count: query.data || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// ============================================================================
// Featured Courses Hook
// ============================================================================

/**
 * Fetch featured courses
 *
 * @param limit - Maximum number of featured courses
 * @returns Featured courses with loading and error states
 *
 * @example
 * ```tsx
 * function FeaturedCourses() {
 *   const { courses, isLoading } = useFeaturedCourses(6);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function useFeaturedCourses(limit: number = 6): UseCoursesResult {
  const query = useQuery({
    queryKey: courseKeys.featured(),
    queryFn: () => getFeaturedCourses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Popular Courses Hook
// ============================================================================

/**
 * Fetch popular courses (by enrollment count)
 *
 * @param limit - Maximum number of popular courses
 * @returns Popular courses with loading and error states
 *
 * @example
 * ```tsx
 * function PopularCourses() {
 *   const { courses, isLoading } = usePopularCourses(10);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function usePopularCourses(limit: number = 10): UseCoursesResult {
  const query = useQuery({
    queryKey: courseKeys.popular(),
    queryFn: () => getPopularCourses(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Top Rated Courses Hook
// ============================================================================

/**
 * Fetch highest rated courses
 *
 * @param limit - Maximum number of top-rated courses
 * @returns Top-rated courses with loading and error states
 *
 * @example
 * ```tsx
 * function TopRatedCourses() {
 *   const { courses, isLoading } = useTopRatedCourses(10);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function useTopRatedCourses(limit: number = 10): UseCoursesResult {
  const query = useQuery({
    queryKey: courseKeys.topRated(),
    queryFn: () => getTopRatedCourses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Newest Courses Hook
// ============================================================================

/**
 * Fetch newest courses
 *
 * @param limit - Maximum number of new courses
 * @returns Newest courses with loading and error states
 *
 * @example
 * ```tsx
 * function NewestCourses() {
 *   const { courses, isLoading } = useNewestCourses(10);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function useNewestCourses(limit: number = 10): UseCoursesResult {
  const query = useQuery({
    queryKey: courseKeys.newest(),
    queryFn: () => getNewestCourses(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
