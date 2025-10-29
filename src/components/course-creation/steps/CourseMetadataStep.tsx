/**
 * Step 1: Course Metadata
 *
 * Form for course title, description, track, difficulty, and estimated hours.
 */

import React from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

export function CourseMetadataStep() {
  const { draft, updateMetadata } = useCourseCreationStore();

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

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-gray-900 mb-2">💡 Tips for Success</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use clear, action-oriented language in your title</li>
          <li>• Include specific outcomes students will achieve</li>
          <li>• Be realistic about time estimates - students appreciate accuracy</li>
          <li>• Choose difficulty based on prerequisite knowledge needed</li>
        </ul>
      </div>
    </div>
  );
}
