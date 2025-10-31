/**
 * NFT Minting Edge Function
 *
 * Creates NFT collections and mints NFTs on Hedera testnet using HTS.
 * This function handles the server-side Hedera SDK operations.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
} from 'npm:@hashgraph/sdk@^2.40.0';

// Hedera configuration from environment variables
const HEDERA_NETWORK = Deno.env.get('HEDERA_NETWORK') || 'testnet';
const HEDERA_OPERATOR_ID = Deno.env.get('HEDERA_OPERATOR_ID');
const HEDERA_OPERATOR_KEY = Deno.env.get('HEDERA_OPERATOR_KEY');

// Default NFT collection ID (create this once and reuse)
const DEFAULT_COLLECTION_ID = Deno.env.get('NFT_COLLECTION_ID');

interface MintRequest {
  healthCheck?: boolean;
  name: string;
  description: string;
  category: string;
  imageData: string;
  attributes: Array<{ trait_type: string; value: string }>;
  collectionId?: string;
  creatorAccountId: string;
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
    const body: MintRequest = await req.json();

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

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID),
      PrivateKey.fromString(HEDERA_OPERATOR_KEY)
    );

    // Use provided collection ID or default
    const collectionId = body.collectionId || DEFAULT_COLLECTION_ID;

    if (!collectionId) {
      // Create a new NFT collection
      const createResult = await createNFTCollection(client, {
        name: `${body.name} Collection`,
        symbol: body.category.substring(0, 4).toUpperCase(),
        maxSupply: 1000,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create collection');
      }

      // Mint NFT to the new collection
      const mintResult = await mintNFT(client, createResult.tokenId!, body);

      return new Response(
        JSON.stringify({
          ...mintResult,
          collectionId: createResult.tokenId,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: mintResult.success ? 200 : 400,
        }
      );
    } else {
      // Mint to existing collection
      const mintResult = await mintNFT(client, collectionId, body);

      return new Response(
        JSON.stringify(mintResult),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: mintResult.success ? 200 : 400,
        }
      );
    }

  } catch (error) {
    console.error('NFT Minting Error:', error);

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
 * Create an NFT collection (HTS token)
 */
async function createNFTCollection(
  client: Client,
  params: { name: string; symbol: string; maxSupply: number }
): Promise<{ success: boolean; tokenId?: string; error?: string }> {
  try {
    const operatorId = client.operatorAccountId;
    const operatorKey = client.operatorPublicKey;

    if (!operatorId || !operatorKey) {
      throw new Error('Operator not set');
    }

    // Create NFT collection
    const createTx = await new TokenCreateTransaction()
      .setTokenName(params.name)
      .setTokenSymbol(params.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(params.maxSupply)
      .setTreasuryAccountId(operatorId)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .freezeWith(client)
      .execute(client);

    const receipt = await createTx.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Token ID not returned');
    }

    console.log(`Created NFT collection: ${tokenId.toString()}`);

    return {
      success: true,
      tokenId: tokenId.toString(),
    };

  } catch (error) {
    console.error('Error creating NFT collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mint an NFT to a collection
 */
async function mintNFT(
  client: Client,
  tokenId: string,
  metadata: MintRequest
): Promise<{ success: boolean; tokenId?: string; serialNumber?: number; transactionId?: string; error?: string }> {
  try {
    // Create metadata JSON
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      image: metadata.imageData,
      attributes: metadata.attributes,
      creator: metadata.creatorAccountId,
      timestamp: new Date().toISOString(),
    };

    // Convert metadata to bytes
    const metadataBytes = new TextEncoder().encode(JSON.stringify(nftMetadata));

    // Mint NFT
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([metadataBytes])
      .freezeWith(client)
      .execute(client);

    const receipt = await mintTx.getReceipt(client);
    const serialNumber = receipt.serials[0];

    console.log(`Minted NFT: ${tokenId} #${serialNumber.toString()}`);

    return {
      success: true,
      tokenId,
      serialNumber: serialNumber.toNumber(),
      transactionId: mintTx.transactionId.toString(),
    };

  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
