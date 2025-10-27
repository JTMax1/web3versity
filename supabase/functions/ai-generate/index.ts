/**
 * Supabase Edge Function: AI Generate
 *
 * Securely handles Gemini API calls from the frontend without exposing API keys.
 * Implements authentication, rate limiting, and usage logging.
 *
 * Endpoints:
 * POST /ai-generate
 *   Body: { prompt: object | string, type: 'course' | 'quiz' | 'chat' | 'recommendation' }
 *   Returns: Generated content as JSON
 *
 * Rate Limits:
 * - 5 generations per hour per user (course/quiz/recommendation)
 * - 20 chat messages per hour per user
 * - Respects Gemini free tier (15 RPM, 1500/day)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCourseGenerationPrompt } from './prompts.ts';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
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

  // Dynamically import NEW Gemini SDK (@google/genai)
  const { GoogleGenAI } = await import('npm:@google/genai@1.27.0');

  console.log('🔧 Initializing GoogleGenAI client...');
  const ai = new GoogleGenAI({ apiKey });

  // Generate content
  console.log('📊 Sending request to Gemini API...');
  console.log('  - Model: gemini-2.0-flash');
  console.log('  - Prompt length:', prompt.length, 'chars');
  console.log('  - Estimated tokens:', Math.ceil(prompt.length / 4));

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash', // Stable production model (not experimental)
    contents: prompt, // Can be string or structured content array
    config: {
      responseMimeType: 'application/json', // Request JSON output
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
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
    },
  });

  console.log('✅ Gemini API request completed');
  const response = result;

  console.log('\n=== 🔍 GEMINI API RESPONSE DIAGNOSTICS ===');

  // 1. Check if we have candidates (new SDK structure)
  const candidates = response.candidates;
  console.log('📋 Candidates:', candidates ? candidates.length : 0);

  if (!candidates || candidates.length === 0) {
    console.error('❌ No candidates returned by Gemini API');
    console.error('Full response object:', JSON.stringify(response, null, 2));
    throw new Error('Gemini API returned no candidates. This may indicate a prompt issue or API error.');
  }

  // 2. Check finishReason (CRITICAL: must check before accessing text)
  const candidate = candidates[0];
  const finishReason = candidate.finishReason;
  console.log('🏁 Finish Reason:', finishReason);

  // 3. Handle different finish reasons
  if (finishReason === 'SAFETY') {
    const safetyRatings = candidate.safetyRatings;
    console.error('❌ Content blocked by safety filter');
    console.error('Safety ratings:', JSON.stringify(safetyRatings, null, 2));
    throw new Error(
      'Content generation blocked by Gemini safety filters. ' +
      'The prompt may contain sensitive topics. Please try rephrasing your request.'
    );
  }

  if (finishReason === 'RECITATION') {
    console.error('❌ Content blocked due to recitation (copyrighted material)');
    throw new Error(
      'Content generation blocked due to potential copyright issues. ' +
      'Please use more original phrasing in your topic.'
    );
  }

  if (finishReason === 'MAX_TOKENS') {
    console.error('❌ Response exceeded maximum token limit');
    console.error('Usage metadata:', response.usageMetadata);
    throw new Error(
      'Response too long - exceeded token limit. ' +
      'Try reducing the number of target lessons or simplifying the topic.'
    );
  }

  if (finishReason === 'BLOCKLIST' || finishReason === 'PROHIBITED_CONTENT') {
    console.error('❌ Content blocked - contains prohibited terms');
    throw new Error(
      'Content generation blocked due to prohibited content. ' +
      'Please avoid restricted topics.'
    );
  }

  if (finishReason !== 'STOP' && finishReason) {
    console.warn(`⚠️ Unexpected finish reason: ${finishReason}`);
  }

  // 4. Get text content (new SDK has simple .text property)
  console.log('🔍 Attempting to extract text from response...');
  console.log('Response type:', typeof response);
  console.log('Response keys:', Object.keys(response || {}));

  // Log full response structure for debugging
  console.log('Full response object:', JSON.stringify(response, null, 2).slice(0, 500));

  let text: string;
  try {
    console.log('Accessing response.text property...');
    // New SDK provides direct .text property (not a function!)
    text = response.text;
    console.log('✅ response.text accessed successfully');
    console.log('Text value:', text ? `${text.length} chars` : 'undefined/empty');
  } catch (textError: any) {
    console.error('❌ Failed to extract text from response');
    console.error('Error:', textError.message);
    console.error('Error stack:', textError.stack);
    console.error('Response structure:', JSON.stringify(response, null, 2).slice(0, 1000));
    throw new Error(`Failed to extract text from Gemini response: ${textError.message}`);
  }

  // 5. Validate text content
  console.log('📝 Text extracted successfully');
  console.log('  - Length:', text?.length || 0, 'chars');
  console.log('  - First 100 chars:', text?.slice(0, 100));
  console.log('  - Last 100 chars:', text?.slice(-100));

  if (!text || text.trim() === '') {
    console.error('❌ Gemini returned empty text');
    console.error('Finish reason was:', finishReason);
    console.error('Full response:', JSON.stringify(response, null, 2));
    throw new Error(
      'Gemini API returned empty response. This may be a temporary API issue. Please try again.'
    );
  }

  // 6. Handle potential markdown wrapping
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    console.log('⚠️ Removing markdown code block wrapper (```json)');
    cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleanedText.startsWith('```')) {
    console.log('⚠️ Removing markdown code block wrapper (```)');
    cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  // 7. Parse JSON
  console.log('🔄 Parsing JSON...');
  try {
    const parsed = JSON.parse(cleanedText);
    console.log('✅ JSON parsed successfully');
    console.log('  - Keys:', Object.keys(parsed).join(', '));

    // Log usage metadata (new SDK structure)
    if (response.usageMetadata) {
      console.log('📊 Token usage:');
      console.log('  - Prompt tokens:', response.usageMetadata.promptTokenCount || 'N/A');
      console.log('  - Response tokens:', response.usageMetadata.candidatesTokenCount || 'N/A');
      console.log('  - Total tokens:', response.usageMetadata.totalTokenCount || 'N/A');
    } else {
      console.log('⚠️ No usage metadata available');
    }

    console.log('=== ✅ GEMINI API CALL SUCCESSFUL ===\n');
    return parsed;

  } catch (parseError: any) {
    console.error('❌ JSON parsing failed');
    console.error('Parse error:', parseError.message);
    console.error('Text that failed to parse (first 500 chars):', cleanedText.slice(0, 500));
    console.error('Text that failed to parse (last 200 chars):', cleanedText.slice(-200));

    // Check if it looks like JSON but is malformed
    if (cleanedText.includes('{') && cleanedText.includes('}')) {
      console.error('⚠️ Text contains { } but is malformed JSON');
    }

    throw new Error(
      `Failed to parse Gemini response as JSON: ${parseError.message}. ` +
      `Preview: ${cleanedText.slice(0, 200)}...`
    );
  }
}

/**
 * Main handler function
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Store parsed data for error logging (body can only be read once!)
  let userContext: any = null;
  let requestBody: any = null;
  let actualPublicUserId: string | null = null; // Store the actual user ID from users table

  try {
    console.log('\n========================================');
    console.log('🚀 NEW AI GENERATION REQUEST');
    console.log('========================================\n');

    // 1. Authenticate user
    console.log('Step 1: Authenticating user...');
    const { user, supabase } = await authenticateUser(req);
    userContext = { user, supabase }; // Store for error handling
    console.log('✅ User authenticated:', user.id);

    // 1.5. SAFETY FALLBACK: Ensure user exists in public.users table
    // IMPORTANT: Check by EVM address first (handles migration from old auth system)
    console.log('Step 1.5: Checking if user exists in users table...');

    // Extract wallet info from user metadata
    const evmAddress = user.user_metadata?.evm_address || user.user_metadata?.wallet_address;
    const hederaAccountId = user.user_metadata?.hedera_account_id;

    if (!evmAddress) {
      console.error('❌ Cannot verify user - no EVM address in metadata');
      console.error('User metadata:', JSON.stringify(user.user_metadata, null, 2));
      throw new Error('No EVM address found in session metadata');
    }

    console.log('🔍 Looking up user by EVM address:', evmAddress.toLowerCase());

    // First, check if user exists by EVM address (handles old users from previous auth system)
    const { data: existingUserByWallet, error: walletCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('evm_address', evmAddress.toLowerCase())
      .maybeSingle();

    if (walletCheckError) {
      console.error('❌ Error checking user by wallet:', walletCheckError);
      throw new Error('Failed to verify user in database');
    }

    let actualUserId: string;

    if (existingUserByWallet) {
      // User exists with this wallet - this is an existing user (possibly from old auth system)
      console.log('✅ Found existing user by wallet:', existingUserByWallet.id);
      console.log('  👤 Username:', existingUserByWallet.username);
      console.log('  🔄 Auth ID:', user.id);
      console.log('  📊 Public User ID:', existingUserByWallet.id);

      actualUserId = existingUserByWallet.id;

      // Check if the IDs match
      if (existingUserByWallet.id !== user.id) {
        console.log('⚠️  Auth ID mismatch detected - this user migrated from old auth system');
        console.log('  🔄 Will use existing user ID:', actualUserId);
        console.log('  ℹ️  All courses, certificates, and progress preserved!');

        // Update last login timestamp
        const { error: updateError } = await supabase
          .from('users')
          .update({
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', actualUserId);

        if (updateError) {
          console.warn('⚠️  Could not update last login:', updateError);
        }
      } else {
        console.log('✅ User IDs match - user is using current auth system');
      }
    } else {
      // No user with this wallet - check if user exists by auth ID (new auth system)
      console.log('🔍 No user found by wallet, checking by auth ID...');

      const { data: existingUserById, error: idCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (idCheckError) {
        console.error('❌ Error checking user by ID:', idCheckError);
        throw new Error('Failed to verify user in database');
      }

      if (existingUserById) {
        // User exists with auth ID - already in new system
        console.log('✅ Found existing user by auth ID:', existingUserById.id);
        console.log('  👤 Username:', existingUserById.username);
        actualUserId = existingUserById.id;
      } else {
        // Truly new user - create record
        console.log('🆕 Creating new user record...');

        // Generate username
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const username = `Explorer_${randomNum}`;

        // Generate avatar emoji
        const emojis = ['👨‍💻', '👩‍💻', '🧑‍💻', '🦸', '🦹', '🧙', '🧝', '🧛', '🧞', '🧜', '🧚', '👨‍🚀', '👩‍🚀', '🧑‍🚀', '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦑'];
        const avatarEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Create user record
        const newUserData = {
          id: user.id, // Use the auth user's ID
          evm_address: evmAddress.toLowerCase(),
          hedera_account_id: hederaAccountId || null,
          username,
          email: user.email || null,
          avatar_emoji: avatarEmoji,
          bio: null,
          location: null,
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          courses_completed: 0,
          lessons_completed: 0,
          badges_earned: 0,
          last_login_at: new Date().toISOString(),
          is_active: true,
          is_verified: false,
          profile_public: true,
          show_on_leaderboard: true,
        };

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating user record:', insertError);
          throw new Error(`Failed to create user record: ${insertError.message}`);
        }

        console.log('✅ User record created successfully:', newUser.id);
        console.log('  👤 Username:', newUser.username);
        console.log('  💳 Wallet:', newUser.evm_address);

        actualUserId = newUser.id;
      }
    }

    console.log('✅ User verified. Using user ID:', actualUserId);

    // Store the actual user ID for logging later
    // (Override the auth user ID with the actual public.users ID)
    actualPublicUserId = actualUserId;

    // 2. Parse request body (can only be done once!)
    console.log('Step 2: Parsing request body...');

    // Add debugging for request body parsing
    const rawBody = await req.text();
    console.log('Raw request body length:', rawBody.length);
    console.log('Raw request body (first 500 chars):', rawBody.slice(0, 500));

    try {
      requestBody = JSON.parse(rawBody);
      console.log('✅ Request body parsed successfully');
      console.log('Request keys:', Object.keys(requestBody));
    } catch (parseError: any) {
      console.error('❌ Failed to parse request body as JSON');
      console.error('Parse error:', parseError.message);
      console.error('Raw body:', rawBody);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { prompt, type: generationType } = requestBody;

    console.log('Generation type:', generationType);
    console.log('Prompt type:', typeof prompt);
    console.log('Prompt value:', JSON.stringify(prompt, null, 2).slice(0, 200));

    if (!prompt) {
      throw new Error('Missing prompt');
    }

    if (!generationType || typeof generationType !== 'string') {
      throw new Error('Missing or invalid generation type');
    }

    // 2.5. Generate unique course ID (for course generation only)
    let generatedCourseId: string | null = null;

    if (generationType === 'course') {
      console.log('Step 2.5: Generating unique course ID...');

      // Generate timestamp-based ID with random suffix
      // Format: course_YYYYMMDD_XXXX (e.g., course_20250127_a3f9)
      const now = new Date();
      const dateStr = now.getFullYear().toString() +
                      (now.getMonth() + 1).toString().padStart(2, '0') +
                      now.getDate().toString().padStart(2, '0');

      // Generate 4-character random suffix (lowercase letters and numbers)
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let randomSuffix = '';
      for (let i = 0; i < 4; i++) {
        randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      generatedCourseId = `course_${dateStr}_${randomSuffix}`;

      console.log(`✅ Course ID generated: ${generatedCourseId}`);
      console.log(`   Format: course_YYYYMMDD_XXXX`);
      console.log(`   Date: ${dateStr}, Random: ${randomSuffix}`);
    }

    // 3. Build full prompt based on generation type
    console.log('Step 3: Building full prompt...');
    let fullPrompt: string;
    let promptForLogging: string;

    if (generationType === 'course') {
      // For course generation, prompt is a CoursePrompt object
      if (typeof prompt !== 'object') {
        throw new Error('Course generation requires a CoursePrompt object');
      }
      console.log('Building course generation prompt from:', JSON.stringify(prompt, null, 2));

      // Inject the generated course ID into the prompt
      const promptWithId = { ...prompt, generatedCourseId };

      fullPrompt = buildCourseGenerationPrompt(promptWithId);
      promptForLogging = `Course: ${prompt.topic} (${prompt.track}/${prompt.difficulty})`;
      console.log('✅ Prompt built successfully');
    } else {
      // For other types (quiz, chat, recommendation), prompt might be string or object
      fullPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
      promptForLogging = fullPrompt;
    }

    // 4. Check rate limit
    await checkRateLimit(supabase, user.id, generationType);

    // 5. Call Gemini API
    console.log(`Generating ${generationType} for user ${user.id}`);
    const startTime = Date.now();

    const generatedContent = await callGeminiAPI(fullPrompt);

    const duration = Date.now() - startTime;
    console.log(`Generation completed in ${duration}ms`);

    // 6. Log success (use actualPublicUserId to ensure correct user is logged)
    await logGeneration(supabase, actualPublicUserId, generationType, promptForLogging, true);

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

    // Log error if we have user context (don't try to re-read body!)
    if (userContext && requestBody) {
      try {
        // Build a safe prompt string for logging
        const promptForErrorLog = requestBody.type === 'course' && typeof requestBody.prompt === 'object'
          ? `Course: ${requestBody.prompt.topic || 'Unknown'}`
          : (typeof requestBody.prompt === 'string' ? requestBody.prompt : 'Invalid prompt');

        await logGeneration(
          userContext.supabase,
          actualPublicUserId || userContext.user.id,
          requestBody.type || 'unknown',
          promptForErrorLog,
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
