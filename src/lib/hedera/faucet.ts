/**
 * Hedera Testnet Faucet Service
 *
 * Handles HBAR distribution to users with rate limiting and tracking.
 * SECURITY: This should only be called from server-side (Supabase Edge Functions)
 */

import { TransferTransaction, Hbar, AccountId } from '@hashgraph/sdk';
import { initializeHederaClient, generateHashScanUrl, hbarToTinybars } from './client';
import { supabase } from '../supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface FaucetRequest {
  hederaAccountId: string;
  amount: number; // in HBAR
  userId: string;
}

export interface FaucetResult {
  success: boolean;
  transactionId?: string;
  hashScanUrl?: string;
  error?: string;
  nextAvailableAt?: Date;
}

export interface FaucetEligibility {
  eligible: boolean;
  remainingAmount: number;
  nextAvailableAt: Date | null;
  reason?: string;
}

export interface FaucetHistoryEntry {
  id: string;
  user_id: string;
  hedera_account_id: string;
  amount_hbar: number;
  transaction_id: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  error_message?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DAILY_LIMIT_HBAR = 10; // Max 10 HBAR per user per 24 hours
const COOLDOWN_HOURS = 24; // 24 hours between requests
const MIN_REQUEST_AMOUNT = 1; // Minimum 1 HBAR
const MAX_REQUEST_AMOUNT = 10; // Maximum 10 HBAR per request

// ============================================================================
// Faucet Functions
// ============================================================================

/**
 * Check if user is eligible for faucet request
 *
 * @param userId - User UUID
 * @returns Eligibility status
 */
export async function checkFaucetEligibility(
  userId: string
): Promise<FaucetEligibility> {
  try {
    // Get the last 24 hours timestamp
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - COOLDOWN_HOURS);

    // Query faucet requests in last 24 hours
    const { data: recentRequests, error } = await supabase
      .from('faucet_requests')
      .select('amount_hbar, created_at, status')
      .eq('user_id', userId)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .eq('status', 'success')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking faucet eligibility:', error);
      throw error;
    }

    // If no recent requests, user is eligible
    if (!recentRequests || recentRequests.length === 0) {
      return {
        eligible: true,
        remainingAmount: DAILY_LIMIT_HBAR,
        nextAvailableAt: null,
      };
    }

    // Calculate total requested in last 24 hours
    const totalRequested = recentRequests.reduce(
      (sum, req) => sum + req.amount_hbar,
      0
    );

    // Get the most recent request time
    const lastRequest = new Date(recentRequests[0].created_at);
    const nextAvailable = new Date(lastRequest);
    nextAvailable.setHours(nextAvailable.getHours() + COOLDOWN_HOURS);

    // Check if still in cooldown period
    const now = new Date();
    if (now < nextAvailable) {
      return {
        eligible: false,
        remainingAmount: DAILY_LIMIT_HBAR - totalRequested,
        nextAvailableAt: nextAvailable,
        reason: `You must wait ${COOLDOWN_HOURS} hours between faucet requests`,
      };
    }

    // Check if daily limit reached
    if (totalRequested >= DAILY_LIMIT_HBAR) {
      return {
        eligible: false,
        remainingAmount: 0,
        nextAvailableAt: nextAvailable,
        reason: `Daily limit of ${DAILY_LIMIT_HBAR} HBAR reached`,
      };
    }

    // User is eligible
    return {
      eligible: true,
      remainingAmount: DAILY_LIMIT_HBAR - totalRequested,
      nextAvailableAt: null,
    };
  } catch (error) {
    console.error('Unexpected error checking eligibility:', error);
    throw error;
  }
}

/**
 * Request HBAR from faucet
 *
 * IMPORTANT: This function should only be called from server-side (Supabase Edge Function)
 * It uses the operator private key and must NEVER be exposed to client code
 *
 * @param request - Faucet request details
 * @returns Transaction result
 */
export async function requestFaucetHBAR(
  request: FaucetRequest
): Promise<FaucetResult> {
  const { hederaAccountId, amount, userId } = request;

  try {
    // Validate amount
    if (amount < MIN_REQUEST_AMOUNT || amount > MAX_REQUEST_AMOUNT) {
      return {
        success: false,
        error: `Amount must be between ${MIN_REQUEST_AMOUNT} and ${MAX_REQUEST_AMOUNT} HBAR`,
      };
    }

    // Check eligibility
    const eligibility = await checkFaucetEligibility(userId);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason || 'Not eligible for faucet request',
        nextAvailableAt: eligibility.nextAvailableAt || undefined,
      };
    }

    // Check if requested amount exceeds remaining allowance
    if (amount > eligibility.remainingAmount) {
      return {
        success: false,
        error: `Requested amount exceeds remaining daily allowance (${eligibility.remainingAmount} HBAR remaining)`,
      };
    }

    // Initialize Hedera client
    const client = initializeHederaClient();

    // Parse recipient account ID
    const recipientId = AccountId.fromString(hederaAccountId);

    // Create transfer transaction
    const transferTx = new TransferTransaction()
      .addHbarTransfer(client.operatorAccountId!, Hbar.fromTinybars(-hbarToTinybars(amount))) // Debit from operator
      .addHbarTransfer(recipientId, Hbar.fromTinybars(hbarToTinybars(amount))) // Credit to user
      .setTransactionMemo(`Web3Versity Faucet: ${amount} HBAR`);

    // Execute transaction
    const txResponse = await transferTx.execute(client);

    // Get receipt to confirm success
    const receipt = await txResponse.getReceipt(client);

    // Get transaction ID
    const transactionId = txResponse.transactionId.toString();

    // Generate HashScan URL
    const hashScanUrl = generateHashScanUrl(transactionId);

    // Log successful request in database
    const { error: insertError } = await supabase
      .from('faucet_requests')
      .insert({
        user_id: userId,
        hedera_account_id: hederaAccountId,
        amount_hbar: amount,
        transaction_id: transactionId,
        status: 'success',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error logging faucet request:', insertError);
      // Don't fail the request if logging fails
    }

    // Also log in transactions table for general transaction tracking
    await supabase.from('transactions').insert({
      user_id: userId,
      transaction_type: 'faucet_request',
      hedera_transaction_id: transactionId,
      amount_hbar: amount,
      status: 'success',
      created_at: new Date().toISOString(),
      metadata: {
        recipient: hederaAccountId,
        memo: 'Web3Versity Faucet',
      },
    });

    console.log(`✅ Faucet request successful: ${amount} HBAR sent to ${hederaAccountId}`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   HashScan: ${hashScanUrl}`);

    return {
      success: true,
      transactionId,
      hashScanUrl,
    };
  } catch (error) {
    console.error('❌ Faucet request failed:', error);

    // Log failed request
    await supabase.from('faucet_requests').insert({
      user_id: userId,
      hedera_account_id: hederaAccountId,
      amount_hbar: amount,
      transaction_id: null,
      status: 'failed',
      created_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Get faucet request history for a user
 *
 * @param userId - User UUID
 * @param limit - Maximum number of requests to return
 * @returns Array of faucet requests
 */
export async function getFaucetHistory(
  userId: string,
  limit: number = 20
): Promise<FaucetHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('faucet_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching faucet history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching faucet history:', error);
    return [];
  }
}

/**
 * Get faucet statistics (for admin dashboard)
 *
 * @returns Faucet stats
 */
export async function getFaucetStats() {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get total distributed today
    const { data: todayRequests, error: todayError } = await supabase
      .from('faucet_requests')
      .select('amount_hbar')
      .eq('status', 'success')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (todayError) throw todayError;

    const totalDistributedToday = todayRequests?.reduce(
      (sum, req) => sum + req.amount_hbar,
      0
    ) || 0;

    // Get number of requests today
    const requestsToday = todayRequests?.length || 0;

    // Get total all-time
    const { data: allRequests, error: allError } = await supabase
      .from('faucet_requests')
      .select('amount_hbar')
      .eq('status', 'success');

    if (allError) throw allError;

    const totalDistributedAllTime = allRequests?.reduce(
      (sum, req) => sum + req.amount_hbar,
      0
    ) || 0;

    return {
      totalDistributedToday,
      requestsToday,
      totalDistributedAllTime,
      requestsAllTime: allRequests?.length || 0,
    };
  } catch (error) {
    console.error('Error fetching faucet stats:', error);
    return {
      totalDistributedToday: 0,
      requestsToday: 0,
      totalDistributedAllTime: 0,
      requestsAllTime: 0,
    };
  }
}
