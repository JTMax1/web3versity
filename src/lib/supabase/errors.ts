/**
 * Supabase Error Handling Utilities
 *
 * This module provides helper functions for handling Supabase errors
 * and converting them to user-friendly messages.
 */

import { PostgrestError } from '@supabase/supabase-js';

/**
 * Custom error class for Supabase operations
 */
export class SupabaseError extends Error {
  code: string;
  details: string;
  hint: string;
  originalError?: any;

  constructor(message: string, code: string, details: string = '', hint: string = '', originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
    this.code = code;
    this.details = details;
    this.hint = hint;
    this.originalError = originalError;
  }
}

/**
 * Error codes we want to handle specifically
 */
export const ERROR_CODES = {
  // Connection errors
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Data errors
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  INVALID_DATA: 'INVALID_DATA',

  // Database errors
  QUERY_ERROR: 'QUERY_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',

  // Generic
  UNKNOWN: 'UNKNOWN',
} as const;

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the database. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT]: 'The operation took too long. Please try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You need to log in to perform this action.',
  [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.DUPLICATE]: 'This item already exists.',
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 'This operation violates data constraints.',
  [ERROR_CODES.INVALID_DATA]: 'The provided data is invalid.',
  [ERROR_CODES.QUERY_ERROR]: 'Failed to fetch data from the database.',
  [ERROR_CODES.TRANSACTION_ERROR]: 'Failed to complete the transaction.',
  [ERROR_CODES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Map Postgrest error codes to our error codes
 */
function mapPostgrestErrorCode(postgrestCode: string): string {
  // PostgreSQL error codes
  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html

  if (postgrestCode.startsWith('08')) {
    return ERROR_CODES.CONNECTION_ERROR;
  }

  if (postgrestCode === '23505') {
    // unique_violation
    return ERROR_CODES.DUPLICATE;
  }

  if (postgrestCode.startsWith('23')) {
    // integrity_constraint_violation
    return ERROR_CODES.CONSTRAINT_VIOLATION;
  }

  if (postgrestCode === 'PGRST116') {
    // Row not found
    return ERROR_CODES.NOT_FOUND;
  }

  if (postgrestCode === 'PGRST301') {
    // JWT expired
    return ERROR_CODES.SESSION_EXPIRED;
  }

  if (postgrestCode === 'PGRST204') {
    // No authorization
    return ERROR_CODES.UNAUTHORIZED;
  }

  return ERROR_CODES.UNKNOWN;
}

/**
 * Parse Postgrest error into a SupabaseError
 */
export function parsePostgrestError(error: PostgrestError): SupabaseError {
  const code = mapPostgrestErrorCode(error.code);
  const message = ERROR_MESSAGES[code] || error.message;

  return new SupabaseError(
    message,
    code,
    error.details || '',
    error.hint || '',
    error
  );
}

/**
 * Handle any Supabase error and return a SupabaseError
 */
export function handleSupabaseError(error: any): SupabaseError {
  // Already a SupabaseError
  if (error instanceof SupabaseError) {
    return error;
  }

  // Postgrest error
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return parsePostgrestError(error as PostgrestError);
  }

  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new SupabaseError(
      ERROR_MESSAGES[ERROR_CODES.CONNECTION_ERROR],
      ERROR_CODES.CONNECTION_ERROR,
      'Network request failed',
      'Check your internet connection',
      error
    );
  }

  // Generic error
  return new SupabaseError(
    error?.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN],
    ERROR_CODES.UNKNOWN,
    '',
    '',
    error
  );
}

/**
 * Get a user-friendly error message from any error
 */
export function getErrorMessage(error: any): string {
  const supabaseError = handleSupabaseError(error);
  return supabaseError.message;
}

/**
 * Check if an error is a specific type
 */
export function isErrorType(error: any, errorCode: string): boolean {
  const supabaseError = handleSupabaseError(error);
  return supabaseError.code === errorCode;
}

/**
 * Error logging helper for development
 */
export function logError(error: any, context?: string): void {
  const supabaseError = handleSupabaseError(error);

  console.group(`❌ Supabase Error${context ? `: ${context}` : ''}`);
  console.error('Message:', supabaseError.message);
  console.error('Code:', supabaseError.code);

  if (supabaseError.details) {
    console.error('Details:', supabaseError.details);
  }

  if (supabaseError.hint) {
    console.error('Hint:', supabaseError.hint);
  }

  if (supabaseError.originalError) {
    console.error('Original Error:', supabaseError.originalError);
  }

  console.groupEnd();
}

/**
 * Retry helper for transient errors
 */
export async function retryOnError<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const supabaseError = handleSupabaseError(error);

      // Don't retry on certain errors
      const nonRetryableErrors = [
        ERROR_CODES.UNAUTHORIZED,
        ERROR_CODES.FORBIDDEN,
        ERROR_CODES.NOT_FOUND,
        ERROR_CODES.DUPLICATE,
        ERROR_CODES.CONSTRAINT_VIOLATION,
        ERROR_CODES.INVALID_DATA,
      ];

      if (nonRetryableErrors.includes(supabaseError.code)) {
        throw supabaseError;
      }

      // Last attempt - throw the error
      if (attempt === maxRetries) {
        throw supabaseError;
      }

      // Wait before retrying (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleSupabaseError(lastError);
}

/**
 * Validate error response
 *
 * Helper to check if a Supabase response has an error
 */
export function hasError<T>(response: { data: T | null; error: any }): response is { data: null; error: any } {
  return response.error !== null;
}

/**
 * Assert no error in response
 *
 * Throws if there's an error, otherwise returns the data
 */
export function assertNoError<T>(response: { data: T | null; error: any }): T {
  if (hasError(response)) {
    throw handleSupabaseError(response.error);
  }

  if (response.data === null) {
    throw new SupabaseError(
      'Query returned no data',
      ERROR_CODES.NOT_FOUND,
      'The query completed successfully but returned no data',
      'Check if the resource exists'
    );
  }

  return response.data;
}

/**
 * Safe query wrapper
 *
 * Wraps a Supabase query with error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<T> {
  try {
    const response = await queryFn();
    return assertNoError(response);
  } catch (error) {
    if (context) {
      logError(error, context);
    }
    throw handleSupabaseError(error);
  }
}

/**
 * Error boundary helper for React components
 *
 * Usage in error boundary:
 * ```typescript
 * const errorInfo = getErrorInfo(error);
 * ```
 */
export function getErrorInfo(error: any): {
  message: string;
  code: string;
  details: string;
  canRetry: boolean;
} {
  const supabaseError = handleSupabaseError(error);

  const retryableErrors = [
    ERROR_CODES.CONNECTION_ERROR,
    ERROR_CODES.TIMEOUT,
    ERROR_CODES.QUERY_ERROR,
    ERROR_CODES.TRANSACTION_ERROR,
  ];

  return {
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    canRetry: retryableErrors.includes(supabaseError.code as any),
  };
}
