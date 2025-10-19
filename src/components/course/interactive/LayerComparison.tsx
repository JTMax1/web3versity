import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Zap, DollarSign, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface LayerComparisonProps {
  onInteract?: () => void;
}

export const LayerComparison: React.FC<LayerComparisonProps> = ({ onInteract }) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'comparison'>('overview');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const layer1Examples = [
    { name: 'Bitcoin', tps: '7', finality: '60min', fee: '$2-20' },
    { name: 'Ethereum', tps: '15-30', finality: '13min', fee: '$1-50' },
    { name: 'Hedera', tps: '10,000+', finality: '3-5s', fee: '$0.0001' }
  ];

  const layer2Examples = [
    { name: 'Polygon (Ethereum L2)', tps: '7,000', finality: '2s', fee: '$0.01-0.10', l1: 'Ethereum' },
    { name: 'Arbitrum', tps: '40,000', finality: '1s', fee: '$0.10-1', l1: 'Ethereum' },
    { name: 'Optimism', tps: '2,000', finality: '2s', fee: '$0.10-1', l1: 'Ethereum' }
  ];

  if (selectedView === 'comparison') {
    return (
      <div className="w-full p-6 space-y-6">
        <Button onClick={() => setSelectedView('overview')} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>

        <h2 className="text-3xl text-center mb-6">Layer 1 vs Layer 2 Comparison</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Layer 1 */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2">Layer 1</h3>
              <p className="text-sm text-muted-foreground">Base blockchain networks</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-blue-700">What It Is</h4>
                <p className="text-sm">The main blockchain that processes and finalizes all transactions</p>
              </div>

              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Maximum security</li>
                  <li>✓ Fully decentralized</li>
                  <li>✓ No dependency on other chains</li>
                  <li>✓ Direct ownership</li>
                </ul>
              </div>

              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                <ul className="text-sm space-y-1">
                  <li>✗ Can be slower</li>
                  <li>✗ Higher fees (some chains)</li>
                  <li>✗ Scalability limits</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Examples:</h4>
                {layer1Examples.map((ex, index) => (
                  <div key={index} className="mb-3 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-semibold text-blue-700">{ex.name}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">TPS</p>
                        <p className="font-bold">{ex.tps}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Finality</p>
                        <p className="font-bold">{ex.finality}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fee</p>
                        <p className="font-bold">{ex.fee}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Layer 2 */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2">Layer 2</h3>
              <p className="text-sm text-muted-foreground">Scaling solutions built on top</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-purple-700">What It Is</h4>
                <p className="text-sm">Secondary network that processes transactions off the main chain, then settles on L1</p>
              </div>

              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-green-600">Pros</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Much faster</li>
                  <li>✓ Lower fees</li>
                  <li>✓ Higher throughput</li>
                  <li>✓ Inherits L1 security</li>
                </ul>
              </div>

              <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                <ul className="text-sm space-y-1">
                  <li>✗ Additional complexity</li>
                  <li>✗ Bridge risk</li>
                  <li>✗ Slightly less decentralized</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Examples:</h4>
                {layer2Examples.map((ex, index) => (
                  <div key={index} className="mb-3 p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                    <p className="font-semibold text-purple-700">{ex.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">Built on {ex.l1}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">TPS</p>
                        <p className="font-bold">{ex.tps}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Finality</p>
                        <p className="font-bold">{ex.finality}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fee</p>
                        <p className="font-bold">{ex.fee}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Real-World Analogy */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            Real-World Analogy
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-600">Layer 1 = Main Court</h4>
              <p className="text-sm">Like a country's supreme court that makes final, official rulings. Secure but slower and more expensive.</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-600">Layer 2 = Local Court</h4>
              <p className="text-sm">Like local courts that handle most cases quickly and cheaply, only escalating important cases to the supreme court.</p>
            </div>
          </div>
        </Card>

        {/* African Context */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            Why This Matters for Africa
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-green-700 mb-2">💰 Affordable Transactions</p>
              <p className="text-sm">Layer 2 solutions make microtransactions viable - perfect for African economies where sending $1-5 needs to cost cents, not dollars.</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-blue-700 mb-2">📱 Mobile-Friendly</p>
              <p className="text-sm">Faster finality means better experience on mobile networks. Critical when many Africans access crypto via phones with variable connectivity.</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-purple-700 mb-2">🎯 Hedera's Approach</p>
              <p className="text-sm">Hedera is a Layer 1 that performs like a Layer 2! 10,000+ TPS with $0.0001 fees - best of both worlds without complexity of bridging.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl">Understanding Blockchain Layers</h2>
        <p className="text-muted-foreground text-lg">
          Learn how Layer 1 and Layer 2 solutions work together
        </p>
      </div>

      {/* Visual Diagram */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Layer 2 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-10 h-10" />
                    <div>
                      <h3 className="text-2xl">Layer 2</h3>
                      <p className="text-sm text-white/80">Fast transactions processed here</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">⚡ 1000s TPS</div>
                    <div className="text-sm">Pennies per TX</div>
                  </div>
                </div>
              </Card>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-1/2 -bottom-8 transform -translate-x-1/2"
              >
                <ArrowRight className="w-6 h-6 text-purple-600 rotate-90" />
              </motion.div>
            </motion.div>

            {/* Arrow Text */}
            <div className="text-center text-sm text-muted-foreground py-2">
              Batched & settled ↓
            </div>

            {/* Layer 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-10 h-10" />
                    <div>
                      <h3 className="text-2xl">Layer 1</h3>
                      <p className="text-sm text-white/80">Final settlement & security</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">🔒 Secure</div>
                    <div className="text-sm">Immutable Record</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          How Layer 2 Works (Step by Step)
        </h3>
        <div className="space-y-3">
          {[
            { step: 1, text: 'User sends transaction on Layer 2', icon: '📤' },
            { step: 2, text: 'L2 processes it instantly (seconds, not minutes)', icon: '⚡' },
            { step: 3, text: 'L2 batches many transactions together', icon: '📦' },
            { step: 4, text: 'Batch is sent to Layer 1 for final settlement', icon: '🔗' },
            { step: 5, text: 'Layer 1 confirms and secures the batch forever', icon: '✅' }
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item.step * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg"
              onClick={handleInteraction}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <p>{item.text}</p>
              </div>
              <span className="text-3xl">{item.icon}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <h4 className="mb-2">Lower Fees</h4>
          <p className="text-sm text-muted-foreground">L2 can be 10-100x cheaper</p>
        </Card>
        <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <Zap className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h4 className="mb-2">Faster Speed</h4>
          <p className="text-sm text-muted-foreground">1-2 seconds vs minutes</p>
        </Card>
        <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-purple-600" />
          <h4 className="mb-2">More Scalable</h4>
          <p className="text-sm text-muted-foreground">Thousands more TPS</p>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={() => {
            setSelectedView('comparison');
            handleInteraction();
          }}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600"
        >
          See Detailed Comparison
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
