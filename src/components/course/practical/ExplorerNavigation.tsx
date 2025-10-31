/**
 * Explorer Navigation Component
 *
 * Interactive tutorial for navigating HashScan blockchain explorer.
 * Students complete challenges to find specific data on the real testnet explorer.
 *
 * WOW Factor: Gamified blockchain explorer mastery!
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass, Search, CheckCircle, ExternalLink, Trophy, Target,
  Eye, FileText, Coins, Users, Clock, ArrowRight, Zap, Star,
  Loader2, AlertCircle, Award
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface ExplorerNavigationProps {
  onInteract?: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  task: string;
  hint: string;
  verificationPrompt: string;
  hashscanUrl: string;
  completed: boolean;
}

const HASHSCAN_BASE = 'https://hashscan.io/testnet';

const CHALLENGES: Challenge[] = [
  {
    id: 'find-account',
    title: 'Find an Account',
    description: 'Locate a specific Hedera account and view its balance',
    icon: <Users className="w-5 h-5" />,
    difficulty: 'easy',
    points: 10,
    task: 'Find account 0.0.4827364 and check its HBAR balance',
    hint: 'Use the search bar at the top of HashScan. Paste the account ID and press Enter.',
    verificationPrompt: 'Did you find the account balance?',
    hashscanUrl: `${HASHSCAN_BASE}/account/0.0.4827364`,
    completed: false,
  },
  {
    id: 'view-transaction',
    title: 'View Transaction Details',
    description: 'Find a transaction and identify the sender and receiver',
    icon: <FileText className="w-5 h-5" />,
    difficulty: 'easy',
    points: 10,
    task: 'Search for any recent transaction and identify who sent HBAR to whom',
    hint: 'Click on "Transactions" in the top menu, then click on any transaction ID to see details.',
    verificationPrompt: 'Did you see the transaction details including sender, receiver, and amount?',
    hashscanUrl: `${HASHSCAN_BASE}/transactions`,
    completed: false,
  },
  {
    id: 'track-token',
    title: 'Track a Token',
    description: 'Find a Hedera Token Service (HTS) token and view its details',
    icon: <Coins className="w-5 h-5" />,
    difficulty: 'medium',
    points: 20,
    task: 'Navigate to the Tokens section and explore any HTS token',
    hint: 'Click "Tokens" in the main menu. Browse the list and click on any token to see its details.',
    verificationPrompt: 'Did you find the token details including supply and holders?',
    hashscanUrl: `${HASHSCAN_BASE}/tokens`,
    completed: false,
  },
  {
    id: 'consensus-time',
    title: 'Understand Consensus Timestamp',
    description: 'Find the consensus timestamp of a recent transaction',
    icon: <Clock className="w-5 h-5" />,
    difficulty: 'medium',
    points: 20,
    task: 'Find any transaction and note its consensus timestamp',
    hint: 'Transaction details page shows the consensus timestamp - it looks like: 1234567890.123456789',
    verificationPrompt: 'Did you find the consensus timestamp?',
    hashscanUrl: `${HASHSCAN_BASE}/transactions`,
    completed: false,
  },
  {
    id: 'trace-flow',
    title: 'Trace Transaction Flow',
    description: 'Follow a chain of transactions between multiple accounts',
    icon: <Target className="w-5 h-5" />,
    difficulty: 'hard',
    points: 30,
    task: 'Pick an account, find a transaction it sent, then click the recipient and view their transactions',
    hint: 'Start with any account → Click a transaction → Click the recipient account → View their transaction history',
    verificationPrompt: 'Did you successfully trace transactions through multiple accounts?',
    hashscanUrl: `${HASHSCAN_BASE}/account/0.0.4827364`,
    completed: false,
  },
  {
    id: 'smart-contract',
    title: 'Explore Smart Contract',
    description: 'Find a deployed smart contract and view its bytecode',
    icon: <FileText className="w-5 h-5" />,
    difficulty: 'hard',
    points: 30,
    task: 'Navigate to Contracts section and explore any deployed smart contract',
    hint: 'Click "Contracts" in the menu. Click on any contract to see its details and bytecode.',
    verificationPrompt: 'Did you find the smart contract details?',
    hashscanUrl: `${HASHSCAN_BASE}/contracts`,
    completed: false,
  },
];

export const ExplorerNavigation: React.FC<ExplorerNavigationProps> = ({ onInteract }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);
  const earnedPoints = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);
  const completedCount = challenges.filter(c => c.completed).length;

  /**
   * Start a challenge
   */
  const handleStartChallenge = (challenge: Challenge) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }

    setActiveChallenge(challenge);
    setShowHint(false);

    // Open HashScan in new tab
    window.open(challenge.hashscanUrl, '_blank');
    toast.success('HashScan opened! Complete the task and return here.');
  };

  /**
   * Mark challenge as complete
   */
  const handleCompleteChallenge = () => {
    if (!activeChallenge) return;

    const updatedChallenges = challenges.map(c =>
      c.id === activeChallenge.id ? { ...c, completed: true } : c
    );

    setChallenges(updatedChallenges);
    toast.success(`+${activeChallenge.points} points! Challenge completed! 🎉`);
    setActiveChallenge(null);
    setShowHint(false);
  };

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  // Challenge detail modal
  if (activeChallenge) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeChallenge.icon}
            </div>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium border-2 mb-3 ${getDifficultyColor(activeChallenge.difficulty)}`}>
              {activeChallenge.difficulty.toUpperCase()} • {activeChallenge.points} points
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeChallenge.title}</h2>
            <p className="text-gray-600 text-lg">{activeChallenge.description}</p>
          </div>

          {/* Task Card */}
          <Card className="p-6 mb-6 bg-white border-2 border-blue-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-900">
              <Target className="w-5 h-5" />
              Your Task
            </h3>
            <p className="text-gray-700 mb-4">{activeChallenge.task}</p>
            <Button
              onClick={() => window.open(activeChallenge.hashscanUrl, '_blank')}
              variant="outline"
              className="w-full border-2 border-blue-200 hover:border-blue-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open HashScan Explorer
            </Button>
          </Card>

          {/* Hint Section */}
          <Card className="p-6 mb-6 bg-yellow-50 border-2 border-yellow-200">
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Need a Hint?
              </h3>
              <ArrowRight className={`w-5 h-5 text-yellow-600 transition-transform ${showHint ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-yellow-300"
                >
                  <p className="text-gray-700">{activeChallenge.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Verification */}
          <Card className="p-6 mb-6 bg-green-50 border-2 border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {activeChallenge.verificationPrompt}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you've completed this task on HashScan, click the button below to mark it as complete.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleCompleteChallenge}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Yes, I Completed It!
              </Button>
              <Button
                onClick={() => setActiveChallenge(null)}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main challenge selection screen
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">HashScan Explorer Mastery</h2>
          <p className="text-gray-600 text-lg mb-4">
            Complete challenges to master blockchain explorer navigation
          </p>

          {/* Progress Stats */}
          <div className="flex justify-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{completedCount}/{challenges.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="w-px bg-gray-300"></div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{earnedPoints}/{totalPoints}</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedPoints / totalPoints) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            />
          </div>
        </div>

        {/* Completion Message */}
        {completedCount === challenges.length && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">🎉 All Challenges Complete!</h3>
                  <p className="text-gray-700">
                    You've mastered HashScan navigation! You earned {totalPoints} points.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`p-6 relative overflow-hidden transition-all ${
                challenge.completed
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-white border-2 border-gray-100 hover:border-blue-300'
              }`}
            >
              {/* Completed Badge */}
              {challenge.completed && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Challenge Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                challenge.completed
                  ? 'bg-green-200 text-green-700'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {challenge.icon}
              </div>

              {/* Challenge Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{challenge.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">{challenge.points} points</span>
                </div>
              </div>

              {/* Action Button */}
              {!challenge.completed && (
                <Button
                  onClick={() => handleStartChallenge(challenge)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Start Challenge
                </Button>
              )}

              {challenge.completed && (
                <div className="text-center py-2 text-green-700 font-semibold">
                  ✓ Completed
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Tips Card */}
        <Card className="mt-8 p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Explorer Navigation Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use the search bar at the top to find accounts, transactions, or tokens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click on any account ID or transaction ID to see detailed information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Transaction details show consensus timestamps in nanoseconds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You can trace transaction flows by clicking through accounts</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
