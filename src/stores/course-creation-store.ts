/**
 * Course Creation Store
 *
 * Zustand store for managing course creation wizard state.
 * Handles multi-step form data, draft saving, and validation state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Types
export interface LearningObjective {
  id: string;
  text: string;
  order: number;
}

export interface LessonContent {
  id: string;
  type: 'text' | 'interactive' | 'quiz' | 'practical';
  title: string;
  order: number;

  // Text Lesson
  content?: string;

  // Interactive Lesson
  interactiveType?: string;
  interactiveConfig?: Record<string, any>;

  // Quiz Lesson
  questions?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;

  // Practical Lesson
  practicalType?: string;
  practicalConfig?: {
    objective: string;
    steps: string[];
    tips: string[];
    defaultRecipient?: string;
    defaultAmount?: number;
    defaultMemo?: string;
  };

  // Common
  estimatedMinutes?: number;
  xpReward?: number;
}

export interface CourseDraft {
  id?: string;

  // Step 1: Course Metadata
  title: string;
  description: string;
  track: 'explorer';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  thumbnailEmoji: string;
  imageUrl?: string;

  // Step 2: Learning Objectives
  learningObjectives: LearningObjective[];

  // Step 3: Lessons
  lessons: LessonContent[];

  // Metadata
  creatorId?: string;
  draftStatus?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  lastSaved?: string;
  createdAt?: string;
  updatedAt?: string;

  // Admin-only features
  isComingSoon?: boolean; // Mark course as "Coming Soon" (visible but not enrollable)
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface CourseCreationState {
  // Wizard state
  currentStep: number;
  maxCompletedStep: number;

  // Course data
  draft: CourseDraft;

  // UI state
  isDirty: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  lastSaved: Date | null;

  // Validation
  validationErrors: ValidationError[];

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Course metadata (Step 1)
  updateMetadata: (metadata: Partial<Pick<CourseDraft, 'title' | 'description' | 'track' | 'difficulty' | 'estimatedHours' | 'thumbnailEmoji' | 'imageUrl' | 'isComingSoon'>>) => void;
  setComingSoon: (isComingSoon: boolean) => void;

  // Learning objectives (Step 2)
  addObjective: (text: string) => void;
  updateObjective: (id: string, text: string) => void;
  deleteObjective: (id: string) => void;
  reorderObjectives: (objectives: LearningObjective[]) => void;

  // Lessons (Step 3)
  addLesson: (lesson: Omit<LessonContent, 'id' | 'order'>) => void;
  updateLesson: (id: string, lesson: Partial<LessonContent>) => void;
  deleteLesson: (id: string) => void;
  reorderLessons: (lessons: LessonContent[]) => void;
  duplicateLesson: (id: string) => void;

  // Draft management
  saveDraft: () => Promise<boolean>;
  loadDraft: (draftId: string) => Promise<boolean>;
  createNewDraft: () => void;

  // Submission
  submitForReview: () => Promise<boolean>;

  // Validation
  validateStep: (step: number) => ValidationError[];
  validateAll: () => ValidationError[];

  // Utilities
  markClean: () => void;
  markDirty: () => void;
  resetStore: () => void;
}

const INITIAL_DRAFT: CourseDraft = {
  title: '',
  description: '',
  track: 'explorer',
  difficulty: 'beginner',
  estimatedHours: 1,
  thumbnailEmoji: '📚',
  learningObjectives: [],
  lessons: [],
};

export const useCourseCreationStore = create<CourseCreationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      maxCompletedStep: 0,
      draft: { ...INITIAL_DRAFT },
      isDirty: false,
      isSaving: false,
      isSubmitting: false,
      lastSaved: null,
      validationErrors: [],

      // Navigation
      setStep: (step: number) => {
        const { maxCompletedStep } = get();
        if (step <= maxCompletedStep + 1 && step >= 1 && step <= 5) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep, maxCompletedStep, validateStep } = get();
        const errors = validateStep(currentStep);
        const hasErrors = errors.some(e => e.severity === 'error');

        if (hasErrors) {
          set({ validationErrors: errors });
          toast.error('Please fix all errors before continuing');
          return;
        }

        if (currentStep < 5) {
          set({
            currentStep: currentStep + 1,
            maxCompletedStep: Math.max(maxCompletedStep, currentStep),
            validationErrors: [],
          });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1, validationErrors: [] });
        }
      },

      // Course metadata
      updateMetadata: (metadata) => {
        set((state) => ({
          draft: { ...state.draft, ...metadata },
          isDirty: true,
        }));
      },

      setComingSoon: (isComingSoon: boolean) => {
        set((state) => ({
          draft: { ...state.draft, isComingSoon },
          isDirty: true,
        }));
      },

      // Learning objectives
      addObjective: (text: string) => {
        set((state) => {
          const newObjective: LearningObjective = {
            id: crypto.randomUUID(),
            text,
            order: state.draft.learningObjectives.length,
          };
          return {
            draft: {
              ...state.draft,
              learningObjectives: [...state.draft.learningObjectives, newObjective],
            },
            isDirty: true,
          };
        });
      },

      updateObjective: (id: string, text: string) => {
        set((state) => ({
          draft: {
            ...state.draft,
            learningObjectives: state.draft.learningObjectives.map((obj) =>
              obj.id === id ? { ...obj, text } : obj
            ),
          },
          isDirty: true,
        }));
      },

      deleteObjective: (id: string) => {
        set((state) => {
          const filtered = state.draft.learningObjectives.filter((obj) => obj.id !== id);
          return {
            draft: {
              ...state.draft,
              learningObjectives: filtered.map((obj, index) => ({ ...obj, order: index })),
            },
            isDirty: true,
          };
        });
      },

      reorderObjectives: (objectives: LearningObjective[]) => {
        set((state) => ({
          draft: {
            ...state.draft,
            learningObjectives: objectives.map((obj, index) => ({ ...obj, order: index })),
          },
          isDirty: true,
        }));
      },

      // Lessons
      addLesson: (lesson) => {
        set((state) => {
          const newLesson: LessonContent = {
            ...lesson,
            id: crypto.randomUUID(),
            order: state.draft.lessons.length,
          };
          return {
            draft: {
              ...state.draft,
              lessons: [...state.draft.lessons, newLesson],
            },
            isDirty: true,
          };
        });
      },

      updateLesson: (id: string, lesson: Partial<LessonContent>) => {
        set((state) => ({
          draft: {
            ...state.draft,
            lessons: state.draft.lessons.map((l) =>
              l.id === id ? { ...l, ...lesson } : l
            ),
          },
          isDirty: true,
        }));
      },

      deleteLesson: (id: string) => {
        set((state) => {
          const filtered = state.draft.lessons.filter((l) => l.id !== id);
          return {
            draft: {
              ...state.draft,
              lessons: filtered.map((l, index) => ({ ...l, order: index })),
            },
            isDirty: true,
          };
        });
      },

      reorderLessons: (lessons: LessonContent[]) => {
        set((state) => ({
          draft: {
            ...state.draft,
            lessons: lessons.map((l, index) => ({ ...l, order: index })),
          },
          isDirty: true,
        }));
      },

      duplicateLesson: (id: string) => {
        set((state) => {
          const lesson = state.draft.lessons.find((l) => l.id === id);
          if (!lesson) return state;

          const newLesson: LessonContent = {
            ...lesson,
            id: crypto.randomUUID(),
            title: `${lesson.title} (Copy)`,
            order: state.draft.lessons.length,
          };

          return {
            draft: {
              ...state.draft,
              lessons: [...state.draft.lessons, newLesson],
            },
            isDirty: true,
          };
        });
      },

      // Draft management
      saveDraft: async () => {
        const { draft, isDirty } = get();

        if (!isDirty) {
          return true;
        }

        set({ isSaving: true });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('You must be logged in to save drafts');
            return false;
          }

          // Get database user ID from JWT metadata (fix for auth issue)
          const dbUserId = user.user_metadata?.user_id;
          if (!dbUserId) {
            toast.error('User not properly registered');
            return false;
          }

          // Generate draft ID if creating new draft
          let draftId = draft.id;
          if (!draftId) {
            // Generate unique draft ID in format: draft_TIMESTAMP_RANDOM
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 6);
            draftId = `draft_${timestamp}_${random}`;
          }

          // course_drafts table expects course_data as JSONB
          const draftData = {
            creator_id: dbUserId,
            course_data: {
              title: draft.title,
              description: draft.description,
              track: draft.track,
              difficulty: draft.difficulty,
              estimated_hours: draft.estimatedHours,
              thumbnail_emoji: draft.thumbnailEmoji,
              image_url: draft.imageUrl,
              learning_objectives: draft.learningObjectives,
              lessons: draft.lessons,
            },
            draft_status: draft.draftStatus || 'draft',
            updated_at: new Date().toISOString(),
          };

          let result;
          if (draft.id) {
            // Update existing draft
            const { data, error } = await supabase
              .from('course_drafts')
              .update(draftData)
              .eq('id', draft.id)
              .select()
              .single();

            if (error) throw error;
            result = data;
          } else {
            // Create new draft
            const { data, error } = await supabase
              .from('course_drafts')
              .insert({
                id: draftId,
                ...draftData,
                created_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (error) throw error;
            result = data;
          }

          set({
            draft: { ...draft, id: result.id },
            isDirty: false,
            lastSaved: new Date(),
          });

          toast.success('Draft saved successfully');
          return true;
        } catch (error) {
          console.error('Error saving draft:', error);
          toast.error('Failed to save draft');
          return false;
        } finally {
          set({ isSaving: false });
        }
      },

      loadDraft: async (draftId: string) => {
        try {
          const { data, error } = await supabase
            .from('course_drafts')
            .select('*')
            .eq('id', draftId)
            .single();

          if (error) throw error;

          // Extract from course_data JSONB field
          const courseData = data.course_data || {};

          const loadedDraft: CourseDraft = {
            id: data.id,
            title: courseData.title || '',
            description: courseData.description || '',
            track: courseData.track || 'explorer',
            difficulty: courseData.difficulty || 'beginner',
            estimatedHours: courseData.estimated_hours || 1,
            thumbnailEmoji: courseData.thumbnail_emoji || '📚',
            imageUrl: courseData.image_url,
            learningObjectives: courseData.learning_objectives || [],
            lessons: courseData.lessons || [],
            creatorId: data.creator_id,
            draftStatus: data.draft_status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };

          set({
            draft: loadedDraft,
            isDirty: false,
            lastSaved: new Date(data.updated_at),
            currentStep: 1,
            maxCompletedStep: 0,
          });

          toast.success('Draft loaded successfully');
          return true;
        } catch (error) {
          console.error('Error loading draft:', error);
          toast.error('Failed to load draft');
          return false;
        }
      },

      createNewDraft: () => {
        set({
          draft: { ...INITIAL_DRAFT },
          currentStep: 1,
          maxCompletedStep: 0,
          isDirty: false,
          lastSaved: null,
          validationErrors: [],
        });
      },

      // Submission
      submitForReview: async () => {
        const { draft, validateAll } = get();

        // Validate entire course
        const errors = validateAll();
        const hasErrors = errors.some(e => e.severity === 'error');

        if (hasErrors) {
          set({ validationErrors: errors });
          toast.error('Please fix all errors before submitting');
          return false;
        }

        set({ isSubmitting: true });

        try {
          if (!draft.id) {
            toast.error('Please save your draft before submitting');
            return false;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('You must be logged in to submit courses');
            return false;
          }

          // Get database user ID from JWT metadata (fix for auth issue)
          const dbUserId = user.user_metadata?.user_id;
          if (!dbUserId) {
            toast.error('User not properly registered');
            return false;
          }

          // Call submit_draft_for_review RPC function
          const { error } = await supabase.rpc('submit_draft_for_review', {
            p_draft_id: draft.id,
            p_creator_id: dbUserId,
          });

          if (error) throw error;

          set((state) => ({
            draft: { ...state.draft, draftStatus: 'pending_review' },
            isDirty: false,
          }));

          toast.success('Course submitted for review!');
          return true;
        } catch (error) {
          console.error('Error submitting course:', error);
          toast.error('Failed to submit course for review');
          return false;
        } finally {
          set({ isSubmitting: false });
        }
      },

      // Validation
      validateStep: (step: number) => {
        const { draft } = get();
        const errors: ValidationError[] = [];

        switch (step) {
          case 1: // Course Metadata
            if (!draft.title || draft.title.trim().length === 0) {
              errors.push({ field: 'title', message: 'Course title is required', severity: 'error' });
            } else if (draft.title.length < 10) {
              errors.push({ field: 'title', message: 'Course title should be at least 10 characters', severity: 'warning' });
            }

            if (!draft.description || draft.description.trim().length === 0) {
              errors.push({ field: 'description', message: 'Course description is required', severity: 'error' });
            } else if (draft.description.length < 50) {
              errors.push({ field: 'description', message: 'Course description should be at least 50 characters', severity: 'warning' });
            }

            if (draft.estimatedHours < 0.5) {
              errors.push({ field: 'estimatedHours', message: 'Estimated hours must be at least 0.5', severity: 'error' });
            }
            break;

          case 2: // Learning Objectives
            if (draft.learningObjectives.length < 4) {
              errors.push({ field: 'objectives', message: 'At least 4 learning objectives are required', severity: 'error' });
            }
            if (draft.learningObjectives.length > 10) {
              errors.push({ field: 'objectives', message: 'Maximum 10 learning objectives allowed', severity: 'error' });
            }

            draft.learningObjectives.forEach((obj, index) => {
              if (!obj.text || obj.text.trim().length === 0) {
                errors.push({ field: `objective-${index}`, message: `Objective ${index + 1} is empty`, severity: 'error' });
              }
            });
            break;

          case 3: // Lessons
            if (draft.lessons.length < 5) {
              errors.push({ field: 'lessons', message: 'At least 5 lessons are required', severity: 'error' });
            }

            // Check for at least 1 interactive or quiz
            const hasInteractive = draft.lessons.some(l => l.type === 'interactive' || l.type === 'quiz' || l.type === 'practical');
            if (!hasInteractive) {
              errors.push({ field: 'lessons', message: 'At least 1 interactive, quiz, or practical lesson is required', severity: 'error' });
            }

            // Check text content ratio (warning only)
            const textLessons = draft.lessons.filter(l => l.type === 'text').length;
            const textRatio = textLessons / draft.lessons.length;
            if (textRatio > 0.6) {
              errors.push({ field: 'lessons', message: 'More than 60% text-only lessons may reduce engagement', severity: 'warning' });
            }

            // Validate individual lessons
            draft.lessons.forEach((lesson, index) => {
              if (!lesson.title || lesson.title.trim().length === 0) {
                errors.push({ field: `lesson-${index}`, message: `Lesson ${index + 1} title is required`, severity: 'error' });
              }

              if (lesson.type === 'text' && (!lesson.content || lesson.content.trim().length === 0)) {
                errors.push({ field: `lesson-${index}`, message: `Lesson ${index + 1} content is empty`, severity: 'error' });
              }

              if (lesson.type === 'interactive' && !lesson.interactiveType) {
                errors.push({ field: `lesson-${index}`, message: `Lesson ${index + 1} missing interactive type`, severity: 'error' });
              }

              if (lesson.type === 'quiz' && (!lesson.questions || lesson.questions.length === 0)) {
                errors.push({ field: `lesson-${index}`, message: `Lesson ${index + 1} has no quiz questions`, severity: 'error' });
              }

              if (lesson.type === 'practical' && !lesson.practicalType) {
                errors.push({ field: `lesson-${index}`, message: `Lesson ${index + 1} missing practical type`, severity: 'error' });
              }
            });
            break;

          case 4: // Review (already validated in previous steps)
            break;
        }

        return errors;
      },

      validateAll: () => {
        const errors: ValidationError[] = [];
        for (let step = 1; step <= 4; step++) {
          errors.push(...get().validateStep(step));
        }
        return errors;
      },

      // Utilities
      markClean: () => set({ isDirty: false }),
      markDirty: () => set({ isDirty: true }),

      resetStore: () => {
        set({
          currentStep: 1,
          maxCompletedStep: 0,
          draft: { ...INITIAL_DRAFT },
          isDirty: false,
          isSaving: false,
          isSubmitting: false,
          lastSaved: null,
          validationErrors: [],
        });
      },
    }),
    {
      name: 'course-creation-storage',
      partialize: (state) => ({
        draft: state.draft,
        currentStep: state.currentStep,
        maxCompletedStep: state.maxCompletedStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
