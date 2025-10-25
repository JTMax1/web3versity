import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Clock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Node {
  id: number;
  name: string;
  hasTransaction: boolean;
  confirmations: number;
}

interface Transaction {
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirming' | 'confirmed';
  confirmations: number;
}

interface TransactionSimulatorProps {
  onInteract?: () => void;
}

export const TransactionSimulator: React.FC<TransactionSimulatorProps> = ({ onInteract }) => {
  const [sender, setSender] = useState('Amina (Lagos)');
  const [receiver, setReceiver] = useState('Kwame (Accra)');
  const [amount, setAmount] = useState('500');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, name: 'Node 1 🇳🇬', hasTransaction: false, confirmations: 0 },
    { id: 2, name: 'Node 2 🇰🇪', hasTransaction: false, confirmations: 0 },
    { id: 3, name: 'Node 3 🇿🇦', hasTransaction: false, confirmations: 0 },
    { id: 4, name: 'Node 4 🇬🇭', hasTransaction: false, confirmations: 0 },
    { id: 5, name: 'Node 5 🇪🇬', hasTransaction: false, confirmations: 0 }
  ]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [step, setStep] = useState<'form' | 'broadcasting' | 'confirming' | 'confirmed'>('form');

  const africanPairs = [
    { sender: 'Amina (Lagos)', receiver: 'Kwame (Accra)' },
    { sender: 'Fatima (Nairobi)', receiver: 'Chidi (Johannesburg)' },
    { sender: 'Jabari (Cairo)', receiver: 'Zanele (Cape Town)' },
    { sender: 'Kofi (Kumasi)', receiver: 'Amara (Kigali)' }
  ];

  useEffect(() => {
    if (step === 'broadcasting') {
      // Simulate broadcasting to nodes
      const timer = setTimeout(() => {
        const updatedNodes = nodes.map((node, index) => ({
          ...node,
          hasTransaction: true,
          confirmations: 0
        }));
        setNodes(updatedNodes);
        setStep('confirming');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (step === 'confirming' && transaction) {
      // Simulate gradual confirmations
      const interval = setInterval(() => {
        setNodes(prevNodes => {
          const updatedNodes = prevNodes.map(node => {
            if (node.hasTransaction && node.confirmations < 5) {
              return { ...node, confirmations: node.confirmations + 1 };
            }
            return node;
          });

          // Check if all nodes have confirmed
          const allConfirmed = updatedNodes.every(node => node.confirmations >= 5);
          if (allConfirmed) {
            setTransaction(prev => prev ? { ...prev, status: 'confirmed', confirmations: 5 } : null);
            setStep('confirmed');
          }

          return updatedNodes;
        });

        setTransaction(prev => {
          if (prev && prev.confirmations < 5) {
            return { ...prev, confirmations: prev.confirmations + 1, status: 'confirming' };
          }
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [step, transaction]);

  const sendTransaction = () => {
    if (!sender || !receiver || !amount) return;

    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    setTransaction({
      from: sender,
      to: receiver,
      amount,
      status: 'pending',
      confirmations: 0
    });
    setStep('broadcasting');
  };

  const reset = () => {
    setTransaction(null);
    setNodes(nodes.map(node => ({ ...node, hasTransaction: false, confirmations: 0 })));
    setStep('form');
  };

  const useRandomPair = () => {
    const pair = africanPairs[Math.floor(Math.random() * africanPairs.length)];
    setSender(pair.sender);
    setReceiver(pair.receiver);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Send className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <h2 className="text-xl md:text-2xl font-bold">Transaction Simulator</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              See how a blockchain transaction travels across the network
            </p>
          </div>

          {/* What You'll Learn */}
          <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
            <h4 className="font-semibold mb-2 text-sm md:text-base">💡 What Happens When You Send Money:</h4>
            <ul className="space-y-1 text-xs md:text-sm list-disc list-inside">
              <li>Your transaction is sent to multiple network nodes (computers)</li>
              <li>Each node verifies and confirms the transaction independently</li>
              <li>Once enough nodes agree (consensus), the transaction is final</li>
              <li>No single person or bank controls this - it's decentralized!</li>
            </ul>
          </Card>

          {/* Transaction Form */}
          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Card className="p-4 md:p-6 bg-white dark:bg-gray-900">
                <h4 className="font-semibold mb-4 text-sm md:text-base">📤 Send a Transaction</h4>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs md:text-sm mb-2 text-muted-foreground">From (Sender)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={sender}
                          onChange={(e) => setSender(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 md:py-3 border-2 rounded-lg focus:outline-none focus:border-blue-600 text-sm md:text-base"
                          placeholder="Enter sender name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm mb-2 text-muted-foreground">To (Receiver)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={receiver}
                          onChange={(e) => setReceiver(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 md:py-3 border-2 rounded-lg focus:outline-none focus:border-blue-600 text-sm md:text-base"
                          placeholder="Enter receiver name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm mb-2 text-muted-foreground">Amount (in Naira)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 md:py-3 border-2 rounded-lg focus:outline-none focus:border-blue-600 text-sm md:text-base"
                      placeholder="Enter amount"
                      min="1"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={sendTransaction}
                      disabled={!sender || !receiver || !amount}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Transaction
                    </Button>
                    <Button onClick={useRandomPair} variant="outline" className="sm:w-auto">
                      Use Example
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Transaction Status */}
          {transaction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Transaction Card */}
              <Card className={`p-4 md:p-6 ${
                transaction.status === 'confirmed'
                  ? 'bg-green-50 dark:bg-green-950/20 border-2 border-green-500'
                  : 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-semibold text-sm md:text-base">Transaction Details</h4>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm ${
                      transaction.status === 'confirmed'
                        ? 'bg-green-500 text-white'
                        : transaction.status === 'confirming'
                        ? 'bg-blue-500 text-white'
                        : 'bg-orange-500 text-white'
                    }`}>
                      {transaction.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                      {transaction.status === 'confirming' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {transaction.status === 'pending' && <Clock className="w-4 h-4" />}
                      <span className="capitalize">{transaction.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm">
                    <div>
                      <span className="text-muted-foreground">From:</span>
                      <p className="font-semibold">{transaction.from}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To:</span>
                      <p className="font-semibold">{transaction.to}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-semibold">₦{transaction.amount}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 text-xs md:text-sm">
                      <span className="text-muted-foreground">Confirmations:</span>
                      <span className="font-bold">{transaction.confirmations}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 md:h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(transaction.confirmations / 5) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Network Nodes */}
              <Card className="p-4 md:p-6 bg-white dark:bg-gray-900">
                <h4 className="font-semibold mb-4 text-sm md:text-base">🌍 Network Nodes Verifying Your Transaction</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {nodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: node.hasTransaction ? [1, 1.1, 1] : 1
                      }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <Card className={`p-3 md:p-4 text-center transition-all ${
                        node.hasTransaction
                          ? node.confirmations >= 5
                            ? 'bg-green-100 dark:bg-green-950/30 border-2 border-green-500'
                            : 'bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300'
                      }`}>
                        <div className="text-2xl md:text-3xl mb-2">
                          {node.hasTransaction ? (node.confirmations >= 5 ? '✅' : '⏳') : '⚪'}
                        </div>
                        <div className="text-xs md:text-sm font-semibold mb-1">{node.name}</div>
                        {node.hasTransaction && (
                          <div className="text-xs text-muted-foreground">
                            {node.confirmations}/5 confirms
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Explanation based on step */}
              {step === 'broadcasting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-xs md:text-sm">
                      📡 <strong>Broadcasting...</strong> Your transaction is being sent to all network nodes across Africa. Each node will verify it independently.
                    </p>
                  </Card>
                </motion.div>
              )}

              {step === 'confirming' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-xs md:text-sm">
                      ⏳ <strong>Confirming...</strong> Network nodes are verifying your transaction. They're checking: Does {sender} have enough money? Is this transaction valid? Once 5 nodes confirm, it's final!
                    </p>
                  </Card>
                </motion.div>
              )}

              {step === 'confirmed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-4 md:p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-500">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm md:text-base text-green-600">✅ Transaction Confirmed!</h4>
                          <p className="text-xs md:text-sm mt-2">
                            {receiver} has received ₦{amount} from {sender}. This transaction is now permanent and cannot be reversed or changed!
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg">
                        <p className="text-xs md:text-sm">
                          <strong>🇰🇪 Real-World Example:</strong> This is similar to M-Pesa, but with one BIG difference: No company (like Safaricom) controls this. The network of nodes verified your transaction together. No single company can freeze your account or reverse payments!
                        </p>
                      </div>
                      <Button onClick={reset} className="w-full">
                        Send Another Transaction
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Key Takeaways */}
          <Card className="p-4 md:p-6 bg-purple-50/50 dark:bg-purple-950/20">
            <h4 className="font-semibold mb-3 text-sm md:text-base">🔑 Key Takeaways:</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex gap-2">
                <span>✅</span>
                <span>Transactions are broadcast to multiple nodes (computers) worldwide</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Each node independently verifies the transaction</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Multiple confirmations make the transaction secure and final</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>No single bank or company controls this process</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Once confirmed, the transaction cannot be reversed or changed</span>
              </li>
            </ul>
          </Card>
        </div>
      </Card>
    </div>
  );
};
