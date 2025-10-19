/**
 * Supabase Client Configuration
 *
 * This module initializes and exports a configured Supabase client instance.
 * The client is a singleton that's shared across the entire application.
 *
 * Features:
 * - Type-safe database operations
 * - Automatic auth persistence via localStorage
 * - Configured for Web3Versity database schema
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase/client';
 *   const { data, error } = await supabase.from('users').select('*');
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config';

/**
 * Supabase Client Instance
 *
 * This is a singleton instance configured with:
 * - Project URL from environment
 * - Anonymous/public key from environment
 * - localStorage for auth persistence
 * - TypeScript types for all database tables
 */
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      // Persist auth session in localStorage
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,

      // Auto-refresh tokens
      autoRefreshToken: true,

      // Persist session across page reloads
      persistSession: true,

      // Detect session from URL (for OAuth flows in future)
      detectSessionInUrl: true,
    },

    // Global configuration
    global: {
      headers: {
        'x-application-name': 'Web3Versity',
      },
    },

    // Database configuration
    db: {
      schema: 'public',
    },

    // Realtime configuration (for future real-time features)
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Type-safe table accessor helper
 *
 * Provides autocomplete for table names and ensures type safety.
 *
 * @example
 * ```typescript
 * const users = table('users');
 * const { data, error } = await users.select('*');
 * ```
 */
export function table<T extends keyof Database['public']['Tables']>(tableName: T) {
  return supabase.from(tableName);
}

/**
 * Check if Supabase client is properly initialized
 */
export function isSupabaseConfigured(): boolean {
  try {
    return !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  } catch {
    return false;
  }
}

/**
 * Get current auth session
 *
 * Returns null if no active session.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return session;
}

/**
 * Get current authenticated user
 *
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Database query helper with error handling
 *
 * Wraps Supabase queries with consistent error handling.
 *
 * @example
 * ```typescript
 * const users = await query(
 *   supabase.from('users').select('*').eq('is_active', true)
 * );
 * ```
 */
export async function query<T>(
  queryBuilder: PromiseLike<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Database query error:', error);
    throw error;
  }

  if (data === null) {
    throw new Error('Query returned no data');
  }

  return data;
}

/**
 * Check database connection
 *
 * Performs a simple query to verify connectivity.
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('platform_settings').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Development utilities
 */
export const supabaseUtils = {
  /**
   * Log current configuration (development only)
   */
  logConfig(): void {
    if (!env.IS_DEVELOPMENT) {
      console.warn('⚠️ Cannot log config in production');
      return;
    }

    console.log('📊 Supabase Configuration:');
    console.table({
      'URL': env.SUPABASE_URL,
      'Anon Key': env.SUPABASE_ANON_KEY.substring(0, 20) + '...',
      'Configured': isSupabaseConfigured(),
    });
  },

  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    console.log('🔍 Testing Supabase connection...');

    const isConnected = await checkConnection();

    if (isConnected) {
      console.log('✅ Supabase connection successful!');
    } else {
      console.error('❌ Supabase connection failed!');
    }
  },

  /**
   * Get table row count (development only)
   */
  async getTableCount(tableName: keyof Database['public']['Tables']): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error counting rows in ${tableName}:`, error);
      return 0;
    }
  },

  /**
   * Get database statistics
   */
  async getStats(): Promise<Record<string, number>> {
    console.log('📊 Fetching database statistics...');

    const tables: Array<keyof Database['public']['Tables']> = [
      'users',
      'courses',
      'lessons',
      'user_progress',
      'achievements',
      'discussions',
    ];

    const stats: Record<string, number> = {};

    for (const table of tables) {
      stats[table] = await this.getTableCount(table);
    }

    console.table(stats);
    return stats;
  },
};

// Log configuration in development
if (env.IS_DEVELOPMENT) {
  console.log('🔧 Supabase client initialized');
  console.log(`   URL: ${env.SUPABASE_URL}`);
  console.log(`   Key: ${env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
}

// Export default client
export default supabase;
