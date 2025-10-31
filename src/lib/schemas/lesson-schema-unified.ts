/**
 * Unified Lesson Schema
 *
 * Single source of truth for all lesson types across AI and manual course creation.
 * This schema ensures consistency between AI-generated and manually created lessons.
 *
 * Key Features:
 * - Standardized field names (lesson_type, duration_minutes, completion_xp)
 * - Consistent ID format (course_ID_lesson_NN)
 * - Strongly typed content by lesson type
 * - Perfect score XP tracking
 */

// ===================
// Base Lesson Interface
// ===================

export interface UnifiedLesson {
  id: string; // Format: course_20250127_a3f9_lesson_01
  title: string;
  lesson_type: 'text' | 'interactive' | 'quiz' | 'practical';
  duration_minutes: number;
  completion_xp: number;
  perfect_score_xp: number; // Bonus for perfect completion (typically 3x completion_xp)
  content: LessonContentByType;
  sequence_number: number; // For ordering (1-indexed)
}

// ===================
// Content Type Union
// ===================

export type LessonContentByType =
  | TextLessonContent
  | InteractiveLessonContent
  | QuizLessonContent
  | PracticalLessonContent;

// ===================
// Text Lesson Content
// ===================

export interface TextLessonContent {
  sections: TextSection[];
}

export interface TextSection {
  heading?: string;
  text?: string;
  list?: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
}

// ===================
// Interactive Lesson Content
// ===================

export interface InteractiveLessonContent {
  type: string; // e.g., 'mobile_money_comparison', 'consensus_animation'
  explanation: string;
  analogy?: string;
  [key: string]: any; // Additional config specific to interactive type
}

// ===================
// Quiz Lesson Content
// ===================

export interface QuizLessonContent {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  explanation: string;
  points?: number; // Optional per-question points
}

// ===================
// Practical Lesson Content
// ===================

export interface PracticalLessonContent {
  title: string;
  description: string;
  objective: string;
  interactiveType: string; // e.g., 'transaction_sender', 'smart_contract_deploy'
  steps: string[];
  tips: string[];
  successMessage: string;
  // Optional transaction-specific fields
  defaultRecipient?: string;
  defaultAmount?: number;
  defaultMemo?: string;
  [key: string]: any; // Additional config for specific practical types
}

// ===================
// Validation Helpers
// ===================

/**
 * Validates a unified lesson structure
 */
export function validateUnifiedLesson(lesson: UnifiedLesson): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic validations
  if (!lesson.id || !lesson.id.match(/^course_[a-z0-9_]+_lesson_\d{2}$/)) {
    errors.push('Invalid lesson ID format');
  }

  if (!lesson.title || lesson.title.length < 5) {
    errors.push('Lesson title must be at least 5 characters');
  }

  if (lesson.duration_minutes < 1 || lesson.duration_minutes > 120) {
    errors.push('Duration must be between 1 and 120 minutes');
  }

  if (lesson.completion_xp < 5 || lesson.completion_xp > 100) {
    errors.push('Completion XP must be between 5 and 100');
  }

  if (lesson.perfect_score_xp < lesson.completion_xp) {
    errors.push('Perfect score XP must be >= completion XP');
  }

  // Type-specific validations
  switch (lesson.lesson_type) {
    case 'text':
      const textContent = lesson.content as TextLessonContent;
      if (!textContent.sections || textContent.sections.length === 0) {
        errors.push('Text lesson must have at least one section');
      }
      break;

    case 'quiz':
      const quizContent = lesson.content as QuizLessonContent;
      if (!quizContent.questions || quizContent.questions.length === 0) {
        errors.push('Quiz lesson must have at least one question');
      }
      break;

    case 'practical':
      const practicalContent = lesson.content as PracticalLessonContent;
      if (!practicalContent.steps || practicalContent.steps.length === 0) {
        errors.push('Practical lesson must have at least one step');
      }
      break;

    case 'interactive':
      const interactiveContent = lesson.content as InteractiveLessonContent;
      if (!interactiveContent.type) {
        errors.push('Interactive lesson must have a type specified');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a standardized lesson ID
 */
export function generateLessonId(courseId: string, sequenceNumber: number): string {
  const paddedNumber = String(sequenceNumber).padStart(2, '0');
  return `${courseId}_lesson_${paddedNumber}`;
}

/**
 * Calculates recommended XP based on lesson type and duration
 */
export function calculateRecommendedXP(
  lessonType: UnifiedLesson['lesson_type'],
  durationMinutes: number
): { completionXP: number; perfectScoreXP: number } {
  let baseXP: number;

  switch (lessonType) {
    case 'text':
      baseXP = 10;
      break;
    case 'interactive':
      baseXP = 20;
      break;
    case 'quiz':
      baseXP = 25;
      break;
    case 'practical':
      baseXP = 50;
      break;
    default:
      baseXP = 10;
  }

  // Adjust based on duration
  const durationMultiplier = 1 + (durationMinutes - 10) / 30;
  const completionXP = Math.round(baseXP * Math.max(0.5, Math.min(2, durationMultiplier)));
  const perfectScoreXP = completionXP * 3;

  return {
    completionXP: Math.max(5, Math.min(100, completionXP)),
    perfectScoreXP: Math.max(15, Math.min(300, perfectScoreXP)),
  };
}
