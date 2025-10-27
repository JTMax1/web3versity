/**
 * Zod Validation Schemas for AI-Generated Courses
 *
 * Defines strict schemas for validating AI-generated course content.
 * Ensures all generated content meets quality standards and matches
 * the expected database structure.
 *
 * Schema hierarchy:
 * - CourseSchema (main export)
 *   ├── LessonSchema[]
 *   └── Content unions by lesson_type:
 *       ├── TextLessonContent
 *       ├── InteractiveLessonContent
 *       ├── PracticalLessonContent
 *       ├── QuizLessonContent
 *       └── CodeEditorLessonContent
 */

import { z } from 'zod';

// ===================
// Text Lesson Content
// ===================

/**
 * Schema for text-based educational lessons
 * Contains sections with headings, text content, and optional lists
 */
export const TextLessonContentSchema = z.object({
  sections: z.array(
    z.object({
      heading: z.string().min(3).max(100),
      emoji: z.string().optional(),
      text: z.string().min(50), // At least 50 chars per section
      list: z.array(z.string()).optional(),
    })
  ).min(2).max(8), // 2-8 sections per lesson
});

export type TextLessonContent = z.infer<typeof TextLessonContentSchema>;

// ===================
// Interactive Lesson Content
// ===================

/**
 * Schema for interactive component lessons
 * Uses existing Web3Versity interactive components
 */
export const InteractiveLessonContentSchema = z.object({
  type: z.enum([
    // Mobile Money & Payments
    'mobile_money_comparison',
    'payment_comparison',

    // NFT & Digital Assets
    'nft_showcase',
    'nft_metadata',
    'nft_marketplace',

    // Security & Scams
    'scam_detector',
    'phishing_simulator',

    // DeFi & Finance
    'defi_protocol_explorer',
    'yield_calculator',

    // Blockchain Technology
    'consensus_animation',
    'consensus_comparison',
    'blockchain_animation',
    'transaction_flow',
    'network_comparison',
    'layer_comparison',

    // Hedera-specific
    'hcs_use_case_explorer',
    'explorer_guide',
    'transaction_detective',

    // Wallets & Security
    'wallet_connection_demo',
    'seed_phrase_demo',
    'storage_comparison',

    // DApps & Development
    'dapp_demo',
    'market_transaction_demo',
  ]),
  explanation: z.string().min(100).max(1000), // Context for the interactive component
  analogy: z.string().min(50).max(500).optional(), // African analogy to explain concept
});

export type InteractiveLessonContent = z.infer<typeof InteractiveLessonContentSchema>;

// ===================
// Practical Lesson Content
// ===================

/**
 * Schema for hands-on practical exercises
 * Students complete real blockchain tasks
 */
export const PracticalLessonContentSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(500),
  objective: z.string().min(20).max(200), // What student will accomplish
  interactiveType: z.string(), // Type of practical exercise
  steps: z.array(z.string().min(20)).min(3).max(10), // Step-by-step instructions
  tips: z.array(z.string()).min(2).max(5), // Helpful tips
  defaultRecipient: z.string().optional(), // Pre-filled recipient for demo
  defaultAmount: z.number().positive().optional(), // Pre-filled amount
  successMessage: z.string().min(20).max(200), // Shown when completed
  explorerLink: z.string().url().optional(), // Link to view on Hedera explorer
});

export type PracticalLessonContent = z.infer<typeof PracticalLessonContentSchema>;

// ===================
// Quiz Question & Content
// ===================

/**
 * Schema for individual quiz questions
 * Multiple choice with 4 options
 */
export const QuizQuestionSchema = z.object({
  question: z.string().min(20).max(300),
  options: z.array(z.string().min(5).max(200)).length(4), // Exactly 4 options
  correctAnswer: z.number().int().min(0).max(3), // Index of correct option (0-3)
  explanation: z.string().min(50).max(500), // Why this answer is correct
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

/**
 * Schema for quiz lessons
 * Contains multiple questions for assessment
 */
export const QuizLessonContentSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(5).max(10), // 5-10 questions per quiz
});

export type QuizLessonContent = z.infer<typeof QuizLessonContentSchema>;

// ===================
// Code Editor Lesson Content
// ===================

/**
 * Schema for interactive coding lessons (Developer track only)
 * Students write and test actual code
 */
export const CodeEditorLessonContentSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(500),
  starterCode: z.string().min(50), // Template code with TODOs
  solution: z.string().min(100), // Complete working solution
  tests: z.array(
    z.object({
      name: z.string(), // Test name (e.g., "Should return correct balance")
      assertion: z.string(), // What to test
      expected: z.any(), // Expected result
    })
  ).min(1).max(5), // 1-5 automated tests
  hints: z.array(z.string()).min(2).max(5), // Step-by-step hints
  explanation: z.string().min(100).optional(), // Concept explanation
  references: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    })
  ).optional(), // Links to docs
});

export type CodeEditorLessonContent = z.infer<typeof CodeEditorLessonContentSchema>;

// ===================
// Main Lesson Schema
// ===================

/**
 * Schema for individual lessons
 * Supports multiple lesson types via discriminated union
 */
export const LessonSchema = z.object({
  id: z.string().regex(/^\d{8}_[a-z0-9]{4}_lesson_\d+$/), // Format: 20250127_a3f9_lesson_1
  title: z.string().min(10).max(200),
  lesson_type: z.enum(['text', 'interactive', 'practical', 'quiz', 'code_editor']),
  content: z.union([
    TextLessonContentSchema,
    InteractiveLessonContentSchema,
    PracticalLessonContentSchema,
    QuizLessonContentSchema,
    CodeEditorLessonContentSchema,
  ]),
  sequence_number: z.number().int().positive(),
  duration_minutes: z.number().int().min(5).max(60), // 5-60 minutes per lesson
  completion_xp: z.number().int().min(50).max(500), // XP reward
  perfect_score_xp: z.number().int().nullable(), // Bonus XP for perfect score
});

export type Lesson = z.infer<typeof LessonSchema>;

// ===================
// Main Course Schema
// ===================

/**
 * Main schema for complete course structure
 * This is what the AI must generate and what we validate
 */
export const CourseSchema = z.object({
  id: z.string().regex(/^course_\d{8}_[a-z0-9]{4}$/), // Format: course_20250127_a3f9
  title: z.string().min(15).max(200),
  description: z.string().min(100).max(1000),
  track: z.enum(['explorer', 'developer']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(3).max(50),
  estimated_hours: z.number().int().min(1).max(20),
  thumbnail_emoji: z.string(), // Single emoji for course icon
  prerequisites: z.array(z.string().regex(/^course_\d{8}_[a-z0-9]{4}$/)), // Required courses
  learning_objectives: z.array(z.string().min(20).max(200)).min(4).max(10), // 4-10 objectives
  target_audience: z.string().min(50).max(500), // Who should take this course
  lessons: z.array(LessonSchema).min(5).max(20), // 5-20 lessons per course
});

export type GeneratedCourse = z.infer<typeof CourseSchema>;

// ===================
// Helper Validation Functions
// ===================

/**
 * Validate that a course has proper lesson balance
 * Should not be all text lessons
 */
export function validateLessonBalance(course: GeneratedCourse): {
  passed: boolean;
  message?: string;
} {
  const lessonTypes = course.lessons.map(l => l.lesson_type);
  const textCount = lessonTypes.filter(t => t === 'text').length;
  const total = lessonTypes.length;

  const textPercentage = (textCount / total) * 100;

  if (textPercentage > 70) {
    return {
      passed: false,
      message: `Too many text lessons (${textPercentage.toFixed(0)}%). Add more interactive/practical content.`,
    };
  }

  const hasQuiz = lessonTypes.includes('quiz');
  if (!hasQuiz) {
    return {
      passed: false,
      message: 'Course must include at least one quiz lesson',
    };
  }

  return { passed: true };
}

/**
 * Validate that Developer track courses have code exercises
 */
export function validateDeveloperTrackContent(course: GeneratedCourse): {
  passed: boolean;
  message?: string;
} {
  if (course.track !== 'developer') {
    return { passed: true };
  }

  const hasCodeLesson = course.lessons.some(l => l.lesson_type === 'code_editor');

  if (!hasCodeLesson) {
    return {
      passed: false,
      message: 'Developer track courses must include at least one code_editor lesson',
    };
  }

  return { passed: true };
}

/**
 * Validate that Explorer track courses don't have code lessons
 */
export function validateExplorerTrackContent(course: GeneratedCourse): {
  passed: boolean;
  message?: string;
} {
  if (course.track !== 'explorer') {
    return { passed: true };
  }

  const hasCodeLesson = course.lessons.some(l => l.lesson_type === 'code_editor');

  if (hasCodeLesson) {
    return {
      passed: false,
      message: 'Explorer track courses should not include code_editor lessons (no-code track)',
    };
  }

  return { passed: true };
}

/**
 * Validate course against schema and custom rules
 */
export function validateCourse(data: unknown): {
  success: boolean;
  data?: GeneratedCourse;
  errors?: string[];
} {
  try {
    // Log the data being validated for debugging
    console.log('Validating course data...');
    console.log('Data type:', typeof data);
    console.log('Data keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');
    console.log('Data sample:', JSON.stringify(data, null, 2).slice(0, 500));

    // Schema validation
    const course = CourseSchema.parse(data);

    // Custom validations
    const balanceCheck = validateLessonBalance(course);
    const devTrackCheck = validateDeveloperTrackContent(course);
    const explorerTrackCheck = validateExplorerTrackContent(course);

    const errors: string[] = [];

    if (!balanceCheck.passed) errors.push(balanceCheck.message!);
    if (!devTrackCheck.passed) errors.push(devTrackCheck.message!);
    if (!explorerTrackCheck.passed) errors.push(explorerTrackCheck.message!);

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: course };

  } catch (error) {
    console.error('Validation error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }

    // Handle non-Zod errors
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
    };
  }
}

// ===================
// Export All Types
// ===================

export type {
  TextLessonContent,
  InteractiveLessonContent,
  PracticalLessonContent,
  QuizQuestion,
  QuizLessonContent,
  CodeEditorLessonContent,
  Lesson,
  GeneratedCourse,
};
