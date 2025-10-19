import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

interface Block {
  id: number;
  transactions: string[];
  timestamp: string;
}

interface BlockChainAnimationProps {
  content: any;
  onInteract: () => void;
}

export function BlockChainAnimation({ content, onInteract }: BlockChainAnimationProps) {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 1,
      transactions: ['Amina → Kwame: 500 Naira', 'Chidi → Ada: 1000 Naira'],
      timestamp: '10:00 AM'
    }
  ]);

  const sampleTransactions = [
    ['Fatima → Ibrahim: 750 Naira', 'Kofi → Ama: 300 Naira', 'Zainab → Yusuf: 600 Naira'],
    ['Ngozi → Emeka: 450 Naira', 'Amara → Chioma: 850 Naira'],
    ['Kamau → Wanjiru: 1200 Naira', 'Adisa → Bola: 550 Naira', 'Tariq → Layla: 900 Naira']
  ];

  const handleAddBlock = () => {
    const newBlock: Block = {
      id: blocks.length + 1,
      transactions: sampleTransactions[(blocks.length) % sampleTransactions.length],
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setBlocks([...blocks, newBlock]);
    onInteract();
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="text-center mb-8">
        <h3 className="mb-4">How Blocks Connect in a Chain</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Each block contains multiple transactions. When a block is full, a new one is created and linked to the previous block, 
          forming an unbreakable chain. Think of it like beads on a string - each bead (block) is permanently connected!
        </p>
      </div>

      {/* Blockchain Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max pb-4">
          {blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {/* Block */}
              <div 
                className="flex-shrink-0 w-64 bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] border-2 border-[#0084C7] animate-[slideIn_0.5s_ease-out]"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center text-white shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.3)]">
                      {block.id}
                    </div>
                    <span className="text-sm text-gray-600">Block {block.id}</span>
                  </div>
                  <span className="text-xs text-gray-500">{block.timestamp}</span>
                </div>

                <div className="space-y-2">
                  {block.transactions.map((tx, txIndex) => (
                    <div 
                      key={txIndex}
                      className="p-3 bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-xl text-xs text-gray-700 shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]"
                    >
                      {tx}
                    </div>
                  ))}
                </div>

                {/* Hash visualization */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Block Hash:</div>
                  <div className="font-mono text-xs text-[#0084C7] break-all">
                    {Array.from({ length: 12 }, () => 
                      Math.floor(Math.random() * 16).toString(16)
                    ).join('')}...
                  </div>
                </div>
              </div>

              {/* Chain Link */}
              {index < blocks.length - 1 && (
                <div className="flex-shrink-0 flex items-center gap-1">
                  <div className="w-8 h-1 bg-[#0084C7] rounded-full"></div>
                  <div className="w-8 h-1 bg-[#0084C7] rounded-full"></div>
                  <div className="w-8 h-1 bg-[#0084C7] rounded-full"></div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Add Block Button */}
          {blocks.length < 4 && (
            <button
              onClick={handleAddBlock}
              className="flex-shrink-0 w-64 h-64 border-4 border-dashed border-[#0084C7]/30 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-[#0084C7] hover:bg-[#0084C7]/5 transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Plus className="w-8 h-8 text-[#0084C7]" />
              </div>
              <span className="text-[#0084C7]">Add New Block</span>
              <span className="text-xs text-gray-500">With new transactions</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Concepts */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="text-3xl mb-3">📦</div>
          <h5 className="mb-2">Blocks</h5>
          <p className="text-sm text-gray-600">
            Each block contains multiple transactions, like pages in a ledger book
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="text-3xl mb-3">⛓️</div>
          <h5 className="mb-2">Chain</h5>
          <p className="text-sm text-gray-600">
            Blocks are linked together in order, making them impossible to change
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="text-3xl mb-3">🔒</div>
          <h5 className="mb-2">Immutable</h5>
          <p className="text-sm text-gray-600">
            Once added, blocks cannot be deleted or modified - permanent records
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
