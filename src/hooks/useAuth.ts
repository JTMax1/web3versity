/**
 * useAuth Hook
 *
 * Provides convenient authentication interface for components.
 * Combines wallet connection with database user authentication.
 *
 * Phase 1, Task 1.5 - User Authentication System
 */

import { useWallet } from '../contexts/WalletContext';
import type { User } from '../lib/supabase/types';

export interface AuthHookReturn {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Loading states
  loading: boolean;
  authLoading: boolean;

  // Errors
  error: string | null;
  authError: string | null;

  // Wallet state
  connected: boolean;
  account: string | null;
  accountId: string | null;
  balance: number;

  // Actions
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

/**
 * useAuth hook
 *
 * Provides authentication state and functions.
 * This is the primary hook components should use for authentication.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Login with Wallet</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.username}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthHookReturn {
  const wallet = useWallet();

  return {
    // User state
    user: wallet.user,
    isAuthenticated: wallet.connected && wallet.user !== null,

    // Loading states
    loading: wallet.loading || wallet.authLoading,
    authLoading: wallet.authLoading,

    // Errors
    error: wallet.error || wallet.authError,
    authError: wallet.authError,

    // Wallet state
    connected: wallet.connected,
    account: wallet.account,
    accountId: wallet.accountId,
    balance: wallet.balance,

    // Actions
    login: wallet.connect,
    logout: wallet.disconnect,
    refreshUser: wallet.refreshUser,
    refreshBalance: wallet.refreshBalance,
  };
}
