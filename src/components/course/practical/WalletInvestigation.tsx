/**
 * Wallet Investigation Component
 *
 * Forensics-style wallet investigation using real Hedera Mirror Node API.
 * Students analyze transaction history, token holdings, and account behavior.
 *
 * WOW Factor: Real blockchain forensics like a detective!
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, TrendingUp, TrendingDown, Coins, ArrowRight, ArrowLeft,
  ExternalLink, AlertCircle, CheckCircle, Loader2, FileText, Users,
  Calendar, Activity, Shield, Eye
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface WalletInvestigationProps {
  onInteract?: () => void;
  defaultAccountId?: string;
}

interface AccountData {
  accountId: string;
  evmAddress: string;
  balance: {
    hbar: number;
    tokens: Array<{ tokenId: string; name: string; balance: number }>;
  };
  createdAt: string;
  transactionCount: number;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  memo?: string;
  consensusTimestamp: string;
}

const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';
const HASHSCAN_URL = 'https://hashscan.io/testnet';

// Demo accounts for investigation practice
const DEMO_ACCOUNTS = [
  { id: '0.0.4827364', label: 'Active Trader', description: 'High volume trading' },
  { id: '0.0.4827365', label: 'NFT Collector', description: 'Multiple NFT holdings' },
  { id: '0.0.4827366', label: 'DeFi User', description: 'Liquidity provider' },
];

export const WalletInvestigation: React.FC<WalletInvestigationProps> = ({
  onInteract,
  defaultAccountId = ''
}) => {
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'tokens'>('overview');

  /**
   * Investigate a wallet using Mirror Node API
   */
  const handleInvestigate = async () => {
    if (!accountId.trim()) {
      toast.error('Please enter an account ID');
      return;
    }

    // Validate format
    if (!accountId.match(/^0\.0\.\d+$/)) {
      toast.error('Invalid account ID format. Expected: 0.0.xxxxx');
      return;
    }

    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }

    setIsLoading(true);
    setAccountData(null);
    setTransactions([]);

    try {
      // Fetch account info from Mirror Node
      const accountResponse = await fetch(`${MIRROR_NODE_URL}/accounts/${accountId}`);

      if (!accountResponse.ok) {
        if (accountResponse.status === 404) {
          toast.error('Account not found on testnet');
        } else {
          toast.error('Failed to fetch account data');
        }
        setIsLoading(false);
        return;
      }

      const accountJson = await accountResponse.json();

      // Fetch transactions
      const transactionsResponse = await fetch(
        `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&limit=25&order=desc`
      );
      const transactionsJson = await transactionsResponse.json();

      // Process account data
      const balance = accountJson.balance?.balance || 0;
      const hbarBalance = balance / 100000000; // Convert tinybars to HBAR

      const processedAccount: AccountData = {
        accountId: accountJson.account,
        evmAddress: accountJson.evm_address || 'N/A',
        balance: {
          hbar: hbarBalance,
          tokens: [], // Would be populated from tokens endpoint
        },
        createdAt: accountJson.created_timestamp || 'Unknown',
        transactionCount: transactionsJson.transactions?.length || 0,
      };

      // Process transactions
      const processedTransactions: Transaction[] = (transactionsJson.transactions || []).map((tx: any) => {
        const transfers = tx.transfers || [];
        const userTransfer = transfers.find((t: any) => t.account === accountId);
        const otherTransfer = transfers.find((t: any) => t.account !== accountId);

        const isSent = userTransfer?.amount < 0;
        const amount = Math.abs(userTransfer?.amount || 0) / 100000000;

        return {
          id: tx.transaction_id,
          type: isSent ? 'sent' : 'received',
          amount,
          from: isSent ? accountId : (otherTransfer?.account || 'Unknown'),
          to: isSent ? (otherTransfer?.account || 'Unknown') : accountId,
          timestamp: new Date(tx.consensus_timestamp * 1000).toLocaleString(),
          memo: tx.memo_base64 ? atob(tx.memo_base64) : undefined,
          consensusTimestamp: tx.consensus_timestamp,
        };
      });

      setAccountData(processedAccount);
      setTransactions(processedTransactions);
      toast.success('Account investigation complete!');

    } catch (error) {
      console.error('Error investigating wallet:', error);
      toast.error('Failed to investigate wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate wallet activity score
   */
  const calculateActivityScore = (): string => {
    if (!transactions.length) return 'Unknown';
    if (transactions.length > 20) return 'Very Active';
    if (transactions.length > 10) return 'Active';
    if (transactions.length > 5) return 'Moderate';
    return 'Low Activity';
  };

  /**
   * Calculate sent vs received ratio
   */
  const calculateFlowRatio = () => {
    const sent = transactions.filter(tx => tx.type === 'sent').length;
    const received = transactions.filter(tx => tx.type === 'received').length;
    return { sent, received };
  };

  // Search interface
  if (!accountData) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Wallet Investigation</h2>
            <p className="text-gray-600 text-lg">
              Investigate any Hedera testnet wallet using real blockchain data
            </p>
          </div>

          {/* Demo accounts */}
          <Card className="p-6 mb-6 bg-white border-2 border-slate-100">
            <h3 className="font-semibold text-lg mb-4">🎯 Try These Demo Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setAccountId(demo.id)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-colors border-2 border-transparent hover:border-slate-300"
                >
                  <p className="font-semibold text-gray-900">{demo.label}</p>
                  <p className="text-xs text-gray-600 mb-2">{demo.description}</p>
                  <p className="text-xs font-mono text-slate-600">{demo.id}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Search form */}
          <Card className="p-6 mb-6 bg-white border-2 border-slate-100">
            <h3 className="font-semibold text-lg mb-4">Or Enter Any Account ID</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="0.0.xxxxx"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:outline-none font-mono"
              />
              <Button
                onClick={handleInvestigate}
                disabled={isLoading || !accountId}
                className="px-8 bg-gradient-to-r from-slate-700 to-gray-900 hover:from-slate-800 hover:to-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Investigating...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Investigate
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Info cards */}
          <Card className="p-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              What You'll Discover
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Account balance and token holdings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Complete transaction history</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Wallet activity patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Sent vs received transaction analysis</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  // Investigation results
  const { sent, received } = calculateFlowRatio();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Investigation Report</h2>
            <p className="text-gray-600 font-mono text-sm">{accountData.accountId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${HASHSCAN_URL}/account/${accountData.accountId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              HashScan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAccountData(null);
                setTransactions([]);
                setAccountId('');
              }}
            >
              <Search className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'bg-slate-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-slate-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-2" />
            Tokens
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Balance Card */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <h3 className="text-sm text-gray-600 mb-1">Current Balance</h3>
              <p className="text-4xl font-bold text-green-700 mb-2">
                {accountData.balance.hbar.toLocaleString()} ℏ
              </p>
              <p className="text-sm text-gray-600">
                ≈ ${(accountData.balance.hbar * 0.05).toFixed(2)} USD (testnet)
              </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-white border-2 border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Activity Level</p>
                    <p className="text-lg font-bold text-gray-900">{calculateActivityScore()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-2 border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Received</p>
                    <p className="text-lg font-bold text-gray-900">{received} TXs</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-2 border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-lg font-bold text-gray-900">{sent} TXs</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Account Details */}
            <Card className="p-6 bg-white border-2 border-slate-100">
              <h3 className="font-semibold text-lg mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Account ID</span>
                  <span className="font-mono text-gray-900">{accountData.accountId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">EVM Address</span>
                  <span className="font-mono text-gray-900 text-xs">{accountData.evmAddress}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(parseFloat(accountData.createdAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-semibold text-gray-900">{accountData.transactionCount}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {transactions.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No transactions found</p>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card
                  key={tx.id}
                  className="p-4 bg-white border-2 border-slate-100 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'sent'
                          ? 'bg-red-100'
                          : 'bg-green-100'
                      }`}>
                        {tx.type === 'sent' ? (
                          <ArrowRight className="w-5 h-5 text-red-600" />
                        ) : (
                          <ArrowLeft className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {tx.type === 'sent' ? 'Sent' : 'Received'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {tx.type === 'sent' ? `To: ${tx.to}` : `From: ${tx.from}`}
                        </p>
                        <p className="text-xs text-gray-400">{tx.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}{tx.amount.toFixed(2)} ℏ
                      </p>
                      {tx.memo && (
                        <p className="text-xs text-gray-500 mt-1">Memo: {tx.memo}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center bg-white">
              <Coins className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Token holdings feature coming soon</p>
              <p className="text-sm text-gray-500 mt-2">
                Will display HTS tokens, NFTs, and fungible tokens
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
