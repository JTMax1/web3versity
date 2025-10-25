/**
 * Certificate Generator with HFS Integration
 *
 * Handles SVG generation, HFS uploads, and metadata creation
 */

import {
  Client,
  PrivateKey,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  FileId,
  Hbar,
} from '@hashgraph/sdk';
import { generateCertificateSVG, svgToBytes, validateSVGSize } from './certificate-svg-template';
import { generatePlatformSignature } from './signature';

export interface CertificateMetadata {
  name: string;
  description: string;
  image_hfs_file_id: string;
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

  const fileCreateTx = await new FileCreateTransaction()
    .setKeys([privateKey])
    .setContents(firstChunk)
    .setMaxTransactionFee(new Hbar(2))
    .freezeWith(client);

  const fileCreateSign = await fileCreateTx.sign(privateKey);
  const fileCreateSubmit = await fileCreateSign.execute(client);
  const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
  const fileId = fileCreateReceipt.fileId;

  if (!fileId) {
    throw new Error('Failed to create HFS file - no file ID returned');
  }

  console.log(`✅ File created: ${fileId.toString()}`);

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
      await fileAppendSign.execute(client);

      offset += MAX_CHUNK_SIZE;
    }

    console.log(`✅ File upload complete (${chunkCount} chunks)`);
  }

  return fileId.toString();
}

/**
 * Fetch file contents from HFS via Mirror Node REST API
 *
 * @param fileId - HFS file ID (e.g., "0.0.12345")
 * @param network - "testnet" or "mainnet"
 * @returns File contents as Uint8Array
 */
export async function fetchFromHFSMirror(
  fileId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Uint8Array> {
  const mirrorNodeUrl =
    network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet-public.mirrornode.hedera.com';

  const url = `${mirrorNodeUrl}/api/v1/files/${fileId}`;

  console.log(`📥 Fetching file from HFS mirror: ${fileId}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch HFS file: ${response.statusText}`);
  }

  const data = await response.json();

  // Mirror node returns file contents as base64
  if (data.file_data) {
    const base64 = data.file_data;
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  throw new Error('No file data found in mirror node response');
}

/**
 * Fetch file contents from HFS via direct query (costs HBAR)
 *
 * @param fileId - HFS file ID
 * @param client - Hedera client
 * @returns File contents as Uint8Array
 */
export async function fetchFromHFSDirect(
  fileId: string,
  client: Client
): Promise<Uint8Array> {
  console.log(`📥 Fetching file from HFS (direct query): ${fileId}`);

  const query = new FileContentsQuery().setFileId(fileId);

  const contents = await query.execute(client);

  return contents;
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
  baseUrl: string = 'https://web3versity.netlify.app'
): Promise<{
  imageFileId: string;
  metadataFileId: string;
  platformSignature: string;
  svgSize: number;
}> {
  // Generate platform signature
  const platformSignature = generatePlatformSignature(
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

  // Upload SVG to HFS
  const imageFileId = await uploadToHFS(
    svgBytes,
    client,
    privateKey,
    `certificate-${certificateNumber}.svg`
  );

  // Upload metadata JSON to HFS
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
  console.log(`   SVG Size: ${svgSize} bytes`);
  console.log(`   Signature: ${platformSignature.substring(0, 16)}...`);

  return {
    imageFileId,
    metadataFileId,
    platformSignature,
    svgSize,
  };
}
