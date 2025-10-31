/**
 * Course & Lesson Transformers
 *
 * Bidirectional transformations between different course/lesson formats:
 * - AI format ↔ Unified format
 * - Manual format ↔ Unified format
 * - Unified format ↔ Database format
 *
 * This enables seamless transitions between AI generation and manual editing.
 */

import {
  UnifiedLesson,
  generateLessonId,
  calculateRecommendedXP,
} from './lesson-schema-unified';
import {
  UnifiedCourse,
  generateCourseId,
} from './course-schema-unified';
import type { CourseDraft, LessonContent, LearningObjective } from '../../stores/course-creation-store';
import type { GeneratedCourse } from '../ai/ai-service';

// ===================
// AI → Unified
// ===================

/**
 * Transforms AI-generated course to unified format
 */
export function aiCourseToUnified(aiCourse: GeneratedCourse): UnifiedCourse {
  return {
    id: aiCourse.id,
    title: aiCourse.title,
    description: aiCourse.description,
    track: aiCourse.track,
    difficulty: aiCourse.difficulty,
    estimated_hours: aiCourse.estimated_hours,
    thumbnail_emoji: aiCourse.thumbnail_emoji,
    image_url: undefined,
    category: aiCourse.category,
    target_audience: aiCourse.target_audience,
    prerequisites: aiCourse.prerequisites || [],
    learning_objectives: aiCourse.learning_objectives,
    lessons: aiCourse.lessons.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      duration_minutes: lesson.duration_minutes,
      completion_xp: lesson.completion_xp,
      perfect_score_xp: lesson.perfect_score_xp || lesson.completion_xp * 3,
      content: lesson.content,
      sequence_number: index + 1,
    })),
    creator_id: '', // Set when saving
    created_with: 'ai',
    draft_status: 'draft',
  };
}

// ===================
// Manual Draft → Unified
// ===================

/**
 * Transforms manual course draft to unified format
 */
export function manualDraftToUnified(draft: CourseDraft): UnifiedCourse {
  const courseId = draft.id || generateCourseId();

  return {
    id: courseId,
    title: draft.title,
    description: draft.description,
    track: draft.track,
    difficulty: draft.difficulty,
    estimated_hours: draft.estimatedHours,
    thumbnail_emoji: draft.thumbnailEmoji,
    image_url: draft.imageUrl,
    category: (draft as any).category || '',
    target_audience: (draft as any).targetAudience || '',
    prerequisites: (draft as any).prerequisites || [],
    learning_objectives: draft.learningObjectives.map(obj => obj.text),
    lessons: draft.lessons.map((lesson, index) =>
      manualLessonToUnified(lesson, courseId, index + 1)
    ),
    creator_id: draft.creatorId || '',
    created_with: 'manual',
    quality_score: undefined,
    draft_status: draft.draftStatus || 'draft',
    is_coming_soon: draft.isComingSoon,
  };
}

/**
 * Transforms manual lesson to unified format
 */
export function manualLessonToUnified(
  lesson: LessonContent,
  courseId: string,
  sequenceNumber: number
): UnifiedLesson {
  const lessonId = generateLessonId(courseId, sequenceNumber);

  // Calculate XP if not provided
  const recommendedXP = calculateRecommendedXP(
    lesson.type as any,
    lesson.estimatedMinutes || 10
  );
  const completionXP = lesson.xpReward || recommendedXP.completionXP;
  const perfectScoreXP = completionXP * 3;

  return {
    id: lessonId,
    title: lesson.title,
    lesson_type: lesson.type as any,
    duration_minutes: lesson.estimatedMinutes || 10,
    completion_xp: completionXP,
    perfect_score_xp: perfectScoreXP,
    content: transformManualLessonContent(lesson),
    sequence_number: sequenceNumber,
  };
}

/**
 * Transforms manual lesson content to unified format
 */
function transformManualLessonContent(lesson: LessonContent): any {
  switch (lesson.type) {
    case 'text':
      // Text lesson: content is markdown string, need to convert to sections
      if (typeof lesson.content === 'string') {
        return {
          sections: [
            {
              text: lesson.content,
            },
          ],
        };
      }
      return lesson.content || { sections: [] };

    case 'interactive':
      // Interactive lesson: interactiveType at top level needs to move into content.type
      return {
        type: lesson.interactiveType || 'unknown',
        explanation: '',
        analogy: '',
        ...(typeof lesson.interactiveConfig === 'object' ? lesson.interactiveConfig : {}),
      };

    case 'practical':
      // Practical lesson: practicalConfig needs to be flattened
      const config = lesson.practicalConfig || {};
      return {
        title: lesson.title,
        description: config.objective || '',
        objective: config.objective || '',
        interactiveType: lesson.practicalType || 'transaction',
        steps: config.steps || [],
        tips: config.tips || [],
        successMessage: 'Great job completing this exercise!',
        defaultRecipient: config.defaultRecipient,
        defaultAmount: config.defaultAmount,
        defaultMemo: config.defaultMemo,
      };

    case 'quiz':
      // Quiz lesson: questions array
      return {
        questions: lesson.questions || [],
      };

    default:
      return lesson.content || {};
  }
}

// ===================
// Unified → Manual Draft
// ===================

/**
 * Transforms unified course back to manual draft format
 * Used when editing AI-generated courses
 */
export function unifiedCourseToManualDraft(course: UnifiedCourse): CourseDraft {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    track: course.track,
    difficulty: course.difficulty,
    estimatedHours: course.estimated_hours,
    thumbnailEmoji: course.thumbnail_emoji,
    imageUrl: course.image_url,
    category: course.category,
    targetAudience: course.target_audience,
    prerequisites: course.prerequisites,
    learningObjectives: course.learning_objectives.map((text, index) => ({
      id: `obj_${index}`,
      text,
      order: index + 1,
    })),
    lessons: course.lessons.map((lesson, index) =>
      unifiedLessonToManual(lesson, index + 1)
    ),
    creatorId: course.creator_id,
    draftStatus: course.draft_status,
    isComingSoon: course.is_coming_soon,
  };
}

/**
 * Transforms unified lesson back to manual format
 */
function unifiedLessonToManual(lesson: UnifiedLesson, order: number): LessonContent {
  const baseLesson: Partial<LessonContent> = {
    id: lesson.id,
    type: lesson.lesson_type as any,
    title: lesson.title,
    order,
    estimatedMinutes: lesson.duration_minutes,
    xpReward: lesson.completion_xp,
  };

  // Transform content based on type
  switch (lesson.lesson_type) {
    case 'text':
      return {
        ...baseLesson,
        content: lesson.content,
      } as LessonContent;

    case 'interactive':
      const interactiveContent = lesson.content as any;
      return {
        ...baseLesson,
        interactiveType: interactiveContent.type,
        interactiveConfig: interactiveContent,
      } as LessonContent;

    case 'practical':
      const practicalContent = lesson.content as any;
      return {
        ...baseLesson,
        practicalType: practicalContent.interactiveType,
        practicalConfig: {
          objective: practicalContent.objective,
          steps: practicalContent.steps,
          tips: practicalContent.tips,
          defaultRecipient: practicalContent.defaultRecipient,
          defaultAmount: practicalContent.defaultAmount,
          defaultMemo: practicalContent.defaultMemo,
        },
      } as LessonContent;

    case 'quiz':
      return {
        ...baseLesson,
        questions: (lesson.content as any).questions || [],
      } as LessonContent;

    default:
      return {
        ...baseLesson,
        content: lesson.content,
      } as LessonContent;
  }
}

// ===================
// Unified → Database
// ===================

/**
 * Transforms unified course to database format (for course_drafts table)
 */
export function unifiedCourseToDatabase(course: UnifiedCourse) {
  return {
    id: course.id,
    creator_id: course.creator_id,
    course_data: {
      title: course.title,
      description: course.description,
      track: course.track,
      difficulty: course.difficulty,
      estimated_hours: course.estimated_hours,
      thumbnail_emoji: course.thumbnail_emoji,
      image_url: course.image_url,
      category: course.category,
      target_audience: course.target_audience,
      prerequisites: course.prerequisites,
      learning_objectives: course.learning_objectives,
      lessons: course.lessons,
      is_coming_soon: course.is_coming_soon,
    },
    quality_score: course.quality_score,
    created_with: course.created_with,
    draft_status: course.draft_status,
  };
}

/**
 * Transforms database course_data back to unified format
 */
export function databaseToUnifiedCourse(dbData: any): UnifiedCourse {
  const courseData = dbData.course_data || {};

  return {
    id: dbData.id,
    title: courseData.title || '',
    description: courseData.description || '',
    track: courseData.track || 'explorer',
    difficulty: courseData.difficulty || 'beginner',
    estimated_hours: courseData.estimated_hours || 1,
    thumbnail_emoji: courseData.thumbnail_emoji || '📚',
    image_url: courseData.image_url,
    category: courseData.category || '',
    target_audience: courseData.target_audience || '',
    prerequisites: courseData.prerequisites || [],
    learning_objectives: courseData.learning_objectives || [],
    lessons: courseData.lessons || [],
    creator_id: dbData.creator_id,
    created_with: dbData.created_with || 'manual',
    quality_score: dbData.quality_score,
    draft_status: dbData.draft_status || 'draft',
    is_coming_soon: courseData.is_coming_soon,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at,
  };
}

// ===================
// Helper: Transform Draft for Quality Check
// ===================

/**
 * Transforms a partial draft to unified format for quality checking
 * Handles incomplete courses gracefully
 */
export function transformDraftForQualityCheck(draft: CourseDraft): UnifiedCourse {
  try {
    return manualDraftToUnified(draft);
  } catch (error) {
    // If transformation fails, return minimal valid structure
    console.warn('Error transforming draft for quality check:', error);
    return {
      id: draft.id || generateCourseId(),
      title: draft.title || '',
      description: draft.description || '',
      track: draft.track,
      difficulty: draft.difficulty,
      estimated_hours: draft.estimatedHours || 1,
      thumbnail_emoji: draft.thumbnailEmoji || '📚',
      image_url: draft.imageUrl,
      category: (draft as any).category || '',
      target_audience: (draft as any).targetAudience || '',
      prerequisites: (draft as any).prerequisites || [],
      learning_objectives: draft.learningObjectives?.map(obj => obj.text) || [],
      lessons: [],
      creator_id: draft.creatorId || '',
      created_with: 'manual',
      draft_status: draft.draftStatus || 'draft',
    };
  }
}

// ===================
// Conversion for AI Course Editing
// ===================

/**
 * Converts AI-generated course to manual draft with quality score preserved
 * Used when user clicks "Edit" on AI-generated course
 */
export function convertAICourseToManualDraft(
  aiCourse: GeneratedCourse,
  qualityScore?: number
): CourseDraft {
  const unified = aiCourseToUnified(aiCourse);
  const draft = unifiedCourseToManualDraft(unified);

  // Preserve quality score in draft metadata
  (draft as any).qualityScore = qualityScore;
  (draft as any).originallyCreatedWith = 'ai';

  return draft;
}
