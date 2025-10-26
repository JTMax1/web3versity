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
      providers?: any[]; // Support for multiple wallet providers
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
    decimals: 18,  // Hedera uses 18 decimals for HBAR
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
 * Detect if ANY Web3 wallet is installed
 * Supports: Metamask, HashPack, Blade, Kabila, Trust, Coinbase, and any wallet with ethereum provider
 * @returns true if any wallet with ethereum provider is detected
 */
export function detectWallet(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.ethereum);
}

/**
 * Check if wallet is supported
 * @returns true if any Web3 wallet is installed
 */
export function isWalletSupported(): boolean {
  return detectWallet();
}

/**
 * Get the Ethereum provider (Metamask)
 * Forces use of Metamask to avoid conflicts with Hashgraph SDK wallet detection
 * @throws Error if Metamask is not installed
 */
function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Web3 wallet detected. Please install Metamask to use this app.');
  }

  // Force use of Metamask provider to avoid conflicts
  // If multiple wallets are installed, prioritize Metamask
  if (window.ethereum.providers) {
    // Some wallets inject an array of providers
    const metamaskProvider = (window.ethereum.providers as any[]).find(
      (provider: any) => provider.isMetaMask
    );
    if (metamaskProvider) {
      return metamaskProvider;
    }
  }

  // Return the default ethereum provider (should be Metamask)
  return window.ethereum;
}

/**
 * Get the name of the detected wallet
 * @returns Wallet name or 'unknown'
 */
export function getWalletName(): string {
  if (typeof window === 'undefined' || !window.ethereum) return 'none';

  if (window.ethereum.isMetaMask) return 'Metamask';
  if ((window.ethereum as any).isHashPack) return 'HashPack';
  if ((window.ethereum as any).isBlade) return 'Blade Wallet';
  if ((window.ethereum as any).isKabila) return 'Kabila Wallet';
  if ((window.ethereum as any).isTrust) return 'Trust Wallet';
  if ((window.ethereum as any).isCoinbaseWallet) return 'Coinbase Wallet';
  if ((window.ethereum as any).isTokenPocket) return 'TokenPocket';

  return 'Web3 Wallet';
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
 * SMART NETWORK HANDLING:
 * - Auto-detects current network
 * - Auto-adds Hedera Testnet if not present
 * - Auto-switches to Hedera Testnet
 * - Handles all user rejection scenarios gracefully
 *
 * @returns Wallet connection result with account ID and EVM address
 * @throws Error if connection fails or user rejects
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  const provider = getProvider();

  try {
    console.log('🔌 Initiating wallet connection...');

    // Step 1: Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock Metamask.');
    }

    const evmAddress = accounts[0];
    console.log('✅ Account connected:', evmAddress.substring(0, 10) + '...');

    // Step 2: Check current network
    const currentChainId = await getCurrentChainId();
    const onTestnet = currentChainId === HEDERA_TESTNET_CHAIN_ID;

    console.log(`🌐 Current network: Chain ID ${currentChainId} (Hedera Testnet: ${onTestnet})`);

    // Step 3: If not on Hedera Testnet, add and switch
    if (!onTestnet) {
      console.log('⚠️ Not on Hedera Testnet. Attempting to add/switch network...');

      try {
        // First try to switch (in case network already exists)
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
        });
        console.log('✅ Switched to Hedera Testnet');
      } catch (switchError: any) {
        // Network doesn't exist (error 4902), add it
        if (switchError.code === 4902) {
          console.log('📡 Hedera Testnet not found. Adding network to Metamask...');

          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [HEDERA_TESTNET_CONFIG],
            });
            console.log('✅ Hedera Testnet added successfully!');
          } catch (addError: any) {
            if (addError.code === 4001) {
              throw new Error('You need to add Hedera Testnet to use this app. Please try again and approve the network addition.');
            }
            throw addError;
          }
        } else if (switchError.code === 4001) {
          // User rejected the switch
          throw new Error('You need to switch to Hedera Testnet to use this app. Please try again and approve the network switch.');
        } else {
          throw switchError;
        }
      }
    }

    // Step 4: Verify we're on correct network now
    const finalChainId = await getCurrentChainId();
    if (finalChainId !== HEDERA_TESTNET_CHAIN_ID) {
      throw new Error('Failed to connect to Hedera Testnet. Please switch your network manually.');
    }

    // Step 5: Get or derive Hedera account ID
    console.log('🔍 Fetching Hedera account ID...');
    const accountId = await getHederaAccountId(evmAddress);
    console.log('✅ Hedera account ID:', accountId);

    console.log('🎉 Wallet connection successful!');

    return {
      accountId,
      evmAddress,
      network: 'testnet',
      connected: true,
    };
  } catch (error: any) {
    console.error('❌ Wallet connection failed:', error);

    // User rejected connection
    if (error.code === 4001) {
      throw new Error('You rejected the wallet connection. Please try again and approve the connection.');
    }

    // Already handled errors with custom messages
    if (error.message?.includes('need to')) {
      throw error;
    }

    // User rejected network addition/switch (already handled above, but fallback)
    if (error.message?.includes('rejected') || error.message?.includes('switch')) {
      throw new Error('Network setup required. Please approve adding Hedera Testnet to your Metamask.');
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
 * Submit a transaction on Hedera
 * Uses Metamask to sign and broadcast transactions to Hedera Testnet
 *
 * REAL IMPLEMENTATION - Transaction signing via Metamask
 *
 * @param fromAccountId - Sender account (EVM address or Hedera account ID)
 * @param toAccountId - Recipient account (EVM address or Hedera account ID)
 * @param amount - Amount in HBAR
 * @returns Transaction result with hash and explorer URL
 */
export async function submitTransaction(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<TransactionResult> {
  const provider = getProvider();

  try {
    // Convert accounts to EVM address format if needed
    let fromAddress = fromAccountId;
    let toAddress = toAccountId;

    // If sender is in Hedera format (0.0.xxxxx), convert to EVM
    if (fromAccountId.startsWith('0.0.')) {
      const accountNum = fromAccountId.split('.')[2];
      fromAddress = '0x' + parseInt(accountNum).toString(16).padStart(40, '0');
    }

    // If recipient is in Hedera format (0.0.xxxxx), convert to EVM
    if (toAccountId.startsWith('0.0.')) {
      const accountNum = toAccountId.split('.')[2];
      toAddress = '0x' + parseInt(accountNum).toString(16).padStart(40, '0');
    }

    // Convert HBAR to wei (1 HBAR = 10^18 wei)
    const amountInWei = BigInt(Math.floor(amount * 1e18)).toString(16);

    // Build transaction parameters
    const txParams = {
      from: fromAddress,
      to: toAddress,
      value: '0x' + amountInWei,
      gas: '0x5208', // 21000 gas for simple transfer
    };

    console.log('🚀 Submitting transaction via Metamask...');

    // Request user to sign transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    }) as string;

    console.log('✅ Transaction submitted:', txHash);

    // Wait for confirmation
    let attempts = 0;
    const maxAttempts = 30;
    let receipt = null;

    while (!receipt && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      receipt = await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      attempts++;
    }

    const success = receipt && (receipt.status === '0x1' || receipt.status === 1);

    return {
      transactionId: txHash,
      status: success ? 'success' : 'failed',
      explorerUrl: getHashScanUrl(txHash),
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error('Transaction submission failed:', error);
    throw new Error(parseMetamaskError(error));
  }
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
    console.time('Token Association Total Time');

    // Get user's account (may be slow if MetaMask is loading)
    console.log('⏳ Requesting accounts from MetaMask...');
    console.time('MetaMask Account Request');
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];
    console.timeEnd('MetaMask Account Request');

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

    // Send transaction (MetaMask popup will appear here)
    console.log('⏳ Sending transaction to MetaMask for signing...');
    console.time('MetaMask Transaction Signing');
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: userAddress,
        to: HTS_ADDRESS,
        data: data,
        // gas: '0x100000', // 1,048,576 gas limit removed cause it slows metamask. Not needed since this is just a testnet app
      }],
    }) as string;
    console.timeEnd('MetaMask Transaction Signing');

    console.log(`✅ Token association transaction sent: ${txHash}`);

    // Wait for transaction receipt
    console.log('⏳ Waiting for transaction confirmation...');
    console.time('Transaction Confirmation');
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

      if (attempts % 5 === 0) {
        console.log(`Still waiting... (${attempts}/${maxAttempts} seconds)`);
      }
    }
    console.timeEnd('Transaction Confirmation');

    if (!receipt) {
      throw new Error('Transaction receipt not found after 30 seconds');
    }

    // Check if transaction succeeded
    const success = receipt.status === '0x1' || receipt.status === 1;

    console.timeEnd('Token Association Total Time');
    console.log(`🎉 Token association ${success ? 'successful' : 'failed'}!`);

    return {
      transactionId: txHash,
      status: success ? 'success' : 'failed',
      explorerUrl: `https://hashscan.io/testnet/transaction/${txHash}`,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.timeEnd('Token Association Total Time');
    console.error('❌ Token association failed:', error);
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
