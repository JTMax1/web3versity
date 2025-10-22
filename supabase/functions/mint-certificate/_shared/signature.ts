/**
 * Platform Signature System (Deno/Edge Function Version)
 *
 * Generates and validates HMAC signatures for certificate authenticity
 * Uses Web Crypto API (available in Deno)
 */

/**
 * Generate platform signature for certificate metadata
 *
 * @param metadata - Certificate metadata to sign
 * @param secret - Platform HMAC secret
 * @returns HMAC-SHA256 signature (hex string)
 */
export async function generatePlatformSignature(
  metadata: {
    certificateNumber: string;
    userName: string;
    courseName: string;
    completionDate: string;
    userHederaAccountId: string;
  },
  secret: string
): Promise<string> {
  // Create canonical string from metadata (order matters for consistency)
  const canonical = [
    metadata.certificateNumber,
    metadata.userName,
    metadata.courseName,
    metadata.completionDate,
    metadata.userHederaAccountId,
  ].join('|');

  // Convert secret to key material
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secret);
  const data = encoder.encode(canonical);

  // Import key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Generate HMAC-SHA256
  const signature = await crypto.subtle.sign('HMAC', key, data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate platform signature
 *
 * @param metadata - Certificate metadata to validate
 * @param signature - Signature to validate
 * @param secret - Platform HMAC secret
 * @returns true if signature is valid
 */
export async function validatePlatformSignature(
  metadata: {
    certificateNumber: string;
    userName: string;
    courseName: string;
    completionDate: string;
    userHederaAccountId: string;
  },
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generatePlatformSignature(metadata, secret);
  return expectedSignature === signature;
}
