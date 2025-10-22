/**
 * Course and Lesson Count Analysis Script
 *
 * This script analyzes the database to verify that courses.total_lessons
 * matches the actual number of lessons in the lessons table.
 *
 * Related Issue: Course completion triggered at 6/7 lessons for Hedera Fundamentals
 *
 * Run with: npx tsx scripts/analyze-course-lessons.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface CourseAnalysis {
  id: string;
  title: string;
  stored_count: number;
  actual_count: number;
  status: 'Match' | 'Mismatch';
  difference: number;
}

interface LessonDetail {
  id: string;
  title: string;
  sequence_number: number;
  lesson_type: string;
}

// ============================================================================
// Main Analysis Functions
// ============================================================================

async function analyzeCourses(): Promise<CourseAnalysis[]> {
  console.log('📊 Analyzing courses and lesson counts...\n');

  // Get all courses
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, total_lessons')
    .order('id');

  if (coursesError) {
    console.error('❌ Error fetching courses:', coursesError);
    return [];
  }

  if (!courses || courses.length === 0) {
    console.log('⚠️  No courses found in database');
    return [];
  }

  // Analyze each course
  const analysis: CourseAnalysis[] = [];

  for (const course of courses) {
    // Count actual lessons
    const { count, error: lessonsError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id);

    if (lessonsError) {
      console.error(`❌ Error counting lessons for ${course.id}:`, lessonsError);
      continue;
    }

    const actualCount = count || 0;
    const storedCount = course.total_lessons;
    const difference = actualCount - storedCount;

    analysis.push({
      id: course.id,
      title: course.title,
      stored_count: storedCount,
      actual_count: actualCount,
      status: storedCount === actualCount ? 'Match' : 'Mismatch',
      difference,
    });
  }

  return analysis;
}

async function analyzeSpecificCourse(courseId: string): Promise<void> {
  console.log(`\n📚 Detailed Analysis: ${courseId}\n`);

  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    console.error(`❌ Course ${courseId} not found:`, courseError);
    return;
  }

  console.log(`Course: ${course.title}`);
  console.log(`Stored lesson count: ${course.total_lessons}`);

  // Get all lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, sequence_number, lesson_type')
    .eq('course_id', courseId)
    .order('sequence_number');

  if (lessonsError) {
    console.error(`❌ Error fetching lessons:`, lessonsError);
    return;
  }

  console.log(`Actual lesson count: ${lessons?.length || 0}`);
  console.log(`Difference: ${(lessons?.length || 0) - course.total_lessons}\n`);

  if (lessons && lessons.length > 0) {
    console.log('Lessons:');
    lessons.forEach((lesson) => {
      console.log(
        `  ${lesson.sequence_number}. [${lesson.lesson_type.toUpperCase()}] ${lesson.title} (${lesson.id})`
      );
    });

    // Check for gaps in sequence numbers
    const gaps: number[] = [];
    for (let i = 1; i < lessons.length; i++) {
      const expectedSeq = lessons[i - 1].sequence_number + 1;
      if (lessons[i].sequence_number !== expectedSeq) {
        gaps.push(lessons[i - 1].sequence_number);
      }
    }

    if (gaps.length > 0) {
      console.log(`\n⚠️  Sequence gaps found after: ${gaps.join(', ')}`);
    }

    // Check for duplicates
    const sequenceNumbers = lessons.map((l) => l.sequence_number);
    const duplicates = sequenceNumbers.filter(
      (num, idx) => sequenceNumbers.indexOf(num) !== idx
    );

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Duplicate sequence numbers: ${[...new Set(duplicates)].join(', ')}`);
    }
  } else {
    console.log('⚠️  No lessons found for this course');
  }
}

async function checkUserProgressIssues(courseId: string): Promise<void> {
  console.log(`\n👥 User Progress Analysis for ${courseId}\n`);

  // Get course total lessons
  const { data: course } = await supabase
    .from('courses')
    .select('total_lessons, title')
    .eq('id', courseId)
    .single();

  if (!course) {
    console.log('Course not found');
    return;
  }

  // Get user progress records
  const { data: progressRecords, error } = await supabase
    .from('user_progress')
    .select('user_id, lessons_completed, total_lessons, completed_at, progress_percentage')
    .eq('course_id', courseId);

  if (error) {
    console.error('Error fetching progress:', error);
    return;
  }

  if (!progressRecords || progressRecords.length === 0) {
    console.log('No user progress records found');
    return;
  }

  console.log(`Found ${progressRecords.length} user(s) enrolled in "${course.title}"\n`);

  for (const progress of progressRecords) {
    const isCompleted = progress.completed_at !== null;
    const shouldBeCompleted = progress.lessons_completed >= course.total_lessons;

    let status = '✓ Normal';
    if (isCompleted && progress.lessons_completed < course.total_lessons) {
      status = '⚠️  Completed but lessons_completed < total_lessons';
    } else if (!isCompleted && shouldBeCompleted) {
      status = '⚠️  Should be completed but not marked';
    }

    console.log(`User: ${progress.user_id.substring(0, 8)}...`);
    console.log(`  Lessons completed: ${progress.lessons_completed}/${progress.total_lessons} (snapshot: ${progress.total_lessons}, current: ${course.total_lessons})`);
    console.log(`  Progress: ${progress.progress_percentage}%`);
    console.log(`  Status: ${isCompleted ? 'Completed' : 'In Progress'}`);
    console.log(`  ${status}\n`);
  }
}

// ============================================================================
// Report Generation
// ============================================================================

function printReport(analysis: CourseAnalysis[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('COURSE LESSON COUNT ANALYSIS REPORT');
  console.log('='.repeat(100) + '\n');

  const mismatches = analysis.filter((a) => a.status === 'Mismatch');
  const matches = analysis.filter((a) => a.status === 'Match');

  console.log(`Total Courses: ${analysis.length}`);
  console.log(`✓ Matching: ${matches.length}`);
  console.log(`✗ Mismatched: ${mismatches.length}\n`);

  if (mismatches.length > 0) {
    console.log('❌ COURSES WITH MISMATCHED LESSON COUNTS:\n');
    console.log(
      '┌─────────────┬──────────────────────────────────────────┬────────┬────────┬────────────┐'
    );
    console.log(
      '│ Course ID   │ Title                                    │ Stored │ Actual │ Difference │'
    );
    console.log(
      '├─────────────┼──────────────────────────────────────────┼────────┼────────┼────────────┤'
    );

    mismatches.forEach((course) => {
      const id = course.id.padEnd(11);
      const title = course.title.substring(0, 40).padEnd(40);
      const stored = course.stored_count.toString().padStart(6);
      const actual = course.actual_count.toString().padStart(6);
      const diff = course.difference.toString().padStart(10);

      console.log(`│ ${id} │ ${title} │ ${stored} │ ${actual} │ ${diff} │`);
    });

    console.log(
      '└─────────────┴──────────────────────────────────────────┴────────┴────────┴────────────┘\n'
    );

    console.log('🔧 RECOMMENDED FIXES:\n');
    mismatches.forEach((course) => {
      console.log(
        `UPDATE courses SET total_lessons = ${course.actual_count}, updated_at = NOW() WHERE id = '${course.id}';  -- ${course.title}`
      );
    });
    console.log('');
  } else {
    console.log('✅ All courses have matching lesson counts!\n');
  }

  // List courses by lesson count
  console.log('\n📊 COURSES GROUPED BY LESSON COUNT:\n');

  const grouped = analysis.reduce((acc, course) => {
    const count = course.actual_count;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(course);
    return acc;
  }, {} as Record<number, CourseAnalysis[]>);

  Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach((count) => {
      console.log(`${count} lessons: ${grouped[count].length} course(s)`);
      grouped[count].forEach((course) => {
        const status = course.status === 'Match' ? '✓' : '✗';
        console.log(`  ${status} ${course.id}: ${course.title}`);
      });
    });

  console.log('\n' + '='.repeat(100) + '\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🚀 Starting Course Lesson Count Analysis\n');

  try {
    // Test connection
    const { error: connError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    if (connError) {
      console.error('❌ Database connection failed:', connError);
      process.exit(1);
    }

    console.log('✅ Connected to database\n');

    // Run full analysis
    const analysis = await analyzeCourses();

    if (analysis.length === 0) {
      console.log('⚠️  No courses to analyze');
      process.exit(0);
    }

    // Print report
    printReport(analysis);

    // Analyze Hedera Fundamentals specifically (the reported issue)
    await analyzeSpecificCourse('course_001');

    // Check user progress for Hedera Fundamentals
    await checkUserProgressIssues('course_001');

    // Check for courses with zero lessons
    const emptyCoursesCount = analysis.filter((a) => a.actual_count === 0).length;
    if (emptyCoursesCount > 0) {
      console.log(`\n⚠️  Warning: ${emptyCoursesCount} course(s) have no lessons!`);
    }

    console.log('\n✅ Analysis complete!\n');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

main();
