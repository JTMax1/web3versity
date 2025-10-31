/**
 * Live Quality Monitor Component
 *
 * Provides real-time quality feedback as educators create courses.
 * Shows quality score, errors, warnings, and suggestions.
 *
 * Features:
 * - Real-time quality scoring (0-100)
 * - Expandable/collapsible UI
 * - Error and warning badges
 * - Sticky positioning (stays visible while scrolling)
 * - Color-coded feedback (red, yellow, green)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useCourseCreationStore } from '../../stores/course-creation-store';
import { performQualityChecks, QualityReport } from '../../lib/ai/quality-checker';
import { transformDraftForQualityCheck } from '../../lib/schemas/transformers';

interface LiveQualityMonitorProps {
  className?: string;
}

export function LiveQualityMonitor({ className = '' }: LiveQualityMonitorProps) {
  const { draft } = useCourseCreationStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);

  // Recalculate quality on draft changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const unifiedCourse = transformDraftForQualityCheck(draft);

        // Convert to format expected by quality checker
        const courseForCheck: any = {
          ...unifiedCourse,
          lessons: unifiedCourse.lessons.map(lesson => ({
            ...lesson,
            lesson_type: lesson.lesson_type,
            content: lesson.content,
          })),
        };

        const report = performQualityChecks(courseForCheck);
        setQualityReport(report);

        // Update draft with quality score
        if (draft.qualityScore !== report.score) {
          useCourseCreationStore.getState().updateMetadata({
            qualityScore: report.score
          } as any);
        }
      } catch (error) {
        console.error('Quality check failed:', error);
        setQualityReport(null);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [
    draft.title,
    draft.description,
    draft.learningObjectives,
    draft.lessons,
    draft.category,
    draft.targetAudience,
  ]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  if (!qualityReport) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 border-2 border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-sm text-gray-600">Analyzing course quality...</span>
        </div>
      </div>
    );
  }

  const errors = qualityReport.issues.filter(i => i.severity === 'error');
  const warnings = qualityReport.issues.filter(i => i.severity === 'warning');
  const allWarnings = [...qualityReport.warnings, ...warnings.map(w => w.message)];

  return (
    <div className={`bg-white rounded-xl border-2 shadow-lg ${className}`}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#0084C7]" />
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-sm">Quality Score</h3>
            <p className="text-xs text-gray-500">Live feedback</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score Badge */}
          <div className={`px-4 py-2 rounded-lg border-2 font-bold ${getScoreColor(qualityReport.score)}`}>
            <span className="text-2xl">{qualityReport.score}</span>
            <span className="text-xs ml-1">/100</span>
          </div>

          {/* Error/Warning Badges */}
          {errors.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
              <XCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-600">{errors.length}</span>
            </div>
          )}

          {allWarnings.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-600">{allWarnings.length}</span>
            </div>
          )}

          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 p-4 space-y-4">
          {/* Score Description */}
          <div className={`p-3 rounded-lg border ${getScoreColor(qualityReport.score)}`}>
            <p className="text-sm font-semibold">
              {getScoreLabel(qualityReport.score)} - {qualityReport.passed ? '✓ Ready to Submit' : '✗ Needs Improvement'}
            </p>
            <p className="text-xs mt-1 opacity-80">
              {qualityReport.score >= 60
                ? 'Your course meets quality standards! Review feedback below for improvements.'
                : 'Please address the errors below to meet publication standards (60+ score required).'}
            </p>
          </div>

          {/* Checks Passed */}
          {qualityReport.checksPassed.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Passed Checks ({qualityReport.checksPassed.length})
              </h4>
              <div className="space-y-1">
                {qualityReport.checksPassed.map((check, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {check}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Errors ({errors.length})
              </h4>
              <div className="space-y-3">
                {errors.map((error, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-red-900">{error.message}</p>
                    {error.suggestion && (
                      <p className="text-xs text-red-700 mt-1">
                        💡 <strong>Suggestion:</strong> {error.suggestion}
                      </p>
                    )}
                    <p className="text-xs text-red-600 mt-1 opacity-75">Check: {error.checkName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {allWarnings.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Warnings ({allWarnings.length})
              </h4>
              <div className="space-y-2">
                {allWarnings.map((warning, idx) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <p className="text-xs text-yellow-900">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Checks */}
          {qualityReport.checksFailed.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Failed Checks ({qualityReport.checksFailed.length})
              </h4>
              <div className="space-y-1">
                {qualityReport.checksFailed.map((check, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="text-red-500">✗</span>
                    {check}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfect Score Message */}
          {qualityReport.score === 100 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-bold text-green-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Perfect Score! Outstanding Course Quality!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your course meets all quality standards with excellent African contextualization,
                lesson balance, and educational content. Ready to inspire learners!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
