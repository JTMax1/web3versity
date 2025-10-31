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

  const contentObj = adaptedContent as any;

  // For interactive lessons, ensure content.type exists
  if (lesson.lesson_type === 'interactive') {
    // Manual course creation stores interactiveType at top level, we need it in content.type
    if (!('type' in contentObj)) {
      console.log(`Interactive lesson ${lesson.id}: looking for type field`);

      // Check for interactiveType from manual course creation
      const possibleType = contentObj.interactiveType || contentObj.interactive_type || contentObj.componentType;

      if (possibleType) {
        // For manual courses: build proper interactive content structure
        adaptedContent = {
          type: possibleType,
          explanation: contentObj.explanation || `Experience the ${possibleType.replace(/_/g, ' ')} interactive component.`,
          analogy: contentObj.analogy || '',
          ...contentObj,
        };
      } else {
        // Fallback
        console.warn(`Interactive lesson ${lesson.id} missing type identifier`);
        adaptedContent = { ...contentObj, type: 'unknown' };
      }
    }
  }

  // For practical lessons, ensure content has required fields
  if (lesson.lesson_type === 'practical') {
    // Manual course creation stores practicalType and practicalConfig at top level
    // We need to transform it to match PracticalLesson component expectations
    const practicalType = contentObj.practicalType || contentObj.practical_type || contentObj.type;
    const practicalConfig = contentObj.practicalConfig || contentObj.practical_config || {};

    if (practicalType || Object.keys(practicalConfig).length > 0) {
      // Build proper practical content structure
      adaptedContent = {
        title: lesson.title,
        description: contentObj.description || practicalConfig.description || 'Complete this hands-on exercise',
        objective: practicalConfig.objective || contentObj.objective || 'Practice your blockchain skills',
        interactiveType: practicalType || 'transaction',
        steps: practicalConfig.steps || contentObj.steps || ['Complete the exercise'],
        tips: practicalConfig.tips || contentObj.tips || ['Read instructions carefully'],
        successMessage: contentObj.successMessage || practicalConfig.successMessage || 'Great job!',
        defaultRecipient: practicalConfig.defaultRecipient || contentObj.defaultRecipient,
        defaultAmount: practicalConfig.defaultAmount || contentObj.defaultAmount,
        defaultMemo: practicalConfig.defaultMemo || contentObj.defaultMemo,
      };
    } else if (!('interactiveType' in contentObj)) {
      // Fallback for missing practical configuration
      console.warn(`Practical lesson ${lesson.id} missing practicalType configuration`);
      adaptedContent = {
        title: lesson.title,
        description: 'Complete this practical exercise',
        objective: 'Practice your blockchain skills',
        interactiveType: 'transaction',
        steps: ['Complete the exercise'],
        tips: ['Read instructions carefully'],
        successMessage: 'Great job completing this exercise!',
      };
    }
  }

  // For text lessons, ensure content.sections exists
  if (lesson.lesson_type === 'text') {
    if (!('sections' in contentObj) || !Array.isArray(contentObj.sections)) {
      console.warn(`Text lesson ${lesson.id} missing 'sections' array in content`);
      // Try to convert old format or provide fallback
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
