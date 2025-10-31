/**
 * Unified Course Schema
 *
 * Complete unified course structure that merges AI and Manual course creation fields.
 * This schema ensures consistency and allows seamless transitions between creation modes.
 *
 * Key Features:
 * - All required fields from both AI and manual systems
 * - Category, target_audience, prerequisites support
 * - Quality score tracking
 * - Creation mode tracking (ai vs manual)
 * - Coming soon flag for admin features
 */

import { UnifiedLesson } from './lesson-schema-unified';

// ===================
// Main Course Interface
// ===================

export interface UnifiedCourse {
  // Identification
  id: string; // Format: course_TIMESTAMP_RANDOM

  // Core Metadata (Both Systems)
  title: string; // 15-200 chars
  description: string; // 100-1000 chars
  track: 'explorer' | 'developer';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number; // 1-20 hours
  thumbnail_emoji: string; // Single emoji
  image_url?: string; // Optional custom image

  // Discovery & Organization (From AI System)
  category: string; // Required for catalog filtering
  target_audience: string; // Required, 50-500 chars
  prerequisites: string[]; // Array of course IDs

  // Educational Content
  learning_objectives: string[]; // 4-10 objectives, 20-200 chars each
  lessons: UnifiedLesson[]; // 5-20 lessons

  // Metadata
  creator_id: string;
  created_with: 'ai' | 'manual'; // Track creation method
  quality_score?: number; // 0-100, from quality checker

  // Status & Publishing
  draft_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  is_coming_soon?: boolean; // Admin only: visible but not enrollable

  // Timestamps (added by database)
  created_at?: string;
  updated_at?: string;
}

// ===================
// Course Categories
// ===================

export const COURSE_CATEGORIES = [
  { value: 'fundamentals', label: 'Blockchain Fundamentals' },
  { value: 'consensus', label: 'Consensus Mechanisms' },
  { value: 'tokens', label: 'Tokens & Tokenomics' },
  { value: 'hedera-basics', label: 'Hedera Basics' },
  { value: 'smart-contracts', label: 'Smart Contracts' },
  { value: 'defi', label: 'Decentralized Finance (DeFi)' },
  { value: 'nfts', label: 'NFTs & Digital Assets' },
  { value: 'security', label: 'Security & Best Practices' },
  { value: 'use-cases', label: 'Use Cases & Applications' },
  { value: 'developer-tools', label: 'Developer Tools' },
] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number]['value'];

// ===================
// Validation Interface
// ===================

export interface CourseValidationResult {
  valid: boolean;
  errors: CourseValidationError[];
  warnings: string[];
  score?: number; // Quality score if validation passes
}

export interface CourseValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

// ===================
// Validation Function
// ===================

/**
 * Validates a unified course structure
 * Returns validation results with errors, warnings, and quality score
 */
export function validateUnifiedCourse(course: Partial<UnifiedCourse>): CourseValidationResult {
  const errors: CourseValidationError[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!course.title) {
    errors.push({
      field: 'title',
      message: 'Course title is required',
      severity: 'error',
      suggestion: 'Add a clear, descriptive title for your course',
    });
  } else if (course.title.length < 15) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 15 characters',
      severity: 'error',
      suggestion: 'Make your title more descriptive to help students understand the course',
    });
  } else if (course.title.length > 200) {
    errors.push({
      field: 'title',
      message: 'Title must not exceed 200 characters',
      severity: 'error',
    });
  }

  // Description validation
  if (!course.description) {
    errors.push({
      field: 'description',
      message: 'Course description is required',
      severity: 'error',
    });
  } else if (course.description.length < 100) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 100 characters',
      severity: 'error',
      suggestion: 'Provide more details about what students will learn',
    });
  } else if (course.description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description must not exceed 1000 characters',
      severity: 'error',
    });
  }

  // Category validation
  if (!course.category) {
    errors.push({
      field: 'category',
      message: 'Course category is required',
      severity: 'error',
      suggestion: 'Select a category to help students discover your course',
    });
  }

  // Target audience validation
  if (!course.target_audience) {
    errors.push({
      field: 'target_audience',
      message: 'Target audience is required',
      severity: 'error',
      suggestion: 'Describe who should take this course and what they need to know',
    });
  } else if (course.target_audience.length < 50) {
    errors.push({
      field: 'target_audience',
      message: 'Target audience must be at least 50 characters',
      severity: 'error',
      suggestion: 'Provide more details about the ideal student for this course',
    });
  } else if (course.target_audience.length > 500) {
    errors.push({
      field: 'target_audience',
      message: 'Target audience must not exceed 500 characters',
      severity: 'error',
    });
  }

  // Learning objectives validation
  if (!course.learning_objectives || course.learning_objectives.length === 0) {
    errors.push({
      field: 'learning_objectives',
      message: 'At least one learning objective is required',
      severity: 'error',
    });
  } else {
    if (course.learning_objectives.length < 4) {
      errors.push({
        field: 'learning_objectives',
        message: 'At least 4 learning objectives are recommended',
        severity: 'warning',
        suggestion: 'Add more objectives to clearly define what students will achieve',
      });
    }
    if (course.learning_objectives.length > 10) {
      warnings.push('More than 10 learning objectives may overwhelm students. Consider consolidating.');
    }

    // Validate individual objectives
    course.learning_objectives.forEach((obj, index) => {
      if (obj.length < 20) {
        warnings.push(`Objective ${index + 1} is too short. Make it more specific.`);
      }
      if (obj.length > 200) {
        errors.push({
          field: `learning_objectives[${index}]`,
          message: `Objective ${index + 1} exceeds 200 characters`,
          severity: 'error',
        });
      }
    });
  }

  // Lessons validation
  if (!course.lessons || course.lessons.length === 0) {
    errors.push({
      field: 'lessons',
      message: 'At least one lesson is required',
      severity: 'error',
    });
  } else {
    if (course.lessons.length < 5) {
      errors.push({
        field: 'lessons',
        message: 'At least 5 lessons are required for a complete course',
        severity: 'error',
        suggestion: 'Add more lessons to provide comprehensive coverage',
      });
    }
    if (course.lessons.length > 20) {
      warnings.push('More than 20 lessons may be too long. Consider splitting into multiple courses.');
    }

    // Lesson balance check
    const textLessons = course.lessons.filter(l => l.lesson_type === 'text').length;
    const totalLessons = course.lessons.length;
    const textPercentage = (textLessons / totalLessons) * 100;

    if (textPercentage > 70) {
      warnings.push(
        `${textPercentage.toFixed(0)}% of lessons are text-only. Add more interactive content for better engagement.`
      );
    }

    // Quiz requirement
    const hasQuiz = course.lessons.some(l => l.lesson_type === 'quiz');
    if (!hasQuiz) {
      warnings.push('No quiz lessons found. Add at least one quiz to assess understanding.');
    }
  }

  // Estimated hours validation
  if (course.estimated_hours) {
    if (course.estimated_hours < 0.5 || course.estimated_hours > 100) {
      errors.push({
        field: 'estimated_hours',
        message: 'Estimated hours must be between 0.5 and 100',
        severity: 'error',
      });
    }
  }

  // Prerequisites validation (circular dependency check)
  if (course.prerequisites && course.prerequisites.length > 0) {
    if (course.id && course.prerequisites.includes(course.id)) {
      errors.push({
        field: 'prerequisites',
        message: 'Course cannot be its own prerequisite',
        severity: 'error',
      });
    }
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    warnings,
  };
}

// ===================
// Helper Functions
// ===================

/**
 * Generates a standardized course ID
 */
export function generateCourseId(): string {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits
  const random = Math.random().toString(36).substring(2, 6); // 4 random chars
  return `course_${timestamp}_${random}`;
}

/**
 * Checks if a course has all required fields for publication
 */
export function isReadyForPublication(course: Partial<UnifiedCourse>): boolean {
  const validation = validateUnifiedCourse(course);
  return validation.valid && course.lessons && course.lessons.length >= 5;
}

/**
 * Calculates estimated completion time based on lessons
 */
export function calculateEstimatedHours(lessons: UnifiedLesson[]): number {
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0);
  return Math.ceil(totalMinutes / 60 * 10) / 10; // Round to 0.1 hours
}

/**
 * Calculates total XP available in a course
 */
export function calculateTotalXP(lessons: UnifiedLesson[]): {
  completion: number;
  perfect: number;
} {
  return lessons.reduce(
    (totals, lesson) => ({
      completion: totals.completion + lesson.completion_xp,
      perfect: totals.perfect + lesson.perfect_score_xp,
    }),
    { completion: 0, perfect: 0 }
  );
}

/**
 * Gets course category label by value
 */
export function getCategoryLabel(categoryValue: string): string {
  const category = COURSE_CATEGORIES.find(c => c.value === categoryValue);
  return category?.label || categoryValue;
}
