import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Repeat, Landmark, Wallet, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Protocol {
  id: string;
  name: string;
  type: 'dex' | 'lending' | 'staking';
  icon: string;
  description: string;
  africanExample: string;
  howItWorks: string[];
  risks: string[];
  benefits: string[];
  realExample: {
    scenario: string;
    input: string;
    output: string;
    fees: string;
  };
}

const protocols: Protocol[] = [
  {
    id: 'saucerswap',
    name: 'SaucerSwap DEX',
    type: 'dex',
    icon: '🔄',
    description: 'Decentralized Exchange - Swap tokens directly without a middleman',
    africanExample: 'Like exchanging Nigerian Naira for Kenyan Shillings at the border, but instant, automated, and on Hedera',
    howItWorks: [
      '1. You provide HBAR to a liquidity pool',
      '2. Smart contract automatically calculates exchange rate based on supply/demand',
      '3. Traders swap tokens and pay a small fee',
      '4. You earn a share of those fees (typically 0.3% per trade)',
      '5. Withdraw your tokens + earnings anytime'
    ],
    risks: [
      'Impermanent Loss: If token prices change drastically, you could lose value compared to just holding',
      'Smart contract bugs (rare but possible)',
      'Liquidity risk: If everyone withdraws, you might be stuck temporarily'
    ],
    benefits: [
      'Earn passive income (3-20% APY typically)',
      'No middleman taking a cut',
      'Trade anytime 24/7',
      'Full control of your funds',
      'Ultra-low fees ($0.0001-$0.01)'
    ],
    realExample: {
      scenario: 'Amina wants to swap HBAR for USDC',
      input: '100 HBAR',
      output: '~8.5 USDC (assuming $0.085/HBAR)',
      fees: '0.3 HBAR trading fee + $0.0001 network fee'
    }
  },
  {
    id: 'lending',
    name: 'Hedera Lending Protocol',
    type: 'lending',
    icon: '🏦',
    description: 'Lend your crypto to earn interest, or borrow against your holdings',
    africanExample: 'Like a village savings group (ROSCA), but automated, global, and you can borrow instantly without waiting your turn',
    howItWorks: [
      '1. Lenders deposit HBAR/USDC into a smart contract pool',
      '2. Borrowers lock up collateral (e.g., 150 HBAR to borrow 100 USDC)',
      '3. Smart contract automatically calculates interest rates based on supply/demand',
      '4. Borrowers pay interest, lenders earn that interest',
      '5. If collateral value drops too low, smart contract auto-liquidates to protect lenders'
    ],
    risks: [
      'Liquidation risk (if borrowing): Your collateral can be sold if its value drops',
      'Smart contract risk: Bugs could freeze funds',
      'Interest rate volatility: Rates change based on demand'
    ],
    benefits: [
      'Earn 5-15% APY on stablecoins (way better than banks!)',
      'Borrow without credit checks or paperwork',
      'Access liquidity without selling your crypto',
      'Rates are transparent and algorithmic (no hidden fees)',
      'Withdraw anytime (if not borrowed against)'
    ],
    realExample: {
      scenario: 'Kwame deposits 1000 USDC to earn interest',
      input: '1000 USDC deposited',
      output: '8% APY = 80 USDC earned per year',
      fees: '$0.0001 to deposit, $0.0001 to withdraw'
    }
  },
  {
    id: 'staking',
    name: 'HBAR Staking',
    type: 'staking',
    icon: '💎',
    description: 'Lock your HBAR to help secure the network and earn rewards',
    africanExample: 'Like buying shares in a cooperative (sacco) - you contribute to the community and earn dividends',
    howItWorks: [
      '1. You stake (lock) your HBAR to a Hedera node',
      '2. That node uses your stake to participate in consensus',
      '3. The network rewards the node for maintaining security',
      '4. You receive a percentage of those rewards (~6-7% APY)',
      '5. Your HBAR remains in your wallet, but is "locked" until you unstake'
    ],
    risks: [
      'Unstaking delay: Takes 24 hours to unstake (can\'t sell immediately)',
      'Reward rate varies: Not guaranteed, depends on network activity',
      'If node goes offline, you might miss rewards for that period'
    ],
    benefits: [
      'Passive income while holding HBAR',
      'Help secure the network',
      'Your HBAR never leaves your wallet',
      'No minimum amount required',
      'No lockup period (can unstake anytime, just 24hr delay)'
    ],
    realExample: {
      scenario: 'Nia stakes 10,000 HBAR',
      input: '10,000 HBAR staked to Node 3',
      output: '~650 HBAR earned per year (6.5% APY)',
      fees: 'FREE to stake/unstake (just normal network fees)'
    }
  }
];

interface DeFiProtocolExplorerProps {
  onInteract?: () => void;
}

export const DeFiProtocolExplorer: React.FC<DeFiProtocolExplorerProps> = ({ onInteract }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState<'how' | 'risks' | 'benefits' | 'example'>('how');

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setActiveTab('how');

    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dex': return 'from-blue-500 to-cyan-500';
      case 'lending': return 'from-green-500 to-emerald-500';
      case 'staking': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dex': return <Repeat className="w-6 h-6" />;
      case 'lending': return <Landmark className="w-6 h-6" />;
      case 'staking': return <TrendingUp className="w-6 h-6" />;
      default: return <Wallet className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">DeFi Protocol Explorer</h2>
            </div>
            <p className="text-muted-foreground">
              Explore how decentralized finance protocols work on Hedera
            </p>
          </div>

          {/* Protocol Cards */}
          {!selectedProtocol && (
            <div className="grid md:grid-cols-3 gap-4">
              {protocols.map((protocol) => (
                <motion.div
                  key={protocol.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                    onClick={() => handleSelectProtocol(protocol)}
                  >
                    <div className="space-y-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(protocol.type)} flex items-center justify-center text-3xl`}>
                        {protocol.icon}
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-xl font-bold mb-1">{protocol.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getTypeIcon(protocol.type)}
                          <span className="capitalize">{protocol.type}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {protocol.description}
                      </p>

                      {/* CTA */}
                      <Button variant="ghost" className="w-full group">
                        Explore
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Selected Protocol Detail */}
          <AnimatePresence mode="wait">
            {selectedProtocol && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => setSelectedProtocol(null)}
                  size="sm"
                >
                  ← Back to Protocols
                </Button>

                {/* Protocol Header */}
                <Card className={`p-6 bg-gradient-to-br ${getTypeColor(selectedProtocol.type)} text-white`}>
                  <div className="flex items-start gap-4">
                    <div className="text-6xl">{selectedProtocol.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-2">{selectedProtocol.name}</h3>
                      <p className="text-lg opacity-90 mb-4">{selectedProtocol.description}</p>
                      <Card className="p-3 bg-white/20 backdrop-blur-sm">
                        <p className="text-sm">
                          <strong>🌍 African Context:</strong> {selectedProtocol.africanExample}
                        </p>
                      </Card>
                    </div>
                  </div>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                  {[
                    { id: 'how', label: 'How It Works', icon: <Info className="w-4 h-4" /> },
                    { id: 'risks', label: 'Risks', icon: <AlertCircle className="w-4 h-4" /> },
                    { id: 'benefits', label: 'Benefits', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'example', label: 'Real Example', icon: <Wallet className="w-4 h-4" /> },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      onClick={() => setActiveTab(tab.id as any)}
                      className="flex items-center gap-2"
                    >
                      {tab.icon}
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'how' && (
                      <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/20">
                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          How It Works
                        </h4>
                        <ol className="space-y-3">
                          {selectedProtocol.howItWorks.map((step, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-3"
                            >
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </span>
                              <span className="flex-1 pt-1">{step.replace(/^\d+\.\s*/, '')}</span>
                            </motion.li>
                          ))}
                        </ol>
                      </Card>
                    )}

                    {activeTab === 'risks' && (
                      <Card className="p-6 bg-red-50/50 dark:bg-red-950/20">
                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          Risks to Consider
                        </h4>
                        <ul className="space-y-3">
                          {selectedProtocol.risks.map((risk, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-3"
                            >
                              <span className="flex-shrink-0 text-2xl">⚠️</span>
                              <span className="flex-1">
                                <strong>{risk.split(':')[0]}:</strong>
                                {risk.split(':')[1]}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                        <Card className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400">
                          <p className="text-sm">
                            <strong>💡 Pro Tip:</strong> Never invest more than you can afford to lose. Start small, learn the platform, then scale up.
                          </p>
                        </Card>
                      </Card>
                    )}

                    {activeTab === 'benefits' && (
                      <Card className="p-6 bg-green-50/50 dark:bg-green-950/20">
                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-5 h-5" />
                          Benefits & Advantages
                        </h4>
                        <ul className="space-y-3">
                          {selectedProtocol.benefits.map((benefit, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-3"
                            >
                              <span className="flex-shrink-0 text-2xl">✅</span>
                              <span className="flex-1">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {activeTab === 'example' && (
                      <Card className="p-6 bg-purple-50/50 dark:bg-purple-950/20">
                        <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-600">
                          <Wallet className="w-5 h-5" />
                          Real-World Example
                        </h4>
                        <div className="space-y-4">
                          <Card className="p-4 bg-white dark:bg-gray-900">
                            <p className="font-semibold mb-2">📖 Scenario:</p>
                            <p className="text-muted-foreground">{selectedProtocol.realExample.scenario}</p>
                          </Card>

                          <div className="grid md:grid-cols-3 gap-4">
                            <Card className="p-4 bg-blue-100 dark:bg-blue-950/40">
                              <p className="text-xs text-muted-foreground mb-1">INPUT</p>
                              <p className="text-lg font-bold">{selectedProtocol.realExample.input}</p>
                            </Card>
                            <Card className="p-4 bg-green-100 dark:bg-green-950/40">
                              <p className="text-xs text-muted-foreground mb-1">OUTPUT</p>
                              <p className="text-lg font-bold">{selectedProtocol.realExample.output}</p>
                            </Card>
                            <Card className="p-4 bg-orange-100 dark:bg-orange-950/40">
                              <p className="text-xs text-muted-foreground mb-1">FEES</p>
                              <p className="text-lg font-bold">{selectedProtocol.realExample.fees}</p>
                            </Card>
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};
