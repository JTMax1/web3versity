/**
 * Supabase Edge Function: AI Generate
 *
 * Securely handles Gemini API calls from the frontend without exposing API keys.
 * Implements authentication, rate limiting, and usage logging.
 *
 * Endpoints:
 * POST /ai-generate
 *   Body: { prompt: string, type: 'course' | 'quiz' | 'chat' | 'recommendation' }
 *   Returns: Generated content as JSON
 *
 * Rate Limits:
 * - 5 generations per hour per user (course/quiz/recommendation)
 * - 20 chat messages per hour per user
 * - Respects Gemini free tier (15 RPM, 1500/day)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

/**
 * Validate and extract user from JWT token
 */
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Create Supabase client with service role key (server-side)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Verify JWT and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return { user, supabase };
}

/**
 * Check if user has exceeded rate limit
 */
async function checkRateLimit(
  supabase: any,
  userId: string,
  generationType: string
): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Different limits for different types
  const limits: Record<string, number> = {
    course: 5,
    quiz: 5,
    recommendation: 5,
    chat: 20,
  };

  const limit = limits[generationType] || 5;

  const { count, error } = await supabase
    .from('ai_generation_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('generation_type', generationType)
    .gte('created_at', oneHourAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    throw new Error('Failed to check rate limit');
  }

  if ((count || 0) >= limit) {
    throw new Error(
      `Rate limit exceeded. You can make ${limit} ${generationType} requests per hour. ` +
      'Please try again later.'
    );
  }
}

/**
 * Log AI generation to database
 */
async function logGeneration(
  supabase: any,
  userId: string,
  generationType: string,
  prompt: string,
  success: boolean,
  errorMessage?: string,
  tokensUsed?: number
): Promise<void> {
  const { error } = await supabase.from('ai_generation_log').insert({
    user_id: userId,
    generation_type: generationType,
    prompt_data: { prompt: prompt.slice(0, 500) }, // Store first 500 chars only
    response_tokens: tokensUsed || null,
    success,
    error_message: errorMessage || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log generation:', error);
  }
}

/**
 * Call Gemini API (dynamic import to avoid loading at startup)
 */
async function callGeminiAPI(prompt: string): Promise<any> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not configured. Get your free API key from https://ai.google.dev/'
    );
  }

  // Dynamically import Gemini SDK
  const { GoogleGenerativeAI } = await import('npm:@google/generative-ai@0.1.3');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  });

  const result = await model.generateContent(prompt);
  const response = result.response;

  // Parse JSON response
  const text = response.text();
  return JSON.parse(text);
}

/**
 * Main handler function
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Authenticate user
    const { user, supabase } = await authenticateUser(req);

    // 2. Parse request body
    const body = await req.json();
    const { prompt, type: generationType } = body;

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Missing or invalid prompt');
    }

    if (!generationType || typeof generationType !== 'string') {
      throw new Error('Missing or invalid generation type');
    }

    // 3. Check rate limit
    await checkRateLimit(supabase, user.id, generationType);

    // 4. Call Gemini API
    console.log(`Generating ${generationType} for user ${user.id}`);
    const startTime = Date.now();

    const generatedContent = await callGeminiAPI(prompt);

    const duration = Date.now() - startTime;
    console.log(`Generation completed in ${duration}ms`);

    // 5. Log success
    await logGeneration(supabase, user.id, generationType, prompt, true);

    // 6. Return result
    return new Response(JSON.stringify(generatedContent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('AI generation error:', error);

    // Determine appropriate status code
    let status = 500;
    if (error.message.includes('Rate limit exceeded')) {
      status = 429;
    } else if (error.message.includes('authorization') || error.message.includes('token')) {
      status = 401;
    } else if (error.message.includes('Missing')) {
      status = 400;
    }

    // Log error if we have user context
    if (req.headers.get('Authorization')) {
      try {
        const { user, supabase } = await authenticateUser(req);
        const body = await req.json();
        await logGeneration(
          supabase,
          user.id,
          body.type || 'unknown',
          body.prompt || '',
          false,
          error.message
        );
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
