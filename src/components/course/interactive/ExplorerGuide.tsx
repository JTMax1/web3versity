import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Search, ExternalLink, Eye, Clock, Coins, FileText } from 'lucide-react';

interface ExplorerSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ExplorerGuideProps {
  onInteract?: () => void;
}

export function ExplorerGuide({ onInteract }: ExplorerGuideProps) {
  const [activeSection, setActiveSection] = useState<string>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState(false);

  const sections: ExplorerSection[] = [
    {
      id: 'search',
      title: 'Search Transactions',
      description: 'Find any transaction using its ID or hash',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'account',
      title: 'View Accounts',
      description: 'Check balance and history of any account',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'tokens',
      title: 'Track Tokens',
      description: 'See all tokens and their movements',
      icon: <Coins className="w-5 h-5" />
    },
    {
      id: 'contracts',
      title: 'Smart Contracts',
      description: 'Inspect deployed smart contracts',
      icon: <FileText className="w-5 h-5" />
    }
  ];

  const mockTransaction = {
    id: '0.0.123456@1634567890.123456789',
    from: 'Adeola (0.0.123456)',
    to: 'Kwame (0.0.789012)',
    amount: '50 HBAR',
    fee: '0.0001 HBAR',
    time: '2 minutes ago',
    status: 'Success',
    memo: 'Payment for vegetables'
  };

  const handleSearch = () => {
    setShowResult(true);
    if (onInteract) onInteract();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50"
         style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Blockchain Explorer Tutorial</h3>
        <p className="text-gray-600">Learn to track and verify transactions on HashScan</p>
      </div>

      {/* Section Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setShowResult(false);
            }}
            className={`p-4 rounded-2xl text-left transition-all ${
              activeSection === section.id
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                : 'bg-white hover:bg-indigo-50 text-gray-900'
            }`}
            style={{ 
              boxShadow: activeSection === section.id
                ? '0 8px 24px rgba(99, 102, 241, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="mb-2">{section.icon}</div>
            <div className={`text-sm mb-1 ${activeSection === section.id ? 'text-white' : ''}`}>
              {section.title}
            </div>
            <p className={`text-xs ${activeSection === section.id ? 'text-white/80' : 'text-gray-500'}`}>
              {section.description}
            </p>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeSection === 'search' && (
            <div className="space-y-6">
              {/* Search Interface */}
              <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
                <p className="mb-4"><strong>How to Search for a Transaction:</strong></p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-600">
                      Enter Transaction ID or Account Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., 0.0.123456@1634567890.123456789"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:outline-none"
                      />
                      <Button 
                        onClick={handleSearch}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-gray-700">
                      💡 <strong>Tip:</strong> You can search by transaction ID, account number, or transaction hash. 
                      The explorer will show you all details about that transaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Result */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-white border-2 border-green-200"
                  style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p><strong>Transaction Found!</strong></p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">From</p>
                        <p className="text-sm">{mockTransaction.from}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">To</p>
                        <p className="text-sm">{mockTransaction.to}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="text-sm">{mockTransaction.amount}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Fee</p>
                        <p className="text-sm">{mockTransaction.fee}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Time</p>
                        <p className="text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mockTransaction.time}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="text-sm text-green-600">✓ {mockTransaction.status}</p>
                      </div>
                    </div>

                    {mockTransaction.memo && (
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-xs text-gray-500 mb-1">Memo</p>
                        <p className="text-sm">{mockTransaction.memo}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => window.open('https://hashscan.io/testnet', '_blank')}
                  >
                    View on HashScan
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {activeSection === 'account' && (
            <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
              <p className="mb-4"><strong>Viewing Account Information:</strong></p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="mb-3 text-gray-900"><strong>What You Can See:</strong></p>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Current HBAR balance</li>
                    <li>✓ All tokens owned by the account</li>
                    <li>✓ Complete transaction history</li>
                    <li>✓ NFTs owned</li>
                    <li>✓ Account creation date</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm">
                    🔍 <strong>African Example:</strong> Imagine being able to verify that a business in Lagos 
                    actually has the funds they claim before doing business with them. With a blockchain explorer, 
                    you can check any account's balance and transaction history instantly!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm">
                    🔒 <strong>Privacy Note:</strong> While balances are public, your identity isn't automatically linked 
                    to your account. This is why blockchain is both transparent AND private.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tokens' && (
            <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
              <p className="mb-4"><strong>Tracking Tokens on the Explorer:</strong></p>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-purple-50">
                    <div className="text-2xl mb-2">🪙</div>
                    <p className="mb-2"><strong>Fungible Tokens</strong></p>
                    <p className="text-sm text-gray-600">
                      Like digital money or points. Each token is identical (like HBAR or a stablecoin).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-pink-50">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="mb-2"><strong>NFTs</strong></p>
                    <p className="text-sm text-gray-600">
                      Unique tokens like digital art, certificates, or collectibles. Each one is different.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm mb-3">
                    💡 <strong>Use Case in Africa:</strong> You can verify if a token claiming to be backed by gold 
                    actually exists and track its movement history!
                  </p>
                  <p className="text-sm text-gray-600">
                    For example, a farmer in Kenya could create tokens representing bags of coffee. Buyers can verify 
                    on the explorer that these tokens are real and track their ownership history.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contracts' && (
            <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
              <p className="mb-4"><strong>Understanding Smart Contract Information:</strong></p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                  <p className="mb-3"><strong>What the Explorer Shows:</strong></p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Contract address and deployment date</li>
                    <li>• All transactions with the contract</li>
                    <li>• Contract code (if verified)</li>
                    <li>• Gas used by transactions</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm">
                    ⚠️ <strong>Safety Tip:</strong> Before interacting with a DApp, check its smart contract on the 
                    explorer. Look for:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li>✓ Recent activity (not abandoned)</li>
                    <li>✓ Verified contract code</li>
                    <li>✓ Many successful transactions</li>
                    <li>✗ No suspicious failed transactions</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm">
                    🌍 <strong>Real Example:</strong> Before using a DeFi platform to lend your HBAR, you can check 
                    the explorer to see:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    <li>• How many people are using it</li>
                    <li>• When it was created</li>
                    <li>• If there have been any problems</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick Links */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <p className="mb-4"><strong>Try HashScan Yourself!</strong></p>
        <div className="grid md:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="w-full bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => window.open('https://hashscan.io/testnet', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Testnet Explorer
          </Button>
          <Button
            variant="secondary"
            className="w-full bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => window.open('https://hashscan.io/mainnet', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Mainnet Explorer
          </Button>
        </div>
        <p className="mt-3 text-sm text-white/90">
          Practice on Testnet first - it's safe and free!
        </p>
      </div>
    </div>
  );
}
