import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Lock, Link as LinkIcon, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Block {
  id: number;
  data: string;
  previousHash: string;
  hash: string;
  timestamp: string;
}

interface BlockChainBuilderProps {
  onInteract?: () => void;
}

// Simple hash function for demo purposes
const simpleHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
};

export const BlockChainBuilder: React.FC<BlockChainBuilderProps> = ({ onInteract }) => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 0,
      data: 'Genesis Block - The First Block Ever',
      previousHash: '00000000',
      hash: 'A3F7B2C9',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newBlockData, setNewBlockData] = useState('');
  const [tamperedBlockId, setTamperedBlockId] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const africanExamples = [
    'Amina sends 500 Naira to Kwame',
    'Chidi buys airtime worth 100 Naira',
    'Fatima receives payment for goods',
    'Jabari transfers rent money',
    'Zanele pays for market vegetables',
    'Kofi sends money to family in village'
  ];

  const addBlock = () => {
    if (!newBlockData.trim()) return;

    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    const previousBlock = blocks[blocks.length - 1];
    const blockData = `Block #${blocks.length}: ${newBlockData}`;
    const timestamp = new Date().toLocaleTimeString();
    const hashInput = `${previousBlock.hash}${blockData}${timestamp}`;
    const newHash = simpleHash(hashInput);

    const newBlock: Block = {
      id: blocks.length,
      data: blockData,
      previousHash: previousBlock.hash,
      hash: newHash,
      timestamp
    };

    setBlocks([...blocks, newBlock]);
    setNewBlockData('');
    setTamperedBlockId(null);
  };

  const tamperWithBlock = (blockId: number) => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    setTamperedBlockId(blockId);
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          data: block.data + ' [TAMPERED ⚠️]'
        };
      }
      return block;
    });
    setBlocks(updatedBlocks);
    setShowExplanation(true);
  };

  const resetChain = () => {
    setBlocks([
      {
        id: 0,
        data: 'Genesis Block - The First Block Ever',
        previousHash: '00000000',
        hash: 'A3F7B2C9',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setNewBlockData('');
    setTamperedBlockId(null);
    setShowExplanation(false);
  };

  const useExample = () => {
    const randomExample = africanExamples[Math.floor(Math.random() * africanExamples.length)];
    setNewBlockData(randomExample);
  };

  const isChainBroken = tamperedBlockId !== null;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <LinkIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
              <h2 className="text-xl md:text-2xl font-bold">Build Your Own Blockchain</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Add blocks and see how they link together with hashes
            </p>
          </div>

          {/* What You'll Learn */}
          <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
            <h4 className="font-semibold mb-2 text-sm md:text-base">💡 What You'll Learn:</h4>
            <ul className="space-y-1 text-xs md:text-sm list-disc list-inside">
              <li>Each block contains data (like a transaction)</li>
              <li>Each block has a unique "hash" (like a fingerprint)</li>
              <li>Each block points to the previous block's hash (forming a chain)</li>
              <li>Changing old data breaks the chain (that's the security!)</li>
            </ul>
          </Card>

          {/* Add Block Input */}
          <Card className="p-4 md:p-6 bg-white dark:bg-gray-900">
            <h4 className="font-semibold mb-3 text-sm md:text-base">➕ Add a New Block</h4>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newBlockData}
                  onChange={(e) => setNewBlockData(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBlock()}
                  placeholder="Enter transaction data (e.g., 'Amina pays 100 Naira to Kwame')"
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 rounded-lg focus:outline-none focus:border-purple-600 text-sm md:text-base"
                />
                <Button
                  onClick={addBlock}
                  disabled={!newBlockData.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </Button>
              </div>
              <Button
                onClick={useExample}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Use African Example
              </Button>
            </div>
          </Card>

          {/* Blockchain Visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-sm md:text-base">⛓️ Your Blockchain ({blocks.length} blocks)</h4>
              {blocks.length > 1 && (
                <Button onClick={resetChain} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            {/* Blocks Container - Horizontal scroll on mobile */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                <AnimatePresence>
                  {blocks.map((block, index) => {
                    const isTampered = tamperedBlockId !== null && tamperedBlockId <= block.id && block.id !== tamperedBlockId;
                    const isDirectlyTampered = tamperedBlockId === block.id;

                    return (
                      <React.Fragment key={block.id}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, x: -50 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex-shrink-0"
                        >
                          <Card
                            className={`w-72 md:w-80 p-4 md:p-6 transition-all ${
                              isDirectlyTampered
                                ? 'border-2 border-red-500 bg-red-50 dark:bg-red-950/20'
                                : isTampered
                                ? 'border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                                : 'border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Block Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Lock className={`w-5 h-5 ${
                                    isDirectlyTampered || isTampered ? 'text-red-600' : 'text-green-600'
                                  }`} />
                                  <span className="font-bold text-sm md:text-base">Block #{block.id}</span>
                                </div>
                                {(isDirectlyTampered || isTampered) && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                                    {isDirectlyTampered ? 'TAMPERED' : 'BROKEN'}
                                  </span>
                                )}
                              </div>

                              {/* Block Data */}
                              <div className="space-y-2 text-xs md:text-sm">
                                <div>
                                  <span className="text-muted-foreground">Data:</span>
                                  <p className="font-mono text-xs break-words">{block.data}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Previous Hash:</span>
                                  <p className="font-mono text-xs text-purple-600">{block.previousHash}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">This Block's Hash:</span>
                                  <p className={`font-mono text-xs font-bold ${
                                    isDirectlyTampered || isTampered ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {block.hash}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time:</span>
                                  <p className="text-xs">{block.timestamp}</p>
                                </div>
                              </div>

                              {/* Tamper Button */}
                              {block.id > 0 && tamperedBlockId === null && (
                                <Button
                                  onClick={() => tamperWithBlock(block.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="w-full text-xs md:text-sm"
                                >
                                  Try to Change This Block
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>

                        {/* Chain Link Arrow */}
                        {index < blocks.length - 1 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center flex-shrink-0"
                          >
                            <div className={`text-3xl md:text-4xl ${
                              isTampered ? 'text-red-500' : 'text-green-500'
                            }`}>
                              →
                            </div>
                          </motion.div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Explanation when chain is broken */}
          {showExplanation && isChainBroken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 md:p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-500">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base text-red-600">
                  🚨 The Chain is Broken!
                </h4>
                <div className="space-y-3 text-xs md:text-sm">
                  <p>
                    <strong>What happened?</strong> You changed the data in Block #{tamperedBlockId}.
                  </p>
                  <p>
                    This changed that block's hash, but all blocks AFTER it still point to the OLD hash.
                    Now the chain is broken! 🔗💥
                  </p>
                  <p>
                    <strong>Why this matters:</strong> In a real blockchain, everyone has a copy of the chain.
                    If someone tries to change old data, their version won't match everyone else's.
                    The network rejects the tampered chain. That's how blockchain prevents fraud!
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg border-2 border-yellow-400">
                    <p className="text-yellow-900 dark:text-yellow-200">
                      <strong>🇳🇬 Nigerian Example:</strong> Imagine Amina's bank tries to change her account balance from ₦50,000 to ₦5,000 in old records. With blockchain, everyone would notice because the "chain" would break. The bank can't cheat!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Success Message */}
          {blocks.length >= 3 && !isChainBroken && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-4 md:p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-500">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm md:text-base text-green-600">
                      🎉 You Built a Blockchain!
                    </h4>
                    <p className="text-xs md:text-sm">
                      Great job! You've created {blocks.length} blocks that are all linked together.
                      Now try clicking "Try to Change This Block" on an older block to see what happens!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Key Takeaways */}
          <Card className="p-4 md:p-6 bg-purple-50/50 dark:bg-purple-950/20">
            <h4 className="font-semibold mb-3 text-sm md:text-base">🔑 Key Takeaways:</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex gap-2">
                <span>✅</span>
                <span>Each block contains data + a unique hash (fingerprint)</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Each block links to the previous one using its hash</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Changing old data breaks all blocks after it</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>This makes blockchain tamper-proof and secure</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>No single person can change history without everyone noticing</span>
              </li>
            </ul>
          </Card>
        </div>
      </Card>
    </div>
  );
};
