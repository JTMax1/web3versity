/**
 * User Adapter
 *
 * Converts database User type to UI User type for compatibility with existing components.
 * This allows us to use real database users without rewriting all UI components.
 */

import type { User as DatabaseUser } from './supabase/types';
import type { User as UIUser } from './mockData';

/**
 * Convert database User to UI User format
 *
 * Database fields → UI fields mapping:
 * - total_xp → totalPoints
 * - current_level → level
 * - current_streak → streakDays
 * - avatar_emoji → profilePicture
 * - evm_address → walletAddress
 * - hedera_account_id → hederaAccountId
 */
export function adaptDatabaseUserToUI(dbUser: DatabaseUser, walletBalance?: number): UIUser {
  return {
    id: dbUser.id,
    username: dbUser.username,
    walletAddress: dbUser.evm_address,
    hederaAccountId: dbUser.hedera_account_id || undefined,
    walletBalance: walletBalance,
    totalPoints: dbUser.total_xp,
    level: dbUser.current_level,
    streakDays: dbUser.current_streak,
    profilePicture: dbUser.avatar_emoji,
  };
}
