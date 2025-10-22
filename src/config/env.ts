/**
 * Environment Configuration
 *
 * This module provides type-safe access to environment variables with validation.
 * All environment variables are validated on application startup to fail fast
 * if required configuration is missing.
 *
 * Usage:
 *   import { env } from '@/config/env';
 *   const url = env.SUPABASE_URL;
 */

// Type definitions for environment variables
interface EnvironmentVariables {
  // Supabase Configuration
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // Hedera Network Configuration
  HEDERA_NETWORK: 'testnet' | 'mainnet';
  HEDERA_TESTNET_RPC: string;
  HEDERA_CHAIN_ID: number;

  // Hedera Operator Account (for server-side operations)
  HEDERA_OPERATOR_ID: string;
  HEDERA_OPERATOR_EVM: string;

  // NFT Certificate Configuration
  NFT_COLLECTION_TOKEN_ID?: string;

  // Application Configuration
  APP_NAME: string;
  APP_URL: string;
  ENABLE_ANALYTICS: boolean;

  // Computed/Derived Values
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  IS_TESTNET: boolean;
}

/**
 * Get an environment variable with the VITE_ prefix
 */
function getEnvVar(key: string): string | undefined {
  return import.meta.env[`VITE_${key}`];
}

/**
 * Get a required environment variable, throw error if missing
 */
function getRequiredEnvVar(key: string, envKey?: string): string {
  const fullKey = envKey || `VITE_${key}`;
  const value = import.meta.env[fullKey];

  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${fullKey}\n\n` +
      `Please ensure your .env.local file contains:\n` +
      `${fullKey}=your-value-here\n\n` +
      `See .env.example for a template.`
    );
  }

  return value;
}

/**
 * Get an optional environment variable with a default value
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return getEnvVar(key) || defaultValue;
}

/**
 * Parse boolean environment variable
 */
function parseBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key);
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Parse integer environment variable
 */
function parseIntEnvVar(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`⚠️ Invalid integer value for ${key}: ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Validate Supabase URL format
 */
function validateSupabaseUrl(url: string): void {
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    throw new Error(
      `❌ Invalid Supabase URL format: ${url}\n\n` +
      `Expected format: https://your-project-id.supabase.co\n` +
      `Get your URL from: https://app.supabase.com/project/YOUR_PROJECT/settings/api`
    );
  }
}

/**
 * Validate Hedera account ID format
 */
function validateHederaAccountId(accountId: string): void {
  const pattern = /^0\.0\.\d+$/;
  if (!pattern.test(accountId)) {
    throw new Error(
      `❌ Invalid Hedera Account ID format: ${accountId}\n\n` +
      `Expected format: 0.0.12345\n` +
      `Get a testnet account from: https://portal.hedera.com/`
    );
  }
}

/**
 * Validate Ethereum address format
 */
function validateEvmAddress(address: string): void {
  const pattern = /^0x[a-fA-F0-9]{40}$/;
  if (!pattern.test(address)) {
    throw new Error(
      `❌ Invalid EVM address format: ${address}\n\n` +
      `Expected format: 0x1234567890abcdef1234567890abcdef12345678`
    );
  }
}

/**
 * Validate Hedera network value
 */
function validateHederaNetwork(network: string): 'testnet' | 'mainnet' {
  if (network !== 'testnet' && network !== 'mainnet') {
    throw new Error(
      `❌ Invalid Hedera network: ${network}\n\n` +
      `Must be either 'testnet' or 'mainnet'`
    );
  }
  return network;
}

/**
 * Load and validate all environment variables
 */
function loadEnvironmentVariables(): EnvironmentVariables {
  console.log('🔧 Loading environment configuration...');

  // Supabase Configuration
  const supabaseUrl = getRequiredEnvVar('SUPABASE_URL');
  validateSupabaseUrl(supabaseUrl);

  const supabaseAnonKey = getRequiredEnvVar('SUPABASE_ANON_KEY');

  // Hedera Network Configuration
  const hederaNetwork = validateHederaNetwork(
    getOptionalEnvVar('HEDERA_NETWORK', 'testnet')
  );

  const hederaTestnetRpc = getOptionalEnvVar(
    'HEDERA_TESTNET_RPC',
    'https://testnet.hashio.io/api'
  );

  const hederaChainId = parseIntEnvVar('HEDERA_CHAIN_ID', 296);

  // Hedera Operator Account
  const hederaOperatorId = getRequiredEnvVar('HEDERA_OPERATOR_ID');
  validateHederaAccountId(hederaOperatorId);

  const hederaOperatorEvm = getRequiredEnvVar('HEDERA_OPERATOR_EVM');
  validateEvmAddress(hederaOperatorEvm);

  // NFT Certificate Configuration (optional)
  const nftCollectionTokenId = getEnvVar('NFT_COLLECTION_TOKEN_ID');

  // Application Configuration
  const appName = getOptionalEnvVar('APP_NAME', 'Web3Versity');
  const appUrl = getOptionalEnvVar('APP_URL', 'http://localhost:3000');
  const enableAnalytics = parseBooleanEnvVar('ENABLE_ANALYTICS', false);

  // Computed values
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  const isTestnet = hederaNetwork === 'testnet';

  console.log('✅ Environment configuration loaded successfully');
  console.log(`   Network: ${hederaNetwork}`);
  console.log(`   Mode: ${isDevelopment ? 'development' : 'production'}`);
  console.log(`   Supabase: ${supabaseUrl}`);
  console.log(`   Hedera Chain ID: ${hederaChainId}`);

  return {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    HEDERA_NETWORK: hederaNetwork,
    HEDERA_TESTNET_RPC: hederaTestnetRpc,
    HEDERA_CHAIN_ID: hederaChainId,
    HEDERA_OPERATOR_ID: hederaOperatorId,
    HEDERA_OPERATOR_EVM: hederaOperatorEvm,
    NFT_COLLECTION_TOKEN_ID: nftCollectionTokenId,
    APP_NAME: appName,
    APP_URL: appUrl,
    ENABLE_ANALYTICS: enableAnalytics,
    IS_DEVELOPMENT: isDevelopment,
    IS_PRODUCTION: isProduction,
    IS_TESTNET: isTestnet,
  };
}

/**
 * Exported environment configuration object
 *
 * This object is initialized once when the module is first imported.
 * If any required environment variables are missing, the application
 * will fail immediately with a helpful error message.
 */
export const env: EnvironmentVariables = loadEnvironmentVariables();

/**
 * Helper function to get the appropriate Hedera RPC URL
 */
export function getHederaRpcUrl(): string {
  if (env.HEDERA_NETWORK === 'testnet') {
    return env.HEDERA_TESTNET_RPC;
  }
  // For mainnet, you'd add the mainnet RPC here
  throw new Error('Mainnet RPC not configured yet');
}

/**
 * Helper function to get HashScan explorer URL
 */
export function getHashScanUrl(type: 'transaction' | 'account' | 'token', id: string): string {
  const baseUrl = env.IS_TESTNET
    ? 'https://hashscan.io/testnet'
    : 'https://hashscan.io/mainnet';

  return `${baseUrl}/${type}/${id}`;
}

/**
 * Helper to check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Development-only utilities
 */
export const devUtils = {
  /**
   * Log all environment variables (development only)
   */
  logEnvVars(): void {
    if (!env.IS_DEVELOPMENT) {
      console.warn('⚠️ Cannot log env vars in production');
      return;
    }

    console.log('📋 Environment Variables:');
    console.table({
      'Supabase URL': env.SUPABASE_URL,
      'Supabase Key': env.SUPABASE_ANON_KEY.substring(0, 20) + '...',
      'Hedera Network': env.HEDERA_NETWORK,
      'Hedera RPC': env.HEDERA_TESTNET_RPC,
      'Hedera Chain ID': env.HEDERA_CHAIN_ID,
      'Operator ID': env.HEDERA_OPERATOR_ID,
      'Operator EVM': env.HEDERA_OPERATOR_EVM,
      'App Name': env.APP_NAME,
      'App URL': env.APP_URL,
      'Analytics': env.ENABLE_ANALYTICS,
      'Environment': env.IS_DEVELOPMENT ? 'development' : 'production',
    });
  },

  /**
   * Validate environment is properly configured
   */
  validateEnv(): boolean {
    console.log('🔍 Validating environment configuration...');

    const checks = [
      { name: 'Supabase URL', valid: !!env.SUPABASE_URL },
      { name: 'Supabase Key', valid: !!env.SUPABASE_ANON_KEY },
      { name: 'Hedera Network', valid: !!env.HEDERA_NETWORK },
      { name: 'Hedera RPC', valid: !!env.HEDERA_TESTNET_RPC },
      { name: 'Hedera Chain ID', valid: env.HEDERA_CHAIN_ID === 296 },
      { name: 'Operator ID', valid: !!env.HEDERA_OPERATOR_ID },
      { name: 'Operator EVM', valid: !!env.HEDERA_OPERATOR_EVM },
    ];

    checks.forEach(check => {
      const icon = check.valid ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);
    });

    const allValid = checks.every(check => check.valid);

    if (allValid) {
      console.log('✅ All environment checks passed!');
    } else {
      console.error('❌ Some environment checks failed. Please check your .env.local file.');
    }

    return allValid;
  }
};

// Export type for use in other modules
export type { EnvironmentVariables };
