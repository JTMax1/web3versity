/**
 * Step 4: Review & Validation
 *
 * Final review step showing complete course summary and validation results.
 */

import React from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { CheckCircle, AlertCircle, AlertTriangle, BookOpen, Target, List } from 'lucide-react';

export function ReviewStep() {
  const { draft, validateAll } = useCourseCreationStore();
  const validationErrors = validateAll();

  const errors = validationErrors.filter(e => e.severity === 'error');
  const warnings = validationErrors.filter(e => e.severity === 'warning');

  const getLessonTypeCount = (type: string) => {
    return draft.lessons.filter(l => l.type === type).length;
  };

  const textRatio = draft.lessons.length > 0
    ? (getLessonTypeCount('text') / draft.lessons.length) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Course</h2>
        <p className="text-gray-600">
          Review all course details before submitting for admin approval.
        </p>
      </div>

      {/* Validation Status */}
      {errors.length === 0 ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-1">Ready to Submit!</h3>
              <p className="text-green-800">
                Your course meets all requirements and is ready for admin review.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-1">
                {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
              </h3>
              <p className="text-red-800 mb-3">
                Please fix all errors before submitting your course.
              </p>
              <ul className="space-y-2">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-800">
                    • {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-900 mb-1">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-yellow-800 mb-3">
                These are suggestions to improve your course quality:
              </p>
              <ul className="space-y-2">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800">
                    • {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Course Summary */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-[#0084C7]" />
          <h3 className="text-xl font-bold text-gray-900">Course Overview</h3>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Title</label>
              <p className="text-gray-900 font-medium">{draft.title || '(Not set)'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Track</label>
              <p className="text-gray-900 font-medium capitalize">{draft.track}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Difficulty</label>
              <p className="text-gray-900 font-medium capitalize">{draft.difficulty}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Estimated Hours</label>
              <p className="text-gray-900 font-medium">{draft.estimatedHours}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Description</label>
            <p className="text-gray-900 mt-1">{draft.description || '(Not set)'}</p>
          </div>

          {/* Image Preview */}
          {draft.imageUrl && (
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Course Image</label>
              <img
                src={draft.imageUrl}
                alt="Course"
                className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/1200x630?text=Invalid+Image';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-[#0084C7]" />
          <h3 className="text-xl font-bold text-gray-900">Learning Objectives</h3>
          <span className="ml-auto text-sm font-semibold text-gray-600">
            {draft.learningObjectives.length} objective{draft.learningObjectives.length !== 1 ? 's' : ''}
          </span>
        </div>

        {draft.learningObjectives.length === 0 ? (
          <p className="text-gray-500 italic">No objectives defined</p>
        ) : (
          <ul className="space-y-2">
            {draft.learningObjectives.map((obj, index) => (
              <li key={obj.id} className="flex items-start gap-3">
                <span className="text-[#0084C7] font-semibold">{index + 1}.</span>
                <span className="text-gray-900">{obj.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lessons Overview */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <List className="w-6 h-6 text-[#0084C7]" />
          <h3 className="text-xl font-bold text-gray-900">Course Content</h3>
          <span className="ml-auto text-sm font-semibold text-gray-600">
            {draft.lessons.length} lesson{draft.lessons.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#0084C7]">{getLessonTypeCount('text')}</div>
            <div className="text-sm text-gray-700">📝 Text</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{getLessonTypeCount('interactive')}</div>
            <div className="text-sm text-gray-700">🎮 Interactive</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{getLessonTypeCount('quiz')}</div>
            <div className="text-sm text-gray-700">❓ Quiz</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{getLessonTypeCount('practical')}</div>
            <div className="text-sm text-gray-700">💸 Practical</div>
          </div>
        </div>

        {/* Text Ratio Warning */}
        {textRatio > 60 && (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Content Balance:</strong> {textRatio.toFixed(0)}% of your lessons are text-only.
              Consider adding more interactive components to improve engagement.
            </p>
          </div>
        )}

        {/* Lessons List */}
        {draft.lessons.length === 0 ? (
          <p className="text-gray-500 italic">No lessons created</p>
        ) : (
          <div className="space-y-2">
            {draft.lessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="w-8 h-8 bg-[#0084C7] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-2xl">
                  {lesson.type === 'text' && '📝'}
                  {lesson.type === 'interactive' && '🎮'}
                  {lesson.type === 'quiz' && '❓'}
                  {lesson.type === 'practical' && '💸'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{lesson.title}</p>
                  <p className="text-sm text-gray-600 capitalize">{lesson.type}</p>
                </div>
                {lesson.estimatedMinutes && (
                  <span className="text-sm text-gray-600">{lesson.estimatedMinutes} min</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Checklist */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-gray-900 mb-4">✅ Quality Checklist</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {draft.title.length >= 10 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Descriptive title (10+ characters)</span>
          </div>
          <div className="flex items-center gap-3">
            {draft.description.length >= 50 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Comprehensive description (50+ characters)</span>
          </div>
          <div className="flex items-center gap-3">
            {draft.learningObjectives.length >= 4 && draft.learningObjectives.length <= 10 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">4-10 learning objectives</span>
          </div>
          <div className="flex items-center gap-3">
            {draft.lessons.length >= 5 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">At least 5 lessons</span>
          </div>
          <div className="flex items-center gap-3">
            {draft.lessons.some(l => l.type !== 'text') ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Includes interactive/quiz/practical content</span>
          </div>
          <div className="flex items-center gap-3">
            {textRatio <= 60 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="text-sm text-gray-700">Balanced content (≤60% text lessons)</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">📋 What Happens Next?</h4>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-3">
            <span className="font-bold text-[#0084C7]">1.</span>
            <span>Click "Next Step" to proceed to the submission page</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-[#0084C7]">2.</span>
            <span>Your course will be submitted to admin review queue</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-[#0084C7]">3.</span>
            <span>An admin will review your course and provide feedback</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-[#0084C7]">4.</span>
            <span>Once approved, your course will be published to all students</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-[#0084C7]">5.</span>
            <span>You'll be notified via email about the review status</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
