import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from '../../ui/badge';
import { TestTube, Eye, Globe, Cog, AlertTriangle, CheckCircle } from 'lucide-react';

interface NetworkInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  purpose: string;
  useCases: string[];
  tokens: string;
  dataRetention: string;
  whoUses: string;
  risk: string;
  example: string;
}

interface NetworkComparisonProps {
  onInteract?: () => void;
}

export function NetworkComparison({ onInteract }: NetworkComparisonProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('testnet');

  const networks: NetworkInfo[] = [
    {
      id: 'testnet',
      name: 'Testnet',
      icon: <TestTube className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      purpose: 'Practice and learn without using real money',
      useCases: [
        'Learning how to use wallets',
        'Testing applications before launch',
        'Experimenting with transactions',
        'Training new developers'
      ],
      tokens: 'Free test tokens (not real money)',
      dataRetention: 'May be reset periodically',
      whoUses: 'Students, new developers, anyone learning',
      risk: 'Zero risk - no real money involved',
      example: 'Amina wants to learn blockchain. She uses testnet to practice sending transactions without spending real money.'
    },
    {
      id: 'previewnet',
      name: 'PreviewNet',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      purpose: 'Test new features before they launch on mainnet',
      useCases: [
        'Testing upcoming Hedera features',
        'Early access to new capabilities',
        'Beta testing applications',
        'Preparing for mainnet upgrades'
      ],
      tokens: 'Free test tokens (not real money)',
      dataRetention: 'May be reset when features launch',
      whoUses: 'Advanced developers, early adopters',
      risk: 'Zero risk - experimental environment',
      example: 'Hedera is launching a new smart contract feature. Developers test it on PreviewNet before it goes live on mainnet.'
    },
    {
      id: 'mainnet',
      name: 'Mainnet',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      purpose: 'Production network with real cryptocurrency',
      useCases: [
        'Real financial transactions',
        'Launching live applications',
        'Actual NFT creation and trading',
        'Production DApps'
      ],
      tokens: 'Real HBAR - costs real money',
      dataRetention: 'Permanent - never reset',
      whoUses: 'Everyone - for real transactions',
      risk: 'Real money involved - be careful!',
      example: 'Kwame sends 50 HBAR to pay for goods. This happens on mainnet using real cryptocurrency.'
    },
    {
      id: 'devnet',
      name: 'Devnet',
      icon: <Cog className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      purpose: 'Local development environment on your computer',
      useCases: [
        'Developing without internet',
        'Fast testing during coding',
        'Private development',
        'Learning smart contracts'
      ],
      tokens: 'Simulated tokens on your machine',
      dataRetention: 'Only on your computer',
      whoUses: 'Developers building applications',
      risk: 'Zero risk - runs locally',
      example: 'Chinwe is building a DApp. She runs devnet on her laptop to test code quickly without needing internet.'
    }
  ];

  const selected = networks.find(n => n.id === selectedNetwork)!;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50"
         style={{ boxShadow: '0 8px 32px rgba(0, 132, 199, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Hedera Network Types</h3>
        <p className="text-gray-600">Understanding different blockchain environments</p>
      </div>

      {/* Network Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {networks.map((network) => (
          <motion.button
            key={network.id}
            onClick={() => {
              setSelectedNetwork(network.id);
              if (onInteract) onInteract();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-2xl text-center transition-all ${
              selectedNetwork === network.id
                ? `bg-gradient-to-br ${network.color} text-white`
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ 
              boxShadow: selectedNetwork === network.id
                ? '0 8px 24px rgba(0, 132, 199, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="mb-2 flex justify-center">
              {network.icon}
            </div>
            <div className={`text-sm ${selectedNetwork === network.id ? 'text-white' : 'text-gray-900'}`}>
              {network.name}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Network Details */}
      <motion.div
        key={selectedNetwork}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className={`p-6 rounded-2xl bg-gradient-to-r ${selected.color} text-white`}
             style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-white/20">
              {selected.icon}
            </div>
            <div>
              <h4 className="text-white mb-1">{selected.name}</h4>
              <p className="text-white/90">{selected.purpose}</p>
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="mb-1"><strong>Tokens</strong></p>
                <p className="text-sm text-gray-600">{selected.tokens}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="mb-1"><strong>Who Uses It</strong></p>
                <p className="text-sm text-gray-600">{selected.whoUses}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">💾</span>
              <div>
                <p className="mb-1"><strong>Data Retention</strong></p>
                <p className="text-sm text-gray-600">{selected.dataRetention}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
            <div className="flex items-start gap-3 mb-3">
              {selected.id === 'mainnet' ? (
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              <div>
                <p className="mb-1"><strong>Risk Level</strong></p>
                <p className="text-sm text-gray-600">{selected.risk}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <p className="mb-4"><strong>Common Use Cases:</strong></p>
          <div className="grid md:grid-cols-2 gap-3">
            {selected.useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-blue-50"
              >
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span className="text-sm text-gray-700">{useCase}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <p className="mb-2"><strong>Real-World Example:</strong></p>
              <p className="text-gray-700">{selected.example}</p>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        {selected.id === 'testnet' && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <p className="mb-3"><strong>🎓 Recommended Learning Path:</strong></p>
            <div className="space-y-2 text-gray-700">
              <p>1. ✅ Start Here: Practice on <strong>Testnet</strong> (safe, free)</p>
              <p>2. Try <strong>PreviewNet</strong> when you're comfortable (test new features)</p>
              <p>3. Build on <strong>Devnet</strong> if you're developing apps</p>
              <p>4. Only use <strong>Mainnet</strong> when you're confident and ready for real money</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Comparison Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">Network</th>
              <th className="p-4 text-left">Cost</th>
              <th className="p-4 text-left">Reset?</th>
              <th className="p-4 text-left">Best For</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((network, idx) => (
              <tr 
                key={network.id} 
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {network.icon}
                    <strong>{network.name}</strong>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={network.id === 'mainnet' ? 'destructive' : 'secondary'}>
                    {network.id === 'mainnet' ? 'Real Money' : 'Free'}
                  </Badge>
                </td>
                <td className="p-4">
                  {network.id === 'mainnet' ? '❌ Never' : '✓ Possible'}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {network.whoUses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
