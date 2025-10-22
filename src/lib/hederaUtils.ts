/**
 * Hedera Wallet and Transaction Utilities for Web3Versity
 *
 * Real Metamask integration for Hedera Testnet via JSON-RPC
 *
 * This module provides:
 * - Metamask detection and connection
 * - Hedera Testnet network management
 * - EVM address to Hedera account ID conversion
 * - HBAR balance queries
 * - Account and network change listeners
 */

import { env } from '@/config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WalletConnectionResult {
  accountId: string;        // Hedera format: 0.0.xxxxx or EVM address
  evmAddress: string;       // EVM format: 0x...
  network: string;          // 'testnet' or 'mainnet'
  connected: boolean;
}

export interface TransactionResult {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  explorerUrl: string;
  timestamp?: number;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Extend Window interface for Ethereum provider
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
    };
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Hedera Testnet Configuration
export const HEDERA_TESTNET_CONFIG: NetworkConfig = {
  chainId: '0x128', // 296 in decimal
  chainName: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 8,  // Hedera uses 8 decimals for HBAR
  },
  rpcUrls: [env.HEDERA_TESTNET_RPC || 'https://testnet.hashio.io/api'],
  blockExplorerUrls: ['https://hashscan.io/testnet'],
};

// Hedera Mainnet Configuration
export const HEDERA_MAINNET_CONFIG: NetworkConfig = {
  chainId: '0x127', // 295 in decimal
  chainName: 'Hedera Mainnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 8,
  },
  rpcUrls: ['https://mainnet.hashio.io/api'],
  blockExplorerUrls: ['https://hashscan.io/mainnet'],
};

// Chain ID constants
export const HEDERA_TESTNET_CHAIN_ID = 296;
export const HEDERA_MAINNET_CHAIN_ID = 295;

// Training wallet address for practice transactions
export const TRAINING_WALLET_ADDRESS = '0.0.999999';

// ============================================================================
// METAMASK DETECTION & VALIDATION
// ============================================================================

/**
 * Detect if Metamask is installed
 * @returns true if Metamask is detected
 */
export function detectMetamask(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.ethereum && window.ethereum.isMetaMask);
}

/**
 * Check if wallet is supported
 * @returns true if Metamask is installed
 */
export function isWalletSupported(): boolean {
  return detectMetamask();
}

/**
 * Get the Ethereum provider
 * @throws Error if Metamask is not installed
 */
function getProvider() {
  if (!detectMetamask()) {
    throw new Error('Metamask is not installed. Please install Metamask to continue.');
  }
  return window.ethereum!;
}

// ============================================================================
// EVM ADDRESS ↔ HEDERA ACCOUNT ID CONVERSION
// ============================================================================

/**
 * Convert EVM address (0x...) to Hedera account ID (0.0.xxxxx)
 *
 * Note: This is a simplified conversion. In production, you would:
 * 1. Query Hedera Mirror Node API for account-address mapping
 * 2. Use the account's EVM address alias
 *
 * For now, we use the address as-is since Hedera supports EVM addresses directly
 *
 * @param evmAddress - EVM address (0x...)
 * @returns Hedera-compatible identifier
 */
export function evmAddressToHederaAccountId(evmAddress: string): string {
  if (!evmAddress || !evmAddress.startsWith('0x')) {
    throw new Error('Invalid EVM address');
  }

  // For Hedera, we can use the EVM address directly as an alias
  // The actual account ID would need to be fetched from Hedera Mirror Node
  // For now, return the EVM address as the identifier
  return evmAddress.toLowerCase();
}

/**
 * Query Hedera Mirror Node to get the actual account ID from EVM address
 * This is an async operation that queries the Hedera network
 *
 * @param evmAddress - EVM address (0x...)
 * @returns Hedera account ID (0.0.xxxxx) or EVM address if not found
 */
export async function getHederaAccountId(evmAddress: string): Promise<string> {
  try {
    const network = env.HEDERA_NETWORK || 'testnet';
    const mirrorNodeUrl = network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet-public.mirrornode.hedera.com';

    // Query Mirror Node for account by EVM address
    const response = await fetch(
      `${mirrorNodeUrl}/api/v1/accounts/${evmAddress.toLowerCase()}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.account) {
        return data.account; // Returns format: "0.0.xxxxx"
      }
    }

    // If no account found, return EVM address as fallback
    return evmAddress.toLowerCase();
  } catch (error) {
    console.error('Error querying Hedera Mirror Node:', error);
    // Return EVM address as fallback
    return evmAddress.toLowerCase();
  }
}

// ============================================================================
// NETWORK MANAGEMENT
// ============================================================================

/**
 * Get current chain ID from Metamask
 * @returns Chain ID as decimal number
 */
export async function getCurrentChainId(): Promise<number> {
  const provider = getProvider();
  const chainIdHex = await provider.request({ method: 'eth_chainId' });
  return parseInt(chainIdHex, 16);
}

/**
 * Check if Metamask is connected to Hedera Testnet
 * @returns true if on Hedera Testnet (chain ID 296)
 */
export async function isOnHederaTestnet(): Promise<boolean> {
  try {
    const chainId = await getCurrentChainId();
    return chainId === HEDERA_TESTNET_CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Add Hedera network to Metamask
 * Prompts user to add the network if not already added
 *
 * @param networkType - 'testnet' or 'mainnet'
 * @returns true if network was added/switched successfully
 */
export async function addHederaNetwork(
  networkType: 'testnet' | 'mainnet' = 'testnet'
): Promise<boolean> {
  const provider = getProvider();
  const config = networkType === 'testnet' ? HEDERA_TESTNET_CONFIG : HEDERA_MAINNET_CONFIG;

  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    });
    return true;
  } catch (error: any) {
    // User rejected the request
    if (error.code === 4001) {
      throw new Error('User rejected network addition');
    }
    // Network already added, try switching
    if (error.code === -32002) {
      return await switchToHederaNetwork(networkType);
    }
    throw error;
  }
}

/**
 * Switch Metamask to Hedera Testnet
 * If network doesn't exist, prompts to add it
 *
 * @param networkType - 'testnet' or 'mainnet'
 * @returns true if switched successfully
 */
export async function switchToHederaNetwork(
  networkType: 'testnet' | 'mainnet' = 'testnet'
): Promise<boolean> {
  const provider = getProvider();
  const config = networkType === 'testnet' ? HEDERA_TESTNET_CONFIG : HEDERA_MAINNET_CONFIG;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    });
    return true;
  } catch (error: any) {
    // Network doesn't exist, add it
    if (error.code === 4902) {
      return await addHederaNetwork(networkType);
    }
    // User rejected the request
    if (error.code === 4001) {
      throw new Error('User rejected network switch');
    }
    throw error;
  }
}

/**
 * Convenience function specifically for Hedera Testnet
 */
export async function switchToHederaTestnet(): Promise<boolean> {
  return await switchToHederaNetwork('testnet');
}

// ============================================================================
// WALLET CONNECTION
// ============================================================================

/**
 * Connect to Metamask wallet
 * Requests account access and ensures user is on Hedera Testnet
 *
 * @returns Wallet connection result with account ID and EVM address
 * @throws Error if connection fails or user rejects
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  const provider = getProvider();

  try {
    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock Metamask.');
    }

    const evmAddress = accounts[0];

    // Check if on correct network
    const onTestnet = await isOnHederaTestnet();

    // If not on Hedera Testnet, prompt to switch
    if (!onTestnet) {
      await switchToHederaTestnet();
    }

    // Get or derive Hedera account ID
    const accountId = await getHederaAccountId(evmAddress);

    return {
      accountId,
      evmAddress,
      network: 'testnet',
      connected: true,
    };
  } catch (error: any) {
    // User rejected connection
    if (error.code === 4001) {
      throw new Error('User rejected wallet connection');
    }
    // User rejected network switch
    if (error.message?.includes('rejected')) {
      throw new Error('User rejected network switch. Please switch to Hedera Testnet manually.');
    }
    throw error;
  }
}

/**
 * Disconnect wallet (client-side only)
 * Note: Metamask doesn't have a programmatic disconnect,
 * so we just clear local state
 */
export function disconnectWallet(): void {
  // Clear any cached connection state
  if (typeof window !== 'undefined') {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }
}

/**
 * Check if wallet is currently connected
 * @returns true if wallet has connected accounts
 */
export async function isWalletConnected(): Promise<boolean> {
  if (!detectMetamask()) return false;

  try {
    const provider = getProvider();
    const accounts = await provider.request({
      method: 'eth_accounts',
    }) as string[];

    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

// ============================================================================
// ACCOUNT & NETWORK LISTENERS
// ============================================================================

/**
 * Listen to account changes in Metamask
 * Fires when user switches accounts
 *
 * @param callback - Function to call when accounts change
 * @returns Cleanup function to remove listener
 */
export function listenToAccountChanges(
  callback: (accounts: string[]) => void
): () => void {
  const provider = getProvider();

  const handleAccountsChanged = (accounts: string[]) => {
    callback(accounts);
  };

  provider.on('accountsChanged', handleAccountsChanged);

  // Return cleanup function
  return () => {
    provider.removeListener('accountsChanged', handleAccountsChanged);
  };
}

/**
 * Listen to network/chain changes in Metamask
 * Fires when user switches networks
 *
 * @param callback - Function to call when chain changes
 * @returns Cleanup function to remove listener
 */
export function listenToChainChanges(
  callback: (chainId: string) => void
): () => void {
  const provider = getProvider();

  const handleChainChanged = (chainId: string) => {
    callback(chainId);
  };

  provider.on('chainChanged', handleChainChanged);

  // Return cleanup function
  return () => {
    provider.removeListener('chainChanged', handleChainChanged);
  };
}

// ============================================================================
// BALANCE QUERIES
// ============================================================================

/**
 * Get HBAR balance for an address
 * Queries via eth_getBalance and converts from wei to HBAR
 *
 * @param address - EVM address to query
 * @returns Balance in HBAR (not tinybars)
 */
export async function getBalance(address: string): Promise<number> {
  const provider = getProvider();

  try {
    // Get balance in wei (smallest unit)
    const balanceWei = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }) as string;

    // Convert from wei to HBAR
    // Wei uses 18 decimals, but HBAR uses 8 decimals
    // 1 HBAR = 100,000,000 tinybars
    // In EVM context: 1 HBAR = 10^18 wei
    const balanceBigInt = BigInt(balanceWei);
    const hbarValue = Number(balanceBigInt) / 1e18;

    return hbarValue;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}

/**
 * Get formatted balance string
 * @param address - EVM address
 * @returns Formatted balance with HBAR symbol
 */
export async function getFormattedBalance(address: string): Promise<string> {
  const balance = await getBalance(address);
  return formatHbar(balance);
}

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Submit a transaction on Hedera (simplified)
 * In production, this would use proper transaction signing
 *
 * @param fromAccountId - Sender account
 * @param toAccountId - Recipient account
 * @param amount - Amount in HBAR
 * @returns Transaction result
 */
export async function submitTransaction(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<TransactionResult> {
  // This is a placeholder for transaction submission
  // In production, you would:
  // 1. Build transaction using ethers.js or web3.js
  // 2. Sign with Metamask
  // 3. Submit to Hedera network
  // 4. Wait for confirmation
  // 5. Return transaction ID

  throw new Error('Transaction submission not yet implemented. Use Hedera SDK for production.');
}

// ============================================================================
// FORMATTING & DISPLAY HELPERS
// ============================================================================

/**
 * Format Hedera account ID for display
 * @param accountId - Account ID (0.0.xxxxx or 0x...)
 * @returns Formatted account ID
 */
export function formatAccountId(accountId: string): string {
  if (!accountId) return '';

  // If it's an EVM address, truncate it
  if (accountId.startsWith('0x')) {
    return `${accountId.substring(0, 6)}...${accountId.substring(accountId.length - 4)}`;
  }

  // If it's a Hedera account ID format
  const parts = accountId.split('.');
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  return accountId;
}

/**
 * Format EVM address for display (truncated)
 * @param address - EVM address (0x...)
 * @returns Truncated address
 */
export function formatEvmAddress(address: string): string {
  if (!address || !address.startsWith('0x')) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Format HBAR amount with symbol
 * @param amount - Amount in HBAR
 * @returns Formatted string with ℏ symbol
 */
export function formatHbar(amount: number): string {
  return `${amount.toFixed(2)} ℏ`;
}

/**
 * Generate HashScan explorer URL
 * @param transactionId - Transaction ID
 * @param network - 'testnet' or 'mainnet'
 * @returns HashScan URL
 */
export function getHashScanUrl(
  transactionId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): string {
  const baseUrl = network === 'testnet'
    ? 'https://hashscan.io/testnet'
    : 'https://hashscan.io/mainnet';
  return `${baseUrl}/transaction/${transactionId}`;
}

/**
 * Generate HashScan account URL
 * @param accountId - Account ID or EVM address
 * @param network - 'testnet' or 'mainnet'
 * @returns HashScan account URL
 */
export function getAccountUrl(
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): string {
  const baseUrl = network === 'testnet'
    ? 'https://hashscan.io/testnet'
    : 'https://hashscan.io/mainnet';
  return `${baseUrl}/account/${accountId}`;
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Parse Metamask error into user-friendly message
 * @param error - Error from Metamask
 * @returns User-friendly error message
 */
export function parseMetamaskError(error: any): string {
  if (!error) return 'Unknown error occurred';

  // User rejected
  if (error.code === 4001) {
    return 'You rejected the request. Please try again.';
  }

  // Unauthorized
  if (error.code === 4100) {
    return 'The requested account is not authorized. Please unlock your wallet.';
  }

  // Unsupported method
  if (error.code === 4200) {
    return 'This operation is not supported by your wallet.';
  }

  // Disconnected
  if (error.code === 4900) {
    return 'Your wallet is disconnected. Please reconnect.';
  }

  // Chain disconnected
  if (error.code === 4901) {
    return 'Your wallet is not connected to any network. Please connect to Hedera Testnet.';
  }

  // Network already pending
  if (error.code === -32002) {
    return 'A network request is already pending. Please check your Metamask.';
  }

  // Return error message or default
  return error.message || 'An error occurred with your wallet';
}

// ============================================================================
// TOKEN ASSOCIATION
// ============================================================================

/**
 * Associate a token with the user's account (user must sign transaction)
 * Required before receiving NFTs on Hedera
 *
 * @param tokenId - Hedera token ID (e.g., "0.0.123456")
 * @returns Transaction result with status and explorer URL
 */
export async function associateToken(tokenId: string): Promise<TransactionResult> {
  if (!window.ethereum) {
    throw new Error('Metamask not detected');
  }

  try {
    console.log(`🔗 Associating token ${tokenId} with account...`);

    // Get user's account
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No account connected');
    }

    const userAddress = accounts[0];

    // Use Hedera Token Service precompile address
    // Address: 0x0000000000000000000000000000000000000167 (HTS system contract)
    const HTS_ADDRESS = '0x0000000000000000000000000000000000000167';

    // Convert Hedera token ID to address format
    // Token ID format: 0.0.XXXXX -> Need to convert to address
    const tokenIdParts = tokenId.split('.');
    const tokenNum = parseInt(tokenIdParts[2]);
    const tokenAddress = '0x' + tokenNum.toString(16).padStart(40, '0');

    // Function selector for associateToken(address,address)
    // associateToken function signature: 0x49146bde
    const functionSelector = '0x49146bde';

    // Encode parameters: user address + token address
    const encodedUserAddress = userAddress.slice(2).padStart(64, '0');
    const encodedTokenAddress = tokenAddress.slice(2).padStart(64, '0');

    const data = functionSelector + encodedUserAddress + encodedTokenAddress;

    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: userAddress,
        to: HTS_ADDRESS,
        data: data,
        // gas: '0x100000', // 1,048,576 gas limit removed cause it slows metamask. Not needed since this is just a testnet app
      }],
    }) as string;

    console.log(`✅ Token association transaction sent: ${txHash}`);

    // Wait for transaction receipt
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!receipt && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      attempts++;
    }

    if (!receipt) {
      throw new Error('Transaction receipt not found after 30 seconds');
    }

    // Check if transaction succeeded
    const success = receipt.status === '0x1' || receipt.status === 1;

    return {
      transactionId: txHash,
      status: success ? 'success' : 'failed',
      explorerUrl: `https://hashscan.io/testnet/transaction/${txHash}`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error('Token association error:', error);
    throw new Error(parseMetamaskError(error));
  }
}

/**
 * Check if a token is already associated with the user's account
 *
 * @param tokenId - Hedera token ID
 * @param accountAddress - User's EVM address
 * @returns true if associated, false otherwise
 */
export async function isTokenAssociated(
  tokenId: string,
  accountAddress: string
): Promise<boolean> {
  if (!window.ethereum) {
    return false;
  }

  try {
    const HTS_ADDRESS = '0x0000000000000000000000000000000000000167';

    // Convert token ID to address
    const tokenIdParts = tokenId.split('.');
    const tokenNum = parseInt(tokenIdParts[2]);
    const tokenAddress = '0x' + tokenNum.toString(16).padStart(40, '0');

    // Function selector for isAssociated(address,address) - custom, may not exist
    // Instead, we'll try to get token balance - if it works, token is associated
    // Function selector for balanceOf(address,address): 0xf7888aec
    const functionSelector = '0xf7888aec';
    const encodedUserAddress = accountAddress.slice(2).padStart(64, '0');
    const encodedTokenAddress = tokenAddress.slice(2).padStart(64, '0');
    const data = functionSelector + encodedTokenAddress + encodedUserAddress;

    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: HTS_ADDRESS,
        data: data,
      }, 'latest'],
    });

    // If call succeeds without error, token is associated
    return result !== null && result !== '0x';
  } catch (error) {
    console.error('Error checking token association:', error);
    // If error, assume not associated
    return false;
  }
}
