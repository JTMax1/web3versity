// Hedera wallet and transaction utilities for Web3versity
// 
// DEMO MODE: This file currently uses simulated wallet connections and transactions
// for demonstration and prototyping purposes.
// 
// FOR PRODUCTION DEPLOYMENT:
// 1. Install HashConnect SDK: npm install hashconnect
// 2. Install Hedera SDK: npm install @hashgraph/sdk
// 3. Replace simulation functions with real SDK calls
// 4. Connect to HashPack or Blade wallet extensions
// 5. Use real Hedera testnet/mainnet endpoints
// 
// Example Production Integration:
// import { HashConnect } from 'hashconnect';
// import { Client, TransferTransaction, Hbar } from '@hashgraph/sdk';
// 
// const hashconnect = new HashConnect();
// await hashconnect.init(appMetadata);
// const pairing = await hashconnect.connectToLocalWallet();
// 
// See: https://docs.hedera.com/hedera/sdks-and-apis/sdks/hashconnect

export interface WalletConnectionResult {
  accountId: string;
  network: string;
  connected: boolean;
}

export interface TransactionResult {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  explorerUrl: string;
  timestamp?: number;
}

// Helper to format Hedera account ID
export function formatAccountId(accountId: string): string {
  if (!accountId) return '';
  const parts = accountId.split('.');
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }
  return accountId;
}

// Generate HashScan explorer URL
export function getHashScanUrl(transactionId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'testnet' 
    ? 'https://hashscan.io/testnet' 
    : 'https://hashscan.io/mainnet';
  return `${baseUrl}/transaction/${transactionId}`;
}

// Simulate wallet connection (in production, this would use HashConnect SDK)
export async function connectWallet(): Promise<WalletConnectionResult> {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, return mock connection
  // In production, this would use HashConnect to connect to HashPack/Blade wallet
  return {
    accountId: '0.0.123456',
    network: 'testnet',
    connected: true
  };
}

// Simulate transaction submission
export async function submitTransaction(
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<TransactionResult> {
  // Simulate transaction processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock transaction ID (format: 0.0.xxxxx@timestamp.nnnnnnnnn)
  const timestamp = Math.floor(Date.now() / 1000);
  const nanos = Math.floor(Math.random() * 1000000000);
  const transactionId = `0.0.123456@${timestamp}.${nanos}`;
  
  // For demo, randomly succeed or fail (90% success rate)
  const success = Math.random() > 0.1;
  
  return {
    transactionId,
    status: success ? 'success' : 'failed',
    explorerUrl: getHashScanUrl(transactionId),
    timestamp: Date.now()
  };
}

// Check if wallet is supported (for production)
export function isWalletSupported(): boolean {
  // In production, check if HashPack or Blade wallet extension is installed
  // For now, always return true for demo
  return true;
}

// Format HBAR amount
export function formatHbar(amount: number): string {
  return `${amount.toFixed(2)} ℏ`;
}

// Training wallet address for practice transactions
export const TRAINING_WALLET_ADDRESS = '0.0.999999';
