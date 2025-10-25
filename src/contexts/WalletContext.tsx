import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  connectWallet as connectMetamask,
  disconnectWallet,
  getBalance,
  listenToAccountChanges,
  listenToChainChanges,
  detectMetamask,
  isWalletConnected,
  parseMetamaskError,
  formatAccountId,
  formatEvmAddress,
} from '@/lib/hederaUtils';
import {
  authenticateWithWallet,
  getUserProfile,
  AuthenticationError,
} from '@/lib/auth/wallet-auth';
import {
  isMobileDevice,
  isInWalletBrowser,
  determineConnectionMethod,
  connectWithBestMethod,
} from '@/lib/mobileWallet';
import type { User } from '@/lib/supabase/types';

interface WalletState {
  connected: boolean;
  account: string | null;  // EVM address
  accountId: string | null;  // Hedera account ID
  balance: number;
  network: string;
  loading: boolean;
  error: string | null;
  user: User | null;  // Authenticated user from database
  authLoading: boolean;  // Authentication loading state
  authError: string | null;  // Authentication error
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: null,
    accountId: null,
    balance: 0,
    network: 'testnet',
    loading: false,
    error: null,
    user: null,
    authLoading: false,
    authError: null,
  });

  // Connect wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, authLoading: true, authError: null }));

    try {
      // 0. Check if we can connect (handles mobile deep linking)
      const canConnect = await connectWithBestMethod();
      if (!canConnect) {
        // User was redirected to install wallet or open wallet app
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // 1. Connect Metamask wallet
      const result = await connectMetamask();

      // 2. Fetch balance
      const balance = await getBalance(result.evmAddress);

      // 3. Authenticate with database (create/retrieve user)
      let user: User | null = null;
      let authError: string | null = null;

      try {
        user = await authenticateWithWallet(result.evmAddress, result.accountId);
        console.log('User authenticated:', user.id);
      } catch (error) {
        console.error('Authentication failed:', error);
        authError = error instanceof AuthenticationError
          ? error.message
          : 'Authentication failed';
      }

      setState({
        connected: true,
        account: result.evmAddress,
        accountId: result.accountId,
        balance,
        network: result.network,
        loading: false,
        error: null,
        user,
        authLoading: false,
        authError,
      });

      // Persist connection
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', result.evmAddress);
      if (user) {
        localStorage.setItem('userId', user.id);
      }
    } catch (error: any) {
      const errorMessage = parseMetamaskError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        authLoading: false,
      }));
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    disconnectWallet();
    setState({
      connected: false,
      account: null,
      accountId: null,
      balance: 0,
      network: 'testnet',
      loading: false,
      error: null,
      user: null,
      authLoading: false,
      authError: null,
    });
    localStorage.removeItem('userId');
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!state.account) return;

    try {
      const balance = await getBalance(state.account);
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [state.account]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!state.user) return;

    setState(prev => ({ ...prev, authLoading: true, authError: null }));

    try {
      const user = await getUserProfile(state.user.id);
      setState(prev => ({
        ...prev,
        user,
        authLoading: false,
        authError: null,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      const authError = error instanceof AuthenticationError
        ? error.message
        : 'Failed to refresh user data';
      setState(prev => ({
        ...prev,
        authLoading: false,
        authError,
      }));
    }
  }, [state.user]);

  // Auto-reconnect on mount
  useEffect(() => {
    const autoConnect = async () => {
      if (!detectMetamask()) return;

      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (!wasConnected) return;

      const isConnected = await isWalletConnected();
      if (isConnected) {
        try {
          await connect();
        } catch (error) {
          console.error('Auto-reconnect failed:', error);
        }
      }
    };

    autoConnect();
  }, [connect]);

  // Listen to account changes
  useEffect(() => {
    if (!detectMetamask() || !state.connected) return;

    const cleanup = listenToAccountChanges((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.account) {
        // Account changed, reconnect
        connect();
      }
    });

    return cleanup;
  }, [state.connected, state.account, connect, disconnect]);

  // Listen to chain changes
  useEffect(() => {
    if (!detectMetamask() || !state.connected) return;

    const cleanup = listenToChainChanges(async (chainIdHex) => {
      const chainId = parseInt(chainIdHex, 16);
      const isHederaTestnet = chainId === 296;

      console.log(`🌐 Network changed to Chain ID ${chainId}`);

      if (!isHederaTestnet) {
        console.warn('⚠️ Switched away from Hedera Testnet. Some features may not work.');
        // Optionally prompt user to switch back
        // For now, just refresh connection which will attempt to switch back
        connect();
      } else {
        console.log('✅ On Hedera Testnet');
        // Just refresh balance and user data
        refreshBalance();
        refreshUser();
      }
    });

    return cleanup;
  }, [state.connected, connect, refreshBalance, refreshUser]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalance, refreshUser }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}