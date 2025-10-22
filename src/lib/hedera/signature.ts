/**
 * Platform Signature System
 *
 * Generates and validates HMAC signatures for certificate authenticity
 */

import { createHmac } from 'crypto';

/**
 * Generate platform signature for certificate metadata
 *
 * @param metadata - Certificate metadata to sign
 * @param secret - Platform HMAC secret
 * @returns HMAC-SHA256 signature (hex string)
 */
export function generatePlatformSignature(
  metadata: {
    certificateNumber: string;
    userName: string;
    courseName: string;
    completionDate: string;
    userHederaAccountId: string;
  },
  secret: string
): string {
  // Create canonical string from metadata (order matters for consistency)
  const canonical = [
    metadata.certificateNumber,
    metadata.userName,
    metadata.courseName,
    metadata.completionDate,
    metadata.userHederaAccountId,
  ].join('|');

  // Generate HMAC-SHA256
  const hmac = createHmac('sha256', secret);
  hmac.update(canonical);
  return hmac.digest('hex');
}

/**
 * Validate platform signature
 *
 * @param metadata - Certificate metadata to validate
 * @param signature - Signature to validate
 * @param secret - Platform HMAC secret
 * @returns true if signature is valid
 */
export function validatePlatformSignature(
  metadata: {
    certificateNumber: string;
    userName: string;
    courseName: string;
    completionDate: string;
    userHederaAccountId: string;
  },
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generatePlatformSignature(metadata, secret);
  return expectedSignature === signature;
}

/**
 * Generate a random HMAC secret (for initial setup)
 *
 * @returns Random 64-character hex string
 */
export function generateHMACSecret(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    const nodeCrypto = require('crypto');
    nodeCrypto.randomFillSync(bytes);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
