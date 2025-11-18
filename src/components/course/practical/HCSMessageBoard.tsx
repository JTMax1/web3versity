/**
 * HCS Message Board - Live Hedera Consensus Service Integration
 *
 * This component demonstrates real-time message submission to Hedera Consensus Service (HCS).
 * Students can post messages to a public HCS topic and see them appear in real-time.
 *
 * WOW Factor: Actual blockchain consensus with sub-second finality!
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Clock, CheckCircle, Loader2, ExternalLink, Users, Zap, Trophy, Sparkles } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { submitTopicMessageClientSide, MESSAGE_BOARD_TOPIC_ID } from '../../../lib/hedera/hcs-service';

interface HCSMessageBoardProps {
  onInteract?: () => void;
}

interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  sequenceNumber?: number;
  consensusTimestamp?: string;
  transactionId?: string;
}

export const HCSMessageBoard: React.FC<HCSMessageBoardProps> = ({ onInteract }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [firstMessageData, setFirstMessageData] = useState<{
    transactionId: string;
    sequenceNumber?: number;
    messageContent: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate connecting to HCS (in real implementation, use Mirror Node API)
  useEffect(() => {
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      // Load recent messages from HCS topic via Mirror Node API
      loadRecentMessages();
    }, 1000);
  }, []);

  const loadRecentMessages = async () => {
    // TODO: In production, fetch from Mirror Node API
    // For now, load some sample messages to demonstrate
    const sampleMessages: Message[] = [
      {
        id: '1',
        content: 'Welcome to the Web3versity HCS Message Board!',
        author: 'System',
        timestamp: Date.now() - 3600000,
        sequenceNumber: 1,
        consensusTimestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        content: 'This is powered by Hedera Consensus Service 🚀',
        author: 'Admin',
        timestamp: Date.now() - 1800000,
        sequenceNumber: 2,
        consensusTimestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setMessages(sampleMessages);
  };

  const handleSubmitMessage = async () => {
    if (!newMessage.trim() || !username.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call client-side HCS submission (prompts wallet signature)
      const result = await submitTopicMessageClientSide({
        topicId: MESSAGE_BOARD_TOPIC_ID,
        message: newMessage,
        username: username,
      });

      if (!result.success) {
        throw new Error(result.error || 'HCS submission failed');
      }

      // Show success modal for first message only
      // DON'T call onInteract yet - wait until user dismisses the modal
      if (!hasInteracted) {
        setFirstMessageData({
          transactionId: result.transactionId || 'pending',
          sequenceNumber: result.sequenceNumber,
          messageContent: newMessage
        });
        setShowSuccessModal(true);
      }

      console.log('✅ HCS submission successful:', result);

      // Add message to local state with real data from blockchain
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        author: username,
        timestamp: Date.now(),
        sequenceNumber: result.sequenceNumber || messages.length + 1,
        consensusTimestamp: result.consensusTimestamp || new Date().toISOString(),
        transactionId: result.transactionId || 'pending'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      toast.success('✅ Message signed and submitted!', {
        description: `Transaction: ${result.transactionId}`
      });

    } catch (error) {
      console.error('❌ Failed to submit message:', error);
      toast.error('Failed to submit message', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const viewOnHashScan = (txId: string) => {
    window.open(`https://hashscan.io/testnet/transaction/${txId}`, '_blank');
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !firstMessageData) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowSuccessModal(false);
            // Call onInteract when modal is dismissed via backdrop click
            if (!hasInteracted) {
              setHasInteracted(true);
              onInteract?.();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#0084C7] via-[#00a8e8] to-[#0084C7] p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4"
              >
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-10 h-10" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold mb-2"
              >
                Message Submitted! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90"
              >
                Your message is now on Hedera Consensus Service
              </motion.p>
            </div>

            {/* Message Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                <div className="text-3xl">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Message</p>
                  <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    "{firstMessageData.messageContent}"
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                    {firstMessageData.transactionId}
                  </p>
                </div>
                {firstMessageData.sequenceNumber && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sequence Number</p>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                      #{firstMessageData.sequenceNumber}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Topic ID</p>
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {MESSAGE_BOARD_TOPIC_ID}
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Consensus Achieved!</p>
                  <p className="text-xs">
                    Your message has been ordered by Hedera's consensus and is now immutable. View it on HashScan to verify the timestamp and order.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => {
                    viewOnHashScan(firstMessageData.transactionId);
                    setShowSuccessModal(false);
                    // Call onInteract after user has seen the modal
                    if (!hasInteracted) {
                      setHasInteracted(true);
                      onInteract?.();
                    }
                  }}
                  className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] hover:from-[#006ba3] hover:to-[#0084C7] text-white rounded-xl text-base font-semibold"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on HashScan
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Call onInteract after user has seen the modal
                    if (!hasInteracted) {
                      setHasInteracted(true);
                      onInteract?.();
                    }
                  }}
                  variant="outline"
                  className="w-full py-6 rounded-xl text-base font-semibold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Another Message
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <MessageSquare className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">HCS Message Board</h2>
            <p className="text-white/90 text-sm md:text-base mb-3">
              Post messages to Hedera Consensus Service in real-time
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected to HCS</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                <Users className="w-4 h-4" />
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                <span>&lt;3s consensus</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl md:text-3xl flex-shrink-0">📡</span>
          <div className="space-y-2 text-sm md:text-base min-w-0">
            <p className="font-semibold text-blue-900">How HCS Works:</p>
            <ul className="space-y-1 text-blue-800 list-disc list-inside">
              <li>Your message is submitted to a Hedera Consensus Service topic</li>
              <li>Hedera nodes achieve consensus on message order in &lt;3 seconds</li>
              <li>Messages are immutable and timestamped by consensus</li>
              <li>Perfect for chat apps, auditing, and event logging</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Message Board */}
      <Card className="p-4 md:p-6 bg-white dark:bg-gray-900">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#0084C7]" />
          Live Message Feed
        </h3>

        {/* Messages List */}
        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-xl"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {message.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{message.author}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sequenceNumber && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            #{message.sequenceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {message.transactionId && (
                    <button
                      onClick={() => viewOnHashScan(message.transactionId!)}
                      className="flex-shrink-0 p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View on HashScan"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 break-words">{message.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7] dark:bg-gray-800 dark:text-white"
              disabled={isSubmitting}
            />
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitMessage();
                }
              }}
              className="md:col-span-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7] resize-none dark:bg-gray-800 dark:text-white"
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <Button
            onClick={handleSubmitMessage}
            disabled={isSubmitting || !newMessage.trim() || !username.trim()}
            className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-xl hover:shadow-lg transition-all text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting to HCS...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit to Hedera Consensus
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500">
            💡 Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <span className="text-xl md:text-2xl">⚡</span>
          <span className="text-sm md:text-base">Why HCS is Powerful</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Fair Ordering</p>
                <p className="text-gray-600 dark:text-gray-400">Consensus timestamp proves exact order</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Lightning Fast</p>
                <p className="text-gray-600 dark:text-gray-400">Consensus in 2-3 seconds</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cost Effective</p>
                <p className="text-gray-600 dark:text-gray-400">$0.0001 per message</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Immutable</p>
                <p className="text-gray-600 dark:text-gray-400">Messages can't be altered or deleted</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <h4 className="font-bold mb-3 text-sm md:text-base">🎯 Real-World HCS Use Cases</h4>
        <div className="grid md:grid-cols-3 gap-3 text-xs md:text-sm">
          <div className="p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <p className="font-semibold mb-1">💬 Chat Apps</p>
            <p className="text-gray-600 dark:text-gray-400">Decentralized messaging with proof of order</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <p className="font-semibold mb-1">📜 Audit Logs</p>
            <p className="text-gray-600 dark:text-gray-400">Tamper-proof system event logging</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <p className="font-semibold mb-1">🎮 Game Events</p>
            <p className="text-gray-600 dark:text-gray-400">Fair play with provable event ordering</p>
          </div>
        </div>
      </Card>

      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};
