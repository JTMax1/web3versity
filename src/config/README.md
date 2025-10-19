# Environment Configuration

This directory contains the type-safe environment configuration for Web3Versity.

## Files

- `env.ts` - Main environment variable loader with validation
- `index.ts` - Re-exports for easy importing

## Usage

### Basic Usage

```typescript
import { env } from '@/config';

// Access environment variables
const supabaseUrl = env.SUPABASE_URL;
const hederaNetwork = env.HEDERA_NETWORK;
const chainId = env.HEDERA_CHAIN_ID;
```

### Helper Functions

```typescript
import { getHederaRpcUrl, getHashScanUrl } from '@/config';

// Get the appropriate Hedera RPC URL
const rpcUrl = getHederaRpcUrl(); // Returns testnet or mainnet RPC

// Generate HashScan explorer URLs
const txUrl = getHashScanUrl('transaction', '0.0.123456@1234567890.123456789');
const accountUrl = getHashScanUrl('account', '0.0.123456');
const tokenUrl = getHashScanUrl('token', '0.0.789012');
```

### Development Utilities

```typescript
import { devUtils } from '@/config';

// Log all environment variables (development only)
devUtils.logEnvVars();

// Validate environment configuration
const isValid = devUtils.validateEnv();
```

## Environment Variables

### Required Variables

These must be set in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HEDERA_OPERATOR_ID=0.0.12345
VITE_HEDERA_OPERATOR_EVM=0x1234...
```

### Optional Variables

These have defaults:

```bash
VITE_HEDERA_NETWORK=testnet              # Default: testnet
VITE_HEDERA_TESTNET_RPC=https://...      # Default: Hedera testnet RPC
VITE_HEDERA_CHAIN_ID=296                 # Default: 296
VITE_APP_NAME=Web3Versity                # Default: Web3Versity
VITE_APP_URL=http://localhost:3000       # Default: localhost:3000
VITE_ENABLE_ANALYTICS=false              # Default: false
```

## Validation

The configuration module performs automatic validation:

- ✅ Checks all required variables are present
- ✅ Validates Supabase URL format
- ✅ Validates Hedera account ID format (0.0.xxxxx)
- ✅ Validates EVM address format (0x...)
- ✅ Validates Hedera network value (testnet/mainnet)
- ✅ Parses numeric values correctly
- ✅ Provides helpful error messages

## Error Handling

If any required variable is missing or invalid, the app will fail immediately on startup with a helpful error message:

```
❌ Missing required environment variable: VITE_SUPABASE_URL

Please ensure your .env.local file contains:
VITE_SUPABASE_URL=your-value-here

See .env.example for a template.
```

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. The app will validate on startup

## TypeScript Support

All environment variables are fully typed:

```typescript
import { env, EnvironmentVariables } from '@/config';

// env is typed as EnvironmentVariables
env.SUPABASE_URL;        // string
env.HEDERA_NETWORK;      // 'testnet' | 'mainnet'
env.HEDERA_CHAIN_ID;     // number
env.IS_DEVELOPMENT;      // boolean
env.ENABLE_ANALYTICS;    // boolean
```

## Security

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Private keys should only be in server-side environment (not VITE_ variables)
- ✅ Use `.env.example` as a template (no actual secrets)
- ✅ All sensitive variables are validated but not logged in production

## Testing

To verify your configuration is correct:

```typescript
import { devUtils } from '@/config';

// In development, run:
devUtils.validateEnv();
devUtils.logEnvVars();
```

This will show a table of all environment variables and verify they're correctly configured.
