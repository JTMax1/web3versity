/**
 * Lesson Adapter
 *
 * Converts database Lesson records to frontend LessonContent format
 */

import type { Lesson } from '../supabase/types';
import type { LessonContent } from '../courseContent';

/**
 * Convert database Lesson to frontend LessonContent
 *
 * @param lesson - Database lesson record
 * @returns LessonContent for frontend use
 */
export function adaptLessonForComponent(lesson: Lesson): LessonContent {
  return {
    id: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    type: lesson.lesson_type as 'text' | 'interactive' | 'quiz' | 'practical',
    content: lesson.content, // JSONB content is already in the right format
    duration: lesson.duration_minutes,
    sequence: lesson.sequence_number,
  };
}

/**
 * Convert array of database Lessons to LessonContent array
 *
 * @param lessons - Array of database lesson records
 * @returns Array of LessonContent for frontend use
 */
export function adaptLessonsForComponent(lessons: Lesson[]): LessonContent[] {
  return lessons.map(adaptLessonForComponent);
}
