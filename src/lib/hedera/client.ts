/**
 * Hedera Client Configuration
 *
 * Initializes and exports a configured Hedera client for testnet operations.
 * Used for faucet, NFT minting, and other blockchain interactions.
 */

import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

/**
 * Initialize Hedera Client for Testnet
 *
 * IMPORTANT: This should only be used server-side (Supabase Edge Functions)
 * NEVER expose the operator private key to client-side code
 */
export function initializeHederaClient(): Client {
  // Get operator credentials from environment variables
  const operatorId = process.env.HEDERA_OPERATOR_ID || process.env.VITE_HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY || process.env.VITE_HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error(
      'Hedera operator credentials not found. Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY environment variables.'
    );
  }

  try {
    // Parse operator account ID
    const accountId = AccountId.fromString(operatorId);

    // Parse operator private key
    const privateKey = PrivateKey.fromString(operatorKey);

    // Create client for Hedera Testnet
    const client = Client.forTestnet();

    // Set operator account
    client.setOperator(accountId, privateKey);

    // Set default transaction fee and query payment
    // Testnet has generous limits, but we set reasonable defaults
    client.setDefaultMaxTransactionFee(100); // 1 HBAR max
    client.setDefaultMaxQueryPayment(1); // 0.01 HBAR max

    console.log(`✅ Hedera client initialized for account: ${operatorId}`);

    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Hedera client:', error);
    throw new Error(`Hedera client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Hedera Network (for display purposes)
 */
export function getHederaNetwork(): string {
  return 'testnet';
}

/**
 * Generate HashScan URL for a transaction
 *
 * @param transactionId - Hedera transaction ID (format: 0.0.xxxxx@1234567890.123456789)
 * @returns HashScan explorer URL
 */
export function generateHashScanUrl(transactionId: string): string {
  const network = getHederaNetwork();
  return `https://hashscan.io/${network}/transaction/${transactionId}`;
}

/**
 * Generate HashScan URL for an account
 *
 * @param accountId - Hedera account ID (format: 0.0.xxxxx)
 * @returns HashScan explorer URL
 */
export function generateAccountUrl(accountId: string): string {
  const network = getHederaNetwork();
  return `https://hashscan.io/${network}/account/${accountId}`;
}

/**
 * Validate Hedera Account ID format
 *
 * @param accountId - Account ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidAccountId(accountId: string): boolean {
  try {
    AccountId.fromString(accountId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format HBAR amount for display
 *
 * @param tinybars - Amount in tinybars (smallest unit)
 * @returns Formatted HBAR amount
 */
export function formatHbar(tinybars: number | bigint): string {
  const hbar = Number(tinybars) / 100_000_000; // 1 HBAR = 100,000,000 tinybars
  return `${hbar.toFixed(4)} ℏ`;
}

/**
 * Convert HBAR to tinybars
 *
 * @param hbar - Amount in HBAR
 * @returns Amount in tinybars
 */
export function hbarToTinybars(hbar: number): bigint {
  return BigInt(Math.floor(hbar * 100_000_000));
}

/**
 * Convert tinybars to HBAR
 *
 * @param tinybars - Amount in tinybars
 * @returns Amount in HBAR
 */
export function tinybarsToHbar(tinybars: number | bigint): number {
  return Number(tinybars) / 100_000_000;
}
