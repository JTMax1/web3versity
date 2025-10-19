import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Users, Clock, Leaf, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface ConsensusComparisonProps {
  onInteract?: () => void;
}

interface ConsensusData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  speed: number; // seconds
  cost: string;
  energy: string;
  security: string;
  howItWorks: string[];
  pros: string[];
  cons: string[];
  examples: string[];
  africanContext: string;
}

const consensusMechanisms: ConsensusData[] = [
  {
    id: 'pow',
    name: 'Proof of Work (PoW)',
    emoji: '⛏️',
    color: 'orange',
    description: 'Miners solve complex puzzles to validate transactions and create new blocks',
    speed: 600,
    cost: '$15-50',
    energy: 'Very High',
    security: 'Excellent',
    howItWorks: [
      'Miners compete to solve complex mathematical puzzles',
      'First to solve gets to add the next block',
      'Other miners verify the solution',
      'Winner receives block reward + transaction fees',
      'Difficulty adjusts to maintain consistent block time'
    ],
    pros: [
      'Battle-tested security (Bitcoin 15+ years)',
      'Truly decentralized',
      'Resistant to attacks (would need 51% of mining power)',
      'Transparent and simple to understand'
    ],
    cons: [
      'Extremely high energy consumption',
      'Slow transaction speeds (Bitcoin: ~10 min/block)',
      'Expensive transaction fees during high demand',
      'Mining hardware expensive and inaccessible'
    ],
    examples: ['Bitcoin', 'Ethereum (before merge)', 'Litecoin', 'Dogecoin'],
    africanContext: 'High electricity costs in Africa make PoW mining unprofitable for most. South Africa has some mining operations due to cheaper power.'
  },
  {
    id: 'pos',
    name: 'Proof of Stake (PoS)',
    emoji: '🪙',
    color: 'blue',
    description: 'Validators lock up coins as collateral to validate transactions',
    speed: 12,
    cost: '$0.50-5',
    energy: 'Very Low',
    security: 'Excellent',
    howItWorks: [
      'Validators "stake" their coins as collateral',
      'Network randomly selects validators to propose blocks',
      'Selection weighted by amount staked',
      'Other validators verify the proposed block',
      'Validators earn rewards; bad actors lose their stake'
    ],
    pros: [
      '99.95% less energy than PoW',
      'Faster transaction finality',
      'Lower entry barrier (no mining hardware needed)',
      'Validators can be anyone with enough stake'
    ],
    cons: [
      'Wealthy validators have more influence',
      'High minimum stake requirement (Ethereum: 32 ETH)',
      'Coins locked up during staking',
      'Newer, less battle-tested than PoW'
    ],
    examples: ['Ethereum 2.0', 'Cardano', 'Polkadot', 'Tezos'],
    africanContext: 'More accessible for Africans - no expensive hardware needed. Can pool stake with others to participate.'
  },
  {
    id: 'hashgraph',
    name: 'Hashgraph Consensus',
    emoji: '⚡',
    color: 'purple',
    description: 'Hedera\'s unique gossip-about-gossip protocol with virtual voting',
    speed: 3,
    cost: '$0.0001',
    energy: 'Extremely Low',
    security: 'Excellent (aBFT)',
    howItWorks: [
      'Nodes "gossip" transactions to random neighbors',
      'Gossip spreads exponentially across network',
      'Each node records who told them what and when',
      'Virtual voting determines consensus (no actual votes sent)',
      'Achieves finality in seconds with certainty'
    ],
    pros: [
      'Blazing fast (10,000+ TPS, 3-5 second finality)',
      'Lowest fees (~$0.0001 per transaction)',
      'Carbon negative (offset by renewable energy)',
      'Asynchronous Byzantine Fault Tolerant (strongest security)',
      'Fair ordering prevents front-running',
      'No mining or high stake requirements'
    ],
    cons: [
      'Patented technology (controlled by Hedera)',
      'Governed by council of 39 organizations',
      'Less decentralized than Bitcoin/Ethereum',
      'Newer, smaller ecosystem'
    ],
    examples: ['Hedera'],
    africanContext: 'Perfect for Africa! Ultra-low fees enable microtransactions. Fast speed works on mobile networks. Low energy = works anywhere.'
  },
  {
    id: 'dpos',
    name: 'Delegated Proof of Stake',
    emoji: '🗳️',
    color: 'green',
    description: 'Token holders vote for delegates who validate transactions',
    speed: 3,
    cost: '$0.01-0.10',
    energy: 'Low',
    security: 'Good',
    howItWorks: [
      'Token holders vote for delegates/witnesses',
      'Top voted delegates become block producers',
      'Delegates take turns producing blocks',
      'Community can vote out bad delegates',
      'Delegates share rewards with voters'
    ],
    pros: [
      'Very fast and scalable',
      'Democratic - community chooses validators',
      'Energy efficient',
      'Lower costs than PoW'
    ],
    cons: [
      'More centralized (usually 21-100 delegates)',
      'Risk of cartels forming among delegates',
      'Wealthy token holders have more voting power',
      'Delegates could collude'
    ],
    examples: ['EOS', 'TRON', 'BitShares'],
    africanContext: 'Community governance aspect appeals to African collective decision-making culture. Lower barriers to participation.'
  }
];

export const ConsensusComparison: React.FC<ConsensusComparisonProps> = ({ onInteract }) => {
  const [selectedMechanism, setSelectedMechanism] = useState<ConsensusData | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSelect = (mechanism: ConsensusData) => {
    setSelectedMechanism(mechanism);
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      orange: { bg: 'from-orange-500 to-red-600', border: 'border-orange-300', text: 'text-orange-600' },
      blue: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-300', text: 'text-blue-600' },
      purple: { bg: 'from-purple-500 to-indigo-600', border: 'border-purple-300', text: 'text-purple-600' },
      green: { bg: 'from-green-500 to-emerald-600', border: 'border-green-300', text: 'text-green-600' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (compareMode) {
    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl">Consensus Mechanisms Comparison</h2>
          <Button onClick={() => setCompareMode(false)} variant="outline">
            Back to Details
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="p-4 text-left">Feature</th>
                {consensusMechanisms.map(m => (
                  <th key={m.id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-sm">{m.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-semibold">Speed</td>
                {consensusMechanisms.map(m => (
                  <td key={m.id} className="p-4 text-center">
                    <Badge variant={m.speed < 10 ? 'default' : 'secondary'}>
                      {m.speed < 60 ? `${m.speed}s` : `${Math.round(m.speed / 60)}min`}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-gray-50 dark:bg-gray-900/20">
                <td className="p-4 font-semibold">Cost per TX</td>
                {consensusMechanisms.map(m => (
                  <td key={m.id} className="p-4 text-center">{m.cost}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Energy Use</td>
                {consensusMechanisms.map(m => (
                  <td key={m.id} className="p-4 text-center">
                    <Badge variant={m.energy.includes('Low') ? 'default' : 'destructive'}>
                      {m.energy}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-gray-50 dark:bg-gray-900/20">
                <td className="p-4 font-semibold">Security</td>
                {consensusMechanisms.map(m => (
                  <td key={m.id} className="p-4 text-center">{m.security}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Examples</td>
                {consensusMechanisms.map(m => (
                  <td key={m.id} className="p-4 text-center text-sm">
                    {m.examples.slice(0, 2).join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <h3 className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            Which is Best for Africa?
          </h3>
          <p className="mb-4">For African use cases, <strong className="text-purple-600">Hedera's Hashgraph</strong> and <strong className="text-blue-600">Proof of Stake</strong> are ideal because:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span><strong>Ultra-low fees</strong> enable microtransactions for mobile money, remittances</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Fast finality</strong> works well on mobile networks with varying speeds</span>
            </li>
            <li className="flex items-start gap-2">
              <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span><strong>Low energy</strong> means works anywhere, even areas with unreliable power</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span><strong>No mining hardware</strong> needed - participate from any smartphone</span>
            </li>
          </ul>
        </Card>
      </div>
    );
  }

  if (selectedMechanism) {
    const colors = getColorClasses(selectedMechanism.color);

    return (
      <div className="w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setSelectedMechanism(null)} variant="outline">
            ← Back
          </Button>
          <Button onClick={() => setCompareMode(true)} variant="outline">
            Compare All
          </Button>
        </div>

        {/* Header */}
        <Card className={`p-8 bg-gradient-to-r ${colors.bg} text-white`}>
          <div className="flex items-start gap-4">
            <div className="text-7xl">{selectedMechanism.emoji}</div>
            <div className="flex-1">
              <h2 className="text-4xl mb-3">{selectedMechanism.name}</h2>
              <p className="text-white/90 text-lg">{selectedMechanism.description}</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">Speed</p>
            <p className="text-xl font-bold">
              {selectedMechanism.speed < 60 ? `${selectedMechanism.speed}s` : `${Math.round(selectedMechanism.speed / 60)}min`}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Cost/TX</p>
            <p className="text-xl font-bold">{selectedMechanism.cost}</p>
          </Card>
          <Card className="p-4 text-center">
            <Leaf className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <p className="text-sm text-muted-foreground">Energy</p>
            <p className="text-xl font-bold">{selectedMechanism.energy}</p>
          </Card>
          <Card className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-muted-foreground">Security</p>
            <p className="text-xl font-bold">{selectedMechanism.security}</p>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            How It Works
          </h3>
          <ol className="space-y-3">
            {selectedMechanism.howItWorks.map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.text} bg-current/10 font-bold flex-shrink-0`}>
                  {index + 1}
                </div>
                <span className="mt-1">{step}</span>
              </motion.li>
            ))}
          </ol>
        </Card>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <h3 className="mb-4 text-green-700">✅ Advantages</h3>
            <ul className="space-y-2">
              {selectedMechanism.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <h3 className="mb-4 text-red-700">⚠️ Disadvantages</h3>
            <ul className="space-y-2">
              {selectedMechanism.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Examples */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <h3 className="mb-3">Networks Using {selectedMechanism.name}</h3>
          <div className="flex flex-wrap gap-2">
            {selectedMechanism.examples.map((example, index) => (
              <Badge key={index} className="px-4 py-2 text-sm" variant="secondary">
                {example}
              </Badge>
            ))}
          </div>
        </Card>

        {/* African Context */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <h3 className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            African Context
          </h3>
          <p className="text-amber-900 dark:text-amber-100">{selectedMechanism.africanContext}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl">Consensus Mechanisms Interactive</h2>
        <p className="text-muted-foreground text-lg">
          Explore how different blockchains reach agreement
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {consensusMechanisms.map((mechanism, index) => {
          const colors = getColorClasses(mechanism.color);
          return (
            <motion.div
              key={mechanism.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 cursor-pointer hover:shadow-lg transition-all border-2 ${colors.border}`}
                onClick={() => handleSelect(mechanism)}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{mechanism.emoji}</div>
                  <h3 className="text-2xl mb-2">{mechanism.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mechanism.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-center">
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="font-bold">
                      {mechanism.speed < 60 ? `${mechanism.speed}s` : `${Math.round(mechanism.speed / 60)}min`}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-center">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-bold">{mechanism.cost}</p>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Learn More →
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={() => setCompareMode(true)}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-indigo-600"
        >
          Compare All Mechanisms
        </Button>
      </div>
    </div>
  );
};
