/**
 * AI Course Quality Checker
 *
 * Performs automated quality validation on AI-generated courses.
 * Ensures courses meet Web3Versity standards before publication.
 *
 * Quality Checks (8 rules):
 * 1. African Contextualization (CRITICAL - 25 points)
 * 2. Lesson Balance (15 points)
 * 3. Quiz Quality (20 points per quiz)
 * 4. Code Compilation (Developer track - 15 points)
 * 5. Practical Lesson Validation (15 points)
 * 6. Scam Warnings (Security courses - 10 points)
 * 7. Learning Objectives (10 points)
 * 8. Title & Description Quality (5 points)
 *
 * Scoring: 0-100 (60+ required to pass)
 */

import type { GeneratedCourse, QuizLessonContent, CodeEditorLessonContent, PracticalLessonContent } from '../schemas/course-schema';

// ===================
// Types
// ===================

export interface QualityIssue {
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  checkName: string;
}

export interface QualityReport {
  passed: boolean;
  score: number; // 0-100
  issues: QualityIssue[];
  warnings: string[];
  checksPassed: string[];
  checksFailed: string[];
}

// ===================
// Quality Checker
// ===================

/**
 * Perform comprehensive quality checks on generated course
 * Returns detailed report with score and issues
 */
export function performQualityChecks(course: GeneratedCourse): QualityReport {
  const issues: QualityIssue[] = [];
  const warnings: string[] = [];
  const checksPassed: string[] = [];
  const checksFailed: string[] = [];

  // Run all quality checks
  check1_AfricanContext(course, issues, warnings, checksPassed, checksFailed);
  check2_LessonBalance(course, issues, warnings, checksPassed, checksFailed);
  check3_QuizQuality(course, issues, warnings, checksPassed, checksFailed);
  check4_CodeCompilation(course, issues, warnings, checksPassed, checksFailed);
  check5_PracticalValidation(course, issues, warnings, checksPassed, checksFailed);
  check6_ScamWarnings(course, issues, warnings, checksPassed, checksFailed);
  check7_LearningObjectives(course, issues, warnings, checksPassed, checksFailed);
  check8_TitleDescription(course, issues, warnings, checksPassed, checksFailed);

  // Calculate final score
  const score = calculateQualityScore(course, issues, warnings);

  // Course passes if score >= 60 and no critical errors
  const criticalErrors = issues.filter(i => i.severity === 'error');
  const passed = score >= 60 && criticalErrors.length === 0;

  return {
    passed,
    score,
    issues,
    warnings,
    checksPassed,
    checksFailed,
  };
}

// ===================
// Check 1: African Contextualization (CRITICAL)
// ===================

function check1_AfricanContext(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'African Contextualization';

  // Keywords to search for
  const africanKeywords = {
    countries: ['africa', 'african', 'nigeria', 'nigerian', 'kenya', 'kenyan', 'ghana', 'ghanaian',
                'south africa', 'south african', 'tanzania', 'tanzanian', 'uganda', 'ugandan',
                'rwanda', 'rwandan', 'ethiopia', 'ethiopian'],
    currencies: ['naira', '₦', 'ngn', 'shilling', 'kes', 'ksh', 'rand', 'zar', 'cedis', 'cedi', 'ghs'],
    mobileMoney: ['m-pesa', 'mpesa', 'mtn mobile money', 'mtn money', 'airtel money', 'ecocash',
                  'mobile money', 'chama', 'stokvel'],
    cities: ['lagos', 'nairobi', 'accra', 'johannesburg', 'joburg', 'cape town', 'kigali',
             'dar es salaam', 'kampala', 'addis ababa'],
  };

  // Convert course to lowercase text for searching
  const courseText = JSON.stringify(course).toLowerCase();

  // Count matches in each category
  const matches = {
    countries: africanKeywords.countries.filter(kw => courseText.includes(kw)),
    currencies: africanKeywords.currencies.filter(kw => courseText.includes(kw)),
    mobileMoney: africanKeywords.mobileMoney.filter(kw => courseText.includes(kw)),
    cities: africanKeywords.cities.filter(kw => courseText.includes(kw)),
  };

  const totalMatches =
    matches.countries.length +
    matches.currencies.length +
    matches.mobileMoney.length +
    matches.cities.length;

  if (totalMatches === 0) {
    issues.push({
      severity: 'error',
      checkName,
      message: 'CRITICAL: Course LACKS African contextualization (0 references found)',
      suggestion: 'Add African currencies (₦, KES, R, GHS), mobile money (M-Pesa, MTN), or city names (Lagos, Nairobi, Accra)',
    });
    failed.push(checkName);
  } else if (totalMatches < 3) {
    warnings.push(
      `Weak African context (only ${totalMatches} references: ${[
        ...matches.countries.slice(0, 2),
        ...matches.currencies.slice(0, 2),
        ...matches.mobileMoney.slice(0, 2),
        ...matches.cities.slice(0, 2),
      ].join(', ')}). Add more local examples for authenticity.`
    );
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Check 2: Lesson Balance
// ===================

function check2_LessonBalance(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Lesson Balance';

  const lessonTypes = course.lessons.map(l => l.lesson_type);
  const total = lessonTypes.length;

  const counts = {
    text: lessonTypes.filter(t => t === 'text').length,
    interactive: lessonTypes.filter(t => t === 'interactive').length,
    quiz: lessonTypes.filter(t => t === 'quiz').length,
    practical: lessonTypes.filter(t => t === 'practical').length,
    code_editor: lessonTypes.filter(t => t === 'code_editor').length,
  };

  // Check for too many text lessons
  const textPercentage = (counts.text / total) * 100;
  if (textPercentage > 70) {
    warnings.push(
      `Too many text lessons (${Math.round(textPercentage)}%). ` +
      `Add more interactive/practical content for engagement. ` +
      `Current: ${counts.text} text, ${counts.interactive} interactive, ${counts.practical} practical`
    );
  }

  // Check for at least one quiz (mandatory)
  if (counts.quiz === 0) {
    issues.push({
      severity: 'error',
      checkName,
      message: 'No quiz lessons found',
      suggestion: 'Add at least one quiz to assess learning',
    });
    failed.push(checkName);
    return;
  }

  passed.push(checkName);
}

// ===================
// Check 3: Quiz Quality
// ===================

function check3_QuizQuality(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Quiz Quality';

  const quizLessons = course.lessons.filter(l => l.lesson_type === 'quiz');

  if (quizLessons.length === 0) {
    // Already handled in lesson balance check
    return;
  }

  let hasIssues = false;

  for (const quiz of quizLessons) {
    const content = quiz.content as QuizLessonContent;

    // Check minimum questions
    if (content.questions.length < 5) {
      issues.push({
        severity: 'error',
        checkName,
        message: `Quiz "${quiz.title}" has only ${content.questions.length} questions (minimum 5 required)`,
        suggestion: 'Add more questions to adequately assess understanding',
      });
      hasIssues = true;
    }

    // Check for duplicate questions
    const questionTexts = content.questions.map(q => q.question.toLowerCase().trim());
    const uniqueQuestions = new Set(questionTexts);
    if (uniqueQuestions.size < questionTexts.length) {
      warnings.push(`Quiz "${quiz.title}" may contain duplicate questions`);
      hasIssues = true;
    }

    // Check that all questions have valid correct answers
    for (let i = 0; i < content.questions.length; i++) {
      const q = content.questions[i];

      if (q.options.length !== 4) {
        issues.push({
          severity: 'error',
          checkName,
          message: `Quiz "${quiz.title}", question ${i + 1} has ${q.options.length} options (must be exactly 4)`,
        });
        hasIssues = true;
      }

      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        issues.push({
          severity: 'error',
          checkName,
          message: `Quiz "${quiz.title}", question ${i + 1} has invalid correctAnswer: ${q.correctAnswer} (must be 0-3)`,
        });
        hasIssues = true;
      }

      if (!q.explanation || q.explanation.length < 20) {
        warnings.push(`Quiz "${quiz.title}", question ${i + 1} has weak or missing explanation`);
        hasIssues = true;
      }
    }
  }

  if (hasIssues) {
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Check 4: Code Compilation (Developer Track)
// ===================

function check4_CodeCompilation(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Code Quality (Developer Track)';

  if (course.track !== 'developer') {
    // Not applicable to Explorer track
    return;
  }

  const codeLessons = course.lessons.filter(l => l.lesson_type === 'code_editor');

  if (codeLessons.length === 0) {
    warnings.push('Developer course has no code_editor lessons. Consider adding practical coding exercises.');
    failed.push(checkName);
    return;
  }

  let hasIssues = false;

  for (const lesson of codeLessons) {
    const content = lesson.content as CodeEditorLessonContent;

    // Check for Hedera SDK usage
    const hasHederaImport =
      content.solution.includes('@hashgraph/sdk') ||
      content.solution.includes('pragma solidity') ||
      content.solution.includes('Hedera');

    if (!hasHederaImport) {
      warnings.push(
        `Lesson "${lesson.title}" code may not use actual Hedera SDK. ` +
        `Verify it's production-ready and uses @hashgraph/sdk or Solidity.`
      );
      hasIssues = true;
    }

    // Check for TODO comments in starter code
    if (!content.starterCode.includes('TODO') && !content.starterCode.includes('// TODO')) {
      warnings.push(
        `Lesson "${lesson.title}" starter code lacks TODO comments for learners. ` +
        `Add guidance on what students should implement.`
      );
      hasIssues = true;
    }

    // Check for tests
    if (content.tests.length === 0) {
      issues.push({
        severity: 'error',
        checkName,
        message: `Code lesson "${lesson.title}" has no tests`,
        suggestion: 'Add at least 1 test to validate learner code',
      });
      hasIssues = true;
    }

    // Check for hints
    if (content.hints.length < 2) {
      warnings.push(
        `Lesson "${lesson.title}" has only ${content.hints.length} hint(s). ` +
        `Provide at least 2-3 hints for better learning experience.`
      );
      hasIssues = true;
    }
  }

  if (hasIssues) {
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Check 5: Practical Lesson Validation
// ===================

function check5_PracticalValidation(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Practical Lesson Validation';

  const practicalLessons = course.lessons.filter(l => l.lesson_type === 'practical');

  if (practicalLessons.length === 0) {
    // Not an error, just no practical lessons
    return;
  }

  let hasIssues = false;

  for (const lesson of practicalLessons) {
    const content = lesson.content as PracticalLessonContent;

    // Check for success message
    if (!content.successMessage || content.successMessage.length < 20) {
      issues.push({
        severity: 'error',
        checkName,
        message: `Practical lesson "${lesson.title}" missing or has weak success message`,
        suggestion: 'Add clear success message to confirm completion',
      });
      hasIssues = true;
    }

    // Check for adequate steps
    if (content.steps.length < 3) {
      warnings.push(
        `Practical lesson "${lesson.title}" has only ${content.steps.length} steps. ` +
        `Consider adding more detailed guidance (recommended: 3-10 steps).`
      );
      hasIssues = true;
    }

    // Check for tips
    if (!content.tips || content.tips.length < 2) {
      warnings.push(
        `Practical lesson "${lesson.title}" needs more tips. ` +
        `Add helpful tips to guide learners (recommended: 2-5 tips).`
      );
      hasIssues = true;
    }
  }

  if (hasIssues) {
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Check 6: Scam Warnings (Security Courses)
// ===================

function check6_ScamWarnings(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Scam Warnings (Security Courses)';

  const securityKeywords = ['scam', 'security', 'phishing', 'safety', 'protect', 'fraud', 'hack'];

  const titleLower = course.title.toLowerCase();
  const descLower = course.description.toLowerCase();

  const isSecurityRelated = securityKeywords.some(kw =>
    titleLower.includes(kw) || descLower.includes(kw)
  );

  if (!isSecurityRelated) {
    // Not a security course, check doesn't apply
    return;
  }

  // Check if course content mentions scams/phishing
  const courseText = JSON.stringify(course).toLowerCase();
  const hasScamWarnings =
    courseText.includes('scam') ||
    courseText.includes('phishing') ||
    courseText.includes('fraud') ||
    courseText.includes('ponzi');

  if (!hasScamWarnings) {
    warnings.push(
      'Security course should include explicit scam warnings. ' +
      'This is CRITICAL in African context where crypto scams are prevalent. ' +
      'Add warnings about: Ponzi schemes, romance scams, fake airdrops, impersonation fraud.'
    );
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Check 7: Learning Objectives
// ===================

function check7_LearningObjectives(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Learning Objectives';

  const objectivesCount = course.learning_objectives.length;

  if (objectivesCount < 4) {
    warnings.push(
      `Only ${objectivesCount} learning objectives. ` +
      `Aim for 4-8 clear, measurable outcomes to set expectations.`
    );
    failed.push(checkName);
    return;
  }

  // Check that objectives are substantial
  const shortObjectives = course.learning_objectives.filter(obj => obj.length < 20);
  if (shortObjectives.length > 0) {
    warnings.push(
      `${shortObjectives.length} learning objective(s) are too short (< 20 chars). ` +
      `Make them more specific and actionable.`
    );
    failed.push(checkName);
    return;
  }

  passed.push(checkName);
}

// ===================
// Check 8: Title & Description Quality
// ===================

function check8_TitleDescription(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[],
  passed: string[],
  failed: string[]
): void {
  const checkName = 'Title & Description Quality';

  let hasIssues = false;

  // Check title length
  if (course.title.length < 15) {
    issues.push({
      severity: 'error',
      checkName,
      message: `Title too short (${course.title.length} chars, minimum 15)`,
      suggestion: 'Make title more descriptive',
    });
    hasIssues = true;
  }

  // Check description length
  if (course.description.length < 100) {
    issues.push({
      severity: 'error',
      checkName,
      message: `Description too short (${course.description.length} chars, minimum 100)`,
      suggestion: 'Add more details about what the course covers',
    });
    hasIssues = true;
  }

  // Check for placeholder text
  const placeholders = ['tbd', 'todo', 'xxx', 'placeholder', 'lorem ipsum'];
  const titleLower = course.title.toLowerCase();
  const descLower = course.description.toLowerCase();

  const hasPlaceholder = placeholders.some(p =>
    titleLower.includes(p) || descLower.includes(p)
  );

  if (hasPlaceholder) {
    issues.push({
      severity: 'error',
      checkName,
      message: 'Title or description contains placeholder text (TBD, TODO, XXX, etc.)',
      suggestion: 'Replace placeholders with actual content',
    });
    hasIssues = true;
  }

  if (hasIssues) {
    failed.push(checkName);
  } else {
    passed.push(checkName);
  }
}

// ===================
// Score Calculation
// ===================

function calculateQualityScore(
  course: GeneratedCourse,
  issues: QualityIssue[],
  warnings: string[]
): number {
  let score = 100;

  // Deduct for errors (critical)
  const errors = issues.filter(i => i.severity === 'error');
  score -= errors.length * 15;

  // Deduct for warnings (minor)
  score -= warnings.length * 5;

  // Bonus points for good practices
  if (course.lessons.length >= 8) {
    score += 5; // Comprehensive course
  }

  if (course.learning_objectives.length >= 6) {
    score += 5; // Clear objectives
  }

  // Bonus for strong African context
  const courseText = JSON.stringify(course).toLowerCase();
  const africanKeywordCount = [
    'm-pesa', 'naira', '₦', 'kes', 'lagos', 'nairobi', 'accra',
    'mobile money', 'mtn', 'airtel'
  ].filter(kw => courseText.includes(kw)).length;

  if (africanKeywordCount >= 5) {
    score += 10; // Excellent African context
  }

  // Clamp score to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ===================
// Export
// ===================


export type { QualityReport, QualityIssue };
