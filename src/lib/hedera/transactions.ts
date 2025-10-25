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
 * the transaction. The transaction is executed on Hedera Testnet via JSON-RPC.
 *
 * REAL IMPLEMENTATION - Uses Metamask to sign transactions
 *
 * @param senderAccountId - Sender's Hedera account ID or EVM address
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
    // Check if Metamask is available
    if (!window.ethereum) {
      return {
        success: false,
        error: 'Metamask not detected. Please install Metamask to send transactions.',
      };
    }

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

    console.log('🚀 Sending HBAR transaction via Metamask...');
    console.log('Transaction details:', {
      from: senderAccountId,
      to: recipientId,
      amount: `${amount} ℏ`,
      memo,
    });

    // Get sender's EVM address
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No wallet account found. Please connect your wallet.',
      };
    }

    const fromAddress = accounts[0];

    // Convert Hedera account ID (0.0.xxxxx) to EVM address format for recipient
    // For testnet, we can use the account ID directly as Hedera supports both formats
    let toAddress: string;

    if (recipientId.startsWith('0.0.')) {
      // Convert Hedera account ID to EVM address
      // Format: 0.0.xxxxx -> extract xxxxx and convert to hex address
      const accountNum = recipientId.split('.')[2];
      toAddress = '0x' + parseInt(accountNum).toString(16).padStart(40, '0');
    } else if (recipientId.startsWith('0x')) {
      // Already in EVM format
      toAddress = recipientId;
    } else {
      return {
        success: false,
        error: 'Invalid recipient address format',
      };
    }

    // Convert HBAR to wei (1 HBAR = 10^18 wei in EVM context)
    const amountInWei = BigInt(Math.floor(amount * 1e18)).toString(16);

    // Prepare transaction parameters
    const txParams: any = {
      from: fromAddress,
      to: toAddress,
      value: '0x' + amountInWei,
      gas: '0x5208', // 21000 gas for simple transfer
    };

    // Note: Hedera doesn't support memo in standard EVM transfers
    // Memo would require a smart contract call or Hedera SDK transaction
    if (memo) {
      console.warn('⚠️ Memo not supported in EVM-style transfers. Use Hedera SDK for memo support.');
    }

    // Log pending transaction to database
    let dbTransactionId: string | null = null;
    if (userId) {
      const { data: dbTx, error: dbError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          transaction_id: 'pending',
          from_account: fromAddress,
          to_account: recipientId,
          amount: amount,
          transaction_type: 'transfer',
          status: 'pending',
          memo: memo || null,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Failed to log transaction to database:', dbError);
      } else if (dbTx) {
        dbTransactionId = dbTx.id;
      }
    }

    // Send transaction via Metamask
    console.log('⏳ Requesting Metamask signature...');
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    }) as string;

    console.log('✅ Transaction sent! Hash:', txHash);

    // Update database with transaction hash
    if (userId && dbTransactionId) {
      await supabase
        .from('payment_transactions')
        .update({
          transaction_id: txHash,
          status: 'pending',
        })
        .eq('id', dbTransactionId);
    }

    // Wait for transaction confirmation (poll for receipt)
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await waitForTransactionReceipt(txHash);

    // Check transaction status
    const success = receipt && (receipt.status === '0x1' || receipt.status === 1);

    // Update database with final status
    if (userId && dbTransactionId) {
      await supabase
        .from('payment_transactions')
        .update({
          status: success ? 'success' : 'failed',
        })
        .eq('id', dbTransactionId);
    }

    if (!success) {
      return {
        success: false,
        error: 'Transaction failed. Please check HashScan for details.',
        transactionId: txHash,
        hashScanUrl: generateHashScanUrl(txHash),
      };
    }

    console.log('🎉 Transaction confirmed!');

    return {
      success: true,
      transactionId: txHash,
      hashScanUrl: generateHashScanUrl(txHash),
    };
  } catch (error: any) {
    console.error('❌ Transaction failed:', error);

    // Handle Metamask user rejection
    if (error.code === 4001) {
      return {
        success: false,
        error: 'Transaction rejected by user',
      };
    }

    // Handle insufficient funds
    if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient funds to complete transaction',
      };
    }

    return {
      success: false,
      error: error.message || 'Transaction failed',
    };
  }
}

/**
 * Wait for transaction receipt (confirmation)
 * Polls for up to 30 seconds
 *
 * @param txHash - Transaction hash
 * @returns Transaction receipt or null if timeout
 */
async function waitForTransactionReceipt(txHash: string, maxAttempts = 30): Promise<any> {
  if (!window.ethereum) return null;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (receipt) {
        return receipt;
      }

      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
    }
  }

  console.warn('⚠️ Transaction receipt not found after 30 seconds');
  return null;
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
