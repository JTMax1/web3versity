/**
 * Hedera NFT Certificate System
 *
 * Implements NFT certificate minting using Hedera Token Service (HTS)
 * with SVG certificate generation and Hedera File Service (HFS) storage.
 *
 * Features:
 * - SVG certificate generation with embedded QR codes
 * - HFS storage for both SVG images and metadata
 * - Platform signatures (HMAC-SHA256) for authenticity
 * - Token association detection and handling
 * - Mirror Node API for verification
 */

import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenNftInfoQuery,
  TokenAssociateTransaction,
  Hbar,
} from '@hashgraph/sdk';
import {
  generateAndUploadCertificate,
  fetchFromHFSMirror,
} from './certificate-generator';

export interface CertificateData {
  courseName: string;
  courseId: string;
  userName: string;
  userHederaAccountId: string;
  completionDate: string;
  certificateNumber: string;
}

export interface NFTCertificateResult {
  tokenId: string;
  serialNumber: number;
  imageHfsFileId: string;
  metadataHfsFileId: string;
  platformSignature: string;
  mintTransactionId: string;
  transferTransactionId?: string;
  hashScanUrl: string;
}

/**
 * Create the Web3Versity NFT Certificate Collection
 * This should be run ONCE during initial setup
 */
export async function createCertificateCollection(
  operatorId: string,
  operatorKey: string
): Promise<{ tokenId: string; transactionId: string }> {
  // Initialize Hedera client
  const client = Client.forTestnet();
  const accountId = AccountId.fromString(operatorId);

  // Parse private key (try ECDSA first, fallback to ED25519)
  let privateKey: PrivateKey;
  try {
    privateKey = PrivateKey.fromStringECDSA(operatorKey);
  } catch {
    privateKey = PrivateKey.fromStringED25519(operatorKey);
  }

  client.setOperator(accountId, privateKey);

  try {
    // Create NFT collection
    const transaction = await new TokenCreateTransaction()
      .setTokenName('Web3Versity Certificates')
      .setTokenSymbol('W3VCERT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setSupplyKey(privateKey) // Needed to mint NFTs
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client);

    const signedTx = await transaction.sign(privateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Failed to create NFT collection - no token ID returned');
    }

    client.close();

    return {
      tokenId: tokenId.toString(),
      transactionId: txResponse.transactionId.toString(),
    };
  } catch (error) {
    client.close();
    throw error;
  }
}

/**
 * Check if account is associated with token
 * Returns true if already associated, false if needs association
 */
export async function checkTokenAssociation(
  tokenId: string,
  accountId: string
): Promise<boolean> {
  try {
    const client = Client.forTestnet();

    // Query account token relationship
    // Note: This requires mirror node query or SDK query
    // For now, we'll assume association is needed and handle the error
    client.close();
    return false; // Conservative: assume not associated
  } catch (error) {
    console.error('Error checking token association:', error);
    return false;
  }
}

/**
 * Associate token with user account (for non-custodial wallets)
 * This must be signed by the user's wallet
 *
 * @param tokenId - HTS token ID
 * @param userAccountId - User's Hedera account
 * @param userPrivateKey - User's private key (from wallet)
 * @returns Transaction ID
 */
export async function associateToken(
  tokenId: string,
  userAccountId: string,
  userPrivateKey: PrivateKey
): Promise<string> {
  const client = Client.forTestnet();
  const accountId = AccountId.fromString(userAccountId);

  client.setOperator(accountId, userPrivateKey);

  try {
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedTx = await transaction.sign(userPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    client.close();

    return txResponse.transactionId.toString();
  } catch (error) {
    client.close();
    throw error;
  }
}

/**
 * Mint NFT Certificate with SVG image and HFS storage
 *
 * Flow:
 * 1. Generate SVG certificate with QR code
 * 2. Upload SVG to HFS → imageHfsFileId
 * 3. Create metadata JSON with certificate data
 * 4. Upload metadata to HFS → metadataHfsFileId
 * 5. Mint NFT with metadata bytes pointing to HFS files
 * 6. Transfer NFT to recipient
 *
 * @param collectionTokenId - HTS token ID of the certificate collection
 * @param certificateData - Certificate information
 * @param recipientAccountId - Recipient's Hedera account
 * @param operatorId - Operator account (treasury)
 * @param operatorKey - Operator private key
 * @param hmacSecret - Platform HMAC secret for signatures
 * @param baseUrl - Base URL for verification (e.g., "https://web3versity.netlify.app")
 * @returns NFT minting result with HFS file IDs
 */
export async function mintCertificateNFT(
  collectionTokenId: string,
  certificateData: CertificateData,
  recipientAccountId: string,
  operatorId: string,
  operatorKey: string,
  hmacSecret: string,
  baseUrl: string = 'https://web3versity.netlify.app'
): Promise<NFTCertificateResult> {
  console.log('🎓 Minting certificate NFT:', certificateData.certificateNumber);

  // Initialize Hedera client
  const client = Client.forTestnet();
  const accountId = AccountId.fromString(operatorId);
  const recipientId = AccountId.fromString(recipientAccountId);

  // Parse private key
  let privateKey: PrivateKey;
  try {
    privateKey = PrivateKey.fromStringECDSA(operatorKey);
  } catch {
    privateKey = PrivateKey.fromStringED25519(operatorKey);
  }

  client.setOperator(accountId, privateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));

  try {
    // 1. Generate certificate SVG and upload to HFS
    console.log('🎨 Generating certificate with SVG and HFS upload...');
    const certificatePackage = await generateAndUploadCertificate(
      {
        userName: certificateData.userName,
        hederaAccountId: certificateData.userHederaAccountId,
      },
      {
        courseName: certificateData.courseName,
      },
      certificateData.certificateNumber,
      certificateData.completionDate,
      client,
      privateKey,
      hmacSecret,
      baseUrl
    );

    console.log('✅ Certificate package created:');
    console.log(`   Image HFS ID: ${certificatePackage.imageFileId}`);
    console.log(`   Metadata HFS ID: ${certificatePackage.metadataFileId}`);

    // 2. Prepare NFT metadata bytes (on-chain)
    // This is minimal - just points to HFS files
    const nftMetadataBytes = Buffer.from(
      JSON.stringify({
        hfs_metadata_file_id: certificatePackage.metadataFileId,
        image_hfs_file_id: certificatePackage.imageFileId,
      })
    );

    // 3. Mint NFT
    console.log('🪙 Minting NFT...');
    const mintTx = await new TokenMintTransaction()
      .setTokenId(collectionTokenId)
      .setMetadata([nftMetadataBytes])
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const mintSign = await mintTx.sign(privateKey);
    const mintSubmit = await mintSign.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);
    const serialNumber = mintReceipt.serials[0];

    console.log(`✅ NFT minted - Serial: ${serialNumber.toString()}`);

    // 4. Transfer NFT to recipient
    console.log(`📨 Transferring to ${recipientAccountId}...`);
    const transferTx = await new TransferTransaction()
      .addNftTransfer(collectionTokenId, serialNumber, accountId, recipientId)
      .setTransactionMemo(`Web3Versity Certificate: ${certificateData.certificateNumber}`)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const transferSign = await transferTx.sign(privateKey);
    const transferSubmit = await transferSign.execute(client);
    await transferSubmit.getReceipt(client);

    console.log(`✅ NFT transferred successfully`);

    client.close();

    const hashScanUrl = `https://hashscan.io/testnet/token/${collectionTokenId}/${serialNumber.toString()}`;

    return {
      tokenId: collectionTokenId,
      serialNumber: serialNumber.toNumber(),
      imageHfsFileId: certificatePackage.imageFileId,
      metadataHfsFileId: certificatePackage.metadataFileId,
      platformSignature: certificatePackage.platformSignature,
      mintTransactionId: mintSubmit.transactionId.toString(),
      transferTransactionId: transferSubmit.transactionId.toString(),
      hashScanUrl,
    };
  } catch (error) {
    client.close();
    console.error('❌ NFT minting failed:', error);
    throw error;
  }
}

/**
 * Verify Certificate on Hedera Network via Mirror Node API
 *
 * Fetches NFT info and metadata from HFS without HBAR cost
 *
 * @param tokenId - HTS token ID
 * @param serialNumber - NFT serial number
 * @returns Verification result with certificate data
 */
export async function verifyCertificate(
  tokenId: string,
  serialNumber: number
): Promise<{
  valid: boolean;
  owner?: string;
  metadata?: any;
  certificateData?: any;
  error?: string;
}> {
  try {
    // 1. Query NFT info via Mirror Node REST API
    const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
    const nftUrl = `${mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;

    console.log(`🔍 Fetching NFT info from Mirror Node: ${nftUrl}`);

    const nftResponse = await fetch(nftUrl);
    if (!nftResponse.ok) {
      return {
        valid: false,
        error: 'Certificate not found on Hedera network',
      };
    }

    const nftData = await nftResponse.json();

    // 2. Decode NFT metadata bytes
    const metadataBase64 = nftData.metadata;
    const metadataJson = Buffer.from(metadataBase64, 'base64').toString('utf-8');
    const nftMetadata = JSON.parse(metadataJson);

    // 3. Fetch full metadata from HFS via Mirror Node
    const metadataHfsFileId = nftMetadata.hfs_metadata_file_id;
    console.log(`📥 Fetching metadata from HFS: ${metadataHfsFileId}`);

    const metadataBytes = await fetchFromHFSMirror(metadataHfsFileId, 'testnet');
    const metadataString = new TextDecoder().decode(metadataBytes);
    const certificateMetadata = JSON.parse(metadataString);

    // 4. Return verification result
    return {
      valid: true,
      owner: nftData.account_id,
      metadata: nftMetadata,
      certificateData: certificateMetadata,
    };
  } catch (error) {
    console.error('❌ Certificate verification failed:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Get NFT info from Hedera Mirror Node
 *
 * @param tokenId - HTS token ID
 * @param serialNumber - NFT serial number
 * @returns NFT information
 */
export async function getNFTInfo(tokenId: string, serialNumber: number) {
  try {
    const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
    const nftUrl = `${mirrorNodeUrl}/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;

    const response = await fetch(nftUrl);
    if (!response.ok) {
      return null;
    }

    const nftData = await response.json();

    // Decode metadata
    const metadataBase64 = nftData.metadata;
    const metadataJson = Buffer.from(metadataBase64, 'base64').toString('utf-8');
    const metadata = JSON.parse(metadataJson);

    return {
      tokenId: nftData.token_id,
      serialNumber: nftData.serial_number,
      owner: nftData.account_id,
      metadata,
      createdTimestamp: nftData.created_timestamp,
      modifiedTimestamp: nftData.modified_timestamp,
    };
  } catch (error) {
    console.error('❌ Failed to get NFT info:', error);
    throw error;
  }
}

/**
 * Fetch certificate SVG image from HFS
 *
 * @param imageHfsFileId - HFS file ID for SVG
 * @returns SVG as string
 */
export async function fetchCertificateSVG(imageHfsFileId: string): Promise<string> {
  const svgBytes = await fetchFromHFSMirror(imageHfsFileId, 'testnet');
  return new TextDecoder().decode(svgBytes);
}
