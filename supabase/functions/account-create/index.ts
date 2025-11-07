/**
 * Hedera Account Creation Edge Function
 *
 * Creates new Hedera accounts on testnet with optional initial balance.
 * This function handles the server-side Hedera SDK operations.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  Client,
  AccountCreateTransaction,
  PrivateKey,
  PublicKey,
  AccountId,
  Hbar,
  AccountInfoQuery,
} from 'npm:@hashgraph/sdk@^2.40.0';

// Hedera configuration from environment variables
const HEDERA_NETWORK = Deno.env.get('HEDERA_NETWORK') || 'testnet';
const HEDERA_OPERATOR_ID = Deno.env.get('HEDERA_OPERATOR_ID');
const HEDERA_OPERATOR_KEY = Deno.env.get('HEDERA_OPERATOR_KEY');

interface CreateAccountRequest {
  healthCheck?: boolean;
  publicKey: string; // Hex string of public key
  initialBalance?: number; // HBAR amount
  maxAutomaticTokenAssociations?: number;
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
    const body: CreateAccountRequest = await req.json();

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

    // Validate public key
    if (!body.publicKey) {
      throw new Error('Public key is required');
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID),
      PrivateKey.fromString(HEDERA_OPERATOR_KEY)
    );

    // Create account
    const result = await createAccount(client, body);

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
    console.error('Account Creation Error:', error);

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
 * Create a new Hedera account
 */
async function createAccount(
  client: Client,
  data: CreateAccountRequest
): Promise<{
  success: boolean;
  accountId?: string;
  transactionId?: string;
  evmAddress?: string;
  balance?: number;
  publicKey?: string;
  error?: string;
}> {
  try {
    // Parse the public key
    const publicKey = parsePublicKey(data.publicKey);

    // Set initial balance (default to 1 HBAR if not specified)
    const initialBalance = data.initialBalance || 1;

    console.log('Creating new Hedera account...');
    console.log(`Initial balance: ${initialBalance} HBAR`);

    // Create the account
    const createAccountTx = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(initialBalance))
      .setMaxAutomaticTokenAssociations(data.maxAutomaticTokenAssociations || 10)
      .execute(client);

    // Get the receipt
    const receipt = await createAccountTx.getReceipt(client);
    const accountId = receipt.accountId;

    if (!accountId) {
      throw new Error('Account ID not returned');
    }

    console.log(`Account created: ${accountId.toString()}`);

    // Derive EVM address from account ID
    const evmAddress = accountIdToEvmAddress(accountId);

    // Get account info to verify
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client);

    return {
      success: true,
      accountId: accountId.toString(),
      transactionId: createAccountTx.transactionId.toString(),
      evmAddress,
      balance: accountInfo.balance.toBigNumber().toNumber() / 100000000, // Convert tinybars to HBAR
      publicKey: publicKey.toStringDer(),
    };

  } catch (error) {
    console.error('Error creating account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse public key from various formats
 */
function parsePublicKey(publicKeyString: string): PublicKey {
  try {
    // Remove any prefixes
    const cleanKey = publicKeyString.replace(/^0x/, '');

    // Try parsing as DER (most common format from Web Crypto API)
    if (cleanKey.length > 64) {
      return PublicKey.fromString(cleanKey);
    }

    // Try parsing as raw ECDSA secp256k1
    return PublicKey.fromStringECDSA(cleanKey);
  } catch (error) {
    console.error('Error parsing public key:', error);
    throw new Error('Invalid public key format. Expected DER or hex string.');
  }
}

/**
 * Convert Hedera Account ID to EVM address
 * EVM address is derived from the account number
 */
function accountIdToEvmAddress(accountId: AccountId): string {
  // Hedera's EVM address format: 0x + account number (left-padded to 40 hex chars)
  const accountNum = accountId.num.toString(16).padStart(40, '0');
  return `0x${accountNum}`;
}
