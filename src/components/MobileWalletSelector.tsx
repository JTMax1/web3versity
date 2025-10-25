/**
 * Mobile Wallet Selector Component
 *
 * MOBILE-ONLY: Shows list of available wallets when user is NOT in a wallet browser
 * Lets user choose which wallet app to open
 *
 * This solves the problem of multiple wallets being installed
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Smartphone, ExternalLink, CheckCircle, Wallet } from 'lucide-react';
import {
  isMobileDevice,
  isInWalletBrowser,
  getWalletInstallUrl,
  openMobileWallet,
  detectAllWallets,
  getMetamaskMobileDeepLink,
  getHashPackDeepLink,
  getBladeWalletDeepLink,
} from '@/lib/mobileWallet';

interface MobileWalletSelectorProps {
  /**
   * Callback when user selects a wallet
   */
  onWalletSelected?: (wallet: string) => void;
}

export function MobileWalletSelector({ onWalletSelected }: MobileWalletSelectorProps) {
  const [mobile, setMobile] = useState(false);
  const [inWalletBrowser, setInWalletBrowser] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  useEffect(() => {
    const isMob = isMobileDevice();
    const inBrowser = isInWalletBrowser();
    const wallets = detectAllWallets();

    setMobile(isMob);
    setInWalletBrowser(inBrowser);
    setAvailableWallets(wallets);

    console.log('🔍 Mobile Wallet Detection:');
    console.log('  - Is Mobile:', isMob);
    console.log('  - In Wallet Browser:', inBrowser);
    console.log('  - Detected Wallets:', wallets);
  }, []);

  const handleWalletClick = async (walletType: string) => {
    console.log('📱 Opening wallet:', walletType);
    onWalletSelected?.(walletType);

    // Dynamically import WalletConnect functions
    const { openWalletWithWalletConnect } = await import('@/lib/walletConnect');

    // Open the selected wallet app via WalletConnect
    try {
      if (walletType === 'hashpack') {
        await openWalletWithWalletConnect('hashpack');
      } else if (walletType === 'blade') {
        await openWalletWithWalletConnect('blade');
      } else if (walletType === 'metamask') {
        await openWalletWithWalletConnect('metamask');
      } else {
        // Default to HashPack for unknown wallets
        await openWalletWithWalletConnect('hashpack');
      }
    } catch (error) {
      console.error('Failed to open wallet with WalletConnect:', error);
      // Fallback to old deep link method
      if (walletType === 'hashpack') {
        window.location.href = getHashPackDeepLink();
      } else if (walletType === 'blade') {
        window.location.href = getBladeWalletDeepLink();
      } else if (walletType === 'metamask') {
        window.location.href = getMetamaskMobileDeepLink();
      } else {
        openMobileWallet('auto');
      }
    }
  };

  const getWalletIcon = (wallet: string) => {
    switch (wallet) {
      case 'hashpack':
        return '🔷';
      case 'blade':
        return '⚔️';
      case 'metamask':
        return '🦊';
      case 'kabila':
        return '🐪';
      case 'coinbase':
        return '🔵';
      case 'trust':
        return '🛡️';
      default:
        return '👛';
    }
  };

  const getWalletName = (wallet: string) => {
    switch (wallet) {
      case 'hashpack':
        return 'HashPack';
      case 'blade':
        return 'Blade Wallet';
      case 'metamask':
        return 'Metamask';
      case 'kabila':
        return 'Kabila Wallet';
      case 'coinbase':
        return 'Coinbase Wallet';
      case 'trust':
        return 'Trust Wallet';
      case 'tokenpocket':
        return 'TokenPocket';
      default:
        return 'Web3 Wallet';
    }
  };

  // Only show on mobile
  if (!mobile) {
    return null;
  }

  // If already in wallet browser, don't show selector
  if (inWalletBrowser) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-green-900">Already in Wallet Browser</h3>
            <p className="text-sm text-green-600">You can connect your wallet now</p>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet selection
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Wallet
        </h2>
        <p className="text-gray-600 text-sm">
          Select a wallet app to open and connect
        </p>
      </div>

      {availableWallets.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Detected {availableWallets.length} wallet{availableWallets.length > 1 ? 's' : ''} on your device:
          </p>

          {availableWallets.map((wallet) => (
            <button
              key={wallet}
              onClick={() => handleWalletClick(wallet)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl">{getWalletIcon(wallet)}</div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600">
                  {getWalletName(wallet)}
                </h3>
                <p className="text-sm text-gray-500">
                  Tap to open in {getWalletName(wallet)}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">No Wallets Detected</h3>
          <p className="text-sm text-gray-500 mb-6">
            Install a Web3 wallet app to continue
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => window.open(getWalletInstallUrl('metamask'), '_blank')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              🦊 Install Metamask
            </Button>
            <Button
              onClick={() => window.open(getWalletInstallUrl('hashpack'), '_blank')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
            >
              🔷 Install HashPack
            </Button>
            <Button
              onClick={() => window.open(getWalletInstallUrl('blade'), '_blank')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              ⚔️ Install Blade Wallet
            </Button>
          </div>
        </div>
      )}

      {availableWallets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Opening in a wallet app will allow you to connect and sign transactions
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function MobileWalletSelectorCompact({ onWalletSelected }: MobileWalletSelectorProps) {
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  useEffect(() => {
    if (isMobileDevice()) {
      setAvailableWallets(detectAllWallets());
    }
  }, []);

  if (!isMobileDevice() || isInWalletBrowser()) {
    return null;
  }

  const handleOpenWallet = async (wallet: string) => {
    onWalletSelected?.(wallet);

    // Dynamically import WalletConnect functions
    const { openWalletWithWalletConnect } = await import('@/lib/walletConnect');

    try {
      if (wallet === 'hashpack') {
        await openWalletWithWalletConnect('hashpack');
      } else if (wallet === 'blade') {
        await openWalletWithWalletConnect('blade');
      } else {
        await openWalletWithWalletConnect('metamask');
      }
    } catch (error) {
      console.error('Failed to open wallet with WalletConnect:', error);
      // Fallback to old deep link method
      if (wallet === 'hashpack') {
        window.location.href = getHashPackDeepLink();
      } else if (wallet === 'blade') {
        window.location.href = getBladeWalletDeepLink();
      } else {
        window.location.href = getMetamaskMobileDeepLink();
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {availableWallets.map((wallet) => (
        <Button
          key={wallet}
          onClick={() => handleOpenWallet(wallet)}
          variant="outline"
          className="rounded-full"
        >
          <span className="mr-2">
            {wallet === 'hashpack' && '🔷'}
            {wallet === 'blade' && '⚔️'}
            {wallet === 'metamask' && '🦊'}
            {wallet === 'unknown' && '👛'}
          </span>
          Open in {wallet === 'hashpack' ? 'HashPack' : wallet === 'blade' ? 'Blade' : wallet === 'metamask' ? 'Metamask' : 'Wallet'}
        </Button>
      ))}
    </div>
  );
}
