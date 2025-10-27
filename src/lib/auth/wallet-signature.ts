/**
 * Wallet Signature Authentication Utilities
 *
 * Handles message signing and verification for wallet-based authentication
 */

import { BrowserProvider } from 'ethers'

/**
 * Generate authentication message for signing
 */
export function generateAuthMessage(walletAddress: string): string {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).substring(7)

  return `Welcome to Web3Versity!

Sign this message to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}`
}

/**
 * Request wallet signature from user
 */
export async function requestWalletSignature(
  walletAddress: string,
  provider: BrowserProvider
): Promise<{ signature: string; message: string }> {
  const message = generateAuthMessage(walletAddress)

  try {
    // Get signer from provider
    const signer = await provider.getSigner()

    // Request signature
    const signature = await signer.signMessage(message)

    return { signature, message }
  } catch (error: any) {
    console.error('Signature request failed:', error)

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Signature request was rejected by user')
    }

    throw new Error('Failed to sign message: ' + error.message)
  }
}

/**
 * Authenticate with backend using wallet signature
 */
export async function authenticateWithSignature(
  walletAddress: string,
  signature: string,
  message: string,
  hederaAccountId?: string
): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  user: any
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing')
  }

  // Call wallet-login Edge Function
  // IMPORTANT: Must send anon key as Authorization header (Supabase gateway requirement)
  const response = await fetch(`${supabaseUrl}/functions/v1/wallet-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`, // Required for Supabase Edge Function gateway
    },
    body: JSON.stringify({
      walletAddress,
      signature,
      message,
      hederaAccountId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Authentication failed: ${response.status}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user: data.user,
  }
}
