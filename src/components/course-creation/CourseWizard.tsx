/**
 * Course Creation Wizard
 *
 * Main component for the 5-step course creation flow:
 * 1. Course Metadata
 * 2. Learning Objectives
 * 3. Lessons
 * 4. Review & Validation
 * 5. Submit for Review
 */

import React, { useEffect } from 'react';
import { useCourseCreationStore } from '../../stores/course-creation-store';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { CourseMetadataStep } from './steps/CourseMetadataStep';
import { LearningObjectivesStep } from './steps/LearningObjectivesStep';
import { LessonsStep } from './steps/LessonsStep';
import { ReviewStep } from './steps/ReviewStep';
import { SubmitStep } from './steps/SubmitStep';
import { LiveQualityMonitor } from './LiveQualityMonitor';

export function CourseWizard() {
  const {
    currentStep,
    maxCompletedStep,
    isDirty,
    isSaving,
    isSubmitting,
    lastSaved,
    validationErrors,
    nextStep,
    previousStep,
    saveDraft,
  } = useCourseCreationStore();

  // Auto-save every 2 minutes if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && !isSaving) {
        saveDraft();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [isDirty, isSaving, saveDraft]);

  const steps = [
    { number: 1, title: 'Course Info', component: CourseMetadataStep },
    { number: 2, title: 'Objectives', component: LearningObjectivesStep },
    { number: 3, title: 'Lessons', component: LessonsStep },
    { number: 4, title: 'Review', component: ReviewStep },
    { number: 5, title: 'Submit', component: SubmitStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-gray-600">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={() => saveDraft()}
                disabled={!isDirty || isSaving}
                variant="outline"
                className="rounded-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep === step.number
                        ? 'bg-[#0084C7] text-white shadow-[0_4px_16px_rgba(0,132,199,0.4)]'
                        : step.number <= maxCompletedStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number <= maxCompletedStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 font-medium">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step.number <= maxCompletedStep
                        ? 'bg-green-500'
                        : step.number < currentStep
                        ? 'bg-[#0084C7]'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription>
              <div className="space-y-2">
                {validationErrors
                  .filter(e => e.severity === 'error')
                  .map((error, index) => (
                    <div key={index} className="text-red-800">
                      • {error.message}
                    </div>
                  ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {validationErrors.some(e => e.severity === 'warning') && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription>
              <div className="space-y-2">
                {validationErrors
                  .filter(e => e.severity === 'warning')
                  .map((error, index) => (
                    <div key={index} className="text-yellow-800">
                      • {error.message}
                    </div>
                  ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Area with Quality Monitor */}
        <div className="flex gap-6 mb-6">
          {/* Current Step Content */}
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <CurrentStepComponent />
          </div>

          {/* Quality Monitor (sticky sidebar) - Hide on submit step */}
          {currentStep < 5 && (
            <div className="w-96 flex-shrink-0">
              <div className="sticky top-24">
                <LiveQualityMonitor />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={previousStep}
            disabled={currentStep === 1}
            variant="outline"
            className="rounded-full px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-full px-6"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
