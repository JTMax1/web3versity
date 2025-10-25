/**
 * Network Status Badge Component
 *
 * Displays current network status and prompts user to switch if needed
 * Shows real-time network detection and switching options
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { getCurrentChainId, switchToHederaTestnet, HEDERA_TESTNET_CHAIN_ID } from '@/lib/hederaUtils';

interface NetworkStatusBadgeProps {
  /**
   * Show expanded version with switch button
   */
  expanded?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

export function NetworkStatusBadge({ expanded = false, className = '' }: NetworkStatusBadgeProps) {
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkNetwork = async () => {
    try {
      setChecking(true);
      const currentChainId = await getCurrentChainId();
      setChainId(currentChainId);
      setIsCorrectNetwork(currentChainId === HEDERA_TESTNET_CHAIN_ID);
    } catch (error) {
      console.error('Failed to check network:', error);
      setChainId(null);
      setIsCorrectNetwork(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      const handleChainChanged = () => {
        checkNetwork();
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleSwitchNetwork = async () => {
    setSwitching(true);
    try {
      await switchToHederaTestnet();
      await checkNetwork();
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      if (error.code !== 4001) {
        alert('Failed to switch network. Please switch manually in Metamask.');
      }
    } finally {
      setSwitching(false);
    }
  };

  if (checking) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Checking network...</span>
      </div>
    );
  }

  if (!chainId) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm ${className}`}>
        <WifiOff className="w-4 h-4" />
        <span>Not connected</span>
      </div>
    );
  }

  // Compact badge
  if (!expanded) {
    if (isCorrectNetwork) {
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium ${className}`}>
          <CheckCircle className="w-4 h-4" />
          <span>Hedera Testnet</span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Wrong Network</span>
      </div>
    );
  }

  // Expanded version with switch button
  if (isCorrectNetwork) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 ${className}`}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-900">Connected to Hedera Testnet</p>
            <p className="text-sm text-green-600">Chain ID: {chainId}</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Wrong network - show switch button
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-orange-900">Wrong Network Detected</p>
          <p className="text-sm text-orange-600">
            Current: Chain ID {chainId} | Required: Hedera Testnet (296)
          </p>
        </div>
      </div>
      <Button
        onClick={handleSwitchNetwork}
        disabled={switching}
        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 py-2"
      >
        {switching ? (
          <>
            <Wifi className="w-4 h-4 mr-2 animate-spin" />
            Switching...
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 mr-2" />
            Switch Network
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * Simple network indicator dot (for header/nav)
 */
export function NetworkIndicatorDot() {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const currentChainId = await getCurrentChainId();
        setIsCorrectNetwork(currentChainId === HEDERA_TESTNET_CHAIN_ID);
      } catch (error) {
        setIsCorrectNetwork(false);
      }
    };

    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum?.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  return (
    <div
      className={`w-2 h-2 rounded-full ${
        isCorrectNetwork ? 'bg-green-500' : 'bg-orange-500'
      } animate-pulse`}
      title={isCorrectNetwork ? 'Connected to Hedera Testnet' : 'Wrong network'}
    />
  );
}
