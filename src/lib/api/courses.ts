/**
 * Course API Functions
 *
 * This module provides functions to interact with the courses table in Supabase.
 * All functions are type-safe and handle errors gracefully.
 *
 * Features:
 * - Fetch all courses with filtering, searching, and sorting
 * - Fetch single course by ID with full details
 * - Fetch course lessons
 * - Fetch course prerequisites
 * - Increment enrollment count
 */

import { supabase } from '../supabase/client';
import type { Course, CourseFilters, Lesson, CoursePrerequisite } from '../supabase/types';

// ============================================================================
// Query Options Types
// ============================================================================

export type CourseSortBy = 'enrollment_count' | 'average_rating' | 'created_at' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface CourseQueryOptions extends CourseFilters {
  sortBy?: CourseSortBy;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class CourseAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CourseAPIError';
  }
}

// ============================================================================
// Course Query Functions
// ============================================================================

/**
 * Fetch all courses with optional filtering, searching, and sorting
 *
 * @param options - Query options for filtering, searching, and sorting
 * @returns Array of courses
 *
 * @example
 * ```typescript
 * // Get all published beginner courses
 * const courses = await getAllCourses({
 *   difficulty: 'beginner',
 *   is_published: true
 * });
 *
 * // Search for courses with sorting
 * const courses = await getAllCourses({
 *   search: 'hedera',
 *   sortBy: 'enrollment_count',
 *   sortOrder: 'desc'
 * });
 * ```
 */
export async function getAllCourses(options: CourseQueryOptions = {}): Promise<Course[]> {
  try {
    const {
      track,
      difficulty,
      category,
      search,
      is_published = true, // Default to published courses only
      is_featured,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit,
      offset,
    } = options;

    // Start building query
    let query = supabase
      .from('courses')
      .select('*');

    // Apply filters
    if (is_published !== undefined) {
      query = query.eq('is_published', is_published);
    }

    if (track) {
      query = query.eq('track', track);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (is_featured !== undefined) {
      query = query.eq('is_featured', is_featured);
    }

    // Apply search (case-insensitive search in title and description)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new CourseAPIError(
        `Failed to fetch courses: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching courses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Fetch a single course by ID with full details
 *
 * @param courseId - The course ID to fetch
 * @returns Course object or null if not found
 *
 * @example
 * ```typescript
 * const course = await getCourseById('course_001');
 * if (course) {
 *   console.log(course.title);
 * }
 * ```
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new CourseAPIError(
        `Failed to fetch course: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching course: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Fetch all lessons for a course, ordered by sequence number
 *
 * @param courseId - The course ID to fetch lessons for
 * @returns Array of lessons
 *
 * @example
 * ```typescript
 * const lessons = await getCourseLessons('course_001');
 * console.log(`Found ${lessons.length} lessons`);
 * ```
 */
export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_number', { ascending: true });

    if (error) {
      throw new CourseAPIError(
        `Failed to fetch lessons: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching lessons: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Fetch prerequisite courses for a course
 *
 * @param courseId - The course ID to fetch prerequisites for
 * @returns Array of prerequisite courses
 *
 * @example
 * ```typescript
 * const prerequisites = await getCoursePrerequisites('course_003');
 * console.log(`This course requires ${prerequisites.length} prerequisites`);
 * ```
 */
export async function getCoursePrerequisites(courseId: string): Promise<Course[]> {
  try {
    // First, get the prerequisite IDs
    const { data: prereqData, error: prereqError } = await supabase
      .from('course_prerequisites')
      .select('prerequisite_course_id, is_required')
      .eq('course_id', courseId)
      .eq('is_required', true);

    if (prereqError) {
      throw new CourseAPIError(
        `Failed to fetch prerequisites: ${prereqError.message}`,
        prereqError.code,
        prereqError.details
      );
    }

    if (!prereqData || prereqData.length === 0) {
      return [];
    }

    // Get the prerequisite course IDs
    const prereqIds = prereqData.map((p) => p.prerequisite_course_id);

    // Fetch the actual course details
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', prereqIds);

    if (coursesError) {
      throw new CourseAPIError(
        `Failed to fetch prerequisite courses: ${coursesError.message}`,
        coursesError.code,
        coursesError.details
      );
    }

    return courses || [];
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching prerequisites: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Increment the enrollment count for a course
 *
 * @param courseId - The course ID to increment enrollment for
 * @returns Updated enrollment count
 *
 * @example
 * ```typescript
 * const newCount = await incrementEnrollmentCount('course_001');
 * console.log(`New enrollment count: ${newCount}`);
 * ```
 */
export async function incrementEnrollmentCount(courseId: string): Promise<number> {
  try {
    // First, get current enrollment count
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('enrollment_count')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      throw new CourseAPIError(
        `Failed to fetch current enrollment count: ${fetchError.message}`,
        fetchError.code,
        fetchError.details
      );
    }

    const newCount = (course?.enrollment_count || 0) + 1;

    // Update the enrollment count
    const { error: updateError } = await supabase
      .from('courses')
      .update({ enrollment_count: newCount })
      .eq('id', courseId);

    if (updateError) {
      throw new CourseAPIError(
        `Failed to increment enrollment count: ${updateError.message}`,
        updateError.code,
        updateError.details
      );
    }

    return newCount;
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error incrementing enrollment count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all unique categories from published courses
 *
 * @returns Array of unique category names
 *
 * @example
 * ```typescript
 * const categories = await getCourseCategories();
 * console.log('Available categories:', categories);
 * ```
 */
export async function getCourseCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('category')
      .eq('is_published', true);

    if (error) {
      throw new CourseAPIError(
        `Failed to fetch categories: ${error.message}`,
        error.code,
        error.details
      );
    }

    // Extract unique categories
    const categories = [...new Set(data?.map((c) => c.category) || [])];
    return categories.sort();
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Get course count by filters
 *
 * @param filters - Course filters
 * @returns Total count of courses matching filters
 *
 * @example
 * ```typescript
 * const count = await getCourseCount({ track: 'explorer', difficulty: 'beginner' });
 * console.log(`Found ${count} beginner explorer courses`);
 * ```
 */
export async function getCourseCount(filters: CourseFilters = {}): Promise<number> {
  try {
    const {
      track,
      difficulty,
      category,
      search,
      is_published = true,
      is_featured,
    } = filters;

    // Start building query
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (is_published !== undefined) {
      query = query.eq('is_published', is_published);
    }

    if (track) {
      query = query.eq('track', track);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (is_featured !== undefined) {
      query = query.eq('is_featured', is_featured);
    }

    // Apply search
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Execute query
    const { count, error } = await query;

    if (error) {
      throw new CourseAPIError(
        `Failed to fetch course count: ${error.message}`,
        error.code,
        error.details
      );
    }

    return count || 0;
  } catch (error) {
    if (error instanceof CourseAPIError) {
      throw error;
    }
    throw new CourseAPIError(
      `Unexpected error fetching course count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Get featured courses
 *
 * @param limit - Maximum number of featured courses to return
 * @returns Array of featured courses
 *
 * @example
 * ```typescript
 * const featured = await getFeaturedCourses(5);
 * console.log('Featured courses:', featured);
 * ```
 */
export async function getFeaturedCourses(limit: number = 6): Promise<Course[]> {
  return getAllCourses({
    is_featured: true,
    is_published: true,
    sortBy: 'average_rating',
    sortOrder: 'desc',
    limit,
  });
}

/**
 * Get popular courses (by enrollment count)
 *
 * @param limit - Maximum number of popular courses to return
 * @returns Array of popular courses
 *
 * @example
 * ```typescript
 * const popular = await getPopularCourses(10);
 * console.log('Popular courses:', popular);
 * ```
 */
export async function getPopularCourses(limit: number = 10): Promise<Course[]> {
  return getAllCourses({
    is_published: true,
    sortBy: 'enrollment_count',
    sortOrder: 'desc',
    limit,
  });
}

/**
 * Get highest rated courses
 *
 * @param limit - Maximum number of top-rated courses to return
 * @returns Array of top-rated courses
 *
 * @example
 * ```typescript
 * const topRated = await getTopRatedCourses(10);
 * console.log('Top rated courses:', topRated);
 * ```
 */
export async function getTopRatedCourses(limit: number = 10): Promise<Course[]> {
  return getAllCourses({
    is_published: true,
    sortBy: 'average_rating',
    sortOrder: 'desc',
    limit,
  });
}

/**
 * Get newest courses
 *
 * @param limit - Maximum number of new courses to return
 * @returns Array of newest courses
 *
 * @example
 * ```typescript
 * const newest = await getNewestCourses(10);
 * console.log('Newest courses:', newest);
 * ```
 */
export async function getNewestCourses(limit: number = 10): Promise<Course[]> {
  return getAllCourses({
    is_published: true,
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit,
  });
}
