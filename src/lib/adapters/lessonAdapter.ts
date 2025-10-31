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
  // Ensure content exists and is an object
  let adaptedContent = lesson.content;

  // Safety check: if content is null/undefined, provide fallback
  if (!adaptedContent || typeof adaptedContent !== 'object') {
    console.warn(`Lesson ${lesson.id} has invalid content, using fallback`);
    adaptedContent = { sections: [] }; // Fallback for text lessons
  }

  // For interactive lessons, ensure content.type exists
  if (lesson.lesson_type === 'interactive') {
    // If content doesn't have a 'type' field, try to infer or use placeholder
    if (!('type' in adaptedContent)) {
      console.warn(`Interactive lesson ${lesson.id} missing 'type' field in content`);
      // Try to find a type field with different casing or structure
      const contentObj = adaptedContent as any;
      const possibleType = contentObj.interactiveType || contentObj.interactive_type || contentObj.componentType;

      if (possibleType) {
        adaptedContent = { ...contentObj, type: possibleType };
      } else {
        // Fallback: mark as unknown type
        adaptedContent = { ...contentObj, type: 'unknown' };
      }
    }
  }

  // For practical lessons, ensure content.interactiveType exists
  if (lesson.lesson_type === 'practical') {
    if (!('interactiveType' in adaptedContent)) {
      console.warn(`Practical lesson ${lesson.id} missing 'interactiveType' field in content`);
      // Try to find the field with different casing
      const contentObj = adaptedContent as any;
      const possibleType = contentObj.type || contentObj.interactive_type || contentObj.practicalType;

      if (possibleType) {
        adaptedContent = { ...contentObj, interactiveType: possibleType };
      } else {
        // Provide default fields for practical lessons
        adaptedContent = {
          title: contentObj.title || lesson.title,
          description: contentObj.description || 'Complete this practical exercise',
          objective: contentObj.objective || 'Practice your blockchain skills',
          interactiveType: contentObj.componentType || 'transaction',
          steps: contentObj.steps || ['Complete the exercise'],
          tips: contentObj.tips || ['Read the instructions carefully'],
          successMessage: contentObj.successMessage || 'Great job completing this exercise!',
          ...contentObj,
        };
      }
    }
  }

  // For text lessons, ensure content.sections exists
  if (lesson.lesson_type === 'text') {
    if (!('sections' in adaptedContent) || !Array.isArray((adaptedContent as any).sections)) {
      console.warn(`Text lesson ${lesson.id} missing 'sections' array in content`);
      // Try to convert old format or provide fallback
      const contentObj = adaptedContent as any;
      if (contentObj.text || contentObj.content) {
        // Try to create sections from raw text
        adaptedContent = {
          sections: [{
            heading: lesson.title,
            text: contentObj.text || contentObj.content,
            list: contentObj.list || contentObj.items,
          }],
        };
      } else {
        adaptedContent = { sections: [] };
      }
    }
  }

  return {
    id: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    type: lesson.lesson_type as 'text' | 'interactive' | 'quiz' | 'practical',
    content: adaptedContent,
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
