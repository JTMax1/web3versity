// Hedera NFT Certificate Verification Edge Function
// Verifies certificates on Hedera Testnet via Mirror Node API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validatePlatformSignature } from '../mint-certificate/_shared/signature.ts';

console.log('Certificate Verification Function Started');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Fetch file from HFS via Mirror Node API
 */
async function fetchFromHFSMirror(
  fileId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Uint8Array> {
  const mirrorNodeUrl =
    network === 'testnet'
      ? 'https://testnet.mirrornode.hedera.com'
      : 'https://mainnet.mirrornode.hedera.com';

  const url = `${mirrorNodeUrl}/api/v1/files/${fileId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file ${fileId}: ${response.statusText}`);
  }

  const data = await response.json();

  // Decode base64 file_data
  const base64 = data.file_data;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request - can verify by certificate number OR token ID + serial
    const { certificateNumber, tokenId, serialNumber } = await req.json();

    console.log('🔍 Verification request:', { certificateNumber, tokenId, serialNumber });

    // Create Supabase client (anon key for public verification)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let certificate;

    // Method 1: Verify by certificate number (most common)
    if (certificateNumber) {
      const { data, error } = await supabase
        .from('nft_certificates')
        .select(`
          *,
          courses (title),
          users (username)
        `)
        .eq('certificate_number', certificateNumber)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Certificate not found in database',
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      certificate = data;
    }
    // Method 2: Verify by token ID + serial number
    else if (tokenId && serialNumber !== undefined) {
      const { data, error } = await supabase
        .from('nft_certificates')
        .select(`
          *,
          courses (title),
          users (username)
        `)
        .eq('token_id', tokenId)
        .eq('serial_number', serialNumber)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Certificate not found in database',
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      certificate = data;
    } else {
      return new Response(
        JSON.stringify({
          error: 'Must provide either certificateNumber or (tokenId + serialNumber)',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify on Hedera blockchain via Mirror Node
    console.log('🔗 Verifying on Hedera blockchain...');

    const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
    const nftUrl = `${mirrorNodeUrl}/api/v1/tokens/${certificate.token_id}/nfts/${certificate.serial_number}`;

    const nftResponse = await fetch(nftUrl);
    if (!nftResponse.ok) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Certificate not found on Hedera blockchain',
          certificate: {
            certificateNumber: certificate.certificate_number,
            status: certificate.status,
          },
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nftData = await nftResponse.json();

    // Decode NFT metadata bytes
    const metadataBase64 = nftData.metadata;
    const metadataJson = new TextDecoder().decode(
      Uint8Array.from(atob(metadataBase64), (c) => c.charCodeAt(0))
    );
    const nftMetadata = JSON.parse(metadataJson);

    // Fetch full metadata from HFS
    console.log('📥 Fetching metadata from HFS...');
    const metadataBytes = await fetchFromHFSMirror(
      certificate.metadata_hfs_file_id,
      'testnet'
    );
    const metadataString = new TextDecoder().decode(metadataBytes);
    const fullMetadata = JSON.parse(metadataString);

    // Validate platform signature
    console.log('🔐 Validating platform signature...');
    const hmacSecret = Deno.env.get('HEDERA_HMAC_SECRET');
    let signatureValid = false;

    if (hmacSecret && certificate.platform_signature) {
      signatureValid = await validatePlatformSignature(
        {
          certificateNumber: certificate.certificate_number,
          userName: certificate.certificate_data.userName,
          courseName: certificate.certificate_data.courseName,
          completionDate: certificate.certificate_data.completionDate,
          userHederaAccountId: certificate.certificate_data.userHederaAccountId || '',
        },
        certificate.platform_signature,
        hmacSecret
      );
    }

    // Log verification
    await supabase.from('certificate_verifications').insert({
      certificate_id: certificate.id,
      verified_by_user_agent: req.headers.get('user-agent'),
      verification_result: {
        valid: true,
        blockchain_verified: true,
        signature_valid: signatureValid,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('✅ Certificate verified successfully');

    // Return comprehensive verification result
    return new Response(
      JSON.stringify({
        valid: true,
        blockchain_verified: true,
        signature_valid: signatureValid,
        certificate: {
          certificateNumber: certificate.certificate_number,
          tokenId: certificate.token_id,
          serialNumber: certificate.serial_number,
          imageHfsFileId: certificate.image_hfs_file_id,
          metadataHfsFileId: certificate.metadata_hfs_file_id,
          platformSignature: certificate.platform_signature,
          status: certificate.status,
          mintedAt: certificate.minted_at,
          transferredAt: certificate.transferred_at,
        },
        student: {
          username: certificate.users?.username || certificate.certificate_data.userName,
          hederaAccountId: certificate.certificate_data.userHederaAccountId,
        },
        course: {
          title: certificate.courses?.title || certificate.certificate_data.courseName,
        },
        completionDate: certificate.certificate_data.completionDate,
        blockchain: {
          owner: nftData.account_id,
          createdTimestamp: nftData.created_timestamp,
          modifiedTimestamp: nftData.modified_timestamp,
        },
        metadata: fullMetadata,
        hashScanUrl: `https://hashscan.io/testnet/token/${certificate.token_id}/${certificate.serial_number}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Certificate verification failed:', error);

    return new Response(
      JSON.stringify({
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
