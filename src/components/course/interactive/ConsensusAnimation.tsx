import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Zap, Users, Network } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Node {
  id: number;
  name: string;
  x: number;
  y: number;
  hasTransaction: boolean;
  timestamp: number;
  color: string;
}

interface Message {
  id: string;
  from: number;
  to: number;
  stage: number;
  color: string;
}

interface ConsensusAnimationProps {
  onInteract?: () => void;
}

export const ConsensusAnimation: React.FC<ConsensusAnimationProps> = ({ onInteract }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stage, setStage] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [consensusReached, setConsensusReached] = useState(false);

  // 7 nodes arranged in a circle (representing Hedera network nodes)
  const initialNodes: Node[] = [
    { id: 0, name: 'Node A\n🇳🇬 Lagos', x: 50, y: 10, hasTransaction: false, timestamp: 0, color: '#8b5cf6' },
    { id: 1, name: 'Node B\n🇰🇪 Nairobi', x: 85, y: 30, hasTransaction: false, timestamp: 0, color: '#06b6d4' },
    { id: 2, name: 'Node C\n🇿🇦 Cape Town', x: 90, y: 70, hasTransaction: false, timestamp: 0, color: '#10b981' },
    { id: 3, name: 'Node D\n🇬🇭 Accra', x: 50, y: 90, hasTransaction: false, timestamp: 0, color: '#f59e0b' },
    { id: 4, name: 'Node E\n🇪🇬 Cairo', x: 10, y: 70, hasTransaction: false, timestamp: 0, color: '#ef4444' },
    { id: 5, name: 'Node F\n🇹🇿 Dar es Salaam', x: 5, y: 30, hasTransaction: false, timestamp: 0, color: '#ec4899' },
    { id: 6, name: 'Node G\n🇺🇬 Kampala', x: 50, y: 50, hasTransaction: false, timestamp: 0, color: '#6366f1' },
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (stage < 5) {
        setStage(stage + 1);
        simulateStage(stage + 1);
      } else {
        setIsPlaying(false);
        setConsensusReached(true);
        if (!hasInteracted && onInteract) {
          setHasInteracted(true);
          onInteract();
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, stage]);

  const simulateStage = (currentStage: number) => {
    switch (currentStage) {
      case 1: // Initial transaction
        setNodes(prev => prev.map(n =>
          n.id === 0 ? { ...n, hasTransaction: true, timestamp: Date.now() } : n
        ));
        break;

      case 2: // Gossip to neighbors (Node A tells Node B and F)
        setMessages([
          { id: '1-1', from: 0, to: 1, stage: 2, color: '#8b5cf6' },
          { id: '1-2', from: 0, to: 5, stage: 2, color: '#8b5cf6' },
        ]);
        setTimeout(() => {
          setNodes(prev => prev.map(n =>
            n.id === 1 || n.id === 5 ? { ...n, hasTransaction: true, timestamp: Date.now() } : n
          ));
          setMessages([]);
        }, 1000);
        break;

      case 3: // Second round of gossip (exponential spread)
        setMessages([
          { id: '2-1', from: 1, to: 2, stage: 3, color: '#06b6d4' },
          { id: '2-2', from: 1, to: 6, stage: 3, color: '#06b6d4' },
          { id: '2-3', from: 5, to: 4, stage: 3, color: '#ec4899' },
          { id: '2-4', from: 5, to: 6, stage: 3, color: '#ec4899' },
        ]);
        setTimeout(() => {
          setNodes(prev => prev.map(n =>
            n.id === 2 || n.id === 4 || n.id === 6 ? { ...n, hasTransaction: true, timestamp: Date.now() } : n
          ));
          setMessages([]);
        }, 1000);
        break;

      case 4: // Third round - complete spread
        setMessages([
          { id: '3-1', from: 2, to: 3, stage: 4, color: '#10b981' },
          { id: '3-2', from: 4, to: 3, stage: 4, color: '#ef4444' },
        ]);
        setTimeout(() => {
          setNodes(prev => prev.map(n =>
            n.id === 3 ? { ...n, hasTransaction: true, timestamp: Date.now() } : n
          ));
          setMessages([]);
        }, 1000);
        break;

      case 5: // Consensus reached - all nodes agree
        setConsensusReached(true);
        break;
    }
  };

  const handlePlay = () => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStage(0);
    setNodes(initialNodes);
    setMessages([]);
    setConsensusReached(false);
  };

  const stageDescriptions = [
    "Ready to start: Node A in Lagos receives a new transaction (e.g., Amina sends 10 HBAR to Kwame)",
    "Stage 1: Node A (Lagos) gossips the transaction to its randomly selected neighbors",
    "Stage 2: Those nodes gossip to their neighbors - exponential spread across Africa!",
    "Stage 3: More gossip rounds ensure every node receives the transaction",
    "Stage 4: All nodes have the transaction and can gossip about the gossip (metadata)",
    "Consensus Reached! All nodes agree on transaction order and timestamp ⚡"
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Network className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold">Hedera Gossip-About-Gossip Protocol</h2>
            </div>
            <p className="text-muted-foreground">
              Watch how transactions spread across African nodes in seconds
            </p>
          </div>

          {/* Animation Canvas */}
          <div className="relative w-full h-[500px] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-950/30 dark:to-gray-900 rounded-xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
            {/* Nodes */}
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: node.id * 0.1 }}
              >
                <motion.div
                  className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 ${
                    node.hasTransaction
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-600 shadow-lg shadow-green-500/50'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500'
                  } transition-all duration-500`}
                  animate={node.hasTransaction ? {
                    boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)'],
                  } : {}}
                  transition={{ duration: 1.5, repeat: node.hasTransaction ? Infinity : 0 }}
                >
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto text-white" />
                  </div>

                  {/* Pulse effect when transaction arrives */}
                  {node.hasTransaction && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-400"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </motion.div>

                {/* Node Label */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-pre-wrap text-center">
                  <span className="text-xs font-semibold px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded shadow-sm">
                    {node.name}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Messages (animated lines between nodes) */}
            <AnimatePresence>
              {messages.map((msg) => {
                const fromNode = nodes[msg.from];
                const toNode = nodes[msg.to];

                return (
                  <motion.div
                    key={msg.id}
                    className="absolute"
                    style={{
                      left: `${fromNode.x}%`,
                      top: `${fromNode.y}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="absolute w-2 h-2 rounded-full"
                      style={{ backgroundColor: msg.color }}
                      animate={{
                        left: `${(toNode.x - fromNode.x) * 5}px`,
                        top: `${(toNode.y - fromNode.y) * 5}px`,
                      }}
                      transition={{ duration: 1, ease: 'linear' }}
                    >
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Consensus celebration overlay */}
            {consensusReached && (
              <motion.div
                className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <div className="text-6xl">✅</div>
                  <h3 className="text-3xl font-bold text-green-600">Consensus Reached!</h3>
                  <p className="text-lg">All nodes agree on the transaction order</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span>Finalized in ~3-5 seconds</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Stage Description */}
          <Card className="p-4 bg-white/50 dark:bg-gray-900/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                {stage}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{stageDescriptions[stage]}</p>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {!isPlaying && stage === 0 && (
              <Button onClick={handlePlay} size="lg" className="w-40">
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            )}
            {isPlaying && (
              <Button onClick={() => setIsPlaying(false)} size="lg" variant="outline" className="w-40">
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} size="lg" variant="outline" className="w-40">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Educational Note */}
          <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              💡 Why This Matters for Africa:
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>⚡ Speed:</strong> Gossip protocol reaches consensus in 3-5 seconds (faster than sending an M-Pesa SMS!)
              </li>
              <li>
                <strong>🌍 No Single Point of Failure:</strong> Unlike mobile money (controlled by one telecom), every node is equal
              </li>
              <li>
                <strong>🔒 Security:</strong> Attacker would need to control ⅔ of nodes simultaneously (nearly impossible)
              </li>
              <li>
                <strong>📡 Efficient:</strong> Even with poor internet, gossip spreads exponentially (1 → 2 → 4 → 8 nodes)
              </li>
              <li>
                <strong>⏰ Fair Ordering:</strong> All nodes agree on timestamp, preventing "double-spending" attacks
              </li>
            </ul>
          </Card>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 bg-red-50/50 dark:bg-red-950/20">
              <h4 className="font-semibold mb-2 text-red-600">❌ Traditional Blockchain (Bitcoin/Ethereum)</h4>
              <ul className="space-y-1 text-sm">
                <li>⏱️ 10 minutes - 15 minutes per block</li>
                <li>⛏️ Mining requires massive energy</li>
                <li>🐢 Only 7-15 transactions per second</li>
                <li>💸 High transaction fees ($5-$50+)</li>
              </ul>
            </Card>
            <Card className="p-4 bg-green-50/50 dark:bg-green-950/20">
              <h4 className="font-semibold mb-2 text-green-600">✅ Hedera Consensus (Gossip-About-Gossip)</h4>
              <ul className="space-y-1 text-sm">
                <li>⚡ 3-5 seconds to finality</li>
                <li>🌱 Minimal energy (carbon negative!)</li>
                <li>🚀 10,000+ transactions per second</li>
                <li>💰 Ultra-low fees ($0.0001 per transaction)</li>
              </ul>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};
