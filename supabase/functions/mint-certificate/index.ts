// Hedera NFT Certificate Minting Edge Function
// Mints course completion certificates as NFTs on Hedera Testnet with SVG images

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  PrivateKey,
  AccountId,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
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
    const collectionTokenId = Deno.env.get('HEDERA_NFT_COLLECTION_TOKEN_ID') || Deno.env.get('NFT_COLLECTION_TOKEN_ID');
    if (!collectionTokenId) {
      console.error('Collection token ID not configured');
      return new Response(
        JSON.stringify({ error: 'NFT collection not configured. Please set NFT_COLLECTION_TOKEN_ID secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create NFT collection record
    let { data: collection, error: collectionError } = await supabase
      .from('nft_collection')
      .select('id, token_id')
      .eq('token_id', collectionTokenId)
      .maybeSingle();

    // If collection doesn't exist, create it
    if (!collection) {
      console.log('Creating NFT collection record...');
      const { data: newCollection, error: createError } = await supabase
        .from('nft_collection')
        .insert({
          collection_name: 'Web3Versity Certificates',
          collection_symbol: 'W3VCERT',
          token_id: collectionTokenId,
          treasury_account: Deno.env.get('HEDERA_OPERATOR_ID') || '',
          description: 'Course completion certificates on Hedera blockchain',
          creation_transaction_id: 'created_externally',
        })
        .select('id, token_id')
        .single();

      if (createError || !newCollection) {
        console.error('Failed to create collection record:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to initialize NFT collection' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      collection = newCollection;
      console.log(`✅ Collection record created: ${collection.id}`);
    }

    const collectionRecordId = collection.id;

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

    // Verify operator account balance
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);
      console.log(`💰 Operator balance: ${balance.hbars.toString()}`);

      if (balance.hbars.toBigNumber().isLessThan(5)) {
        console.warn('⚠️ Low HBAR balance - may not be sufficient for transactions');
      }
    } catch (error) {
      console.error('Failed to check operator balance:', error);
      throw new Error('Unable to verify operator account - check network connectivity');
    }

    // Generate certificate SVG and upload to HFS + Pinata
    console.log('🎨 Generating certificate package...');

    const baseUrl = Deno.env.get('VITE_APP_URL') || 'https://web3versity.app';
    const completionDate = new Date().toISOString().split('T')[0];

    // Get Pinata credentials (optional)
    const pinataApiKey = Deno.env.get('PINATA_API_KEY');
    const pinataApiSecret = Deno.env.get('PINATA_API_SECRET');
    const pinataConfig = pinataApiKey && pinataApiSecret
      ? { apiKey: pinataApiKey, apiSecret: pinataApiSecret }
      : undefined;

    if (pinataConfig) {
      console.log('✅ Pinata credentials found - will upload to IPFS');
    } else {
      console.log('ℹ️ No Pinata credentials - HFS only');
    }

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
      baseUrl,
      pinataConfig
    );

    console.log('✅ Certificate package created:');
    console.log(`   Image HFS ID: ${certificatePackage.imageFileId}`);
    console.log(`   Metadata HFS ID: ${certificatePackage.metadataFileId}`);
    if (certificatePackage.ipfsImageHash) {
      console.log(`   Image IPFS: ${certificatePackage.ipfsImageHash}`);
      console.log(`   Metadata IPFS: ${certificatePackage.ipfsMetadataHash}`);
    }

    // Prepare NFT metadata bytes (on-chain)
    // Hedera has 100-byte limit, so we store only the IPFS metadata hash
    // HashScan will fetch the full metadata from IPFS using this hash
    let onChainMetadata: string;

    if (certificatePackage.ipfsMetadataHash) {
      // Use IPFS hash (compact, HashScan can fetch full metadata)
      onChainMetadata = certificatePackage.ipfsMetadataHash;
      console.log(`📝 Using IPFS metadata hash on-chain: ${onChainMetadata}`);
    } else {
      // Fallback to HFS (old method, won't display on HashScan)
      onChainMetadata = JSON.stringify({
        h: certificatePackage.metadataFileId, // Shortened key
        i: certificatePackage.imageFileId,
      });
      console.log(`📝 Using HFS metadata on-chain (IPFS not available)`);
    }

    const nftMetadataBytes = new TextEncoder().encode(onChainMetadata);
    console.log(`📏 On-chain metadata size: ${nftMetadataBytes.length} bytes (limit: 100)`);

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

    // Attempt to transfer NFT to recipient
    console.log(`📨 Attempting to transfer to ${user.hedera_account_id}...`);

    let transferTransactionId: string | undefined;
    let transferStatus = 'minted'; // Default status if transfer fails

    try {
      const transferTx = await new TransferTransaction()
        .addNftTransfer(collectionTokenId, serialNumber, accountId, recipientId)
        .setTransactionMemo(`Web3Versity Certificate: ${certificateNumber}`)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(client);

      const transferSign = await transferTx.sign(privateKey);
      const transferSubmit = await transferSign.execute(client);
      await transferSubmit.getReceipt(client);

      transferTransactionId = transferSubmit.transactionId.toString();
      transferStatus = 'transferred';
      console.log(`✅ NFT transferred successfully`);
    } catch (transferError: any) {
      console.error('Transfer failed:', transferError.message);

      // Check if it's the TOKEN_NOT_ASSOCIATED error
      if (transferError.message?.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
        console.log('⚠️ Recipient account not associated with token. NFT will remain in treasury pending manual association.');
        transferStatus = 'minted'; // Keep it as minted, user needs to associate token
      } else {
        // Re-throw other errors
        throw transferError;
      }
    }

    client.close();

    // Certificate data for database
    const certificateData = {
      courseName: course.title,
      userName: user.username,
      completionDate,
      certificateNumber,
      userHederaAccountId: user.hedera_account_id,
    };

    // Build unique token identifier: collection_token_id/serial_number
    const uniqueTokenId = `${collectionTokenId}/${serialNumber.toString()}`;

    // Store in database - COMPLETE record with ALL required fields
    const certificateRecord: any = {
      // === REQUIRED FIELDS (NOT NULL) ===
      user_id: userIdToUse,
      course_id: courseId,
      course_title: course.title,
      completion_date: completionDate, // Already in DATE format (YYYY-MM-DD)
      token_id: uniqueTokenId, // UNIQUE constraint: collection_token_id/serial_number
      collection_id: collectionRecordId,
      issued_at: new Date().toISOString(),
      created_at: new Date().toISOString(),

      // === OPTIONAL FIELDS ===
      serial_number: serialNumber.toNumber(),
      certificate_number: certificateNumber,
      verification_code: certificateNumber, // Use cert number for verification

      // HFS storage
      image_hfs_file_id: certificatePackage.imageFileId,
      metadata_hfs_file_id: certificatePackage.metadataFileId,
      metadata_uri: `hfs://${certificatePackage.metadataFileId}`,
      image_uri: `hfs://${certificatePackage.imageFileId}`,

      // IPFS/Pinata storage (if available)
      ipfs_image_hash: certificatePackage.ipfsImageHash,
      ipfs_image_url: certificatePackage.ipfsImageUrl,
      ipfs_metadata_hash: certificatePackage.ipfsMetadataHash,
      ipfs_metadata_url: certificatePackage.ipfsMetadataUrl,

      // SVG content (stored in database for immediate display)
      svg_content: certificatePackage.svgContent,

      // Signatures and metadata
      platform_signature: certificatePackage.platformSignature,
      certificate_data: certificateData,

      // Transaction tracking
      mint_transaction_id: mintTransactionId,
      transaction_id: mintTransactionId, // FK to transactions table

      // Status
      status: transferStatus,
    };

    // Only set transfer fields if transfer succeeded
    if (transferStatus === 'transferred' && transferTransactionId) {
      certificateRecord.transfer_transaction_id = transferTransactionId;
      certificateRecord.transferred_at = new Date().toISOString();
    }

    // Log transaction FIRST (before certificate insert due to FK constraint)
    await supabase.from('transactions').insert({
      user_id: userIdToUse,
      transaction_type: 'nft_mint_certificate',
      transaction_id: mintTransactionId,
      amount_hbar: 0,
      status: 'success',
      from_account: operatorId,
      to_account: user.hedera_account_id,
      related_course_id: courseId,
      memo: `Certificate ${certificateNumber}`,
      consensus_timestamp: new Date().toISOString(),
      hashscan_url: `https://hashscan.io/testnet/token/${collectionTokenId}/${serialNumber.toString()}`,
    });

    // Now insert certificate (FK reference to transaction will be valid)
    const { data: certificate, error: insertError } = await supabase
      .from('nft_certificates')
      .insert(certificateRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    console.log('✅ Certificate minted successfully!');

    const response: any = {
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
        status: transferStatus,
      },
    };

    // Add association instructions if transfer failed
    if (transferStatus === 'minted') {
      response.warning = 'Certificate minted but not transferred. Please associate your account with the token.';
      response.associationRequired = true;
      response.instructions = {
        message: 'Your certificate NFT has been minted but needs to be transferred to your account.',
        steps: [
          'Go to HashScan and view your account',
          `Associate with token ID: ${collectionTokenId}`,
          'After association, the NFT will be automatically transferred to your wallet',
        ],
        tokenId: collectionTokenId,
      };
    }

    return new Response(
      JSON.stringify(response),
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
