// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TransferTransaction, Hbar, AccountId, Client, PrivateKey } from "npm:@hashgraph/sdk@^2.75.0"

console.log("Hedera Faucet Function Started")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body first to get userId
    const { hederaAccountId, amount, userId } = await req.json()

    console.log('📥 Request received:', { hederaAccountId, amount, hasUserId: !!userId })

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    const apiKeyHeader = req.headers.get('apikey')

    console.log('🔐 Headers check:', {
      hasAuthHeader: !!authHeader,
      hasApiKeyHeader: !!apiKeyHeader,
      authHeaderType: authHeader?.substring(0, 30) + '...',
      providedUserId: !!userId
    })

    // Determine user ID from either JWT or request body
    let userIdToUse = userId

    // Try to get user from JWT if Authorization header exists
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // Remove "Bearer "

      // Check if this is a JWT (has dots) or just the anon key
      if (token.split('.').length === 3) {
        // It's a JWT - validate it
        console.log('🔍 Detected JWT token, validating...')
        const authClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await authClient.auth.getUser()

        if (!authError && user) {
          userIdToUse = user.id
          console.log('✅ Using JWT user ID:', userIdToUse)
        } else {
          console.log('⚠️ JWT validation failed:', authError?.message || 'Unknown error')
          console.log('   Falling back to userId from body')
        }
      } else {
        console.log('⚠️ Authorization header contains anon key (not JWT), using userId from body')
      }
    }

    // If no userId from either method, return unauthorized
    if (!userIdToUse) {
      console.error('❌ No user ID available from either JWT or request body')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No user ID provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Final user ID to use:', userIdToUse)

    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate inputs
    if (!hederaAccountId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: hederaAccountId, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate amount range
    if (amount < 1 || amount > 10) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between 1 and 10 HBAR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check eligibility using database function
    const { data: eligibility, error: eligibilityError } = await supabaseClient
      .rpc('check_faucet_eligibility', { p_user_id: userIdToUse })
      .single()

    if (eligibilityError) {
      console.error('Eligibility check error:', eligibilityError)
      return new Response(
        JSON.stringify({ error: 'Failed to check eligibility' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!eligibility.eligible) {
      return new Response(
        JSON.stringify({
          error: eligibility.reason || 'Not eligible for faucet request',
          nextAvailableAt: eligibility.next_available_at,
          remainingAmount: eligibility.remaining_amount
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requested amount exceeds remaining allowance
    if (amount > eligibility.remaining_amount) {
      return new Response(
        JSON.stringify({
          error: `Requested amount exceeds remaining daily allowance (${eligibility.remaining_amount} HBAR remaining)`,
          remainingAmount: eligibility.remaining_amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Hedera client
    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID')
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY')

    if (!operatorId || !operatorKey) {
      console.error('Hedera credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Faucet service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accountId = AccountId.fromString(operatorId)

    // Try to determine key type and parse accordingly
    let privateKey: PrivateKey
    try {
      // First try ECDSA (most common for testnet)
      privateKey = PrivateKey.fromStringECDSA(operatorKey)
      console.log('✅ Using ECDSA private key')
    } catch (ecdsaError) {
      try {
        // Fallback to ED25519
        privateKey = PrivateKey.fromStringED25519(operatorKey)
        console.log('✅ Using ED25519 private key')
      } catch (ed25519Error) {
        // Last resort: try DER format
        privateKey = PrivateKey.fromStringDer(operatorKey)
        console.log('✅ Using DER private key')
      }
    }

    const client = Client.forTestnet()
    client.setOperator(accountId, privateKey)
    client.setDefaultMaxTransactionFee(new Hbar(100))
    client.setDefaultMaxQueryPayment(new Hbar(1))

    // Parse recipient account ID
    const recipientId = AccountId.fromString(hederaAccountId)

    // Convert HBAR to tinybars
    const hbarAmount = new Hbar(amount)

    // Create transfer transaction
    const transferTx = new TransferTransaction()
      .addHbarTransfer(accountId, hbarAmount.negated()) // Debit from operator
      .addHbarTransfer(recipientId, hbarAmount) // Credit to user
      .setTransactionMemo(`Web3Versity Faucet: ${amount} HBAR`)

    console.log(`Executing transfer: ${amount} HBAR to ${hederaAccountId}`)

    // Execute transaction
    const txResponse = await transferTx.execute(client)

    // Get receipt
    const receipt = await txResponse.getReceipt(client)

    // Get transaction ID
    const transactionId = txResponse.transactionId.toString()

    // Generate HashScan URL
    const hashScanUrl = `https://hashscan.io/testnet/transaction/${transactionId}`

    console.log(`✅ Transfer successful: ${transactionId}`)

    // Log successful request in database (using 'completed' status to match schema)
    const { error: insertError } = await supabaseClient
      .from('faucet_requests')
      .insert({
        user_id: userIdToUse,
        hedera_account_id: hederaAccountId,
        amount_hbar: amount,
        transaction_id: transactionId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error logging faucet request:', insertError)
    }

    // Also log in transactions table
    await supabaseClient.from('transactions').insert({
      user_id: userIdToUse,
      transaction_type: 'faucet_request',
      transaction_id: transactionId, // Using transaction_id field from your schema
      amount_hbar: amount,
      status: 'success', // transactions table uses 'success' status
      from_account: operatorId,
      to_account: hederaAccountId,
      memo: 'Web3Versity Faucet',
      consensus_timestamp: new Date().toISOString(),
      hashscan_url: hashScanUrl,
    })

    // Close client
    client.close()

    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        hashScanUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Faucet request failed:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Transaction failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
