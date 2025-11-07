/**
 * Hedera Smart Contracts Service
 *
 * Functions for deploying and interacting with smart contracts on Hedera testnet
 * using client-side wallet signing.
 */

import {
  Client,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
} from '@hashgraph/sdk';

// Extend window type for Ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

const HEDERA_TESTNET_RPC = 'https://testnet.hashio.io/api';

export interface DeployContractParams {
  contractName: string;
  solidityCode: string;
  constructorParams?: any[];
}

export interface DeployContractResult {
  success: boolean;
  contractId?: string;
  transactionId?: string;
  hashScanUrl?: string;
  error?: string;
}

export interface ExecuteContractParams {
  contractId: string;
  functionName: string;
  functionParams?: Array<{ type: string; value: any }>;
  gas?: number;
}

export interface ExecuteContractResult {
  success: boolean;
  transactionId?: string;
  result?: any;
  error?: string;
}

/**
 * Deploy a smart contract using REAL Hedera testnet transactions
 *
 * This function deploys REAL smart contracts to Hedera testnet using the backend
 * Edge Function that has proper Hedera operator credentials.
 *
 * The user's wallet signs a message to prove authorization, then the backend
 * compiles and deploys the actual smart contract.
 *
 * @param params - Contract deployment parameters
 * @returns Deploy result with REAL contract ID verifiable on HashScan
 */
export async function deployContractClientSide(
  params: DeployContractParams
): Promise<DeployContractResult> {
  try {
    console.log('🚀 Deploying REAL smart contract to Hedera testnet...');

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
        error: 'No wallet account found',
      };
    }

    console.log('✅ Wallet connected:', accounts[0]);

    console.log('📝 Contract details:', {
      name: params.contractName,
      codeLength: params.solidityCode.length,
    });

    // Request wallet signature to prove ownership
    const authMessage = `Deploy Smart Contract\nName: ${params.contractName}\nCode Length: ${params.solidityCode.length} chars\nTimestamp: ${new Date().toISOString()}`;

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

    // Call Edge Function to deploy REAL smart contract
    console.log('⏳ Deploying contract to Hedera network via Edge Function...');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contract-deploy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'deploy',
          contractName: params.contractName,
          solidityCode: params.solidityCode,
          constructorParams: params.constructorParams || [],
          walletAddress: accounts[0],
          walletSignature: walletSignature,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to deploy contract');
    }

    console.log('🎉 Smart contract deployed to Hedera testnet!');
    console.log('Contract ID:', result.contractId);
    console.log('Transaction ID:', result.transactionId);

    const hashScanUrl = `https://hashscan.io/testnet/contract/${result.contractId}`;

    // Verify on Mirror Node
    console.log('🔍 Verifying on Hedera Mirror Node...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const mirrorResponse = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/contracts/${result.contractId}`
      );

      if (mirrorResponse.ok) {
        const contractData = await mirrorResponse.json();
        console.log('✅ Mirror Node verification successful:', contractData);
      }
    } catch (mirrorError) {
      console.warn('⚠️ Could not verify on mirror node:', mirrorError);
    }

    return {
      success: true,
      contractId: result.contractId,
      transactionId: result.transactionId,
      hashScanUrl,
    };

  } catch (error: any) {
    console.error('❌ Contract deployment failed:', error);

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

    if (error.message?.includes('not supported')) {
      return {
        success: false,
        error: error.message + '. Please use one of the pre-compiled contract templates.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to deploy contract',
    };
  }
}

/**
 * Execute a smart contract function using REAL Hedera testnet transactions
 *
 * This function executes REAL contract functions on Hedera testnet using the backend
 * Edge Function that has proper Hedera operator credentials.
 *
 * @param params - Contract execution parameters
 * @returns Execution result with REAL transaction details
 */
export async function executeContractClientSide(
  params: ExecuteContractParams
): Promise<ExecuteContractResult> {
  try {
    console.log('⚡ Executing REAL contract function on Hedera testnet...');

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
        error: 'No wallet account found',
      };
    }

    console.log('✅ Wallet connected:', accounts[0]);
    console.log('📝 Executing function:', params.functionName);

    // Request wallet signature to prove ownership
    const authMessage = `Execute Contract Function\nContract: ${params.contractId}\nFunction: ${params.functionName}\nParams: ${JSON.stringify(params.functionParams || [])}\nTimestamp: ${new Date().toISOString()}`;

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

    // Call Edge Function to execute REAL contract function
    console.log('⏳ Executing contract function on Hedera network via Edge Function...');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contract-deploy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'execute',
          contractId: params.contractId,
          functionName: params.functionName,
          functionParams: params.functionParams || [],
          gas: params.gas || 100000,
          walletAddress: accounts[0],
          walletSignature: walletSignature,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to execute contract function');
    }

    console.log('🎉 Contract function executed on Hedera testnet!');
    console.log('Transaction ID:', result.transactionId);
    console.log('Result:', result.result);

    // Verify on Mirror Node
    console.log('🔍 Verifying on Hedera Mirror Node...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const mirrorResponse = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/transactions/${result.transactionId}`
      );

      if (mirrorResponse.ok) {
        const txData = await mirrorResponse.json();
        console.log('✅ Mirror Node verification successful:', txData);
      }
    } catch (mirrorError) {
      console.warn('⚠️ Could not verify on mirror node:', mirrorError);
    }

    return {
      success: true,
      transactionId: result.transactionId,
      result: result.result,
    };

  } catch (error: any) {
    console.error('❌ Contract execution failed:', error);

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
      error: error.message || 'Failed to execute contract',
    };
  }
}

/**
 * Query a smart contract (view/pure functions) using CLIENT-SIDE wallet
 *
 * @param params - Contract query parameters
 * @returns Query result
 */
export async function queryContractClientSide(
  params: ExecuteContractParams
): Promise<ExecuteContractResult> {
  // For view functions, we use the same flow as execute
  // but typically no wallet signature is needed for reads
  // For educational purposes, we'll still prompt for signature
  return executeContractClientSide(params);
}
