import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Smartphone, Server, Users, Lock, Globe, Zap } from 'lucide-react';

interface DAppDemoProps {
  onInteract?: () => void;
}

export function DAppDemo({ onInteract }: DAppDemoProps) {
  const [selectedType, setSelectedType] = useState<'traditional' | 'dapp'>('traditional');

  const traditionalApp = {
    name: 'Traditional Mobile Money App',
    features: [
      {
        icon: <Server className="w-5 h-5" />,
        title: 'Central Server',
        description: 'All your data stored in company servers',
        risk: 'high'
      },
      {
        icon: <Lock className="w-5 h-5" />,
        title: 'Company Control',
        description: 'Company can freeze your account anytime',
        risk: 'high'
      },
      {
        icon: <Users className="w-5 h-5" />,
        title: 'Verification Required',
        description: 'Need ID, address proof, and approval',
        risk: 'medium'
      },
      {
        icon: <Globe className="w-5 h-5" />,
        title: 'Limited Access',
        description: 'Only works in specific countries',
        risk: 'medium'
      }
    ]
  };

  const dapp = {
    name: 'Decentralized App (DApp)',
    features: [
      {
        icon: <Server className="w-5 h-5" />,
        title: 'No Central Server',
        description: 'Data distributed across blockchain network',
        risk: 'low'
      },
      {
        icon: <Lock className="w-5 h-5" />,
        title: 'You Control Everything',
        description: 'Only you have access to your funds',
        risk: 'low'
      },
      {
        icon: <Users className="w-5 h-5" />,
        title: 'No Approval Needed',
        description: 'Just create a wallet and start using',
        risk: 'low'
      },
      {
        icon: <Globe className="w-5 h-5" />,
        title: 'Global Access',
        description: 'Works anywhere with internet',
        risk: 'low'
      }
    ]
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50"
         style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Traditional Apps vs DApps</h3>
        <p className="text-gray-600">Compare how they work and what makes DApps special</p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-2xl bg-white" 
             style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <button
            onClick={() => {
              setSelectedType('traditional');
              if (onInteract) onInteract();
            }}
            className={`px-8 py-3 rounded-xl transition-all ${
              selectedType === 'traditional'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-5 h-5 inline mr-2" />
            Traditional App
          </button>
          <button
            onClick={() => setSelectedType('dapp')}
            className={`px-8 py-3 rounded-xl transition-all ${
              selectedType === 'dapp'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-5 h-5 inline mr-2" />
            DApp
          </button>
        </div>
      </div>

      {/* Comparison Content */}
      <motion.div
        key={selectedType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-6 text-center">
          <h4 className="mb-2">
            {selectedType === 'traditional' ? traditionalApp.name : dapp.name}
          </h4>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {(selectedType === 'traditional' ? traditionalApp.features : dapp.features).map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-white"
              style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  feature.risk === 'high' ? 'bg-red-100 text-red-600' :
                  feature.risk === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-900">{feature.title}</p>
                    <Badge variant={
                      feature.risk === 'high' ? 'destructive' :
                      feature.risk === 'medium' ? 'secondary' :
                      'default'
                    } className={
                      feature.risk === 'low' ? 'bg-green-500' : ''
                    }>
                      {feature.risk === 'low' ? '✓ Safe' : 
                       feature.risk === 'medium' ? '⚠ Caution' : 
                       '✗ Risk'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Real Example */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
        <h4 className="mb-4">🌍 Real African Example</h4>
        
        {selectedType === 'traditional' ? (
          <div className="space-y-3 text-gray-800">
            <p>
              <strong>Scenario:</strong> Kwame in Ghana uses M-Pesa to send money to his family.
            </p>
            <div className="space-y-2 ml-4">
              <p>• Company controls his account and can freeze it</p>
              <p>• High fees for international transfers (5-15%)</p>
              <p>• Recipient must also have M-Pesa account</p>
              <p>• Can only send within East Africa region</p>
              <p>• Company sees all transaction history</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-gray-800">
            <p>
              <strong>Scenario:</strong> Kwame uses a DApp wallet on Hedera to send money.
            </p>
            <div className="space-y-2 ml-4">
              <p>✓ Kwame fully controls his wallet - no one can freeze it</p>
              <p>✓ Ultra-low fees (less than $0.01 per transaction)</p>
              <p>✓ Can send to anyone with any crypto wallet</p>
              <p>✓ Works globally - send money anywhere</p>
              <p>✓ Transactions are private to Kwame</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-6 rounded-2xl bg-white border-2 border-blue-200"
      >
        <h4 className="mb-3">Key Differences</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-blue-50">
            <p className="mb-2">🎯 Control</p>
            <p className="text-sm text-gray-600">
              <strong>Traditional:</strong> Company<br />
              <strong>DApp:</strong> You
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-purple-50">
            <p className="mb-2">💰 Fees</p>
            <p className="text-sm text-gray-600">
              <strong>Traditional:</strong> 1-15%<br />
              <strong>DApp:</strong> {'<$0.01'}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-50">
            <p className="mb-2">🌍 Access</p>
            <p className="text-sm text-gray-600">
              <strong>Traditional:</strong> Limited<br />
              <strong>DApp:</strong> Global
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
