/**
 * Hedera Consensus Service (HCS) Utilities
 *
 * Functions for submitting messages to HCS topics and retrieving topic messages
 * via Mirror Node API.
 */

import { supabase } from '../supabase/client';
import {
  Client,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
  Transaction,
} from '@hashgraph/sdk';

// Extend window type for Ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';
const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';

// Public HCS Topic ID for Web3versity Message Board
// This topic was created with the operator account: 0.0.7045900
export const MESSAGE_BOARD_TOPIC_ID = '0.0.7180075';

export interface SubmitMessageParams {
  topicId: string;
  message: string;
  username: string;
  userAccountId?: string;
}

export interface SubmitMessageResult {
  success: boolean;
  transactionId?: string;
  consensusTimestamp?: string;
  sequenceNumber?: number;
  error?: string;
}

export interface TopicMessage {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  sequenceNumber: number;
  consensusTimestamp: string;
  transactionId: string;
}

/**
 * Submit a message to an HCS topic using backend Edge Function
 *
 * This function calls a Supabase Edge Function that:
 * 1. Creates TopicMessageSubmitTransaction
 * 2. Submits message to the topic
 * 3. Returns transaction ID and consensus timestamp
 *
 * @param params - Message submission parameters
 * @returns Submit result with transaction details
 */
export async function submitTopicMessage(
  params: SubmitMessageParams
): Promise<SubmitMessageResult> {
  try {
    // Call Supabase Edge Function for HCS message submission
    const { data, error } = await supabase.functions.invoke('hcs-submit', {
      body: {
        topicId: params.topicId,
        message: params.message,
        username: params.username,
        userAccountId: params.userAccountId,
      },
    });

    if (error) {
      console.error('HCS message submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit message',
      };
    }

    // Success response from Edge Function
    return {
      success: true,
      transactionId: data.transactionId,
      consensusTimestamp: data.consensusTimestamp,
      sequenceNumber: data.sequenceNumber,
    };

  } catch (error) {
    console.error('Unexpected error during HCS submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit a message to HCS topic using REAL Hedera testnet transactions
 *
 * This function submits REAL messages to HCS topics on Hedera testnet using the
 * backend Edge Function that has proper Hedera operator credentials.
 *
 * The user's wallet signs a message to prove authorization, then the backend
 * submits the actual HCS transaction.
 *
 * @param params - Message submission parameters
 * @returns Submit result with REAL transaction details verifiable on HashScan
 */
export async function submitTopicMessageClientSide(
  params: SubmitMessageParams
): Promise<SubmitMessageResult> {
  try {
    console.log('📤 Submitting REAL HCS message to Hedera testnet...');

    // Get Metamask provider for wallet verification
    if (typeof window === 'undefined' || !window.ethereum) {
      return {
        success: false,
        error: 'Wallet not found. Please install Metamask or HashPack.',
      };
    }

    const provider = window.ethereum;

    // Request wallet connection
    let accounts: string[];
    try {
      accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];
    } catch (error: any) {
      if (error.code === 4001) {
        return {
          success: false,
          error: 'Wallet connection rejected by user',
        };
      }
      throw error;
    }

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No wallet account found. Please connect your wallet.',
      };
    }

    console.log('✅ Wallet connected:', accounts[0]);

    // Create message payload
    const messagePayload = {
      username: params.username,
      message: params.message,
      userAccountId: params.userAccountId || accounts[0],
      timestamp: new Date().toISOString(),
    };

    console.log('📝 Message payload:', messagePayload);
    console.log('🎯 Target topic:', params.topicId);

    // Request wallet signature to prove ownership
    const authMessage = `Submit HCS Message\nTopic: ${params.topicId}\nMessage: ${params.message}\nUsername: ${params.username}\nTimestamp: ${messagePayload.timestamp}`;

    // Convert string to hex for wallet signing (browser-compatible)
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(authMessage);
    const authMessageHex = '0x' + Array.from(messageBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('⏳ Requesting wallet signature for authorization...');

    let walletSignature: string;
    try {
      walletSignature = await provider.request({
        method: 'personal_sign',
        params: [authMessageHex, accounts[0]],
      }) as string;

      console.log('✅ Wallet signature obtained:', walletSignature.substring(0, 20) + '...');
    } catch (signError: any) {
      if (signError.code === 4001) {
        return {
          success: false,
          error: 'Wallet signature rejected by user',
        };
      }
      throw signError;
    }

    // Call Edge Function to submit REAL HCS transaction
    console.log('⏳ Submitting to Hedera network via Edge Function...');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hcs-submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          topicId: params.topicId,
          message: params.message,
          username: params.username,
          userAccountId: params.userAccountId || accounts[0],
          walletAddress: accounts[0],
          walletSignature: walletSignature,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit HCS message');
    }

    console.log('🎉 HCS message confirmed on Hedera testnet!');
    console.log('Transaction ID:', result.transactionId);
    console.log('Consensus Timestamp:', result.consensusTimestamp);
    console.log('Sequence Number:', result.sequenceNumber);

    // Verify on Mirror Node
    console.log('🔍 Verifying on Hedera Mirror Node...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const mirrorResponse = await fetch(
        `${MIRROR_NODE_URL}/topics/${params.topicId}/messages?limit=5&order=desc`
      );

      if (mirrorResponse.ok) {
        const mirrorData = await mirrorResponse.json();
        console.log('✅ Mirror Node verification:', mirrorData.messages?.length || 0, 'recent messages found');
      }
    } catch (mirrorError) {
      console.warn('⚠️ Could not verify on mirror node:', mirrorError);
    }

    return {
      success: true,
      transactionId: result.transactionId,
      consensusTimestamp: result.consensusTimestamp,
      sequenceNumber: result.sequenceNumber,
    };

  } catch (error: any) {
    console.error('❌ HCS submission failed:', error);

    if (error.code === 4001) {
      return {
        success: false,
        error: 'Transaction rejected by user',
      };
    }

    if (error.message?.includes('insufficient')) {
      return {
        success: false,
        error: 'Insufficient HBAR balance. Please fund the platform operator account.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to submit message to HCS',
    };
  }
}

/**
 * Get messages from an HCS topic via Mirror Node API
 *
 * @param topicId - HCS topic ID
 * @param limit - Maximum number of messages to retrieve (default: 25)
 * @returns Array of topic messages
 */
export async function getTopicMessages(
  topicId: string,
  limit: number = 25
): Promise<TopicMessage[]> {
  try {
    const response = await fetch(
      `${MIRROR_NODE_URL}/topics/${topicId}/messages?limit=${limit}&order=desc`
    );

    if (!response.ok) {
      console.error(`Failed to fetch topic messages: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Transform Mirror Node response to our format
    const messages: TopicMessage[] = (data.messages || []).map((msg: any) => {
      // Decode base64 message content
      let content = '';
      try {
        content = msg.message ? atob(msg.message) : '';
      } catch (e) {
        content = msg.message || '';
      }

      // Try to parse JSON format: { username, message }
      let author = 'Anonymous';
      let messageText = content;

      try {
        const parsed = JSON.parse(content);
        if (parsed.username) author = parsed.username;
        if (parsed.message) messageText = parsed.message;
      } catch (e) {
        // If not JSON, use content as-is
      }

      return {
        id: `${msg.consensus_timestamp}-${msg.sequence_number}`,
        content: messageText,
        author,
        timestamp: parseFloat(msg.consensus_timestamp) * 1000, // Convert to milliseconds
        sequenceNumber: msg.sequence_number,
        consensusTimestamp: msg.consensus_timestamp,
        transactionId: msg.payer_account_id, // Approximation
      };
    });

    return messages;

  } catch (error) {
    console.error('Error fetching topic messages:', error);
    return [];
  }
}

/**
 * Get topic information from Mirror Node
 *
 * @param topicId - HCS topic ID
 * @returns Topic info or null if not found
 */
export async function getTopicInfo(topicId: string): Promise<any | null> {
  try {
    const response = await fetch(`${MIRROR_NODE_URL}/topics/${topicId}`);

    if (!response.ok) {
      console.error(`Failed to fetch topic info: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching topic info:', error);
    return null;
  }
}

/**
 * Subscribe to topic messages with polling
 *
 * This creates a simple polling mechanism to check for new messages.
 * Returns a cleanup function to stop polling.
 *
 * @param topicId - HCS topic ID
 * @param onMessage - Callback when new messages arrive
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 * @returns Cleanup function to stop polling
 */
export function subscribeToTopic(
  topicId: string,
  onMessage: (messages: TopicMessage[]) => void,
  intervalMs: number = 5000
): () => void {
  let lastSequenceNumber = 0;
  let isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const messages = await getTopicMessages(topicId, 10);

      // Filter for new messages only
      const newMessages = messages.filter(
        msg => msg.sequenceNumber > lastSequenceNumber
      );

      if (newMessages.length > 0) {
        // Update last sequence number
        lastSequenceNumber = Math.max(
          ...newMessages.map(msg => msg.sequenceNumber)
        );

        // Call callback with new messages
        onMessage(newMessages);
      }

    } catch (error) {
      console.error('Error polling topic messages:', error);
    }

    // Schedule next poll
    if (isPolling) {
      setTimeout(poll, intervalMs);
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    isPolling = false;
  };
}

/**
 * Check if HCS Edge Function is available
 */
export async function checkHCSAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('hcs-submit', {
      body: { healthCheck: true },
    });

    return !error && data?.available === true;
  } catch (error) {
    console.warn('HCS Edge Function not available:', error);
    return false;
  }
}

/**
 * Simulate message submission for development/testing
 * Returns mock data when backend is not available
 */
export async function simulateMessageSubmission(
  params: SubmitMessageParams
): Promise<SubmitMessageResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const mockTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}-000000000`;
  const mockConsensusTimestamp = (Date.now() / 1000).toFixed(9);
  const mockSequenceNumber = Math.floor(Math.random() * 10000) + 100;

  return {
    success: true,
    transactionId: mockTransactionId,
    consensusTimestamp: mockConsensusTimestamp,
    sequenceNumber: mockSequenceNumber,
  };
}

/**
 * Format consensus timestamp for display
 *
 * @param timestamp - Consensus timestamp in format: seconds.nanoseconds
 * @returns Formatted date string
 */
export function formatConsensusTimestamp(timestamp: string): string {
  const seconds = parseFloat(timestamp);
  const date = new Date(seconds * 1000);
  return date.toLocaleString();
}

/**
 * Calculate time ago from consensus timestamp
 *
 * @param timestamp - Consensus timestamp in format: seconds.nanoseconds
 * @returns Time ago string (e.g., "2 minutes ago")
 */
export function getTimeAgo(timestamp: string): string {
  const seconds = parseFloat(timestamp);
  const now = Date.now();
  const messageTime = seconds * 1000;
  const diffMs = now - messageTime;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}
