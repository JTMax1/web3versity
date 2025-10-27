/**
 * Gemini AI Client Configuration
 *
 * Provides a configured Google Generative AI client for Web3Versity.
 * This file should only be used server-side (Supabase Edge Functions)
 * to protect the API key.
 *
 * Free Tier Limits:
 * - 15 requests per minute (RPM)
 * - 1,500 requests per day
 * - 1 million tokens per minute
 *
 * @see https://ai.google.dev/pricing
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Validate API key is available
if (!import.meta.env.GEMINI_API_KEY && typeof process !== 'undefined' && !process.env.GEMINI_API_KEY) {
  console.warn(
    'GEMINI_API_KEY not found. AI features will not work. ' +
    'Get your free API key from https://ai.google.dev/'
  );
}

// Initialize the Gemini AI client
const apiKey = import.meta.env.GEMINI_API_KEY ||
                (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Configured Gemini model for course generation and content creation
 *
 * Model: gemini-1.5-pro-latest
 * - Best balance of quality, speed, and context window (32K tokens)
 * - Supports JSON mode for structured outputs
 * - Multimodal capabilities (text + images)
 */
export const geminiModel: GenerativeModel | null = genAI ? genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
  generationConfig: {
    temperature: 0.7,           // Balance creativity (0.0) vs randomness (1.0)
    topP: 0.9,                  // Nucleus sampling - consider top 90% probable tokens
    topK: 40,                   // Consider top 40 tokens at each step
    maxOutputTokens: 8192,      // Maximum response length (~6,000 words)
    responseMimeType: 'application/json', // Force JSON output for structured data
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
}) : null;

/**
 * Configured Gemini model for chatbot tutoring
 *
 * Optimized for conversational responses with lower temperature
 * for more consistent and helpful educational responses
 */
export const geminiChatModel: GenerativeModel | null = genAI ? genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
  generationConfig: {
    temperature: 0.6,           // Slightly lower for more consistent responses
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,      // Shorter responses for chat (~1,500 words)
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
}) : null;

/**
 * Check if AI features are enabled and configured
 */
export function isAIEnabled(): boolean {
  return genAI !== null && import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';
}

/**
 * Export types for use in other files
 */
export type { GenerativeModel };
