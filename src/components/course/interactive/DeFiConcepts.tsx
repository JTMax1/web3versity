import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { TrendingUp, Coins, Users, Lock, AlertCircle } from 'lucide-react';

interface DeFiConcept {
  id: string;
  name: string;
  icon: string;
  description: string;
  africanExample: string;
  howItWorks: string[];
  benefits: string[];
  risks: string[];
}

export function DeFiConcepts() {
  const [selectedConcept, setSelectedConcept] = useState<string>('lending');

  const concepts: DeFiConcept[] = [
    {
      id: 'lending',
      name: 'Lending & Borrowing',
      icon: '🏦',
      description: 'Lend your crypto to earn interest, or borrow crypto by providing collateral',
      africanExample: 'Amina has 1000 HBAR but doesn\'t need it right now. She lends it on a DeFi platform and earns 5% interest. Kwame needs HBAR for a business opportunity, so he borrows Amina\'s HBAR by putting up his NFTs as collateral.',
      howItWorks: [
        'Lenders deposit their crypto into a smart contract pool',
        'Borrowers put up collateral (usually 150% of loan value)',
        'Smart contract automatically matches lenders and borrowers',
        'Interest is calculated and paid automatically',
        'If borrower doesn\'t repay, collateral is sold to repay lenders'
      ],
      benefits: [
        'Earn passive income on your crypto',
        'Borrow without credit checks or banks',
        'Interest rates set by supply and demand',
        'No middleman taking fees',
        'Access to loans 24/7 globally'
      ],
      risks: [
        'Smart contract bugs could lose funds',
        'If crypto price drops, collateral may be liquidated',
        'Interest rates can change quickly',
        'No insurance like traditional banks'
      ]
    },
    {
      id: 'staking',
      name: 'Staking',
      icon: '🔒',
      description: 'Lock up your crypto to help secure the network and earn rewards',
      africanExample: 'Chioma stakes 500 HBAR on Hedera. Her tokens help validate transactions on the network. In return, she earns approximately 6% annual rewards, paid daily to her account.',
      howItWorks: [
        'You lock your tokens in a staking contract',
        'Your tokens help secure and validate the network',
        'You earn rewards for participating',
        'Rewards are usually paid in the same token',
        'Some staking has lock-up periods, others allow withdrawal anytime'
      ],
      benefits: [
        'Earn passive income (typically 3-15% annually)',
        'Help secure the blockchain network',
        'Rewards paid automatically',
        'Often can unstake anytime',
        'Compounds over time'
      ],
      risks: [
        'Tokens may be locked for a period',
        'Reward rates can decrease',
        'Token price might drop while staked',
        'Smart contract risks'
      ]
    },
    {
      id: 'liquidity',
      name: 'Liquidity Pools',
      icon: '💧',
      description: 'Provide pairs of tokens to enable trading and earn fees from traders',
      africanExample: 'Dele has both HBAR and USDC. He adds them to a liquidity pool. Now when people swap between HBAR and USDC, they use Dele\'s pool and he earns a small fee on every trade.',
      howItWorks: [
        'You deposit two tokens in equal value (e.g., $100 HBAR + $100 USDC)',
        'Traders use your pool to swap between these tokens',
        'You earn a fee on each trade (typically 0.3%)',
        'You can withdraw your tokens plus earnings anytime',
        'Your share of the pool represents your ownership'
      ],
      benefits: [
        'Earn fees from every trade',
        'Higher returns than simple lending',
        'Help create liquid markets',
        'Fees paid instantly',
        'Can withdraw anytime (usually)'
      ],
      risks: [
        'Impermanent loss if token prices diverge',
        'Both tokens could lose value',
        'Smart contract exploits',
        'Low trading volume = low fees'
      ]
    },
    {
      id: 'yield',
      name: 'Yield Farming',
      icon: '🌾',
      description: 'Move your crypto between different DeFi protocols to maximize returns',
      africanExample: 'Ngozi is advanced at DeFi. She lends HBAR on Protocol A earning 5%, takes the receipt token and stakes it on Protocol B for another 7%, then uses that as collateral on Protocol C for 3% more. Total: 15% returns!',
      howItWorks: [
        'Deposit crypto in a DeFi protocol',
        'Receive tokens representing your deposit',
        'Use those tokens in another protocol',
        'Stack multiple layers of rewards',
        'Monitor and move funds to best opportunities'
      ],
      benefits: [
        'Highest potential returns in DeFi',
        'Multiple income streams',
        'Rewards often paid in valuable tokens',
        'Leverage your capital efficiently'
      ],
      risks: [
        'Most complex DeFi strategy',
        'Multiple smart contract risks',
        'Impermanent loss',
        'Gas fees can eat profits',
        'Requires constant monitoring'
      ]
    },
    {
      id: 'dex',
      name: 'Decentralized Exchanges',
      icon: '🔄',
      description: 'Trade cryptocurrencies directly with others without a company in the middle',
      africanExample: 'Fatima wants to trade her HBAR for USDC. Instead of using Binance (centralized), she uses SaucerSwap (decentralized). She keeps control of her funds the entire time and the trade happens peer-to-peer through a smart contract.',
      howItWorks: [
        'Connect your wallet to the DEX',
        'Choose which tokens to swap',
        'Smart contract calculates the exchange rate',
        'Trade happens directly from your wallet',
        'Tokens are swapped instantly'
      ],
      benefits: [
        'You control your funds always',
        'No account needed',
        'Trade any token',
        'No KYC or identity verification',
        'Often lower fees than centralized exchanges'
      ],
      risks: [
        'Responsible for your own security',
        'Can\'t reverse transactions',
        'Slippage on large trades',
        'Must pay gas fees',
        'No customer support'
      ]
    }
  ];

  const selected = concepts.find(c => c.id === selectedConcept)!;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50"
         style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">DeFi Concepts Explained</h3>
        <p className="text-gray-600">Understanding Decentralized Finance for African Users</p>
      </div>

      {/* Concept Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {concepts.map((concept) => (
          <motion.button
            key={concept.id}
            onClick={() => setSelectedConcept(concept.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-2xl text-center transition-all ${
              selectedConcept === concept.id
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                : 'bg-white hover:bg-green-50'
            }`}
            style={{ 
              boxShadow: selectedConcept === concept.id
                ? '0 8px 24px rgba(16, 185, 129, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="text-3xl mb-2">{concept.icon}</div>
            <div className={`text-sm ${selectedConcept === concept.id ? 'text-white' : 'text-gray-900'}`}>
              {concept.name}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Concept Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedConcept}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
               style={{ boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">{selected.icon}</div>
              <div>
                <h4 className="text-white mb-2">{selected.name}</h4>
                <p className="text-white/90">{selected.description}</p>
              </div>
            </div>
          </div>

          {/* African Example */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">🌍</span>
              <div>
                <p className="mb-2"><strong>African Example:</strong></p>
                <p className="text-gray-700">{selected.africanExample}</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p><strong>How It Works:</strong></p>
            </div>
            <div className="space-y-3">
              {selected.howItWorks.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-blue-50"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Benefits and Risks Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Benefits */}
            <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-600">Benefits</Badge>
              </div>
              <div className="space-y-2">
                {selected.benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-green-600 flex-shrink-0">✓</span>
                    <p className="text-sm text-gray-700">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risks */}
            <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <Badge variant="destructive">Risks</Badge>
              </div>
              <div className="space-y-2">
                {selected.risks.map((risk, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-red-600 flex-shrink-0">⚠</span>
                    <p className="text-sm text-gray-700">{risk}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <p className="mb-3"><strong>🛡️ Safety Tips for African DeFi Users:</strong></p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Start small:</strong> Only invest what you can afford to lose</li>
              <li>• <strong>Research:</strong> Check the protocol's audit reports and community reputation</li>
              <li>• <strong>Diversify:</strong> Don't put all funds in one protocol</li>
              <li>• <strong>Understand:</strong> Only use strategies you fully understand</li>
              <li>• <strong>Beware of promises:</strong> If returns seem too good (50%+), be very cautious</li>
              <li>• <strong>Keep learning:</strong> DeFi evolves quickly, stay informed</li>
            </ul>
          </div>

          {/* Complexity Indicator */}
          <div className="flex items-center justify-center gap-8 p-4 rounded-2xl bg-white">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Difficulty</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-4 h-8 rounded ${
                      level <= (selectedConcept === 'lending' ? 2 :
                               selectedConcept === 'staking' ? 2 :
                               selectedConcept === 'dex' ? 3 :
                               selectedConcept === 'liquidity' ? 4 : 5)
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Risk Level</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-4 h-8 rounded ${
                      level <= (selectedConcept === 'lending' ? 3 :
                               selectedConcept === 'staking' ? 2 :
                               selectedConcept === 'dex' ? 3 :
                               selectedConcept === 'liquidity' ? 4 : 5)
                        ? 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
