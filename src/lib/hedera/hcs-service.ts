/**
 * Hedera Consensus Service (HCS) Utilities
 *
 * Functions for submitting messages to HCS topics and retrieving topic messages
 * via Mirror Node API.
 */

import { supabase } from '../supabase/client';

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

// Public HCS Topic ID for Web3versity Message Board
// TODO: Replace with actual topic ID after creating topic
export const MESSAGE_BOARD_TOPIC_ID = '0.0.4827500'; // Placeholder

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
