/**
 * AI Query Hooks
 *
 * React Query hooks for AI-powered features including course generation,
 * chatbot tutoring, recommendations, and quota management.
 *
 * Features:
 * - Automatic caching with React Query
 * - Loading and error state management
 * - Toast notifications for user feedback
 * - Optimistic updates where applicable
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  generateCourse,
  generateQuiz,
  chatWithTutor,
  getRecommendations,
  getAIQuota,
  createChatSession,
  getChatHistory,
  provideFeedback,
  isAIEnabled,
  type CoursePrompt,
  type ChatContext,
  type ChatMessage,
  type ChatResponse,
  type CourseRecommendation,
  type QuizContent,
  type GeneratedCourse,
  type AIQuota,
  RateLimitError,
  AuthenticationError,
  ValidationError,
} from '../lib/ai/ai-service';
import { useAuth } from './useAuth';

// ============================================================================
// Query Keys
// ============================================================================

export const aiKeys = {
  all: ['ai'] as const,
  quota: (type: string) => [...aiKeys.all, 'quota', type] as const,
  recommendations: (userId: string) => [...aiKeys.all, 'recommendations', userId] as const,
  chatSession: (sessionId: string) => [...aiKeys.all, 'chat', sessionId] as const,
  chatHistory: (sessionId: string) => [...aiKeys.chatSession(sessionId), 'history'] as const,
};

// ============================================================================
// Course Generation
// ============================================================================

/**
 * Hook to generate a complete course using AI
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error } = useGenerateCourse();
 *
 * const handleGenerate = () => {
 *   mutate({
 *     track: 'explorer',
 *     difficulty: 'beginner',
 *     topic: 'Understanding Stablecoins for Remittances',
 *   }, {
 *     onSuccess: (course) => {
 *       console.log('Generated course:', course);
 *       navigate(`/courses/${course.id}`);
 *     }
 *   });
 * };
 * ```
 */
export function useGenerateCourse(
  onProgress?: (status: string) => void
): UseMutationResult<GeneratedCourse, Error, CoursePrompt> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prompt: CoursePrompt) => generateCourse(prompt, onProgress),
    onSuccess: (data) => {
      toast.success('Course generated successfully!', {
        description: `"${data.title}" is ready for review`,
      });

      // Invalidate courses cache to show new course
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: Error) => {
      if (error instanceof RateLimitError) {
        toast.error('Rate limit exceeded', {
          description: 'You can generate 5 courses per hour. Please try again later.',
        });
      } else if (error instanceof AuthenticationError) {
        toast.error('Authentication required', {
          description: 'Please sign in to generate courses',
        });
      } else if (error instanceof ValidationError) {
        toast.error('Invalid input', {
          description: error.message,
        });
      } else {
        toast.error('Course generation failed', {
          description: error.message || 'An unexpected error occurred',
        });
      }
    },
  });
}

// ============================================================================
// Quiz Generation
// ============================================================================

/**
 * Hook to generate quiz questions from lesson content
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useGenerateQuiz();
 *
 * mutate({
 *   lessonContent: 'Blockchain is a distributed ledger...',
 *   difficulty: 'beginner',
 * });
 * ```
 */
export function useGenerateQuiz(): UseMutationResult<
  QuizContent,
  Error,
  { lessonContent: string; difficulty: 'beginner' | 'intermediate' | 'advanced' }
> {
  return useMutation({
    mutationFn: ({ lessonContent, difficulty }) => generateQuiz(lessonContent, difficulty),
    onSuccess: () => {
      toast.success('Quiz generated successfully!');
    },
    onError: (error: Error) => {
      if (error instanceof RateLimitError) {
        toast.error('Rate limit exceeded', {
          description: 'Please try again in a few minutes',
        });
      } else {
        toast.error('Quiz generation failed', {
          description: error.message,
        });
      }
    },
  });
}

// ============================================================================
// AI Chat Tutor
// ============================================================================

/**
 * Hook to create a new chat session
 *
 * @param courseId - Optional course context
 * @param lessonId - Optional lesson context
 */
export function useCreateChatSession(): UseMutationResult<
  string,
  Error,
  { courseId?: string; lessonId?: string }
> {
  return useMutation({
    mutationFn: ({ courseId, lessonId }) => createChatSession(courseId, lessonId),
    onError: (error: Error) => {
      toast.error('Failed to create chat session', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to fetch chat history for a session
 *
 * @param sessionId - Chat session ID
 * @param options - React Query options
 */
export function useChatHistory(
  sessionId: string | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<ChatMessage[], Error> {
  return useQuery({
    queryKey: aiKeys.chatHistory(sessionId || ''),
    queryFn: () => getChatHistory(sessionId!),
    enabled: !!sessionId && (options?.enabled !== false),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to send a message to AI tutor
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useChatWithTutor(sessionId);
 *
 * mutate({
 *   message: 'How does blockchain consensus work?',
 *   context: { courseId: 'course_001', lessonId: '001_lesson_3' }
 * });
 * ```
 */
export function useChatWithTutor(
  sessionId: string
): UseMutationResult<ChatResponse, Error, { message: string; context?: ChatContext }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ message, context }) => chatWithTutor(message, context),
    onSuccess: () => {
      // Refetch chat history to show new messages
      queryClient.invalidateQueries({ queryKey: aiKeys.chatHistory(sessionId) });
    },
    onError: (error: Error) => {
      if (error instanceof RateLimitError) {
        toast.error('Too many messages', {
          description: 'You can send 20 messages per hour. Please slow down.',
        });
      } else {
        toast.error('Failed to send message', {
          description: error.message,
        });
      }
    },
  });
}

/**
 * Hook to provide feedback on AI response
 */
export function useProvideFeedback(): UseMutationResult<
  void,
  Error,
  { messageId: string; helpful: boolean; feedback?: string }
> {
  return useMutation({
    mutationFn: ({ messageId, helpful, feedback }) =>
      provideFeedback(messageId, helpful, feedback),
    onSuccess: (_, variables) => {
      const emoji = variables.helpful ? '👍' : '👎';
      toast.success(`Feedback received ${emoji}`, {
        description: 'Thank you for helping us improve!',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to save feedback', {
        description: error.message,
      });
    },
  });
}

// ============================================================================
// Course Recommendations
// ============================================================================

/**
 * Hook to fetch personalized course recommendations
 *
 * @param userId - User ID to fetch recommendations for
 */
export function useCourseRecommendations(
  userId: string | undefined
): UseQueryResult<CourseRecommendation[], Error> {
  return useQuery({
    queryKey: aiKeys.recommendations(userId || ''),
    queryFn: () => getRecommendations(userId!),
    enabled: !!userId && isAIEnabled(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (recommendations don't change often)
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// AI Quota Management
// ============================================================================

/**
 * Hook to check user's remaining AI generation quota
 *
 * @param generationType - Type of generation to check quota for
 *
 * @example
 * ```tsx
 * const { data: quota, isLoading } = useAIQuota('course');
 *
 * if (quota && quota.remaining === 0) {
 *   return <p>You've reached your hourly limit. Try again later.</p>;
 * }
 * ```
 */
export function useAIQuota(
  generationType: 'course' | 'quiz' | 'chat' | 'recommendation' = 'course'
): UseQueryResult<AIQuota, Error> {
  const { user } = useAuth();

  return useQuery({
    queryKey: aiKeys.quota(generationType),
    queryFn: () => getAIQuota(generationType),
    enabled: !!user && isAIEnabled(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// ============================================================================
// Feature Flag Check
// ============================================================================

/**
 * Hook to check if AI features are enabled
 *
 * @returns true if AI features are enabled in environment
 */
export function useIsAIEnabled(): boolean {
  return isAIEnabled();
}

// ============================================================================
// Helper Types (Re-export for convenience)
// ============================================================================

export type {
  CoursePrompt,
  ChatContext,
  ChatMessage,
  ChatResponse,
  CourseRecommendation,
  QuizContent,
  GeneratedCourse,
  AIQuota,
};
