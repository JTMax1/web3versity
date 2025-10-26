/**
 * Hedera Transaction Utilities
 *
 * Functions for sending HBAR transactions, querying transaction history,
 * and interacting with the Hedera network for practical lessons.
 */

// Import only types from Hashgraph SDK to avoid triggering wallet detection
import type {
  TransactionReceipt,
} from '@hashgraph/sdk';
import {
  generateHashScanUrl,
  isValidAccountId,
  hbarToTinybars,
  tinybarsToHbar,
} from './client';
import { supabase } from '../supabase/client';

// Hedera Mirror Node API base URL
const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// Helper to get Metamask provider without SDK interference
function getMetamaskProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Metamask not found');
  }

  // If multiple providers exist, find Metamask
  if ((window.ethereum as any).providers) {
    const providers = (window.ethereum as any).providers;
    const metamask = providers.find((p: any) => p.isMetaMask);
    if (metamask) return metamask;
  }

  // Return default provider
  return window.ethereum;
}

/**
 * Get the EVM address for a Hedera account ID from Mirror Node
 * Hedera accounts have an associated EVM address that must be queried
 * @param accountId - Hedera account ID (0.0.xxxxx format)
 * @returns EVM address (0x... format) or null if not found
 */
async function getEvmAddressFromMirrorNode(accountId: string): Promise<string | null> {
  try {
    console.log(`🔍 Querying Mirror Node for EVM address of ${accountId}...`);

    const response = await fetch(`${MIRROR_NODE_URL}/accounts/${accountId}`);

    if (!response.ok) {
      console.error(`❌ Mirror Node query failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Mirror Node returns evm_address field
    if (data.evm_address) {
      // Ensure it starts with 0x
      const evmAddress = data.evm_address.startsWith('0x')
        ? data.evm_address
        : '0x' + data.evm_address;

      console.log(`✅ Found EVM address: ${evmAddress}`);
      return evmAddress;
    }

    console.warn(`⚠️ No EVM address found for account ${accountId}`);
    return null;
  } catch (error) {
    console.error('❌ Error querying Mirror Node:', error);
    return null;
  }
}

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
 * This function uses the user's connected wallet (Metamask) to sign
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
    // Get Metamask provider directly
    const provider = getMetamaskProvider();

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

    // Get sender's EVM address using provider directly
    let accounts: string[];
    try {
      accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];
    } catch (error: any) {
      // Handle wallet connection errors
      if (error.code === -32603) {
        return {
          success: false,
          error: 'No active wallet found. Please connect your wallet to Hedera Testnet using Metamask.',
        };
      }
      if (error.code === 4001) {
        return {
          success: false,
          error: 'Wallet connection rejected by user. Please approve the connection request.',
        };
      }
      throw error; // Re-throw other errors
    }

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No wallet account found. Please connect your wallet.',
      };
    }

    const fromAddress = accounts[0];

    // Convert Hedera account ID (0.0.xxxxx) to EVM address format for recipient
    // IMPORTANT: Hedera accounts have an associated EVM address that must be queried from Mirror Node
    // We CANNOT simply convert the account number to hex - that produces the wrong address!
    let toAddress: string;

    if (recipientId.startsWith('0.0.')) {
      // Query Mirror Node to get the correct EVM address for this Hedera account
      const evmAddress = await getEvmAddressFromMirrorNode(recipientId);

      if (!evmAddress) {
        return {
          success: false,
          error: `Could not find EVM address for Hedera account ${recipientId}. Make sure the account exists on Hedera Testnet.`,
        };
      }

      toAddress = evmAddress;
      console.log(`📍 Recipient: ${recipientId} → ${toAddress}`);
    } else if (recipientId.startsWith('0x')) {
      // Already in EVM format
      toAddress = recipientId;
      console.log(`📍 Recipient already in EVM format: ${toAddress}`);
    } else {
      return {
        success: false,
        error: 'Invalid recipient address format. Use Hedera account ID (0.0.xxxxx) or EVM address (0x...)',
      };
    }

    // Convert HBAR to wei (1 HBAR = 10^18 wei in EVM context)
    const amountInWei = BigInt(Math.floor(amount * 1e18)).toString(16);

    // Check if recipient is a contract (has code) - contracts need MORE gas
    console.log('🔍 Checking if recipient is a contract...');
    let isContract = false;
    try {
      const code = await provider.request({
        method: 'eth_getCode',
        params: [toAddress, 'latest'],
      }) as string;

      // If code is not '0x' or '0x0', it's a contract
      isContract = !!(code && code !== '0x' && code !== '0x0');
      console.log(isContract ? '⚠️ Recipient is a SMART CONTRACT' : '✅ Recipient is a regular account (EOA)');
    } catch (error) {
      console.warn('⚠️ Could not check if recipient is contract, assuming EOA');
    }

    // Fetch current gas price from the network
    console.log('⛽ Fetching current gas price...');
    let gasPrice: string;
    try {
      gasPrice = await provider.request({
        method: 'eth_gasPrice',
        params: [],
      }) as string;
      console.log('✅ Gas price fetched:', gasPrice);
    } catch (error) {
      console.warn('⚠️ Failed to fetch gas price, using default');
      // Fallback to a reasonable default gas price for Hedera (typically very low)
      gasPrice = '0x' + (10 * 1e9).toString(16); // 10 Gwei
    }

    // Set gas limit for Hedera EVM transfers
    // IMPORTANT: Hedera requires significantly more gas than Ethereum
    // Standard Ethereum EOA transfer: 21,000 gas
    // Hedera EVM EOA transfer: 80,000-400,000 gas
    // Hedera EVM CONTRACT transfer: 800,000-2,000,000 gas (contracts execute receive/fallback functions!)
    console.log('⛽ Setting gas limit for Hedera...');

    // If sending to a contract, we need MUCH MORE gas because the contract's receive() function will execute
    // Contracts can have complex logic in their receive functions
    let safeGasLimit: number;

    if (isContract) {
      // For contracts: Use 2 million gas to be absolutely safe
      // The contract's receive() or fallback() function could do anything!
      safeGasLimit = 2000000;
      console.log('⚠️ Using EXTRA HIGH gas limit for contract recipient');
    } else {
      // For regular accounts (EOA): 400k is more than enough
      safeGasLimit = 400000;
      console.log('✅ Using standard gas limit for EOA recipient');
    }

    const gasLimit = '0x' + safeGasLimit.toString(16);
    console.log('✅ Gas limit set:', gasLimit, `(${safeGasLimit} gas) - Safe for Hedera EVM`);

    // Prepare transaction parameters with dynamic gas settings
    const txParams: any = {
      from: fromAddress,
      to: toAddress,
      value: '0x' + amountInWei,
      gas: gasLimit,
      gasPrice: gasPrice,
    };

    // Note: Hedera doesn't support memo in standard EVM transfers
    // Memo would require a smart contract call or Hedera SDK transaction
    if (memo) {
      console.warn('⚠️ Memo not supported in EVM-style transfers. Use Hedera SDK for memo support.');
    }

    console.log('📋 Transaction parameters:', {
      from: txParams.from,
      to: txParams.to,
      value: amount + ' HBAR',
      gas: parseInt(txParams.gas, 16),
      gasPrice: parseInt(txParams.gasPrice, 16) + ' wei',
    });

    // Log pending transaction to database
    let dbTransactionId: string | null = null;
    if (userId) {
      const { data: dbTx, error: dbError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_id: 'pending',
          transaction_type: 'practice_transfer',
          amount_hbar: amount,
          from_account: fromAddress,
          to_account: recipientId,
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
    const txHash = await provider.request({
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
    const receipt = await waitForTransactionReceipt(txHash, provider);

    // Check transaction status
    const success = receipt && (receipt.status === '0x1' || receipt.status === 1);

    // Update database with final status
    if (userId && dbTransactionId) {
      await supabase
        .from('transactions')
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
 * @param provider - Ethereum provider
 * @returns Transaction receipt or null if timeout
 */
async function waitForTransactionReceipt(txHash: string, provider: any, maxAttempts = 30): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await provider.request({
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
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }

    return (data || []).map((tx: any) => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      from_account: tx.from_account || '',
      to_account: tx.to_account || '',
      amount: tx.amount_hbar || 0,
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
 * This is a conservative estimate that should cover most transactions
 *
 * @param transactionType - Type of transaction
 * @returns Estimated fee in HBAR
 */
export function estimateTransactionFee(transactionType: 'transfer' | 'token_create' | 'contract_call'): number {
  switch (transactionType) {
    case 'transfer':
      // Hedera EVM transfer estimate: 400,000 gas * 490 Gwei = ~0.196 HBAR
      // But gas price varies, so using conservative 0.25 HBAR estimate
      // Actual fee will likely be 0.1-0.2 HBAR (still very cheap!)
      return 0.25; // Simple transfer: ~0.25 HBAR on Hedera
    case 'token_create':
      return 1.0; // Token creation: ~1 HBAR
    case 'contract_call':
      return 0.5; // Contract call: ~0.5 HBAR (can vary widely)
    default:
      return 0.25;
  }
}

/**
 * Get dynamic transaction fee estimate from network
 * Uses actual network gas price and estimated gas limit
 *
 * @param toAddress - Recipient address
 * @param amount - Amount in HBAR
 * @returns Estimated fee in HBAR or fallback estimate
 */
export async function getDynamicTransactionFee(
  toAddress?: string,
  amount: number = 0
): Promise<number> {
  // TEMPORARY: Return static estimate to avoid SDK conflict
  // The actual fee on Hedera is very low anyway (~0.0001 HBAR)
  return estimateTransactionFee('transfer');
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
