/**
 * AI Course Generator Component
 *
 * Multi-step wizard for generating complete courses using AI.
 * Steps: Input → Generating → Review → Complete
 *
 * Features:
 * - Form validation
 * - Real-time progress updates
 * - Quality report display
 * - Course preview
 * - Save to database
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { buildCourseGenerationPrompt } from '../../lib/ai/prompts/course-prompts';
import { performQualityChecks, type QualityReport } from '../../lib/ai/quality-checker';
import { validateCourse } from '../../lib/schemas/course-schema';
import { useGenerateCourse, type CoursePrompt, type GeneratedCourse } from '../../hooks/useAI';
import { convertAICourseToManualDraft } from '../../lib/schemas/transformers';
import { useCourseCreationStore } from '../../stores/course-creation-store';

// Sub-components
import { CourseInputForm } from './CourseInputForm';
import { GeneratingProgress } from './GeneratingProgress';
import { CourseReview } from './CourseReview';
import { GenerationComplete } from './GenerationComplete';

type WizardStep = 'input' | 'generating' | 'review' | 'complete';

interface CourseGeneratorProps {
  onBackToChoose?: () => void;
}

export function CourseGenerator({ onBackToChoose }: CourseGeneratorProps = {}) {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<WizardStep>('input');
  const [progress, setProgress] = useState<string>('');
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [lastPrompt, setLastPrompt] = useState<CoursePrompt | null>(null);

  // AI generation mutation
  const generateMutation = useGenerateCourse((status: string) => {
    setProgress(status);
  });

  /**
   * Handle course generation submission
   */
  const handleGenerate = async (prompt: CoursePrompt) => {
    setLastPrompt(prompt);
    setStep('generating');
    setProgress('Preparing AI prompt...');

    try {
      // Build full prompt
      const fullPrompt = buildCourseGenerationPrompt(prompt);

      setProgress('Connecting to Gemini AI...');

      // Generate course via AI service
      const result = await generateMutation.mutateAsync(prompt);

      setProgress('Validating course structure...');

      // Validate course schema
      const validation = validateCourse(result);
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
      }

      const course = validation.data!;
      setGeneratedCourse(course);

      setProgress('Running quality checks...');

      // Run quality checks
      const report = performQualityChecks(course);
      setQualityReport(report);

      setProgress('Complete!');

      // Show quality score
      if (report.score < 60) {
        toast.warning(`Quality score: ${report.score}/100`, {
          description: 'Review issues before publishing. You can regenerate if needed.',
        });
      } else if (report.score >= 80) {
        toast.success(`Excellent quality: ${report.score}/100`, {
          description: 'Course is ready to publish!',
        });
      } else {
        toast.info(`Good quality: ${report.score}/100`, {
          description: 'Course looks good. Review before publishing.',
        });
      }

      setStep('review');

    } catch (error: any) {
      console.error('Course generation failed:', error);
      toast.error('Generation failed', {
        description: error.message || 'An unexpected error occurred',
      });
      setStep('input');
    }
  };

  /**
   * Handle regeneration (go back to input with prefilled data)
   */
  const handleRegenerate = () => {
    setStep('input');
    setGeneratedCourse(null);
    setQualityReport(null);
    // lastPrompt retained for prefilling
  };

  /**
   * Handle saving course to database
   */
  const handleSave = async () => {
    if (!generatedCourse) return;

    try {
      // Import save function
      const { saveCourseToDatabase } = await import('../../lib/ai/save-course');

      // Save to database
      const result = await saveCourseToDatabase(generatedCourse, {
        publishImmediately: false, // Save as draft for review
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save course');
      }

      toast.success('Course saved!', {
        description: 'Course saved as draft. You can view it or generate another.',
      });

      setStep('complete');

      // Don't auto-navigate - let user choose action from GenerationComplete screen

    } catch (error: any) {
      console.error('Save failed:', error);
      toast.error('Failed to save course', {
        description: error.message,
      });
    }
  };

  /**
   * Handle editing AI-generated course in manual editor
   * Converts AI course to manual draft format and loads it
   */
  const handleEdit = () => {
    if (!generatedCourse || !qualityReport) {
      console.error('Cannot edit: Missing generated course or quality report');
      toast.error('Cannot edit course', {
        description: 'Course data is not available',
      });
      return;
    }

    try {
      console.log('Starting edit mode conversion...');
      console.log('Generated course:', generatedCourse);
      console.log('Quality score:', qualityReport.score);

      // Convert AI course to manual draft format
      const manualDraft = convertAICourseToManualDraft(generatedCourse, qualityReport.score);
      console.log('Converted to manual draft:', manualDraft);

      // Load draft into course creation store using setState
      useCourseCreationStore.setState({
        draft: manualDraft,
        currentStep: 1,
        maxCompletedStep: 0,
        isDirty: true,
        validationErrors: [],
      });
      console.log('Store updated with draft');

      // Show success toast
      toast.success('Entering edit mode!', {
        description: 'You can now manually edit this AI-generated course. Changes will be tracked with live quality monitoring.',
        duration: 4000,
      });

      // Navigate to manual course creation page with mode parameter
      console.log('Navigating to /create-course?mode=manual');
      navigate('/create-course?mode=manual');

    } catch (error: any) {
      console.error('Failed to enter edit mode:', error);
      toast.error('Failed to enter edit mode', {
        description: error.message || 'An unexpected error occurred',
      });
    }
  };

  /**
   * Render current step
   */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Step 1: Input Form */}
      {step === 'input' && (
        <CourseInputForm
          onGenerate={handleGenerate}
          isLoading={generateMutation.isPending}
          initialValues={lastPrompt || undefined}
          onBack={onBackToChoose}
        />
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <GeneratingProgress
          status={progress}
          onCancel={() => setStep('input')}
        />
      )}

      {/* Step 3: Review */}
      {step === 'review' && generatedCourse && qualityReport && (
        <CourseReview
          course={generatedCourse}
          qualityReport={qualityReport}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onEdit={handleEdit}
        />
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && generatedCourse && (
        <GenerationComplete
          course={generatedCourse}
          onGenerateAnother={() => {
            setStep('input');
            setGeneratedCourse(null);
            setQualityReport(null);
            setLastPrompt(null);
          }}
          onViewCourse={() => navigate(`/courses/${generatedCourse.id}`)}
          onBackToDashboard={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
}
