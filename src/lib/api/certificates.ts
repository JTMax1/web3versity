/**
 * NFT Certificates API Client
 *
 * Client-side API for claiming and managing NFT certificates
 */

import { supabase } from '../supabase/client';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  token_id: string;
  serial_number: number;
  certificate_number: string;
  // HFS File IDs (Hedera File Service)
  image_hfs_file_id: string;
  metadata_hfs_file_id: string;
  platform_signature: string;
  // IPFS/Pinata storage
  ipfs_image_hash?: string;
  ipfs_image_url?: string;
  ipfs_metadata_hash?: string;
  ipfs_metadata_url?: string;
  // SVG content (stored in database for immediate display)
  svg_content?: string;
  // Legacy URIs (for backward compatibility)
  metadata_uri?: string;
  image_uri?: string;
  certificate_data: {
    courseName: string;
    userName: string;
    completionDate: string;
    certificateNumber: string;
    verificationUrl?: string;
    userHederaAccountId?: string;
  };
  mint_transaction_id: string;
  transfer_transaction_id?: string;
  status: 'minting' | 'minted' | 'transferred' | 'failed';
  minted_at: string;
  transferred_at?: string;
  // Join fields
  courses?: { title: string };
  users?: { username: string };
}

export interface ClaimCertificateResult {
  success: boolean;
  certificate?: {
    id: string;
    certificateNumber: string;
    tokenId: string;
    serialNumber: number;
    imageHfsFileId: string;
    metadataHfsFileId: string;
    platformSignature: string;
    mintTransactionId: string;
    transferTransactionId?: string;
    hashScanUrl: string;
    // Legacy fields (backward compatibility)
    metadataUri?: string;
    imageUri?: string;
  };
  error?: string;
  details?: {
    completion_percentage?: number;
    already_claimed?: boolean;
  };
}

export interface CertificateEligibility {
  eligible: boolean;
  reason?: string;
  completion_percentage: number;
  already_claimed: boolean;
}

/**
 * Check if user is eligible to claim certificate for a course
 */
export async function checkCertificateEligibility(
  userId: string,
  courseId: string
): Promise<CertificateEligibility> {
  try {
    const { data, error } = await supabase
      .rpc('check_certificate_eligibility', {
        p_user_id: userId,
        p_course_id: courseId,
      })
      .single();

    if (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }

    return {
      eligible: data.eligible,
      reason: data.reason,
      completion_percentage: data.completion_percentage,
      already_claimed: data.already_claimed,
    };
  } catch (error) {
    console.error('Unexpected error checking eligibility:', error);
    throw error;
  }
}

/**
 * Claim NFT certificate for completed course
 */
export async function claimCertificate(
  userId: string,
  courseId: string
): Promise<ClaimCertificateResult> {
  try {
    console.log('🎓 Claiming certificate:', { userId, courseId });

    // Get session for auth - REQUIRED for certificate claiming
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ No session found for certificate claim');
      return {
        success: false,
        error: 'Authentication required. Please connect your wallet first.',
      };
    }

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return {
        success: false,
        error: 'Failed to verify authentication session.',
      };
    }

    console.log('✅ Valid session found for certificate claim');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
    };

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mint-certificate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, courseId }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Certificate claim failed:', {
        status: response.status,
        error: result.error,
        details: result.details,
        userId,
        courseId
      });
      return {
        success: false,
        error: result.error || 'Failed to claim certificate',
        details: result.details,
      };
    }

    return result;
  } catch (error) {
    console.error('Certificate claim error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get user's NFT certificates
 */
export async function getUserCertificates(userId?: string): Promise<Certificate[]> {
  try {
    let query = supabase
      .from('nft_certificates')
      .select(`
        *,
        courses (title)
      `)
      .eq('status', 'transferred')
      .order('minted_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching certificates:', error);
    return [];
  }
}

/**
 * Get certificate by certificate number
 */
export async function getCertificateByNumber(
  certificateNumber: string
): Promise<Certificate | null> {
  try {
    const { data, error } = await supabase
      .from('nft_certificates')
      .select(`
        *,
        courses (title),
        users (username)
      `)
      .eq('certificate_number', certificateNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
}

/**
 * Log certificate verification
 */
export async function logCertificateVerification(
  certificateId: string,
  verificationResult: any
): Promise<void> {
  try {
    await supabase.from('certificate_verifications').insert({
      certificate_id: certificateId,
      verified_by_ip: null, // Would need server-side to get real IP
      verified_by_user_agent: navigator.userAgent,
      verification_result: verificationResult,
    });
  } catch (error) {
    console.error('Error logging verification:', error);
  }
}

/**
 * Fetch file from Hedera File Service via Mirror Node API
 * Includes retry logic for Mirror Node indexing delays
 */
export async function fetchFromHFSMirror(
  fileId: string,
  network: 'testnet' | 'mainnet' = 'testnet',
  maxRetries: number = 5,
  initialDelay: number = 2000
): Promise<Uint8Array> {
  const mirrorNodeUrl =
    network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet.mirrornode.hedera.com';

  const url = `${mirrorNodeUrl}/api/v1/files/${fileId}`;

  let lastError: Error | null = null;
  let delay = initialDelay;

  // Retry with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Fetching HFS file ${fileId} (attempt ${attempt + 1}/${maxRetries})...`);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        // Decode base64 file_data
        const base64 = data.file_data;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log(`✅ Successfully fetched HFS file ${fileId} (${bytes.length} bytes)`);
        return bytes;
      }

      // If 404, the file might not be indexed yet - retry
      if (response.status === 404 && attempt < maxRetries - 1) {
        console.log(`⏳ File ${fileId} not found yet, waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }

      // Other errors
      lastError = new Error(`Failed to fetch file ${fileId}: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');

      if (attempt < maxRetries - 1) {
        console.log(`⏳ Error fetching file, waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
    }
  }

  throw lastError || new Error(`Failed to fetch file ${fileId} after ${maxRetries} attempts`);
}

/**
 * Fetch certificate SVG image from HFS
 */
export async function fetchCertificateSVG(imageHfsFileId: string): Promise<string> {
  try {
    const svgBytes = await fetchFromHFSMirror(imageHfsFileId, 'testnet');
    return new TextDecoder().decode(svgBytes);
  } catch (error) {
    console.error('Error fetching certificate SVG:', error);
    throw error;
  }
}

/**
 * Fetch certificate metadata from HFS
 */
export async function fetchCertificateMetadata(metadataHfsFileId: string): Promise<any> {
  try {
    const metadataBytes = await fetchFromHFSMirror(metadataHfsFileId, 'testnet');
    const metadataString = new TextDecoder().decode(metadataBytes);
    return JSON.parse(metadataString);
  } catch (error) {
    console.error('Error fetching certificate metadata:', error);
    throw error;
  }
}

/**
 * Fetch SVG from Pinata/IPFS gateway
 */
export async function fetchCertificateSVGFromIPFS(ipfsHash: string): Promise<string> {
  try {
    // Try Pinata gateway first
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log(`📥 Fetching SVG from Pinata: ${ipfsHash}`);

    const response = await fetch(pinataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Pinata: ${response.statusText}`);
    }

    const svg = await response.text();
    console.log(`✅ Successfully fetched SVG from IPFS (${svg.length} bytes)`);
    return svg;
  } catch (error) {
    console.error('Error fetching SVG from IPFS:', error);
    throw error;
  }
}
