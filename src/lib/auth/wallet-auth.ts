/**
 * Wallet Authentication Module
 *
 * Handles authentication logic that links Metamask wallets to database user accounts.
 * Creates new users automatically on first wallet connection.
 *
 * Phase 1, Task 1.5 - User Authentication System
 */

import { supabase } from '../supabase/client';
import type { User, UserInsert, UserUpdate } from '../supabase/types';

// ============================================================================
// Error Types
// ============================================================================

export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique username for new users
 * Format: Explorer_XXXX where XXXX is a random 4-digit number
 */
function generateUsername(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Explorer_${randomNum}`;
}

/**
 * Generate a random avatar emoji for new users
 */
function generateAvatarEmoji(): string {
  const emojis = [
    '👨‍💻', '👩‍💻', '🧑‍💻', '🦸', '🦹', '🧙',
    '🧝', '🧛', '🧞', '🧜', '🧚', '👨‍🚀',
    '👩‍🚀', '🧑‍🚀', '🦊', '🐱', '🐶', '🐼',
    '🐨', '🦁', '🐯', '🐸', '🐙', '🦑'
  ];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Check if a username is available
 */
async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Error checking username availability:', error);
    return false;
  }

  return !data;
}

/**
 * Generate a unique username (retry if collision)
 */
async function generateUniqueUsername(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const username = generateUsername();
    const available = await isUsernameAvailable(username);

    if (available) {
      return username;
    }

    attempts++;
  }

  // If we still can't find a unique username after 10 attempts,
  // append timestamp to make it unique
  return `Explorer_${Date.now().toString().slice(-6)}`;
}

// ============================================================================
// Main Authentication Functions
// ============================================================================

/**
 * Authenticate user with wallet
 *
 * This is the main authentication function that:
 * 1. Checks if user exists with the given EVM address
 * 2. If exists, updates last_login_at and returns user
 * 3. If new user, creates account and returns newly created user
 *
 * @param evmAddress - User's EVM address from Metamask (0x...)
 * @param hederaAccountId - User's Hedera account ID (0.0.xxxxx) or EVM address fallback
 * @returns User object
 * @throws AuthenticationError if database operation fails
 */
export async function authenticateWithWallet(
  evmAddress: string,
  hederaAccountId: string
): Promise<User> {
  try {
    // Normalize EVM address to lowercase for consistency
    const normalizedEvmAddress = evmAddress.toLowerCase();

    // 1. Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('evm_address', normalizedEvmAddress)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw new AuthenticationError(
        'Failed to check user existence',
        'FETCH_ERROR'
      );
    }

    // 2. If user exists, update last login and return
    if (existingUser) {
      console.log('Existing user found:', existingUser.id);
      return await updateUserLastLogin(existingUser.id);
    }

    // 3. New user - create account
    console.log('Creating new user for address:', normalizedEvmAddress);

    // Generate unique username
    const username = await generateUniqueUsername();

    // Prepare new user data
    const newUserData: UserInsert = {
      evm_address: normalizedEvmAddress,
      hedera_account_id: hederaAccountId || null,
      username,
      email: null,
      avatar_emoji: generateAvatarEmoji(),
      bio: null,
      location: null,
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: new Date().toISOString().split('T')[0], // Today's date
      courses_completed: 0,
      lessons_completed: 0,
      badges_earned: 0,
      last_login_at: new Date().toISOString(),
      is_active: true,
      is_verified: false,
      profile_public: true,
      show_on_leaderboard: true,
    };

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(newUserData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw new AuthenticationError(
        'Failed to create user account',
        'INSERT_ERROR'
      );
    }

    if (!newUser) {
      throw new AuthenticationError(
        'User creation failed - no data returned',
        'NO_DATA'
      );
    }

    console.log('New user created successfully:', newUser.id);

    // Initialize streak for new user
    try {
      await supabase.rpc('update_streak', { p_user_id: newUser.id });
    } catch (streakError) {
      console.warn('Failed to initialize streak for new user:', streakError);
      // Don't fail authentication if streak initialization fails
    }

    return newUser;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error('Unexpected error during authentication:', error);
    throw new AuthenticationError(
      'An unexpected error occurred during authentication',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Update user's last login timestamp and streak
 *
 * @param userId - User's UUID
 * @returns Updated user object
 * @throws AuthenticationError if update fails
 */
export async function updateUserLastLogin(userId: string): Promise<User> {
  try {
    // Update last_login_at timestamp
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating last login:', updateError);
      throw new AuthenticationError(
        'Failed to update last login timestamp',
        'UPDATE_ERROR'
      );
    }

    if (!updatedUser) {
      throw new AuthenticationError(
        'Failed to retrieve updated user',
        'NO_DATA'
      );
    }

    // Update streak (calls database function)
    try {
      await supabase.rpc('update_streak', { p_user_id: userId });

      // Fetch updated user with new streak values
      const { data: userWithStreak, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.warn('Failed to fetch user after streak update:', fetchError);
        return updatedUser; // Return user without updated streak
      }

      return userWithStreak || updatedUser;
    } catch (streakError) {
      console.warn('Failed to update streak:', streakError);
      return updatedUser; // Return user even if streak update fails
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error('Unexpected error updating last login:', error);
    throw new AuthenticationError(
      'An unexpected error occurred while updating last login',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Get complete user profile
 *
 * @param userId - User's UUID
 * @returns User object with all profile data
 * @throws AuthenticationError if user not found
 */
export async function getUserProfile(userId: string): Promise<User> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw new AuthenticationError(
        'Failed to fetch user profile',
        'FETCH_ERROR'
      );
    }

    if (!user) {
      throw new AuthenticationError('User not found', 'USER_NOT_FOUND');
    }

    return user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error('Unexpected error fetching user profile:', error);
    throw new AuthenticationError(
      'An unexpected error occurred while fetching user profile',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Update user profile
 *
 * Allows updating editable fields like username, avatar, bio, etc.
 * Validates username uniqueness before updating.
 *
 * @param userId - User's UUID
 * @param updates - Partial user object with fields to update
 * @returns Updated user object
 * @throws AuthenticationError if validation fails or update fails
 */
export async function updateUserProfile(
  userId: string,
  updates: UserUpdate
): Promise<User> {
  try {
    // If username is being updated, check if it's available
    if (updates.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking username availability:', checkError);
        throw new AuthenticationError(
          'Failed to validate username',
          'VALIDATION_ERROR'
        );
      }

      if (existingUser) {
        throw new AuthenticationError(
          'Username is already taken',
          'USERNAME_TAKEN'
        );
      }
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      throw new AuthenticationError(
        'Failed to update user profile',
        'UPDATE_ERROR'
      );
    }

    if (!updatedUser) {
      throw new AuthenticationError(
        'Failed to retrieve updated user',
        'NO_DATA'
      );
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error('Unexpected error updating user profile:', error);
    throw new AuthenticationError(
      'An unexpected error occurred while updating user profile',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Get user by EVM address
 *
 * Useful for checking if a wallet is already registered
 *
 * @param evmAddress - User's EVM address
 * @returns User object or null if not found
 */
export async function getUserByEvmAddress(
  evmAddress: string
): Promise<User | null> {
  try {
    const normalizedEvmAddress = evmAddress.toLowerCase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('evm_address', normalizedEvmAddress)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by EVM address:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error fetching user by EVM address:', error);
    return null;
  }
}

/**
 * Check if user exists by EVM address
 *
 * @param evmAddress - User's EVM address
 * @returns true if user exists, false otherwise
 */
export async function userExists(evmAddress: string): Promise<boolean> {
  const user = await getUserByEvmAddress(evmAddress);
  return user !== null;
}

/**
 * Update user's Hedera account ID
 *
 * Useful when user initially connects with just EVM address
 * and later the Hedera account ID is resolved via Mirror Node
 *
 * @param userId - User's UUID
 * @param hederaAccountId - Hedera account ID (0.0.xxxxx)
 * @returns Updated user object
 */
export async function updateHederaAccountId(
  userId: string,
  hederaAccountId: string
): Promise<User> {
  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        hedera_account_id: hederaAccountId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Hedera account ID:', error);
      throw new AuthenticationError(
        'Failed to update Hedera account ID',
        'UPDATE_ERROR'
      );
    }

    if (!updatedUser) {
      throw new AuthenticationError(
        'Failed to retrieve updated user',
        'NO_DATA'
      );
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    console.error('Unexpected error updating Hedera account ID:', error);
    throw new AuthenticationError(
      'An unexpected error occurred while updating Hedera account ID',
      'UNKNOWN_ERROR'
    );
  }
}
