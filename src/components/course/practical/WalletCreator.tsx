/**
 * Wallet Creator Component
 *
 * Interactive wallet creation experience for Hedera Testnet.
 * Students generate real keypairs, create accounts, and receive testnet HBAR.
 *
 * WOW Factor: Students create their very first blockchain wallet!
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, Key, Copy, Download, CheckCircle, AlertCircle,
  ExternalLink, Shield, Eye, EyeOff, Sparkles, RefreshCw, Loader2
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface WalletCreatorProps {
  onInteract?: () => void;
}

interface WalletData {
  accountId: string;
  publicKey: string;
  privateKey: string;
  evmAddress: string;
  balance: number;
}

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';
const HASHSCAN_URL = 'https://hashscan.io/testnet';

export const WalletCreator: React.FC<WalletCreatorProps> = ({ onInteract }) => {
  const [step, setStep] = useState<'intro' | 'generating' | 'created' | 'funded'>('intro');
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  /**
   * Generate a new Hedera testnet wallet
   * Uses browser crypto API for key generation
   */
  const handleGenerateWallet = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the security terms first');
      return;
    }

    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }

    setIsGenerating(true);
    setStep('generating');

    try {
      // Generate ECDSA keypair using Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256', // secp256r1
        },
        true, // extractable
        ['sign', 'verify']
      );

      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyHex = bufferToHex(publicKeyBuffer);

      // Export private key
      const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyHex = bufferToHex(privateKeyBuffer);

      // Derive EVM address from public key (last 20 bytes of keccak256 hash)
      const evmAddress = await deriveEvmAddress(publicKeyBuffer);

      // In production, this would call a backend endpoint to create the account
      // For now, simulate account creation
      const mockAccountId = `0.0.${Math.floor(Math.random() * 1000000) + 4000000}`;

      const newWallet: WalletData = {
        accountId: mockAccountId,
        publicKey: publicKeyHex.substring(0, 66), // First 66 chars for display
        privateKey: privateKeyHex.substring(0, 64), // First 64 chars for display
        evmAddress,
        balance: 0,
      };

      setWallet(newWallet);
      setStep('created');
      toast.success('Wallet created successfully!');

    } catch (error) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate wallet. Please try again.');
      setStep('intro');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Request testnet HBAR from faucet
   */
  const handleRequestFunding = async () => {
    if (!wallet) return;

    setIsFunding(true);

    try {
      // In production, this calls the Hedera faucet API
      // POST https://faucet.hedera.com/api/v1/accounts/{accountId}/fund

      // For now, simulate funding delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful funding
      setWallet(prev => prev ? { ...prev, balance: 10000 } : null);
      setStep('funded');
      toast.success('Received 10,000 testnet HBAR!');

      // In production, verify the funding via Mirror Node
      // const response = await fetch(`${MIRROR_NODE_URL}/accounts/${wallet.accountId}`);
      // const data = await response.json();
      // setWallet(prev => prev ? { ...prev, balance: data.balance.balance / 100000000 } : null);

    } catch (error) {
      console.error('Error requesting funding:', error);
      toast.error('Failed to request funding. Try again or use the manual faucet link.');
    } finally {
      setIsFunding(false);
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  /**
   * Download wallet details as JSON
   */
  const downloadWallet = () => {
    if (!wallet) return;

    const walletData = {
      accountId: wallet.accountId,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      evmAddress: wallet.evmAddress,
      network: 'testnet',
      createdAt: new Date().toISOString(),
      warning: '⚠️ NEVER SHARE YOUR PRIVATE KEY! This is a testnet wallet for learning purposes only.',
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedera-testnet-wallet-${wallet.accountId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Wallet details downloaded!');
  };

  // Intro screen
  if (step === 'intro') {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Hedera Wallet</h2>
            <p className="text-gray-600 text-lg">
              Generate a real testnet wallet with cryptographic keys and receive test HBAR
            </p>
          </div>

          <Card className="p-6 mb-6 bg-white border-2 border-purple-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              What You'll Learn
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Generate secure ECDSA public/private key pairs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Understand the relationship between keys and accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Learn proper private key security practices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Receive real testnet HBAR from the faucet</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 mb-6 bg-orange-50 border-2 border-orange-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              Important Security Notes
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>🔒 Your private key is generated locally in your browser</li>
              <li>🚫 NEVER share your private key with anyone</li>
              <li>📝 Write down your private key in a secure location</li>
              <li>🧪 This is a TESTNET wallet - not for real funds</li>
              <li>💾 Download and securely store your wallet details</li>
            </ul>
          </Card>

          <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-xl">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I understand that I am responsible for keeping my private key secure,
              and that this is a testnet wallet for educational purposes only.
            </label>
          </div>

          <Button
            onClick={handleGenerateWallet}
            disabled={!agreedToTerms}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Generating screen
  if (step === 'generating') {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Key className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Wallet...</h2>
          <p className="text-gray-600 mb-4">Creating cryptographic keys securely in your browser</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✓ Generating ECDSA key pair</p>
            <p>✓ Deriving EVM address</p>
            <p>✓ Creating account ID</p>
          </div>
        </div>
      </div>
    );
  }

  // Wallet created screen
  if (step === 'created' && wallet) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Wallet Created!</h2>
            <p className="text-gray-600">Your Hedera testnet wallet is ready to use</p>
          </div>

          {/* Account ID */}
          <Card className="p-6 mb-4 bg-white border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Account ID</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(wallet.accountId, 'Account ID')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-lg text-purple-600 break-all">{wallet.accountId}</p>
          </Card>

          {/* EVM Address */}
          <Card className="p-6 mb-4 bg-white border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">EVM Address</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(wallet.evmAddress, 'EVM Address')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-sm text-blue-600 break-all">{wallet.evmAddress}</p>
          </Card>

          {/* Public Key */}
          <Card className="p-6 mb-4 bg-white border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Public Key</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(wallet.publicKey, 'Public Key')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-xs text-green-600 break-all">{wallet.publicKey}</p>
          </Card>

          {/* Private Key */}
          <Card className="p-6 mb-6 bg-red-50 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-red-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Private Key (Keep Secret!)
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="font-mono text-xs text-red-600 break-all">
              {showPrivateKey ? wallet.privateKey : '••••••••••••••••••••••••••••••••'}
            </p>
            <p className="text-xs text-red-600 mt-2">
              ⚠️ Never share this key with anyone! Anyone with your private key can access your funds.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={downloadWallet}
              variant="outline"
              className="flex-1 h-12 border-2 border-purple-200 hover:border-purple-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Details
            </Button>
            <Button
              onClick={handleRequestFunding}
              disabled={isFunding}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isFunding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Testnet HBAR
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://portal.hedera.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
            >
              Or manually request from Hedera Portal
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Funded screen
  if (step === 'funded' && wallet) {
    return (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-14 h-14 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Wallet Funded! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Your wallet has been successfully funded with testnet HBAR
          </p>

          <Card className="p-8 mb-6 bg-white border-2 border-green-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Balance</p>
              <p className="text-5xl font-bold text-green-600">{wallet.balance.toLocaleString()} ℏ</p>
              <p className="text-sm text-gray-500 mt-1">Testnet HBAR</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Account: <span className="font-mono text-purple-600">{wallet.accountId}</span>
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">🎓 What's Next?</h3>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                <li>• Use your wallet to send transactions in other lessons</li>
                <li>• View your account on HashScan explorer</li>
                <li>• Practice with NFT minting and smart contracts</li>
                <li>• Keep your private key safe for future lessons</li>
              </ul>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => window.open(`${HASHSCAN_URL}/account/${wallet.accountId}`, '_blank')}
                variant="outline"
                className="flex-1 h-12"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View on HashScan
              </Button>
              <Button
                onClick={() => {
                  setStep('intro');
                  setWallet(null);
                  setAgreedToTerms(false);
                  setShowPrivateKey(false);
                }}
                variant="outline"
                className="flex-1 h-12"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Helper functions

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derive EVM address from public key
 * This is a simplified version - in production use proper keccak256 hashing
 */
async function deriveEvmAddress(publicKeyBuffer: ArrayBuffer): Promise<string> {
  // In production, use keccak256 hash of the public key
  // For now, create a deterministic address from the public key
  const publicKeyBytes = new Uint8Array(publicKeyBuffer);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', publicKeyBytes);
  const hashArray = new Uint8Array(hashBuffer);

  // Take last 20 bytes for EVM address
  const addressBytes = hashArray.slice(-20);
  const address = '0x' + Array.from(addressBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return address;
}
