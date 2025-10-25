/**
 * Certificate Generator with HFS Integration (Deno/Edge Function Version)
 *
 * Handles SVG generation, HFS uploads, and metadata creation
 */

import {
  Client,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  Hbar,
} from 'npm:@hashgraph/sdk@^2.75.0';
import { generateCertificateSVG, svgToBytes, validateSVGSize } from './certificate-svg.ts';
import { generatePlatformSignature } from './signature.ts';
import { uploadToPinata, uploadJSONToPinata } from './pinata-uploader.ts';

export interface CertificateMetadata {
  name: string;
  description: string;
  image_hfs_file_id: string;
  image?: string; // IPFS URL (ipfs://xxx) for NFT marketplaces
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  platform_signature: string;
  external_url: string;
}

/**
 * Upload file to Hedera File Service
 *
 * Handles chunking for files > 4KB
 *
 * @param fileBytes - File content as Uint8Array
 * @param client - Hedera client
 * @param privateKey - Operator private key
 * @param fileName - Optional file name for logging
 * @returns HFS file ID (e.g., "0.0.12345")
 */
export async function uploadToHFS(
  fileBytes: Uint8Array,
  client: Client,
  privateKey: PrivateKey,
  fileName?: string
): Promise<string> {
  const MAX_CHUNK_SIZE = 4096; // 4 KB max per transaction
  const fileSize = fileBytes.length;

  console.log(`📤 Uploading ${fileName || 'file'} to HFS (${fileSize} bytes)...`);

  // Create file with first chunk
  const firstChunk = fileBytes.slice(0, MAX_CHUNK_SIZE);

  // Create file with operator public key for management but publicly readable content
  // Set expiration far in the future (7776000 seconds = 90 days)
  const expirationTime = new Date();
  expirationTime.setDate(expirationTime.getDate() + 90);

  const fileCreateTx = await new FileCreateTransaction()
    .setContents(firstChunk)
    .setKeys([privateKey.publicKey])
    .setExpirationTime(expirationTime)
    .setMaxTransactionFee(new Hbar(2))
    .freezeWith(client);

  const fileCreateSign = await fileCreateTx.sign(privateKey);
  const fileCreateSubmit = await fileCreateSign.execute(client);

  console.log(`⏳ Waiting for receipt for ${fileName || 'file'}...`);
  const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);

  // Detailed receipt logging
  console.log(`📋 Receipt details for ${fileName || 'file'}:`);
  console.log(`   Status: ${fileCreateReceipt.status.toString()}`);
  console.log(`   Transaction ID: ${fileCreateSubmit.transactionId.toString()}`);
  console.log(`   File ID: ${fileCreateReceipt.fileId?.toString() || 'null'}`);

  if (fileCreateReceipt.status.toString() !== 'SUCCESS') {
    throw new Error(`File creation failed with status: ${fileCreateReceipt.status.toString()}`);
  }

  const fileId = fileCreateReceipt.fileId;

  if (!fileId) {
    throw new Error('Failed to create HFS file - no file ID returned');
  }

  const fileIdString = fileId.toString();
  console.log(`✅ ${fileName || 'File'} created: ${fileIdString}`);
  console.log(`   HashScan TX: https://hashscan.io/testnet/transaction/${fileCreateSubmit.transactionId.toString()}`);
  console.log(`   HashScan File: https://hashscan.io/testnet/file/${fileIdString}`);

  // Append remaining chunks if file > 4KB
  if (fileSize > MAX_CHUNK_SIZE) {
    let offset = MAX_CHUNK_SIZE;
    let chunkCount = 1;

    while (offset < fileSize) {
      const chunk = fileBytes.slice(offset, offset + MAX_CHUNK_SIZE);

      console.log(`📤 Appending chunk ${++chunkCount} (${chunk.length} bytes)...`);

      const fileAppendTx = await new FileAppendTransaction()
        .setFileId(fileId)
        .setContents(chunk)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

      const fileAppendSign = await fileAppendTx.sign(privateKey);
      const fileAppendSubmit = await fileAppendSign.execute(client);
      const fileAppendReceipt = await fileAppendSubmit.getReceipt(client);

      if (fileAppendReceipt.status.toString() !== 'SUCCESS') {
        throw new Error(`File append failed with status: ${fileAppendReceipt.status.toString()}`);
      }

      offset += MAX_CHUNK_SIZE;
    }

    console.log(`✅ File upload complete (${chunkCount} chunks)`);
  }

  return fileIdString;
}

/**
 * Create metadata JSON and upload to HFS
 *
 * @param data - Certificate data
 * @param imageFileId - HFS file ID of certificate SVG
 * @param client - Hedera client
 * @param privateKey - Operator private key
 * @returns HFS file ID of metadata JSON
 */
export async function createMetadataJsonAndUpload(
  data: {
    userName: string;
    courseName: string;
    completionDate: string;
    certificateNumber: string;
    userHederaAccountId: string;
    platformSignature: string;
    verificationUrl: string;
  },
  imageFileId: string,
  client: Client,
  privateKey: PrivateKey
): Promise<string> {
  // Create NFT metadata JSON
  const metadata: CertificateMetadata = {
    name: `Web3Versity Certificate - ${data.courseName}`,
    description: `Certificate of Completion for ${data.courseName}, awarded to ${data.userName} on ${new Date(data.completionDate).toLocaleDateString()}`,
    image_hfs_file_id: imageFileId,
    attributes: [
      { trait_type: 'Student', value: data.userName },
      { trait_type: 'Course', value: data.courseName },
      { trait_type: 'Certificate Number', value: data.certificateNumber },
      {
        trait_type: 'Completion Date',
        value: new Date(data.completionDate).toISOString().split('T')[0],
      },
      { trait_type: 'Platform', value: 'Web3Versity' },
      { trait_type: 'Network', value: 'Hedera Testnet' },
      { trait_type: 'Hedera Account', value: data.userHederaAccountId },
    ],
    platform_signature: data.platformSignature,
    external_url: data.verificationUrl,
  };

  // Convert to JSON string
  const metadataJson = JSON.stringify(metadata, null, 2);
  const metadataBytes = new TextEncoder().encode(metadataJson);

  console.log(`📄 Metadata JSON size: ${metadataBytes.length} bytes`);

  // Upload to HFS
  const metadataFileId = await uploadToHFS(
    metadataBytes,
    client,
    privateKey,
    'metadata.json'
  );

  return metadataFileId;
}

/**
 * Generate complete certificate package (SVG + metadata) and upload to HFS
 *
 * @param userData - User information
 * @param courseData - Course information
 * @param certificateNumber - Unique certificate number
 * @param completionDate - ISO 8601 completion date
 * @param client - Hedera client
 * @param privateKey - Operator private key
 * @param hmacSecret - Platform HMAC secret
 * @param baseUrl - Base URL for verification (e.g., "https://web3versity.netlify.app")
 * @returns { imageFileId, metadataFileId, platformSignature, svgSize }
 */
export async function generateAndUploadCertificate(
  userData: {
    userName: string;
    hederaAccountId: string;
  },
  courseData: {
    courseName: string;
  },
  certificateNumber: string,
  completionDate: string,
  client: Client,
  privateKey: PrivateKey,
  hmacSecret: string,
  baseUrl: string = 'https://web3versity.netlify.app',
  pinataConfig?: {
    apiKey: string;
    apiSecret: string;
  }
): Promise<{
  imageFileId: string;
  metadataFileId: string;
  platformSignature: string;
  svgSize: number;
  svgContent: string;
  ipfsImageHash?: string;
  ipfsImageUrl?: string;
  ipfsMetadataHash?: string;
  ipfsMetadataUrl?: string;
}> {
  // Generate platform signature
  const platformSignature = await generatePlatformSignature(
    {
      certificateNumber,
      userName: userData.userName,
      courseName: courseData.courseName,
      completionDate,
      userHederaAccountId: userData.hederaAccountId,
    },
    hmacSecret
  );

  // Generate verification URL
  const verificationUrl = `${baseUrl}/verify?cert=${certificateNumber}`;

  // Generate SVG certificate
  console.log('🎨 Generating SVG certificate...');
  const svg = await generateCertificateSVG({
    userName: userData.userName,
    courseName: courseData.courseName,
    completionDate,
    certificateNumber,
    verificationUrl,
    platformSignature,
  });

  // Validate SVG size
  validateSVGSize(svg, 4096);

  const svgBytes = svgToBytes(svg);
  const svgSize = svgBytes.length;

  // Upload SVG to HFS (Hedera File Service)
  const imageFileId = await uploadToHFS(
    svgBytes,
    client,
    privateKey,
    `certificate-${certificateNumber}.svg`
  );

  // Initialize result object
  let ipfsImageHash: string | undefined;
  let ipfsImageUrl: string | undefined;
  let ipfsMetadataHash: string | undefined;
  let ipfsMetadataUrl: string | undefined;

  // Upload to Pinata/IPFS if credentials provided
  if (pinataConfig) {
    try {
      console.log('📤 Uploading to Pinata/IPFS...');

      // Upload SVG image to IPFS
      const ipfsImageResult = await uploadToPinata(
        svg,
        `certificate-${certificateNumber}.svg`,
        pinataConfig.apiKey,
        pinataConfig.apiSecret
      );

      ipfsImageHash = ipfsImageResult.ipfsHash;
      ipfsImageUrl = ipfsImageResult.ipfsUrl;

      console.log(`✅ SVG uploaded to IPFS: ${ipfsImageHash}`);

      // Create metadata JSON with IPFS image URL
      const metadata: CertificateMetadata = {
        name: `Web3Versity Certificate - ${courseData.courseName}`,
        description: `Certificate of Completion for ${courseData.courseName}, awarded to ${userData.userName} on ${new Date(completionDate).toLocaleDateString()}`,
        image_hfs_file_id: imageFileId,
        image: ipfsImageUrl, // IPFS URL for NFT marketplaces
        attributes: [
          { trait_type: 'Student', value: userData.userName },
          { trait_type: 'Course', value: courseData.courseName },
          { trait_type: 'Certificate Number', value: certificateNumber },
          {
            trait_type: 'Completion Date',
            value: new Date(completionDate).toISOString().split('T')[0],
          },
          { trait_type: 'Platform', value: 'Web3Versity' },
          { trait_type: 'Network', value: 'Hedera Testnet' },
          { trait_type: 'Hedera Account', value: userData.hederaAccountId },
        ],
        platform_signature: platformSignature,
        external_url: verificationUrl,
      };

      // Upload metadata to IPFS
      const ipfsMetadataResult = await uploadJSONToPinata(
        metadata,
        `certificate-${certificateNumber}-metadata.json`,
        pinataConfig.apiKey,
        pinataConfig.apiSecret
      );

      ipfsMetadataHash = ipfsMetadataResult.ipfsHash;
      ipfsMetadataUrl = ipfsMetadataResult.ipfsUrl;

      console.log(`✅ Metadata uploaded to IPFS: ${ipfsMetadataHash}`);
    } catch (error) {
      console.error('⚠️ Pinata upload failed (continuing with HFS only):', error);
      // Continue without IPFS - HFS is still available
    }
  }

  // Upload metadata JSON to HFS (fallback/backup)
  const metadataFileId = await createMetadataJsonAndUpload(
    {
      userName: userData.userName,
      courseName: courseData.courseName,
      completionDate,
      certificateNumber,
      userHederaAccountId: userData.hederaAccountId,
      platformSignature,
      verificationUrl,
    },
    imageFileId,
    client,
    privateKey
  );

  console.log('✅ Certificate package created:');
  console.log(`   Image HFS ID: ${imageFileId}`);
  console.log(`   Metadata HFS ID: ${metadataFileId}`);
  if (ipfsImageHash) {
    console.log(`   Image IPFS Hash: ${ipfsImageHash}`);
    console.log(`   Image IPFS URL: ${ipfsImageUrl}`);
  }
  if (ipfsMetadataHash) {
    console.log(`   Metadata IPFS Hash: ${ipfsMetadataHash}`);
    console.log(`   Metadata IPFS URL: ${ipfsMetadataUrl}`);
  }
  console.log(`   SVG Size: ${svgSize} bytes`);
  console.log(`   Signature: ${platformSignature.substring(0, 16)}...`);

  return {
    imageFileId,
    metadataFileId,
    platformSignature,
    svgSize,
    svgContent: svg,
    ipfsImageHash,
    ipfsImageUrl,
    ipfsMetadataHash,
    ipfsMetadataUrl,
  };
}
