/**
 * HCS Message Submission Edge Function
 *
 * Submits messages to Hedera Consensus Service topics.
 * This function handles the server-side Hedera SDK operations.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
  AccountId,
} from 'npm:@hashgraph/sdk@^2.40.0';

// Hedera configuration from environment variables
const HEDERA_NETWORK = Deno.env.get('HEDERA_NETWORK') || 'testnet';
const HEDERA_OPERATOR_ID = Deno.env.get('HEDERA_OPERATOR_ID');
const HEDERA_OPERATOR_KEY = Deno.env.get('HEDERA_OPERATOR_KEY');

// HCS Topic ID for message board
const MESSAGE_BOARD_TOPIC_ID = Deno.env.get('HCS_MESSAGE_BOARD_TOPIC');

interface SubmitRequest {
  healthCheck?: boolean;
  topicId?: string;
  message: string;
  username: string;
  userAccountId?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body: SubmitRequest = await req.json();

    // Health check endpoint
    if (body.healthCheck) {
      return new Response(
        JSON.stringify({ available: true, network: HEDERA_NETWORK }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate environment variables
    if (!HEDERA_OPERATOR_ID || !HEDERA_OPERATOR_KEY) {
      throw new Error('Hedera operator credentials not configured');
    }

    // Use provided topic ID or default
    const topicId = body.topicId || MESSAGE_BOARD_TOPIC_ID;

    if (!topicId) {
      throw new Error('Topic ID not provided and no default configured');
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID),
      PrivateKey.fromString(HEDERA_OPERATOR_KEY)
    );

    // Submit message to topic
    const result = await submitMessage(client, topicId, body);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: result.success ? 200 : 400,
      }
    );

  } catch (error) {
    console.error('HCS Submission Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      }
    );
  }
});

/**
 * Submit a message to an HCS topic
 */
async function submitMessage(
  client: Client,
  topicId: string,
  data: SubmitRequest
): Promise<{
  success: boolean;
  transactionId?: string;
  consensusTimestamp?: string;
  sequenceNumber?: number;
  error?: string;
}> {
  try {
    // Create message payload with username and message
    const messagePayload = {
      username: data.username,
      message: data.message,
      userAccountId: data.userAccountId,
      timestamp: new Date().toISOString(),
    };

    // Convert to JSON string and then to bytes
    const messageBytes = new TextEncoder().encode(JSON.stringify(messagePayload));

    // Submit message to topic
    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(messageBytes)
      .freezeWith(client)
      .execute(client);

    // Get receipt for consensus timestamp and sequence number
    const receipt = await submitTx.getReceipt(client);
    const record = await submitTx.getRecord(client);

    console.log(`Submitted message to topic ${topicId}`);
    console.log(`Transaction ID: ${submitTx.transactionId.toString()}`);
    console.log(`Consensus Timestamp: ${record.consensusTimestamp.toString()}`);

    return {
      success: true,
      transactionId: submitTx.transactionId.toString(),
      consensusTimestamp: record.consensusTimestamp.toString(),
      sequenceNumber: record.consensusTimestamp.nanos, // Approximation
    };

  } catch (error) {
    console.error('Error submitting message to HCS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
