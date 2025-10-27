/**
 * User API Functions
 * Functions for managing user profile and settings
 */

import { supabase } from '../supabase/client';
import type { User } from '../supabase/types';

// ============================================================================
// Types
// ============================================================================

export interface UpdateUserProfileInput {
  username?: string;
  email?: string | null;
  avatar_emoji?: string;
  bio?: string;
  location?: string;
  profile_public?: boolean;
  show_on_leaderboard?: boolean;
}

export interface UpdateUserProfileResult {
  success: boolean;
  user?: User;
  error?: string;
}

// ============================================================================
// User Profile Functions
// ============================================================================

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: UpdateUserProfileInput
): Promise<UpdateUserProfileResult> {
  try {
    // Check if username is being updated and if it's already taken
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        return {
          success: false,
          error: 'Username is already taken'
        };
      }
    }

    // Check if email is being updated and if it's already taken
    if (updates.email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', updates.email)
        .neq('id', userId)
        .maybeSingle();

      if (existingEmail) {
        return {
          success: false,
          error: 'Email is already in use'
        };
      }
    }

    // Update the user
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get user by EVM address
 */
export async function getUserByEvmAddress(evmAddress: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('evm_address', evmAddress.toLowerCase())
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user by EVM address:', error);
    return null;
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data } = await query.maybeSingle();
    return !data; // Available if no user found
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}
