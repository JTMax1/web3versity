/**
 * Save AI-Generated Course to Database
 *
 * Handles saving generated courses to Supabase with proper ID generation,
 * validation, and error handling.
 */

import { supabase } from '../supabase/client';
import type { GeneratedCourse } from '../schemas/course-schema';

// ===================
// Types
// ===================

export interface SaveCourseOptions {
  publishImmediately?: boolean; // If true, set is_published=true
  asDraft?: boolean; // If true, save to course_drafts table
}

export interface SaveCourseResult {
  success: boolean;
  courseId?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ===================
// ID Generation
// ===================

/**
 * Generate next available course ID
 * Format: course_XXX (e.g., course_013)
 */
export async function generateCourseId(): Promise<string> {
  try {
    // Get highest course number from existing courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!courses || courses.length === 0) {
      return 'course_001';
    }

    // Extract number from course_XXX format
    const lastId = courses[0].id;
    const match = lastId.match(/course_(\d{3})/);

    if (!match) {
      throw new Error(`Invalid course ID format: ${lastId}`);
    }

    const lastNumber = parseInt(match[1], 10);
    const nextNumber = lastNumber + 1;

    // Pad with zeros to 3 digits
    return `course_${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating course ID:', error);
    throw new Error('Failed to generate course ID');
  }
}

/**
 * Generate lesson ID for a course
 * Format: XXX_lesson_Y (e.g., 013_lesson_1)
 */
export function generateLessonId(courseId: string, sequenceNumber: number): string {
  // Extract number from course_XXX
  const match = courseId.match(/course_(\d{3})/);
  if (!match) {
    throw new Error(`Invalid course ID format: ${courseId}`);
  }

  const courseNumber = match[1];
  return `${courseNumber}_lesson_${sequenceNumber}`;
}

// ===================
// Validation
// ===================

/**
 * Validate course is ready for database insertion
 */
export function validateCourseForDatabase(course: GeneratedCourse): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!course.id || !course.id.match(/^course_\d{8}_[a-z0-9]{4}$/)) {
    errors.push('Invalid course ID format');
  }

  if (!course.title || course.title.length < 15) {
    errors.push('Title too short (minimum 15 characters)');
  }

  if (!course.description || course.description.length < 100) {
    errors.push('Description too short (minimum 100 characters)');
  }

  if (!course.lessons || course.lessons.length < 5) {
    errors.push('Course must have at least 5 lessons');
  }

  if (!course.learning_objectives || course.learning_objectives.length < 4) {
    errors.push('Course must have at least 4 learning objectives');
  }

  // Validate each lesson
  course.lessons.forEach((lesson, idx) => {
    if (!lesson.id || !lesson.id.match(/^\d{8}_[a-z0-9]{4}_lesson_\d+$/)) {
      errors.push(`Lesson ${idx + 1}: Invalid lesson ID format`);
    }

    if (lesson.sequence_number !== idx + 1) {
      errors.push(`Lesson ${idx + 1}: Sequence number mismatch`);
    }

    if (!lesson.title || lesson.title.length < 10) {
      errors.push(`Lesson ${idx + 1}: Title too short`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ===================
// Database Save
// ===================

/**
 * Save AI-generated course to database
 * Handles both course and lessons tables
 */
export async function saveCourseToDatabase(
  course: GeneratedCourse,
  options: SaveCourseOptions = {}
): Promise<SaveCourseResult> {
  try {
    // Validate course
    const validation = validateCourseForDatabase(course);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return {
        success: false,
        error: 'Authentication required to save course',
      };
    }

    // Extract our custom user ID from session metadata
    const userId = session.user.user_metadata?.user_id;
    if (!userId) {
      return {
        success: false,
        error: 'User ID not found in session. Please reconnect your wallet.',
      };
    }

    // If saving as draft, use course_drafts table
    if (options.asDraft) {
      const { error: draftError } = await supabase.from('course_drafts').insert({
        id: course.id,
        creator_id: userId,
        course_data: course,
        quality_score: 0, // Will be set by quality checker
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (draftError) {
        if (draftError.code === '23505') {
          // Duplicate key
          return {
            success: false,
            error: `Course ID ${course.id} already exists. Try regenerating.`,
          };
        }
        throw draftError;
      }

      return {
        success: true,
        courseId: course.id,
      };
    }

    // Save to courses table
    const { error: courseError } = await supabase.from('courses').insert({
      id: course.id,
      title: course.title,
      description: course.description,
      track: course.track,
      difficulty: course.difficulty,
      category: course.category,
      estimated_hours: course.estimated_hours,
      thumbnail_emoji: course.thumbnail_emoji,
      prerequisites: course.prerequisites,
      learning_objectives: course.learning_objectives,
      target_audience: course.target_audience,
      total_lessons: course.lessons.length,
      enrollment_count: 0,
      is_published: options.publishImmediately || false,
      published_at: options.publishImmediately ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (courseError) {
      if (courseError.code === '23505') {
        // Duplicate key
        return {
          success: false,
          error: `Course ID ${course.id} already exists. Try regenerating.`,
        };
      }
      throw courseError;
    }

    // Save lessons
    const lessonsToInsert = course.lessons.map((lesson) => ({
      id: lesson.id,
      course_id: course.id,
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      content: lesson.content,
      sequence_number: lesson.sequence_number,
      duration_minutes: lesson.duration_minutes,
      completion_xp: lesson.completion_xp,
      perfect_score_xp: lesson.perfect_score_xp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert);

    if (lessonsError) {
      // Rollback: delete course if lessons failed
      await supabase.from('courses').delete().eq('id', course.id);

      return {
        success: false,
        error: `Failed to save lessons: ${lessonsError.message}. Course rolled back.`,
      };
    }

    return {
      success: true,
      courseId: course.id,
    };
  } catch (error: any) {
    console.error('Error saving course:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update existing course (for editing)
 */
export async function updateCourse(
  courseId: string,
  updates: Partial<GeneratedCourse>
): Promise<SaveCourseResult> {
  try {
    const { error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId);

    if (error) throw error;

    return {
      success: true,
      courseId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete course and all its lessons
 */
export async function deleteCourse(courseId: string): Promise<SaveCourseResult> {
  try {
    // Lessons will be deleted automatically due to CASCADE
    const { error } = await supabase.from('courses').delete().eq('id', courseId);

    if (error) throw error;

    return {
      success: true,
      courseId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Publish a draft course
 */
export async function publishDraftCourse(draftId: string): Promise<SaveCourseResult> {
  try {
    // Get draft
    const { data: draft, error: fetchError } = await supabase
      .from('course_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (fetchError || !draft) {
      return {
        success: false,
        error: 'Draft not found',
      };
    }

    // Save draft as published course
    const result = await saveCourseToDatabase(draft.course_data as GeneratedCourse, {
      publishImmediately: true,
    });

    if (result.success) {
      // Delete draft
      await supabase.from('course_drafts').delete().eq('id', draftId);
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ===================
// Exports
// ===================

// All functions already exported above with `export async function` or `export function`
// No need to re-export them here
