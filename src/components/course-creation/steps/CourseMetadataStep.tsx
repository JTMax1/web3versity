/**
 * Step 1: Course Metadata
 *
 * Form for course title, description, track, difficulty, and estimated hours.
 */

import React from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { useWallet } from '../../../contexts/WalletContext';
import { BookOpen, Clock, Target, TrendingUp, AlertCircle, Tag, Users, Network } from 'lucide-react';
import { COURSE_CATEGORIES } from '../../../lib/schemas/course-schema-unified';
import { PrerequisiteCoursesSelector } from '../PrerequisiteCoursesSelector';

export function CourseMetadataStep() {
  const { draft, updateMetadata, setComingSoon } = useCourseCreationStore();
  const { user } = useWallet();

  const isAdmin = user?.is_admin || false;

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', emoji: '🌱', description: 'No prior knowledge required' },
    { value: 'intermediate', label: 'Intermediate', emoji: '📚', description: 'Some blockchain basics needed' },
    { value: 'advanced', label: 'Advanced', emoji: '🚀', description: 'Advanced technical concepts' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Information</h2>
        <p className="text-gray-600">
          Let's start with the basics. This information will help students discover your course.
        </p>
      </div>

      {/* Course Title */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <BookOpen className="w-4 h-4 text-[#0084C7]" />
          Course Title *
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateMetadata({ title: e.target.value })}
          placeholder="e.g., Introduction to Hedera Consensus Service"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-lg"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Choose a clear, descriptive title that tells students what they'll learn
          </p>
          <span className="text-sm text-gray-400">{draft.title.length}/100</span>
        </div>
      </div>

      {/* Course Description */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Target className="w-4 h-4 text-[#0084C7]" />
          Course Description *
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => updateMetadata({ description: e.target.value })}
          placeholder="Describe what students will learn, who this course is for, and what makes it valuable..."
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Explain the course value and what students will achieve
          </p>
          <span className="text-sm text-gray-400">{draft.description.length}/1000</span>
        </div>
      </div>

      {/* Thumbnail Emoji Picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Course Emoji *
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Type or paste a single emoji to represent your course
        </p>

        {/* Custom Emoji Input */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={draft.thumbnailEmoji}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow single emoji or empty
              const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}]$/u;
              if (value === '' || emojiRegex.test(value)) {
                updateMetadata({ thumbnailEmoji: value });
              }
            }}
            maxLength={2}
            placeholder="📚"
            className="w-24 h-24 text-5xl text-center rounded-2xl border-2 border-[#0084C7] bg-gradient-to-br from-blue-50 to-cyan-50 focus:border-[#0084C7] focus:outline-none focus:ring-4 focus:ring-[#0084C7]/20 transition-all shadow-[0_4px_16px_rgba(0,132,199,0.15)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.25)]"
          />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              {draft.thumbnailEmoji ? '✓ Emoji Selected' : 'Enter an Emoji'}
            </p>
            <p className="text-xs text-gray-600">
              Examples: 📚 💻 🚀 🎓 💡 🔒 🌍 💰
            </p>
            <p className="text-xs text-gray-500">
              Tip: Use your device's emoji picker (Windows: Win + . | Mac: Cmd + Ctrl + Space)
            </p>
          </div>
        </div>
      </div>

      {/* Track Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <TrendingUp className="w-4 h-4 text-[#0084C7]" />
          Learning Track *
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Explorer Track */}
          <button
            type="button"
            onClick={() => updateMetadata({ track: 'explorer' })}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              draft.track === 'explorer'
                ? 'border-[#0084C7] bg-blue-50 shadow-[0_4px_16px_rgba(0,132,199,0.2)]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">🧭</div>
            <h3 className="font-bold text-gray-900 mb-1">Explorer Track</h3>
            <p className="text-sm text-gray-600">
              For beginners learning blockchain and Web3 fundamentals
            </p>
          </button>

          {/* Developer Track - Coming Soon */}
          <button
            type="button"
            disabled
            className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed relative"
          >
            <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
              Coming Soon
            </div>
            <div className="text-3xl mb-2">👨‍💻</div>
            <h3 className="font-bold text-gray-900 mb-1">Developer Track</h3>
            <p className="text-sm text-gray-600">
              For builders learning to code smart contracts and dApps
            </p>
          </button>
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Difficulty Level *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {difficultyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateMetadata({ difficulty: option.value as any })}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                draft.difficulty === option.value
                  ? 'border-[#0084C7] bg-blue-50 shadow-[0_4px_16px_rgba(0,132,199,0.2)]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{option.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-1">{option.label}</h3>
              <p className="text-xs text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Hours */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Clock className="w-4 h-4 text-[#0084C7]" />
          Estimated Completion Time *
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={draft.estimatedHours}
            onChange={(e) => updateMetadata({ estimatedHours: parseFloat(e.target.value) || 0 })}
            min="0.5"
            max="100"
            step="0.5"
            className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-center text-lg font-semibold"
          />
          <span className="text-gray-700 font-medium">hours</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Estimate how long it will take an average student to complete this course
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Tag className="w-4 h-4 text-[#0084C7]" />
          Course Category *
        </label>
        <select
          value={draft.category || ''}
          onChange={(e) => updateMetadata({ category: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-gray-900"
        >
          <option value="" disabled>Select a category...</option>
          {COURSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Choose the primary category that best describes your course content
        </p>
      </div>

      {/* Target Audience */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Users className="w-4 h-4 text-[#0084C7]" />
          Target Audience *
        </label>
        <textarea
          value={draft.targetAudience || ''}
          onChange={(e) => updateMetadata({ targetAudience: e.target.value })}
          placeholder="Describe who this course is designed for, what background knowledge they should have, and why this course is relevant to them..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Clearly define your ideal student to help them self-assess fit
          </p>
          <span className={`text-sm font-medium ${
            (draft.targetAudience?.length || 0) < 50
              ? 'text-red-500'
              : (draft.targetAudience?.length || 0) >= 500
              ? 'text-yellow-500'
              : 'text-gray-400'
          }`}>
            {draft.targetAudience?.length || 0}/500 {(draft.targetAudience?.length || 0) < 50 && '(min 50)'}
          </span>
        </div>
      </div>

      {/* Prerequisites Selector */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Network className="w-4 h-4 text-[#0084C7]" />
          Prerequisites (Optional)
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select courses that students should complete before taking this course. Students must complete them in the order you specify.
        </p>
        <PrerequisiteCoursesSelector
          selectedCourses={draft.prerequisites || []}
          onChange={(courseIds) => updateMetadata({ prerequisites: courseIds })}
          currentCourseId={draft.id}
        />
      </div>

      {/* Course Image URL (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Course Image URL (Optional)
        </label>
        <input
          type="url"
          value={draft.imageUrl || ''}
          onChange={(e) => updateMetadata({ imageUrl: e.target.value })}
          placeholder="https://example.com/course-image.jpg"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
        />
        <p className="text-sm text-gray-500 mt-2">
          Add a custom image for your course (recommended: 1200x630px)
        </p>
        {draft.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={draft.imageUrl}
              alt="Course preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/1200x630?text=Invalid+Image+URL';
              }}
            />
          </div>
        )}
      </div>

      {/* Admin-Only: Coming Soon Toggle */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">👑 Admin Feature: Coming Soon</h4>
              <p className="text-sm text-gray-700 mb-4">
                Mark this course as "Coming Soon" to make it visible in the course catalog without allowing enrollments yet.
                This is useful for building anticipation for upcoming courses.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setComingSoon(!draft.isComingSoon)}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    draft.isComingSoon ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={draft.isComingSoon}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      draft.isComingSoon ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {draft.isComingSoon ? 'Course marked as Coming Soon' : 'Mark as Coming Soon'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-gray-900 mb-2">💡 Tips for Success</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use clear, action-oriented language in your title</li>
          <li>• Include specific outcomes students will achieve</li>
          <li>• Be realistic about time estimates - students appreciate accuracy</li>
          <li>• Choose difficulty based on prerequisite knowledge needed</li>
          <li>• Select the most specific category that matches your content</li>
          <li>• Target audience should be detailed enough for students to self-assess</li>
          <li>• Only add prerequisites if they're truly necessary for understanding</li>
        </ul>
      </div>
    </div>
  );
}
