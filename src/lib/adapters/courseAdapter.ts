/**
 * Course Adapter
 *
 * Adapts database Course type to component-friendly format.
 * Maps database field names to component prop names.
 */

import type { Course as DBCourse } from '../supabase/types';

/**
 * Component-friendly Course type
 * Matches the original mockData Course interface for backwards compatibility
 */
export interface ComponentCourse {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  track: 'explorer' | 'developer';
  category: string;
  estimatedHours: number;
  enrollmentCount: number;
  rating: number;
  thumbnail: string;
  lessons: number;
  prerequisites: string[];
  isComingSoon: boolean;
}

/**
 * Adapt database Course to component Course
 *
 * @param dbCourse - Course from database
 * @returns Component-friendly course object
 */
export function adaptCourseForComponent(dbCourse: DBCourse): ComponentCourse {
  return {
    id: dbCourse.id,
    title: dbCourse.title,
    description: dbCourse.description,
    difficulty: dbCourse.difficulty,
    track: dbCourse.track,
    category: dbCourse.category,
    estimatedHours: dbCourse.estimated_hours,
    enrollmentCount: dbCourse.enrollment_count,
    rating: dbCourse.average_rating,
    thumbnail: dbCourse.thumbnail_emoji,
    lessons: dbCourse.total_lessons,
    prerequisites: [], // Will be populated separately if needed
    isComingSoon: dbCourse.is_coming_soon,
  };
}

/**
 * Adapt multiple courses
 *
 * @param dbCourses - Array of courses from database
 * @returns Array of component-friendly courses
 */
export function adaptCoursesForComponent(dbCourses: DBCourse[]): ComponentCourse[] {
  return dbCourses.map(adaptCourseForComponent);
}
