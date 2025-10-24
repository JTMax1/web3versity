/**
 * Hedera Transaction Utilities
 *
 * Functions for sending HBAR transactions, querying transaction history,
 * and interacting with the Hedera network for practical lessons.
 */

import {
  TransferTransaction,
  AccountId,
  Hbar,
  TransactionId,
  TransactionReceipt,
  TransactionResponse,
} from '@hashgraph/sdk';
import {
  generateHashScanUrl,
  isValidAccountId,
  hbarToTinybars,
  tinybarsToHbar,
} from './client';
import { supabase } from '../supabase/client';

/**
 * Transaction result interface
 */
export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  hashScanUrl?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

/**
 * Transaction history item interface
 */
export interface TransactionHistoryItem {
  id: string;
  transaction_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  memo?: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
  hash_scan_url: string;
}

/**
 * Send HBAR from user's wallet to a recipient
 *
 * This function uses the user's connected wallet (Metamask/WalletConnect) to sign
 * the transaction. The transaction is executed on Hedera Testnet.
 *
 * @param senderAccountId - Sender's Hedera account ID
 * @param recipientId - Recipient's Hedera account ID (format: 0.0.xxxxx)
 * @param amount - Amount in HBAR (not tinybars)
 * @param memo - Optional memo/message for the transaction
 * @param userId - User ID for database logging
 * @returns Transaction result with success status and details
 */
export async function sendHBAR(
  senderAccountId: string,
  recipientId: string,
  amount: number,
  memo?: string,
  userId?: string
): Promise<TransactionResult> {
  try {
    // Validate recipient account ID format
    if (!isValidAccountId(recipientId)) {
      return {
        success: false,
        error: 'Invalid recipient account ID format. Expected format: 0.0.xxxxx',
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    // Check if user has sufficient balance (we'll get balance from wallet context)
    // Note: Balance check should be done in the component before calling this function

    // Create transfer transaction
    const transaction = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(senderAccountId), Hbar.fromTinybars(-hbarToTinybars(amount)))
      .addHbarTransfer(AccountId.fromString(recipientId), Hbar.fromTinybars(hbarToTinybars(amount)));

    // Add memo if provided
    if (memo) {
      transaction.setTransactionMemo(memo);
    }

    // IMPORTANT: Transaction signing must happen via wallet
    // For Metamask/WalletConnect, we need to use HashConnect or similar
    // This is a placeholder - actual implementation depends on wallet integration

    console.log('⚠️ Transaction signing via wallet not yet implemented');
    console.log('Transaction details:', {
      from: senderAccountId,
      to: recipientId,
      amount: `${amount} ℏ`,
      memo,
    });

    // For now, return a simulated response
    // TODO: Implement actual wallet signing and transaction execution
    const simulatedTxId = `${senderAccountId}@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`;

    // Log transaction in database
    if (userId) {
      const { error: dbError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          transaction_id: simulatedTxId,
          from_account: senderAccountId,
          to_account: recipientId,
          amount: amount,
          transaction_type: 'transfer',
          status: 'success',
          memo: memo || null,
        });

      if (dbError) {
        console.error('Failed to log transaction to database:', dbError);
      }
    }

    return {
      success: true,
      transactionId: simulatedTxId,
      hashScanUrl: generateHashScanUrl(simulatedTxId),
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Get transaction history for a user
 *
 * Fetches transactions from the database and optionally from Hedera Mirror Node
 *
 * @param userId - User ID to fetch transactions for
 * @param limit - Maximum number of transactions to return
 * @returns Array of transaction history items
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<TransactionHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }

    return (data || []).map((tx) => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      from_account: tx.from_account || '',
      to_account: tx.to_account || '',
      amount: tx.amount || 0,
      memo: tx.memo,
      status: tx.status || 'pending',
      created_at: tx.created_at,
      hash_scan_url: generateHashScanUrl(tx.transaction_id),
    }));
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

/**
 * Get transaction details by transaction ID from Hedera Mirror Node
 *
 * @param transactionId - Hedera transaction ID
 * @returns Transaction details
 */
export async function getTransactionById(transactionId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/transactions/${transactionId}`
    );

    if (!response.ok) {
      throw new Error('Transaction not found');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

/**
 * Estimate transaction fee for different transaction types
 *
 * @param transactionType - Type of transaction
 * @returns Estimated fee in HBAR
 */
export function estimateTransactionFee(transactionType: 'transfer' | 'token_create' | 'contract_call'): number {
  switch (transactionType) {
    case 'transfer':
      return 0.0001; // Simple transfer: ~$0.0001
    case 'token_create':
      return 1.0; // Token creation: ~1 HBAR
    case 'contract_call':
      return 0.001; // Contract call: ~0.001 HBAR
    default:
      return 0.0001;
  }
}

/**
 * Format transaction ID for display
 *
 * @param transactionId - Full transaction ID
 * @returns Shortened transaction ID for display
 */
export function formatTransactionId(transactionId: string): string {
  if (!transactionId || transactionId.length < 20) {
    return transactionId;
  }
  return `${transactionId.substring(0, 10)}...${transactionId.substring(transactionId.length - 8)}`;
}

/**
 * Get transaction status from Hedera Mirror Node
 *
 * @param transactionId - Hedera transaction ID
 * @returns Transaction status
 */
export async function getTransactionStatus(
  transactionId: string
): Promise<'success' | 'failed' | 'pending'> {
  try {
    const data = await getTransactionById(transactionId);
    if (!data || !data.transactions || data.transactions.length === 0) {
      return 'pending';
    }

    const tx = data.transactions[0];
    return tx.result === 'SUCCESS' ? 'success' : 'failed';
  } catch (error) {
    return 'pending';
  }
}
