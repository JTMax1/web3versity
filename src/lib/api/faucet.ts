/**
 * Faucet API Client
 *
 * Client-side API for requesting testnet HBAR from the faucet
 */

import { supabase } from '../supabase/client';

export interface FaucetEligibility {
  eligible: boolean;
  remainingAmount: number;
  nextAvailableAt: Date | null;
  reason?: string;
}

export interface FaucetResult {
  success: boolean;
  transactionId?: string;
  hashScanUrl?: string;
  error?: string;
  nextAvailableAt?: Date;
}

export interface FaucetHistoryEntry {
  id: string;
  user_id: string;
  hedera_account_id: string;
  amount_hbar: number;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed'; // Using 'completed' to match your schema
  requested_at: string; // Your schema uses requested_at instead of created_at
  completed_at?: string;
  error_message?: string;
}

/**
 * Check if user is eligible for faucet request
 */
export async function checkFaucetEligibility(
  userId: string
): Promise<FaucetEligibility> {
  try {
    const { data, error } = await supabase
      .rpc('check_faucet_eligibility', { p_user_id: userId })
      .single();

    if (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }

    return {
      eligible: data.eligible,
      remainingAmount: data.remaining_amount,
      nextAvailableAt: data.next_available_at ? new Date(data.next_available_at) : null,
      reason: data.reason || undefined,
    };
  } catch (error) {
    console.error('Unexpected error checking eligibility:', error);
    throw error;
  }
}

/**
 * Request HBAR from faucet
 *
 * Calls the Supabase Edge Function to execute the transaction
 *
 * @param hederaAccountId - User's Hedera account ID (0.0.xxxxx)
 * @param amount - Amount of HBAR to request (1-10)
 * @param userId - User's database ID (from WalletContext)
 */
export async function requestFaucetHBAR(
  hederaAccountId: string,
  amount: number,
  userId?: string
): Promise<FaucetResult> {
  try {
    console.log('🚀 Faucet API called with:', { hederaAccountId, amount, userId });

    // First try to get Supabase Auth session
    const { data: { session } } = await supabase.auth.getSession();

    console.log('🔑 Session check:', { hasSession: !!session, providedUserId: userId });

    // If no auth session but we have a userId, create a service role request
    if (!session && !userId) {
      console.error('❌ No session and no userId!');
      return {
        success: false,
        error: 'You must be logged in to use the faucet',
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // CRITICAL FIX: Supabase Edge Functions ALWAYS need apikey header
    // If we have a session, use JWT in Authorization header
    // If not, use anon key in BOTH apikey AND Authorization headers
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (session) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('✅ Using JWT session with apikey header');
    } else {
      headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      console.log('✅ Using anon key in both apikey and Authorization headers + userId:', userId);
    }

    console.log('📤 Sending request to:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-faucet`);
    console.log('📦 Request body:', JSON.stringify({ hederaAccountId, amount, userId }));

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-faucet`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          hederaAccountId,
          amount,
          userId, // Pass userId for wallet-based auth
        }),
      }
    );

    console.log('📥 Response status:', response.status);

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Faucet request failed',
        nextAvailableAt: result.nextAvailableAt ? new Date(result.nextAvailableAt) : undefined,
      };
    }

    return result;
  } catch (error) {
    console.error('Faucet request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get faucet request history for current user
 */
export async function getFaucetHistory(limit: number = 20): Promise<FaucetHistoryEntry[]> {
  try {
    // Get session to access user metadata
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return [];
    }

    // Extract our custom user ID from session metadata
    const userId = session.user.user_metadata?.user_id;
    if (!userId) {
      console.error('User ID not found in session metadata');
      return [];
    }

    const { data, error } = await supabase
      .from('faucet_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false }) // Using requested_at from your schema
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching history:', error);
    return [];
  }
}

/**
 * Calculate time remaining until next available request
 */
export function getTimeUntilAvailable(nextAvailable: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date();
  const diff = nextAvailable.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Format cooldown time as human-readable string
 */
export function formatCooldownTime(nextAvailable: Date): string {
  const { hours, minutes } = getTimeUntilAvailable(nextAvailable);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
