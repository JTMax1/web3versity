/**
 * Hedera Validation Utilities
 *
 * Pure validation functions with NO SDK dependencies
 * Safe to import in client-side code without triggering SDK wallet detection
 */

/**
 * Validate Hedera Account ID format
 * Uses regex to avoid triggering Hashgraph SDK wallet detection
 *
 * @param accountId - Account ID to validate (format: 0.0.xxxxx or 0x... EVM address)
 * @returns true if valid, false otherwise
 */
export function isValidAccountId(accountId: string): boolean {
  if (!accountId) return false;

  // Match Hedera account ID format: 0.0.xxxxx or 0.0.xxxxx-abcde
  const hederaIdRegex = /^0\.0\.\d+(-[a-z]{5})?$/;

  // Match EVM address format: 0x followed by 40 hexadecimal characters
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  return hederaIdRegex.test(accountId) || evmAddressRegex.test(accountId);
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

/**
 * Generate HashScan URL for a transaction
 *
 * @param transactionId - Hedera transaction ID (format: 0.0.xxxxx@1234567890.123456789)
 * @param network - Network ('testnet' or 'mainnet')
 * @returns HashScan explorer URL
 */
export function generateHashScanUrl(transactionId: string, network: string = 'testnet'): string {
  return `https://hashscan.io/${network}/transaction/${transactionId}`;
}

/**
 * Generate HashScan URL for an account
 *
 * @param accountId - Hedera account ID (format: 0.0.xxxxx)
 * @param network - Network ('testnet' or 'mainnet')
 * @returns HashScan explorer URL
 */
export function generateAccountUrl(accountId: string, network: string = 'testnet'): string {
  return `https://hashscan.io/${network}/account/${accountId}`;
}
