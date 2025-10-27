/**
 * AI Service - Frontend API Wrapper
 *
 * Provides type-safe functions to interact with AI features via Supabase Edge Functions.
 * Handles authentication, error handling, and retry logic.
 *
 * Features:
 * - Course generation
 * - Quiz generation
 * - Chat with AI tutor
 * - Personalized recommendations
 * - Content quality analysis
 */

import { supabase } from '../supabase/client';

// ===================
// Types & Interfaces
// ===================

export interface CoursePrompt {
  track: 'explorer' | 'developer';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  description?: string;
  customRequirements?: string;
  targetLessons?: number; // 6-12 recommended
}

export interface ChatContext {
  courseId?: string;
  lessonId?: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  message: string;
  messageId: string;
  suggestions?: string[]; // Follow-up question suggestions
}

export interface CourseRecommendation {
  courseId: string;
  reasoning: string;
  confidenceScore: number; // 0-100
  prerequisitesMet: string[];
}

export interface QuizContent {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

export interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  track: 'explorer' | 'developer';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedHours: number;
  thumbnailEmoji: string;
  prerequisites: string[];
  learningObjectives: string[];
  targetAudience: string;
  lessons: any[]; // Detailed type in course-schema.ts
}

export interface AIQuota {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}

// ===================
// Error Classes
// ===================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends AIServiceError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AIServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

// ===================
// Helper Functions
// ===================

/**
 * Get authenticated user's JWT token from Supabase session
 */
async function getAuthToken(): Promise<string> {
  // Get current Supabase session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new AuthenticationError('Failed to retrieve authentication session');
  }

  if (!session) {
    throw new AuthenticationError('Please connect your wallet to use AI features');
  }

  // Verify session is still valid
  if (!session.access_token) {
    throw new AuthenticationError('Invalid authentication session');
  }

  // Check if session is expired
  const expiresAt = session.expires_at;
  if (expiresAt && Date.now() / 1000 > expiresAt) {
    throw new AuthenticationError('Authentication session expired. Please reconnect your wallet.');
  }

  return session.access_token;
}

/**
 * Call Supabase Edge Function with retry logic
 */
async function callEdgeFunction<T>(
  functionName: string,
  body: any,
  maxRetries: number = 3
): Promise<T> {
  const token = await getAuthToken(); // Get Supabase JWT token

  // Get Supabase URL and anon key from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new AuthenticationError('Supabase configuration missing');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use direct fetch instead of supabase.functions.invoke
      // This matches the working test-ai-prompt.html implementation
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(body), // Direct JSON.stringify, no parse/stringify cycle
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        throw new AIServiceError(
          `Edge Function returned a non-2xx status code: ${response.status} ${response.statusText}. Response: ${errorText}`,
          'REQUEST_FAILED',
          response.status
        );
      }

      // Parse response
      const data = await response.json();

      // Check if data contains an error property
      if (data && (data as any).error) {
        const errorMessage = (data as any).error.message || (data as any).error.toString();

        // Check for specific error types
        if (errorMessage.includes('Rate limit')) {
          throw new RateLimitError(errorMessage);
        } else if (errorMessage.includes('authorization') || errorMessage.includes('token') || errorMessage.includes('Unauthorized')) {
          throw new AuthenticationError(errorMessage);
        } else if (errorMessage.includes('invalid') || errorMessage.includes('Missing')) {
          throw new ValidationError(errorMessage);
        }

        throw new AIServiceError(
          errorMessage || 'AI service request failed',
          'REQUEST_FAILED',
          500
        );
      }

      return data as T;

    } catch (error: any) {
      lastError = error;

      // Don't retry on auth or rate limit errors
      if (
        error instanceof AuthenticationError ||
        error instanceof RateLimitError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      // Exponential backoff for network errors
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new AIServiceError('Max retries exceeded', 'MAX_RETRIES_EXCEEDED');
}

// ===================
// Public API Functions
// ===================

/**
 * Generate a complete course using AI
 *
 * @param prompt - Course generation parameters
 * @param onProgress - Optional callback for progress updates
 * @returns Generated course data
 *
 * @throws {RateLimitError} If user has exceeded rate limit (5/hour)
 * @throws {AuthenticationError} If user is not authenticated
 * @throws {ValidationError} If prompt is invalid
 */
export async function generateCourse(
  prompt: CoursePrompt,
  onProgress?: (status: string) => void
): Promise<GeneratedCourse> {
  // Validate prompt
  if (!prompt.topic || prompt.topic.trim().length < 10) {
    throw new ValidationError('Topic must be at least 10 characters long');
  }

  if (prompt.targetLessons && (prompt.targetLessons < 5 || prompt.targetLessons > 20)) {
    throw new ValidationError('Target lessons must be between 5 and 20');
  }

  onProgress?.('Connecting to AI...');

  try {
    // Send raw prompt object (Edge Function will handle stringification)
    const requestBody = {
      prompt: prompt, // ✅ Raw JSON, not stringified
      type: 'course',
    };

    onProgress?.('Generating course structure...');

    const result = await callEdgeFunction<GeneratedCourse>('ai-generate', requestBody);

    onProgress?.('Validating content...');

    return result;

  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    throw new AIServiceError(
      error instanceof Error ? error.message : 'Failed to generate course',
      'GENERATION_FAILED'
    );
  }
}

/**
 * Generate quiz questions from lesson content
 *
 * @param lessonContent - The lesson content to generate quiz from
 * @param difficulty - Quiz difficulty level
 * @returns Generated quiz questions
 */
export async function generateQuiz(
  lessonContent: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<QuizContent> {
  if (!lessonContent || lessonContent.trim().length < 100) {
    throw new ValidationError('Lesson content must be at least 100 characters');
  }

  const requestBody = {
    prompt: { lessonContent, difficulty }, // ✅ Raw JSON, not stringified
    type: 'quiz',
  };

  return await callEdgeFunction<QuizContent>('ai-generate', requestBody);
}

/**
 * Send a message to AI tutor and get response
 *
 * @param message - User's question or message
 * @param context - Optional context (current course/lesson, history)
 * @returns AI tutor's response
 *
 * @throws {RateLimitError} If user has exceeded rate limit (20/hour for chat)
 */
export async function chatWithTutor(
  message: string,
  context?: ChatContext
): Promise<ChatResponse> {
  if (!message || message.trim().length < 3) {
    throw new ValidationError('Message must be at least 3 characters');
  }

  if (message.length > 1000) {
    throw new ValidationError('Message must be less than 1000 characters');
  }

  const requestBody = {
    prompt: { message, context }, // ✅ Raw JSON, not stringified
    type: 'chat',
  };

  return await callEdgeFunction<ChatResponse>('ai-generate', requestBody);
}

/**
 * Get personalized course recommendations for user
 *
 * @param userId - User ID to generate recommendations for
 * @returns Array of recommended courses with reasoning
 *
 * @throws {RateLimitError} If user has exceeded rate limit (5/hour)
 */
export async function getRecommendations(
  userId: string
): Promise<CourseRecommendation[]> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const requestBody = {
    prompt: { userId }, // ✅ Raw JSON, not stringified
    type: 'recommendation',
  };

  return await callEdgeFunction<CourseRecommendation[]>('ai-generate', requestBody);
}

/**
 * Get user's remaining AI generation quota
 *
 * @param generationType - Type of generation to check quota for
 * @returns Quota information
 */
export async function getAIQuota(
  generationType: 'course' | 'quiz' | 'chat' | 'recommendation' = 'course'
): Promise<AIQuota> {
  // Get session to access user metadata
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new AuthenticationError();
  }

  // Extract our custom user ID from session metadata
  const userId = session.user.user_metadata?.user_id;
  if (!userId) {
    throw new AuthenticationError('User ID not found in session');
  }

  const { data, error } = await (supabase as any).rpc('get_user_ai_quota', {
    p_user_id: userId,
    p_generation_type: generationType,
  });

  if (error) {
    throw new AIServiceError('Failed to fetch quota', 'QUOTA_CHECK_FAILED');
  }

  return data as AIQuota;
}

/**
 * Create a new chat session
 *
 * @param courseId - Optional course context
 * @param lessonId - Optional lesson context
 * @returns Session ID
 */
export async function createChatSession(
  courseId?: string,
  lessonId?: string
): Promise<string> {
  // Get session to access user metadata
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new AuthenticationError();
  }

  // Extract our custom user ID from session metadata
  const userId = session.user.user_metadata?.user_id;
  if (!userId) {
    throw new AuthenticationError('User ID not found in session');
  }

  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert({
      user_id: userId,
      course_id: courseId || null,
      lesson_id: lessonId || null,
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      message_count: 0,
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new AIServiceError('Failed to create chat session', 'SESSION_CREATE_FAILED');
  }

  return data.id;
}

/**
 * Get chat history for a session
 *
 * @param sessionId - Chat session ID
 * @param limit - Maximum number of messages to fetch
 * @returns Array of chat messages
 */
export async function getChatHistory(
  sessionId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new AIServiceError('Failed to fetch chat history', 'HISTORY_FETCH_FAILED');
  }

  return (data || []).map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.created_at,
  }));
}

/**
 * Provide feedback on AI tutor response
 *
 * @param messageId - Message ID to provide feedback for
 * @param helpful - Was the response helpful?
 * @param feedback - Optional detailed feedback
 */
export async function provideFeedback(
  messageId: string,
  helpful: boolean,
  feedback?: string
): Promise<void> {
  const { error } = await supabase
    .from('ai_chat_messages')
    .update({
      helpful,
      helpful_feedback: feedback || null,
    })
    .eq('id', messageId);

  if (error) {
    throw new AIServiceError('Failed to save feedback', 'FEEDBACK_SAVE_FAILED');
  }
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';
}
