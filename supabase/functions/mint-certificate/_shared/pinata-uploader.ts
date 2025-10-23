/**
 * Pinata IPFS Upload Utility (Deno/Edge Function Version)
 *
 * Uploads files to IPFS via Pinata pinning service
 */

export interface PinataUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  pinataUrl: string;
  size: number;
}

/**
 * Upload file to Pinata IPFS
 *
 * @param fileContent - File content as string or Uint8Array
 * @param fileName - Name for the file
 * @param apiKey - Pinata API Key
 * @param apiSecret - Pinata API Secret
 * @returns Upload result with IPFS URLs
 */
export async function uploadToPinata(
  fileContent: string | Uint8Array,
  fileName: string,
  apiKey: string,
  apiSecret: string
): Promise<PinataUploadResult> {
  console.log(`📤 Uploading ${fileName} to Pinata...`);

  // Convert content to Blob
  const blob = typeof fileContent === 'string'
    ? new Blob([fileContent], { type: 'text/plain' })
    : new Blob([fileContent], { type: 'application/octet-stream' });

  // Create FormData
  const formData = new FormData();
  formData.append('file', blob, fileName);

  // Optional: Add metadata
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      project: 'Web3Versity',
      type: 'certificate'
    }
  });
  formData.append('pinataMetadata', metadata);

  // Optional: Pin options
  const options = JSON.stringify({
    cidVersion: 1, // Use CIDv1 for better compatibility
  });
  formData.append('pinataOptions', options);

  // Upload to Pinata
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': apiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pinata upload error:', errorText);
    throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const ipfsHash = result.IpfsHash;
  const size = result.PinSize;

  console.log(`✅ Uploaded to Pinata: ${ipfsHash} (${size} bytes)`);

  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    size,
  };
}

/**
 * Upload JSON metadata to Pinata
 *
 * @param jsonData - JavaScript object to upload
 * @param name - Name for the metadata
 * @param apiKey - Pinata API Key
 * @param apiSecret - Pinata API Secret
 * @returns Upload result with IPFS URLs
 */
export async function uploadJSONToPinata(
  jsonData: any,
  name: string,
  apiKey: string,
  apiSecret: string
): Promise<PinataUploadResult> {
  console.log(`📤 Uploading JSON metadata to Pinata: ${name}`);

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': apiSecret,
    },
    body: JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: {
        name,
        keyvalues: {
          project: 'Web3Versity',
          type: 'metadata'
        }
      },
      pinataOptions: {
        cidVersion: 1,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pinata JSON upload error:', errorText);
    throw new Error(`Pinata JSON upload failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const ipfsHash = result.IpfsHash;
  const size = result.PinSize;

  console.log(`✅ Uploaded JSON to Pinata: ${ipfsHash} (${size} bytes)`);

  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    size,
  };
}

/**
 * Test Pinata connection
 *
 * @param apiKey - Pinata API Key
 * @param apiSecret - Pinata API Secret
 * @returns True if connection successful
 */
export async function testPinataConnection(
  apiKey: string,
  apiSecret: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Pinata connection successful:', result.message);
      return true;
    } else {
      console.error('❌ Pinata connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Pinata connection error:', error);
    return false;
  }
}
