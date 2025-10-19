/**
 * Configuration Module Entry Point
 *
 * Re-exports all configuration utilities for easy importing.
 *
 * Usage:
 *   import { env, getHederaRpcUrl } from '@/config';
 */

export { env, getHederaRpcUrl, getHashScanUrl, isBrowser, devUtils } from './env';
export type { EnvironmentVariables } from './env';
