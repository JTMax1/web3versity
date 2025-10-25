import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Users, ArrowLeftRight, Lock, Zap, Ban, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface CentralizedVsDecentralizedProps {
  onInteract?: () => void;
}

const scenarios = [
  {
    id: 1,
    title: 'Sending Money to Family',
    emoji: '💸',
    centralized: {
      description: 'Using a traditional bank or money transfer service',
      steps: [
        'You go to the bank or agent',
        'Bank verifies your identity',
        'Bank checks if you have enough money',
        'Bank processes the transfer (takes hours/days)',
        'Bank charges a fee (5-10%)',
        'Receiver gets money through their bank',
        'Bank can freeze or reverse the transaction'
      ],
      pros: ['Familiar process', 'Customer support available', 'Regulated'],
      cons: ['High fees (5-10%)', 'Slow (hours to days)', 'Bank can freeze your account', 'Requires bank account', 'Bank downtime']
    },
    decentralized: {
      description: 'Using blockchain (like Bitcoin or Hedera)',
      steps: [
        'You open your wallet app',
        'Enter receiver\'s address',
        'Network nodes verify the transaction',
        'Transaction is confirmed (seconds to minutes)',
        'Tiny fee ($0.0001 - $1)',
        'Receiver gets money instantly in their wallet',
        'Transaction cannot be reversed or frozen'
      ],
      pros: ['Ultra-low fees ($0.0001)', 'Fast (seconds)', 'No one can freeze it', 'No bank account needed', '24/7 operation'],
      cons: ['Need internet', 'Must keep wallet secure', 'Irreversible (can\'t undo mistakes)', 'Learning curve']
    }
  },
  {
    id: 2,
    title: 'Storing Your Money',
    emoji: '🏦',
    centralized: {
      description: 'Keeping money in a bank account',
      steps: [
        'You deposit money at the bank',
        'Bank stores it in their system',
        'Bank uses your money for loans',
        'You trust the bank to keep it safe',
        'Bank controls access',
        'You need permission to withdraw large amounts'
      ],
      pros: ['FDIC insurance (in some countries)', 'Easy to use', 'Can earn interest'],
      cons: ['Bank controls YOUR money', 'Withdrawal limits', 'Bank can freeze account', 'Inflation reduces value', 'Bank can fail (2008 crisis)']
    },
    decentralized: {
      description: 'Storing money in your blockchain wallet',
      steps: [
        'You create a wallet (generates keys)',
        'You control the private keys',
        'Money is stored on the blockchain',
        'Only YOU can access it',
        'No permission needed to withdraw',
        'Accessible 24/7 from anywhere'
      ],
      pros: ['YOU control your money', 'No withdrawal limits', 'No one can freeze it', 'Cannot be seized', 'Protected from inflation (for some coins)'],
      cons: ['You are responsible for security', 'If you lose keys, money is gone', 'No customer support to call']
    }
  },
  {
    id: 3,
    title: 'Verifying Identity',
    emoji: '🪪',
    centralized: {
      description: 'Government or company controls your identity',
      steps: [
        'Government issues ID card',
        'Company stores your data in their database',
        'They can change or revoke your access',
        'Data can be hacked or lost',
        'Need their permission to prove identity',
        'Data sold to advertisers'
      ],
      pros: ['Widely accepted', 'Legal backing', 'Recovery process if lost'],
      cons: ['Company controls your data', 'Data breaches (Yahoo, Facebook)', 'Identity theft', 'Privacy invasion', 'Can be revoked']
    },
    decentralized: {
      description: 'Self-sovereign identity on blockchain',
      steps: [
        'You create your digital identity',
        'Stored on blockchain, YOU control it',
        'You decide who sees what information',
        'Cannot be changed by anyone else',
        'Cryptographically verified',
        'No company owns your data'
      ],
      pros: ['YOU own your identity', 'No data breaches', 'Privacy by design', 'Cannot be revoked', 'Portable across services'],
      cons: ['Not yet widely accepted', 'Complex to set up', 'Must safeguard keys']
    }
  }
];

export const CentralizedVsDecentralized: React.FC<CentralizedVsDecentralizedProps> = ({ onInteract }) => {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [view, setView] = useState<'centralized' | 'decentralized' | 'compare'>('compare');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleScenarioChange = (scenario: typeof scenarios[0]) => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }
    setSelectedScenario(scenario);
  };

  const handleViewChange = (newView: typeof view) => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }
    setView(newView);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-gradient-to-br from-orange-50/50 to-purple-50/50 dark:from-orange-950/20 dark:to-purple-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <ArrowLeftRight className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              <h2 className="text-xl md:text-2xl font-bold">Centralized vs Decentralized</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Explore the difference between traditional (centralized) and blockchain (decentralized) systems
            </p>
          </div>

          {/* Scenario Selector */}
          <div>
            <h4 className="font-semibold mb-3 text-sm md:text-base">Choose a Scenario:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenarios.map((scenario) => (
                <Button
                  key={scenario.id}
                  onClick={() => handleScenarioChange(scenario)}
                  variant={selectedScenario.id === scenario.id ? 'default' : 'outline'}
                  className="h-auto p-3 md:p-4 text-left justify-start"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl">{scenario.emoji}</span>
                    <span className="text-xs md:text-sm font-semibold">{scenario.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => handleViewChange('centralized')}
              variant={view === 'centralized' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Centralized Only
            </Button>
            <Button
              onClick={() => handleViewChange('compare')}
              variant={view === 'compare' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-purple-600 text-white hover:from-orange-700 hover:to-purple-700"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Compare Both
            </Button>
            <Button
              onClick={() => handleViewChange('decentralized')}
              variant={view === 'decentralized' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none"
            >
              <Users className="w-4 h-4 mr-2" />
              Decentralized Only
            </Button>
          </div>

          {/* Comparison View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedScenario.id}-${view}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            >
              {/* Centralized */}
              {(view === 'centralized' || view === 'compare') && (
                <Card className="p-4 md:p-6 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">Centralized</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Traditional way</p>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm">{selectedScenario.centralized.description}</p>

                    <div>
                      <h4 className="font-semibold mb-2 text-xs md:text-sm">How it works:</h4>
                      <ol className="space-y-2">
                        {selectedScenario.centralized.steps.map((step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-2 text-xs md:text-sm"
                          >
                            <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2 text-xs md:text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Pros
                        </h5>
                        <ul className="space-y-1 text-xs">
                          {selectedScenario.centralized.pros.map((pro, i) => (
                            <li key={i} className="flex gap-1">
                              <span>+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2 text-xs md:text-sm text-red-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Cons
                        </h5>
                        <ul className="space-y-1 text-xs">
                          {selectedScenario.centralized.cons.map((con, i) => (
                            <li key={i} className="flex gap-1">
                              <span>-</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Card className="p-3 bg-orange-100 dark:bg-orange-950/40 border border-orange-300">
                      <p className="text-xs flex items-start gap-2">
                        <span className="flex-shrink-0 text-lg">🏢</span>
                        <span><strong>Key Point:</strong> One company/government controls everything. You must trust them.</span>
                      </p>
                    </Card>
                  </div>
                </Card>
              )}

              {/* Decentralized */}
              {(view === 'decentralized' || view === 'compare') && (
                <Card className="p-4 md:p-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500 flex items-center justify-center">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">Decentralized</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Blockchain way</p>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm">{selectedScenario.decentralized.description}</p>

                    <div>
                      <h4 className="font-semibold mb-2 text-xs md:text-sm">How it works:</h4>
                      <ol className="space-y-2">
                        {selectedScenario.decentralized.steps.map((step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-2 text-xs md:text-sm"
                          >
                            <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2 text-xs md:text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Pros
                        </h5>
                        <ul className="space-y-1 text-xs">
                          {selectedScenario.decentralized.pros.map((pro, i) => (
                            <li key={i} className="flex gap-1">
                              <span>+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2 text-xs md:text-sm text-red-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Cons
                        </h5>
                        <ul className="space-y-1 text-xs">
                          {selectedScenario.decentralized.cons.map((con, i) => (
                            <li key={i} className="flex gap-1">
                              <span>-</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Card className="p-3 bg-purple-100 dark:bg-purple-950/40 border border-purple-300">
                      <p className="text-xs flex items-start gap-2">
                        <span className="flex-shrink-0 text-lg">🌐</span>
                        <span><strong>Key Point:</strong> Network of computers control it together. No single point of control.</span>
                      </p>
                    </Card>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* African Context Example */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 border-2 border-green-500">
            <h4 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
              🌍 Why This Matters in Africa
            </h4>
            <div className="space-y-2 text-xs md:text-sm">
              {selectedScenario.id === 1 && (
                <>
                  <p>
                    <strong>🇳🇬 Nigeria:</strong> During #EndSARS protests in 2020, banks froze accounts of protesters. With decentralized crypto, no one can freeze your money.
                  </p>
                  <p>
                    <strong>🇿🇦 South Africa → Zimbabwe:</strong> Sending money home costs 5-10% with Western Union. With blockchain, it costs $0.0001.
                  </p>
                </>
              )}
              {selectedScenario.id === 2 && (
                <>
                  <p>
                    <strong>🇿🇼 Zimbabwe:</strong> In 2008, banks failed and people lost their savings. With blockchain, YOU control your money.
                  </p>
                  <p>
                    <strong>🇰🇪 Kenya:</strong> Banks require minimum balances. Blockchain wallets have no minimum - perfect for small savings.
                  </p>
                </>
              )}
              {selectedScenario.id === 3 && (
                <>
                  <p>
                    <strong>🇳🇬 Nigeria:</strong> Equifax data breach exposed millions. With blockchain identity, YOU control who sees your data.
                  </p>
                  <p>
                    <strong>🇬🇭 Ghana:</strong> Land ownership disputes are common. Blockchain land registry = permanent, tamper-proof records.
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Key Takeaways */}
          <Card className="p-4 md:p-6 bg-blue-50/50 dark:bg-blue-950/20">
            <h4 className="font-semibold mb-3 text-sm md:text-base">🔑 Key Takeaways:</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex gap-2">
                <span>✅</span>
                <span><strong>Centralized</strong> = One company/government controls it (like banks, Facebook)</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span><strong>Decentralized</strong> = Network of computers control it together (like blockchain)</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Centralized is easier to use but gives power to one entity</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Decentralized gives YOU control but requires more responsibility</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Blockchain = decentralized technology for money, identity, and more</span>
              </li>
            </ul>
          </Card>
        </div>
      </Card>
    </div>
  );
};
