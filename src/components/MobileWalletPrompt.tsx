/**
 * Mobile Wallet Prompt Component
 *
 * Smart wallet connection component that adapts to desktop and mobile
 * Shows appropriate UI and actions based on device and wallet availability
 *
 * REAL IMPLEMENTATION - Works on both desktop and mobile
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Smartphone, Download, ExternalLink, Wallet, CheckCircle } from 'lucide-react';
import {
  isMobileDevice,
  isInWalletBrowser,
  getAvailableWallets,
  getWalletInstallUrl,
  openMobileWallet,
  determineConnectionMethod,
} from '@/lib/mobileWallet';
import { detectMetamask } from '@/lib/hederaUtils';

interface MobileWalletPromptProps {
  /**
   * Callback when user initiates wallet connection
   */
  onConnect?: () => void;

  /**
   * Show compact version
   */
  compact?: boolean;

  /**
   * Custom title
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;
}

export function MobileWalletPrompt({
  onConnect,
  compact = false,
  title,
  description,
}: MobileWalletPromptProps) {
  const [mobile, setMobile] = useState(false);
  const [inWalletBrowser, setInWalletBrowser] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<{
    method: 'browser' | 'deep-link' | 'install-required';
    wallet: string;
  } | null>(null);

  useEffect(() => {
    setMobile(isMobileDevice());
    setInWalletBrowser(isInWalletBrowser());
    setHasMetamask(detectMetamask());
    setConnectionMethod(determineConnectionMethod());
  }, []);

  const handleConnectClick = () => {
    if (connectionMethod?.method === 'deep-link') {
      // Open wallet app
      openMobileWallet('metamask');
    } else if (connectionMethod?.method === 'install-required') {
      // Open install page
      window.open(getWalletInstallUrl('metamask'), '_blank');
    } else {
      // Can connect directly
      onConnect?.();
    }
  };

  // Compact version
  if (compact) {
    return (
      <Button
        onClick={handleConnectClick}
        className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:shadow-lg rounded-full"
      >
        {mobile ? (
          <>
            <Smartphone className="w-4 h-4 mr-2" />
            {connectionMethod?.method === 'install-required' ? 'Install Wallet' : 'Connect Wallet'}
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Full version
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-lg border border-blue-100">
      <div className="text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center mx-auto mb-6">
          {mobile ? (
            <Smartphone className="w-10 h-10 text-white" />
          ) : (
            <Wallet className="w-10 h-10 text-white" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title || (mobile ? 'Connect Your Mobile Wallet' : 'Connect Your Wallet')}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {description || (
            mobile
              ? 'Connect your mobile wallet to access all features and start learning'
              : 'Connect your Metamask wallet to access all features and start learning'
          )}
        </p>

        {/* Status indicators */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="space-y-3 text-left">
            {/* Device Type */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-600">Device:</span>
              <span className="font-semibold text-gray-900">
                {mobile ? 'Mobile' : 'Desktop'}
              </span>
            </div>

            {/* Wallet Status */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-600">Wallet Installed:</span>
              <span className={`font-semibold ${hasMetamask ? 'text-green-600' : 'text-orange-600'}`}>
                {hasMetamask ? (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  'Not Detected'
                )}
              </span>
            </div>

            {/* Browser Type */}
            {mobile && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Wallet Browser:</span>
                <span className={`font-semibold ${inWalletBrowser ? 'text-green-600' : 'text-gray-600'}`}>
                  {inWalletBrowser ? (
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes
                    </span>
                  ) : (
                    'No'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Connection method instructions */}
        {connectionMethod && (
          <div className="mb-6">
            {connectionMethod.method === 'browser' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-left">
                <p className="text-green-800 text-sm">
                  ✅ <strong>Ready to connect!</strong> Click the button below to connect your wallet.
                </p>
              </div>
            )}

            {connectionMethod.method === 'deep-link' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-left">
                <p className="text-blue-800 text-sm">
                  📱 <strong>Open in Wallet App:</strong> Click below to open this page in your{' '}
                  {connectionMethod.wallet} app, then connect.
                </p>
              </div>
            )}

            {connectionMethod.method === 'install-required' && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg text-left">
                <p className="text-orange-800 text-sm">
                  📲 <strong>Wallet Not Found:</strong> You need to install Metamask {mobile ? 'app' : 'extension'}{' '}
                  to continue. Click below to download.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleConnectClick}
          className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:shadow-xl rounded-full py-6 text-lg font-semibold transition-all"
        >
          {connectionMethod?.method === 'deep-link' && (
            <>
              <ExternalLink className="w-5 h-5 mr-2" />
              Open in {connectionMethod.wallet === 'metamask' ? 'Metamask' : 'Wallet'} App
            </>
          )}
          {connectionMethod?.method === 'install-required' && (
            <>
              <Download className="w-5 h-5 mr-2" />
              Install Metamask {mobile ? 'App' : 'Extension'}
            </>
          )}
          {connectionMethod?.method === 'browser' && (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        {/* Available Wallets */}
        {!mobile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Supported Wallets:</p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-2xl">🦊</span>
                </div>
                <p className="text-xs text-gray-600">Metamask</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-2xl">🔷</span>
                </div>
                <p className="text-xs text-gray-600">HashPack</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-2xl">⚔️</span>
                </div>
                <p className="text-xs text-gray-600">Blade</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
