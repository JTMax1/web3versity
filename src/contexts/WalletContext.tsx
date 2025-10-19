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

interface WalletState {
  connected: boolean;
  account: string | null;  // EVM address
  accountId: string | null;  // Hedera account ID
  balance: number;
  network: string;
  loading: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
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
  });

  // Connect wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await connectMetamask();

      // Fetch balance
      const balance = await getBalance(result.evmAddress);

      setState({
        connected: true,
        account: result.evmAddress,
        accountId: result.accountId,
        balance,
        network: result.network,
        loading: false,
        error: null,
      });

      // Persist connection
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', result.evmAddress);
    } catch (error: any) {
      const errorMessage = parseMetamaskError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
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
    });
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

    const cleanup = listenToChainChanges((chainId) => {
      // Chain changed, refresh connection
      connect();
    });

    return cleanup;
  }, [state.connected, connect]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalance }}>
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