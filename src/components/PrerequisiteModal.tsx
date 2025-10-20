/**
 * Prerequisite Modal Component
 *
 * Displays a modal when a user tries to enroll in a course
 * that requires prerequisites to be completed first.
 */

import React from 'react';
import { X, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import type { Course } from '../lib/supabase/types';

// ============================================================================
// Types
// ============================================================================

interface PrerequisiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  prerequisites: Course[];
  onNavigateToCourse?: (courseId: string) => void;
}

// ============================================================================
// Prerequisite Modal Component
// ============================================================================

export function PrerequisiteModal({
  isOpen,
  onClose,
  courseName,
  prerequisites,
  onNavigateToCourse,
}: PrerequisiteModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),inset_2px_2px_8px_rgba(255,255,255,0.3)]">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Course Locked</h2>
              <p className="text-white/90 text-sm">Prerequisites Required</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 text-lg">
              To enroll in <span className="font-semibold text-gray-900">{courseName}</span>,
              you must first complete the following prerequisite{' '}
              {prerequisites.length === 1 ? 'course' : 'courses'}:
            </p>
          </div>

          {/* Prerequisites List */}
          <div className="space-y-4">
            {prerequisites.map((prereq, index) => (
              <div
                key={prereq.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center text-white font-bold shadow-[0_4px_12px_rgba(0,132,199,0.3)]">
                    {index + 1}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {prereq.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {prereq.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="capitalize">{prereq.difficulty}</span>
                      </span>
                      <span>•</span>
                      <span>{prereq.estimated_hours}h</span>
                      <span>•</span>
                      <span>{prereq.total_lessons} lessons</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="capitalize">{prereq.track}</span>
                      </span>
                    </div>

                    {/* View Course Button */}
                    {onNavigateToCourse && (
                      <button
                        onClick={() => {
                          onNavigateToCourse(prereq.id);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-xl text-sm font-medium shadow-[0_4px_12px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_16px_rgba(0,132,199,0.4)] transition-all"
                      >
                        Start This Course
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Complete prerequisites in order</p>
                <p className="text-blue-700">
                  Once you've completed{' '}
                  {prerequisites.length === 1 ? 'this course' : 'these courses'}, you'll be
                  able to enroll in <span className="font-semibold">{courseName}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {prerequisites.length} prerequisite{prerequisites.length === 1 ? '' : 's'}{' '}
              required
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-2xl font-medium shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Keyboard Support
// ============================================================================

// Add this to your component if you want to close on Escape key
export function useEscapeKey(onEscape: () => void) {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape]);
}
