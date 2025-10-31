/**
 * Hedera Token Service (HTS) Utilities
 *
 * Functions for creating NFT collections, minting NFTs, and managing tokens
 * on Hedera testnet.
 */

import { supabase } from '../supabase/client';

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

export interface CreateCollectionParams {
  name: string;
  symbol: string;
  maxSupply?: number;
  memo?: string;
}

export interface MintNFTParams {
  collectionId?: string; // If not provided, creates new collection
  name: string;
  description: string;
  category: string;
  imageData: string; // emoji or IPFS hash
  attributes: Array<{ trait_type: string; value: string }>;
  creatorAccountId: string;
}

export interface MintResult {
  success: boolean;
  tokenId: string;
  serialNumber: number;
  transactionId: string;
  hashScanUrl: string;
  error?: string;
}

export interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: number;
  maxSupply: number;
  type: string;
  owner: string;
}

/**
 * Mint an NFT using backend Edge Function
 *
 * This function calls a Supabase Edge Function that handles:
 * 1. Creating NFT collection (if needed)
 * 2. Uploading metadata to IPFS (optional)
 * 3. Minting NFT with TokenMintTransaction
 * 4. Returning token ID and transaction details
 *
 * @param params - NFT minting parameters
 * @returns Mint result with token ID and transaction details
 */
export async function mintNFT(params: MintNFTParams): Promise<MintResult> {
  try {
    // Call Supabase Edge Function for NFT minting
    const { data, error } = await supabase.functions.invoke('nft-mint', {
      body: {
        name: params.name,
        description: params.description,
        category: params.category,
        imageData: params.imageData,
        attributes: params.attributes,
        collectionId: params.collectionId,
        creatorAccountId: params.creatorAccountId,
      },
    });

    if (error) {
      console.error('NFT minting error:', error);
      return {
        success: false,
        tokenId: '',
        serialNumber: 0,
        transactionId: '',
        hashScanUrl: '',
        error: error.message || 'Failed to mint NFT',
      };
    }

    // Success response from Edge Function
    return {
      success: true,
      tokenId: data.tokenId,
      serialNumber: data.serialNumber,
      transactionId: data.transactionId,
      hashScanUrl: `https://hashscan.io/testnet/token/${data.tokenId}`,
    };

  } catch (error) {
    console.error('Unexpected error during NFT minting:', error);
    return {
      success: false,
      tokenId: '',
      serialNumber: 0,
      transactionId: '',
      hashScanUrl: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get token information from Mirror Node
 *
 * @param tokenId - Hedera token ID (0.0.xxxxx format)
 * @returns Token information or null if not found
 */
export async function getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
  try {
    const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);

    if (!response.ok) {
      console.error(`Failed to fetch token info: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      tokenId: data.token_id,
      name: data.name,
      symbol: data.symbol,
      totalSupply: parseInt(data.total_supply || '0'),
      maxSupply: parseInt(data.max_supply || '0'),
      type: data.type,
      owner: data.treasury_account_id,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

/**
 * Get NFT details including metadata
 *
 * @param tokenId - Token ID
 * @param serialNumber - NFT serial number
 * @returns NFT details or null if not found
 */
export async function getNFTDetails(
  tokenId: string,
  serialNumber: number
): Promise<any | null> {
  try {
    const response = await fetch(
      `${MIRROR_NODE_URL}/tokens/${tokenId}/nfts/${serialNumber}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch NFT details: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return null;
  }
}

/**
 * Get all NFTs owned by an account
 *
 * @param accountId - Hedera account ID
 * @returns Array of NFTs or empty array
 */
export async function getAccountNFTs(accountId: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${MIRROR_NODE_URL}/accounts/${accountId}/nfts?limit=100`
    );

    if (!response.ok) {
      console.error(`Failed to fetch account NFTs: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.nfts || [];
  } catch (error) {
    console.error('Error fetching account NFTs:', error);
    return [];
  }
}

/**
 * Check if Edge Function is available
 * This is a fallback to ensure the feature works even without backend
 */
export async function checkNFTMintingAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('nft-mint', {
      body: { healthCheck: true },
    });

    return !error && data?.available === true;
  } catch (error) {
    console.warn('NFT minting Edge Function not available:', error);
    return false;
  }
}

/**
 * Simulate NFT minting for development/testing
 * Returns mock data when backend is not available
 */
export async function simulateNFTMinting(params: MintNFTParams): Promise<MintResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockTokenId = `0.0.${Math.floor(Math.random() * 1000000) + 5000000}`;
  const mockSerialNumber = Math.floor(Math.random() * 1000) + 1;
  const mockTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}-000000000`;

  return {
    success: true,
    tokenId: mockTokenId,
    serialNumber: mockSerialNumber,
    transactionId: mockTransactionId,
    hashScanUrl: `https://hashscan.io/testnet/token/${mockTokenId}`,
  };
}
