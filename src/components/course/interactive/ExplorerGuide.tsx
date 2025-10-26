import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Search, ExternalLink, Eye, Clock, Coins, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

interface ExplorerSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ExplorerGuideProps {
  onInteract?: () => void;
}

// Hedera Mirror Node API base URL
const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

export function ExplorerGuide({ onInteract }: ExplorerGuideProps) {
  const wallet = useWallet();
  const [activeSection, setActiveSection] = useState<string>('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const sections: ExplorerSection[] = [
    {
      id: 'account',
      title: 'View Accounts',
      description: 'Check balance and history of any account',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'search',
      title: 'Search Transactions',
      description: 'Find any transaction using its ID or hash',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'tokens',
      title: 'Track Tokens',
      description: 'See all tokens and their movements',
      icon: <Coins className="w-5 h-5" />
    },
  ];

  // Fetch real account data from Mirror Node
  const fetchAccountData = async (accountId: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      console.log(`🔍 Fetching account data for ${accountId}...`);

      const response = await fetch(`${MIRROR_NODE_URL}/accounts/${accountId}`);

      if (!response.ok) {
        throw new Error(`Account not found or API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Fetch recent transactions for this account
      const txResponse = await fetch(
        `${MIRROR_NODE_URL}/transactions?account.id=${accountId}&limit=5&order=desc`
      );
      const txData = txResponse.ok ? await txResponse.json() : { transactions: [] };

      setSearchResult({
        type: 'account',
        account: accountId,
        balance: (parseFloat(data.balance.balance) / 100000000).toFixed(4), // Convert tinybars to HBAR
        evmAddress: data.evm_address,
        created: data.created_timestamp,
        recentTransactions: txData.transactions || [],
      });

      if (onInteract) onInteract();
      toast.success('Account found!');
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchError(error.message || 'Failed to fetch account data');
      toast.error('Search failed', { description: error.message });
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch real transaction data
  const fetchTransactionData = async (txId: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      console.log(`🔍 Fetching transaction data for ${txId}...`);

      const response = await fetch(`${MIRROR_NODE_URL}/transactions/${txId}`);

      if (!response.ok) {
        throw new Error(`Transaction not found or API error: ${response.statusText}`);
      }

      const data = await response.json();
      const tx = data.transactions && data.transactions.length > 0 ? data.transactions[0] : null;

      if (!tx) {
        throw new Error('Transaction not found');
      }

      setSearchResult({
        type: 'transaction',
        id: tx.transaction_id,
        from: tx.transfers && tx.transfers.length > 0 ? tx.transfers[0].account : 'N/A',
        to: tx.transfers && tx.transfers.length > 1 ? tx.transfers[1].account : 'N/A',
        amount: tx.transfers && tx.transfers.length > 0
          ? Math.abs(tx.transfers[0].amount / 100000000).toFixed(4)
          : '0',
        fee: (tx.charged_tx_fee / 100000000).toFixed(8),
        time: new Date(parseFloat(tx.consensus_timestamp) * 1000).toLocaleString(),
        status: tx.result,
        memo: tx.memo_base64 ? atob(tx.memo_base64) : 'None',
      });

      if (onInteract) onInteract();
      toast.success('Transaction found!');
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchError(error.message || 'Failed to fetch transaction data');
      toast.error('Search failed', { description: error.message });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    // Determine if it's an account ID or transaction ID
    if (searchQuery.match(/^0\.0\.\d+$/)) {
      // Hedera account ID format
      fetchAccountData(searchQuery);
    } else if (searchQuery.match(/^0\.0\.\d+@[\d.]+$/)) {
      // Hedera transaction ID format
      fetchTransactionData(searchQuery);
    } else if (searchQuery.match(/^0x[a-fA-F0-9]{64}$/)) {
      // Ethereum transaction hash format
      toast.info('Ethereum transaction hash detected. Converting to Hedera format...');
      // For now, show error - need transaction hash to ID mapping
      setSearchError('Please use Hedera transaction ID format: 0.0.xxxxx@timestamp');
    } else {
      setSearchError('Invalid format. Use Hedera Account ID (0.0.xxxxx) or Transaction ID (0.0.xxxxx@timestamp)');
    }
  };

  const handleViewMyAccount = () => {
    if (!wallet.accountId) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSearchQuery(wallet.accountId);
    fetchAccountData(wallet.accountId);
  };

  const formatTimestamp = (timestamp: string) => {
    const seconds = parseFloat(timestamp);
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50"
         style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>

      <div className="mb-8 text-center">
        <h3 className="mb-2">Blockchain Explorer Tutorial</h3>
        <p className="text-gray-600">Learn to track and verify transactions on HashScan using real Hedera Testnet data</p>
      </div>

      {/* Section Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setSearchResult(null);
              setSearchError(null);
              if (section.id === 'search') {
                setSearchQuery('');
              }
            }}
            className={`p-4 rounded-xl transition-all ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {section.icon}
              <span className="font-semibold text-sm">{section.title}</span>
            </div>
            <p className={`text-xs ${activeSection === section.id ? 'text-indigo-100' : 'text-gray-500'}`}>
              {section.description}
            </p>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
        <AnimatePresence mode="wait">
          {activeSection === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h4 className="mb-4">View Account Balance & History</h4>
              <p className="text-gray-600 mb-4">
                Enter any Hedera account ID to view its balance, transactions, and details. All data is fetched live from Hedera Testnet.
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter account ID (e.g., 0.0.123456)"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSearching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" /> Search</>
                  )}
                </Button>
              </div>

              {wallet.connected && (
                <Button
                  onClick={handleViewMyAccount}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View My Account ({wallet.accountId})
                </Button>
              )}

              {searchError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{searchError}</p>
                  </div>
                </div>
              )}

              {searchResult && searchResult.type === 'account' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h5 className="text-green-900">Account Found!</h5>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account ID</p>
                      <p className="font-mono text-sm font-semibold">{searchResult.account}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Balance</p>
                      <p className="font-semibold text-lg text-green-700">{searchResult.balance} ℏ</p>
                    </div>
                    {searchResult.evmAddress && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 mb-1">EVM Address</p>
                        <p className="font-mono text-xs break-all">{searchResult.evmAddress}</p>
                      </div>
                    )}
                  </div>

                  {searchResult.recentTransactions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Recent Transactions:</p>
                      <div className="space-y-2">
                        {searchResult.recentTransactions.slice(0, 3).map((tx: any, index: number) => (
                          <div key={index} className="p-3 rounded-lg bg-white border border-green-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">TX ID</p>
                                <p className="font-mono text-xs">{tx.transaction_id}</p>
                              </div>
                              <a
                                href={`https://hashscan.io/testnet/transaction/${tx.transaction_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <a
                    href={`https://hashscan.io/testnet/account/${searchResult.account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    View Full Details on HashScan <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeSection === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h4 className="mb-4">Search Transactions</h4>
              <p className="text-gray-600 mb-4">
                Enter a Hedera transaction ID to view its details. Transaction IDs have the format: 0.0.xxxxx@timestamp
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter transaction ID (e.g., 0.0.123456@1234567890.123456789)"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSearching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" /> Search</>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm mb-2"><strong>💡 Where to find transaction IDs:</strong></p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• After sending HBAR in the practical lessons</li>
                  <li>• In your wallet's transaction history</li>
                  <li>• On HashScan after making a transaction</li>
                </ul>
              </div>

              {searchError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{searchError}</p>
                  </div>
                </div>
              )}

              {searchResult && searchResult.type === 'transaction' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                    <h5 className="text-purple-900">Transaction Found!</h5>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-mono text-xs break-all">{searchResult.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">From</p>
                      <p className="font-mono text-sm">{searchResult.from}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">To</p>
                      <p className="font-mono text-sm">{searchResult.to}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="font-semibold text-lg">{searchResult.amount} ℏ</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fee</p>
                      <p className="text-sm">{searchResult.fee} ℏ</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="font-semibold text-green-600">{searchResult.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Time</p>
                      <p className="text-sm">{searchResult.time}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Memo</p>
                      <p className="text-sm">{searchResult.memo}</p>
                    </div>
                  </div>

                  <a
                    href={`https://hashscan.io/testnet/transaction/${searchResult.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    View Full Details on HashScan <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeSection === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h4 className="mb-4">Track Tokens (Coming Soon)</h4>
              <p className="text-gray-600 mb-4">
                This feature will allow you to search for Hedera Token Service (HTS) tokens and view their metadata, supply, and holders.
              </p>

              <div className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200 text-center">
                <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">Token tracking feature coming in next update</p>
                <a
                  href="https://hashscan.io/testnet/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Browse Tokens on HashScan <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* African Context */}
      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
        <p className="mb-2">
          <strong>🌍 Why This Matters in Africa:</strong>
        </p>
        <p className="text-gray-700 text-sm">
          Unlike traditional banking where transactions are hidden from you, blockchain explorers give you FULL transparency.
          You can verify any transaction, check anyone's balance (public by design), and ensure nothing is hidden.
          This level of transparency is crucial in regions where financial systems may lack accountability.
        </p>
      </div>
    </div>
  );
}
