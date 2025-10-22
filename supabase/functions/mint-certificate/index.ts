// Hedera NFT Certificate Minting Edge Function
// Mints course completion certificates as NFTs on Hedera Testnet with SVG images

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TransferTransaction,
  Hbar,
} from 'npm:@hashgraph/sdk@^2.75.0';
import { generateAndUploadCertificate } from './_shared/certificate-generator.ts';

console.log('Certificate Minting Function Started');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const { userId, courseId } = await req.json();
    console.log('📥 Mint request:', { userId, courseId });

    // Get auth header
    const authHeader = req.headers.get('Authorization');

    // Determine user ID from JWT or request body
    let userIdToUse = userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token.split('.').length === 3) {
        // It's a JWT
        const authClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error } = await authClient.auth.getUser();
        if (!error && user) {
          userIdToUse = user.id;
          console.log('✅ Using JWT user ID');
        }
      }
    }

    if (!userIdToUse) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No user ID provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check eligibility
    const { data: eligibility, error: eligibilityError } = await supabase
      .rpc('check_certificate_eligibility', {
        p_user_id: userIdToUse,
        p_course_id: courseId,
      })
      .single();

    if (eligibilityError) {
      console.error('Eligibility check error:', eligibilityError);
      return new Response(
        JSON.stringify({ error: 'Failed to check eligibility' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!eligibility.eligible) {
      return new Response(
        JSON.stringify({
          error: eligibility.reason || 'Not eligible to claim certificate',
          details: {
            completion_percentage: eligibility.completion_percentage,
            already_claimed: eligibility.already_claimed,
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user and course data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username, hedera_account_id')
      .eq('id', userIdToUse)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title, id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: 'Course not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get collection token ID (try multiple env var names for compatibility)
    const collectionTokenId = Deno.env.get('NFT_COLLECTION_TOKEN_ID') ||
                               Deno.env.get('HEDERA_NFT_COLLECTION_TOKEN_ID');
    if (!collectionTokenId) {
      console.error('Collection token ID not configured');
      return new Response(
        JSON.stringify({ error: 'NFT collection not configured. Please set NFT_COLLECTION_TOKEN_ID secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get HMAC secret
    const hmacSecret = Deno.env.get('HEDERA_HMAC_SECRET');
    if (!hmacSecret) {
      console.error('HMAC secret not configured');
      return new Response(
        JSON.stringify({ error: 'Certificate signing not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique certificate number
    const { data: certNumber } = await supabase
      .rpc('generate_certificate_number')
      .single();

    const certificateNumber = certNumber || `W3V-${new Date().getFullYear()}-${Date.now()}`;

    console.log(`🎓 Minting certificate: ${certificateNumber}`);

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID');
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY');

    if (!operatorId || !operatorKey) {
      console.error('Hedera credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Certificate service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = Client.forTestnet();
    const accountId = AccountId.fromString(operatorId);
    const recipientId = AccountId.fromString(user.hedera_account_id);

    // Parse private key
    let privateKey: PrivateKey;
    try {
      privateKey = PrivateKey.fromStringECDSA(operatorKey);
    } catch {
      privateKey = PrivateKey.fromStringED25519(operatorKey);
    }

    client.setOperator(accountId, privateKey);
    client.setDefaultMaxTransactionFee(new Hbar(100));

    // Generate certificate SVG and upload to HFS
    console.log('🎨 Generating certificate package...');

    const baseUrl = Deno.env.get('VITE_APP_URL') || 'https://web3versity.app';
    const completionDate = new Date().toISOString().split('T')[0];

    const certificatePackage = await generateAndUploadCertificate(
      {
        userName: user.username,
        hederaAccountId: user.hedera_account_id,
      },
      {
        courseName: course.title,
      },
      certificateNumber,
      completionDate,
      client,
      privateKey,
      hmacSecret,
      baseUrl
    );

    console.log('✅ Certificate package created:');
    console.log(`   Image HFS ID: ${certificatePackage.imageFileId}`);
    console.log(`   Metadata HFS ID: ${certificatePackage.metadataFileId}`);

    // Prepare NFT metadata bytes (on-chain) - minimal, just points to HFS files
    const nftMetadataBytes = new TextEncoder().encode(
      JSON.stringify({
        hfs_metadata_file_id: certificatePackage.metadataFileId,
        image_hfs_file_id: certificatePackage.imageFileId,
      })
    );

    // Mint NFT
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

    const mintTransactionId = mintSubmit.transactionId.toString();

    // Transfer NFT to recipient
    console.log(`📨 Transferring to ${user.hedera_account_id}...`);

    const transferTx = await new TransferTransaction()
      .addNftTransfer(collectionTokenId, serialNumber, accountId, recipientId)
      .setTransactionMemo(`Web3Versity Certificate: ${certificateNumber}`)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    const transferSign = await transferTx.sign(privateKey);
    const transferSubmit = await transferSign.execute(client);
    await transferSubmit.getReceipt(client);

    const transferTransactionId = transferSubmit.transactionId.toString();

    console.log(`✅ NFT transferred successfully`);

    client.close();

    // Certificate data for database
    const certificateData = {
      courseName: course.title,
      userName: user.username,
      completionDate,
      certificateNumber,
      userHederaAccountId: user.hedera_account_id,
    };

    // Store in database with new schema
    const { data: certificate, error: insertError } = await supabase
      .from('nft_certificates')
      .insert({
        user_id: userIdToUse,
        course_id: courseId,
        token_id: collectionTokenId,
        serial_number: serialNumber.toNumber(),
        certificate_number: certificateNumber,
        image_hfs_file_id: certificatePackage.imageFileId,
        metadata_hfs_file_id: certificatePackage.metadataFileId,
        platform_signature: certificatePackage.platformSignature,
        metadata_uri: `hfs://${certificatePackage.metadataFileId}`, // Legacy field
        image_uri: `hfs://${certificatePackage.imageFileId}`, // Legacy field
        certificate_data: certificateData,
        mint_transaction_id: mintTransactionId,
        transfer_transaction_id: transferTransactionId,
        status: 'transferred',
        transferred_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    // Log transaction
    await supabase.from('transactions').insert({
      user_id: userIdToUse,
      transaction_type: 'certificate_mint',
      transaction_id: mintTransactionId,
      amount_hbar: 0,
      status: 'success',
      from_account: operatorId,
      to_account: user.hedera_account_id,
      memo: `Certificate ${certificateNumber}`,
      consensus_timestamp: new Date().toISOString(),
      hashscan_url: `https://hashscan.io/testnet/token/${collectionTokenId}/${serialNumber.toString()}`,
    });

    console.log('✅ Certificate minted successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificate?.id,
          certificateNumber,
          tokenId: collectionTokenId,
          serialNumber: serialNumber.toNumber(),
          imageHfsFileId: certificatePackage.imageFileId,
          metadataHfsFileId: certificatePackage.metadataFileId,
          platformSignature: certificatePackage.platformSignature,
          mintTransactionId,
          transferTransactionId,
          hashScanUrl: `https://hashscan.io/testnet/token/${collectionTokenId}/${serialNumber.toString()}`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Certificate minting failed:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Certificate minting failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
