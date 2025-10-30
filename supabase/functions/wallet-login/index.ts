// supabase/functions/wallet-login/index.ts
//
// CHANGELOG:
// 2025-10-27: CRITICAL FIX - Use generateLink() + verifyOtp() for session creation.
//             This is the official Supabase workaround for server-side session generation.
//             Creates proper session records in Supabase's session store with valid tokens.
//             Fixes "session_not_found" error when calling setSession() on frontend.
// 2025-10-26: Fixed token generation with comprehensive debug logging.
//             Added fallback for when generateLink() doesn't return usable tokens.
//
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { ethers } from 'https://esm.sh/ethers@6.9.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WalletLoginRequest {
  walletAddress: string
  signature: string
  message: string
  hederaAccountId?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Wallet Login Request ===')

    // 1. Check Authorization header (required by Supabase gateway)
    const authHeader = req.headers.get('Authorization')
    console.log('🔑 Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 37)}...` : 'MISSING')

    if (!authHeader) {
      console.error('❌ ERROR: Missing Authorization header')
      return new Response(
        JSON.stringify({
          error: 'Missing Authorization header',
          details: 'Request must include Authorization: Bearer <token>'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error('❌ ERROR: Malformed Authorization header (first 30 chars):', authHeader.substring(0, 30))
      return new Response(
        JSON.stringify({
          error: 'Malformed Authorization header',
          details: 'Authorization header must be in format: Bearer <token>'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('📊 Extracted token length:', token.length)

    // 2. Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Admin client for user creation (uses service role key)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 3. Validate the JWT token
    // The Supabase gateway has already validated the JWT at the edge.
    // If we reached here, the token is valid (either anon key or user JWT).
    // We just log what type of token it is for debugging.
    console.log('🔍 JWT token validation:')
    console.log('  ℹ️  Token passed gateway validation (token is valid)')

    // Check if it's the anon key by comparing
    if (token === supabaseAnonKey) {
      console.log('  ✅ Token type: Anon key (initial wallet login)')
    } else {
      console.log('  ✅ Token type: User JWT (re-authentication)')

      // For user JWTs, we can optionally verify the user exists
      // But this is not strictly necessary since gateway already validated it
      try {
        const supabaseClient = createClient(supabaseUrl, token, {
          auth: { autoRefreshToken: false, persistSession: false }
        })
        const { data: { user: tokenUser } } = await supabaseClient.auth.getUser()
        if (tokenUser) {
          console.log('  📧 User email:', tokenUser.email)
        }
      } catch (err) {
        // Non-critical - just means we couldn't get user details
        console.log('  ⚠️  Could not fetch user details (non-critical)')
      }
    }

    // Parse request body
    const { walletAddress, signature, message, hederaAccountId }: WalletLoginRequest = await req.json()

    console.log('📝 Wallet login request details:')
    console.log('  💳 Wallet address length:', walletAddress?.length || 0)
    console.log('  🏦 Hedera account:', hederaAccountId || 'Not provided')
    console.log('  📄 Message length:', message?.length || 0)
    console.log('  ✍️  Signature length:', signature?.length || 0)

    // 4. Verify wallet signature
    console.log('🖊️  Verifying wallet signature...')
    const normalizedAddress = walletAddress.toLowerCase()

    try {
      const recoveredAddress = ethers.verifyMessage(message, signature)
      const recoveredNormalized = recoveredAddress.toLowerCase()

      console.log('  🎯 Expected address:', normalizedAddress)
      console.log('  🔍 Recovered address:', recoveredNormalized)
      console.log('  ✔️  Match:', recoveredNormalized === normalizedAddress ? '✅ YES' : '❌ NO')

      if (recoveredNormalized !== normalizedAddress) {
        console.error('❌ Signature verification failed: Address mismatch')
        return new Response(
          JSON.stringify({ error: 'Invalid signature - address mismatch' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ Signature verified successfully for address:', normalizedAddress)
    } catch (error) {
      console.error('❌ Signature verification exception:', error)
      return new Response(
        JSON.stringify({ error: 'Signature verification failed', details: error.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Check if user exists in database
    console.log('🔍 Checking if user exists in database...')
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('evm_address', normalizedAddress)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if this wallet should be auto-admin (matches HEDERA_OPERATOR_ID from environment)
    const operatorId = Deno.env.get('VITE_HEDERA_OPERATOR_ID')
    const shouldBeAdmin = operatorId && hederaAccountId && hederaAccountId.toLowerCase() === operatorId.toLowerCase()

    if (shouldBeAdmin) {
      console.log('👑 Auto-admin detected: wallet matches VITE_HEDERA_OPERATOR_ID')
    }

    let userId: string

    // 6. Create or update user
    if (existingUser) {
      console.log('✅ Existing user found:', existingUser.id)
      console.log('  👤 Username:', existingUser.username)
      console.log('  🕐 Last login:', existingUser.last_login_at)

      // Prepare update data
      const updateData: any = {
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Auto-grant admin if this is the operator wallet
      if (shouldBeAdmin && !existingUser.is_admin) {
        updateData.is_admin = true
        console.log('  👑 Granting admin privileges to operator wallet')
      }

      // Update last login and admin status if needed
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('⚠️  Error updating user:', updateError)
      }

      // Update streak
      try {
        await supabaseAdmin.rpc('update_streak', { p_user_id: existingUser.id })
      } catch (streakError) {
        console.warn('⚠️  Failed to update streak:', streakError)
      }

      userId = existingUser.id
    } else {
      console.log('👤 Creating new user for address:', normalizedAddress)

      // Generate unique username
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const username = `Explorer_${randomNum}`

      // Generate random avatar emoji
      const emojis = ['👨‍💻', '👩‍💻', '🧑‍💻', '🦸', '🦹', '🧙', '🧝', '🧛', '🧞', '🧜', '🧚', '👨‍🚀', '👩‍🚀', '🧑‍🚀', '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦑']
      const avatarEmoji = emojis[Math.floor(Math.random() * emojis.length)]

      const newUserData = {
        evm_address: normalizedAddress,
        hedera_account_id: hederaAccountId || null,
        username,
        email: null,
        avatar_emoji: avatarEmoji,
        bio: null,
        location: null,
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
        courses_completed: 0,
        lessons_completed: 0,
        badges_earned: 0,
        last_login_at: new Date().toISOString(),
        is_active: true,
        is_verified: false,
        profile_public: true,
        show_on_leaderboard: true,
        is_admin: shouldBeAdmin, // Auto-grant admin to operator wallet
      }

      if (shouldBeAdmin) {
        console.log('  👑 New user created with admin privileges (operator wallet)')
      }

      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert(newUserData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating user:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!newUser) {
        return new Response(
          JSON.stringify({ error: 'User creation failed - no data returned' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('✅ New user created:', newUser.id)
      console.log('  👤 Username:', newUser.username)
      console.log('  💳 Wallet:', newUser.evm_address)

      // Initialize streak for new user
      try {
        await supabaseAdmin.rpc('update_streak', { p_user_id: newUser.id })
      } catch (streakError) {
        console.warn('⚠️  Failed to initialize streak:', streakError)
      }

      userId = newUser.id
    }

    // 7. Generate Supabase Auth user (for JWT generation)
    console.log('🔐 Creating/updating Supabase Auth user...')
    const authEmail = `${normalizedAddress}@wallet.local`
    console.log('  📧 Auth email:', authEmail)

    // Try to create auth user (will fail if exists, which is fine)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
      user_metadata: {
        wallet_address: normalizedAddress,
        hedera_account_id: hederaAccountId,
        user_id: userId,
      }
    })

    let authUserId: string

    if (authError) {
      // Check if the error is because user already exists
      const isUserExists = authError.message.includes('already registered') ||
                          authError.message.includes('email_exists') ||
                          (authError as any).code === 'email_exists'

      if (isUserExists) {
        console.log('  ℹ️  Auth user already exists, fetching and updating metadata...')

        // User exists, get the auth user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const existingAuthUser = users?.users.find(u => u.email === authEmail)

        if (!existingAuthUser) {
          console.error('❌ Auth user should exist but not found in list')
          console.log('  📋 Attempting to search by email directly...')

          // Fallback: try to get user by searching more broadly
          const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
          console.log('  📊 Total auth users found:', allUsers?.users?.length || 0)

          // Log emails to debug (only first 20 chars for security)
          allUsers?.users.forEach((u: any) => {
            if (u.email?.startsWith(normalizedAddress.substring(0, 10))) {
              console.log('  🔍 Found similar email:', u.email)
            }
          })

          return new Response(
            JSON.stringify({ error: 'Auth user not found after creation error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        authUserId = existingAuthUser.id
        console.log('  🔍 Found existing auth user:', authUserId)

        // Update user metadata
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          user_metadata: {
            wallet_address: normalizedAddress,
            hedera_account_id: hederaAccountId,
            user_id: userId,
          }
        })

        if (updateError) {
          console.error('⚠️  Error updating user metadata:', updateError)
        } else {
          console.log('✅ Auth user metadata updated')
        }
      } else {
        console.error('❌ Error creating auth user:', authError)
        console.error('  📋 Error details:', JSON.stringify(authError, null, 2))
        return new Response(
          JSON.stringify({ error: 'Failed to create auth session', details: authError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      authUserId = authUser.user.id
      console.log('✅ New auth user created:', authUserId)
    }

    // 8. Generate session tokens using Admin API
    console.log('🎫 Generating JWT tokens for auth user:', authUserId)

    // Use admin.generateLink with 'magiclink' type to get valid tokens
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: authEmail,
      options: {
        redirectTo: undefined, // No redirect needed for API
      }
    })

    console.log("📋 DEBUG: generateLink result:", JSON.stringify(linkData, null, 2));

    if (linkError) {
      console.error('❌ Error calling generateLink:', linkError)
    }

    // Check if we got usable tokens from generateLink
    const properties = linkData?.properties
    let accessToken: string | null = null
    let refreshToken: string | null = null
    let expiresIn = 3600

    if (properties?.access_token && properties?.refresh_token) {
      // Success path: use tokens from generateLink
      console.log('✅ generateLink returned valid tokens')
      console.log('  📏 Access token length:', properties.access_token.length)
      console.log('  📏 Refresh token length:', properties.refresh_token.length)

      accessToken = properties.access_token
      refreshToken = properties.refresh_token
      expiresIn = properties.expires_in || 3600
    } else {
      // Fallback path: Use Supabase Admin API to create session
      // This creates BOTH the JWT tokens AND the session record in Supabase's database
      console.log('⚠️  generateLink did not return usable tokens (properties:', JSON.stringify(properties), ')')
      console.log('🔧 DEBUG: falling back to admin.createSession for authUserId:', authUserId)

      try {
        // Workaround: Use generateLink() + verifyOtp() to create session
        // This is the official Supabase-recommended approach for server-side session creation
        // Step 1: We already have linkData from above, extract the hashed token
        const hashedToken = linkData.properties.hashed_token

        if (!hashedToken) {
          console.error('❌ No hashed_token in generateLink response')
          throw new Error('Failed to extract hashed token from magic link')
        }

        console.log('  🔑 Extracted hashed token from magic link')
        console.log('  📝 Verifying OTP to create session...')

        // Step 2: Verify the OTP to create a session and get tokens
        const { data: otpData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
          token_hash: hashedToken,
          type: 'magiclink',
        })

        if (otpError || !otpData || !otpData.session) {
          console.error('❌ Failed to verify OTP:', otpError)
          throw new Error(otpError?.message || 'OTP verification failed')
        }

        console.log('✅ OTP verified, session created successfully')
        console.log('  📏 Access token length:', otpData.session.access_token?.length || 0)
        console.log('  📏 Refresh token length:', otpData.session.refresh_token?.length || 0)

        accessToken = otpData.session.access_token
        refreshToken = otpData.session.refresh_token
        expiresIn = otpData.session.expires_in || 3600

      } catch (sessionError: unknown) {
        const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError)
        console.error('❌ Session creation failed:', errorMessage)
        return new Response(
          JSON.stringify({
            error: 'Failed to create authentication session',
            details: errorMessage
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Final validation: we must have an access_token
    if (!accessToken) {
      console.error('❌ CRITICAL: No access_token available after all generation attempts')
      return new Response(
        JSON.stringify({ error: 'Unable to generate valid session tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user data from database
    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userFetchError || !userData) {
      console.error('❌ Error fetching user data:', userFetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Returning session with tokens')
    console.log('  📏 Final access_token length:', accessToken.length)
    console.log('  📏 Final refresh_token:', refreshToken ? `length ${refreshToken.length}` : 'null')
    console.log('  ⏱️  Expires in:', expiresIn, 'seconds')

    // Return session data
    return new Response(
      JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        token_type: 'bearer',
        user: userData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
