/**
 * Transaction Detective Component
 *
 * Gamified blockchain forensics - solve mysteries by analyzing real testnet transactions.
 * Students trace transaction flows, identify patterns, and solve crypto puzzles.
 *
 * WOW Factor: Be a blockchain detective solving real mysteries!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Eye, TrendingUp, AlertCircle, CheckCircle, ExternalLink,
  Target, Zap, Award, ArrowRight, Clock, Shield, FileText, Loader2,
  Lock, Unlock, ChevronRight
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface TransactionDetectiveProps {
  onInteract?: () => void;
}

interface Case {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  story: string;
  objective: string;
  clues: string[];
  startingAccount: string;
  questions: CaseQuestion[];
  unlocked: boolean;
  completed: boolean;
}

interface CaseQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text_input' | 'account_id';
  options?: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}

const HASHSCAN_BASE = 'https://hashscan.io/testnet';
const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

const CASES: Case[] = [
  {
    id: 'case-1',
    title: 'The Missing HBAR',
    difficulty: 'beginner',
    points: 50,
    story: 'A user claims they sent 100 HBAR to account 0.0.4827365 but the recipient says they never received it. Your mission: Find out what happened!',
    objective: 'Investigate the transaction history and determine if the transfer was successful.',
    clues: [
      'The sender\'s account ID is 0.0.4827364',
      'The transaction was supposed to happen in the last 24 hours',
      'Check both sender and receiver transaction history'
    ],
    startingAccount: '0.0.4827364',
    questions: [
      {
        id: 'q1',
        question: 'Was the transaction successful?',
        type: 'multiple_choice',
        options: ['Yes, transaction was successful', 'No, transaction failed', 'Transaction not found'],
        correctAnswer: 'Yes, transaction was successful',
        hint: 'Look at the transaction status in the transaction details',
        explanation: 'The transaction shows as SUCCESS in the transaction details on HashScan.'
      },
      {
        id: 'q2',
        question: 'What could be the reason the recipient didn\'t see the funds?',
        type: 'multiple_choice',
        options: [
          'Wrong account ID was used',
          'Recipient is looking at mainnet instead of testnet',
          'Transaction is still pending',
          'Funds were sent but need time to appear'
        ],
        correctAnswer: 'Recipient is looking at mainnet instead of testnet',
        hint: 'Check which network you\'re investigating',
        explanation: 'Common mistake: the recipient was checking mainnet HashScan instead of testnet!'
      }
    ],
    unlocked: true,
    completed: false,
  },
  {
    id: 'case-2',
    title: 'The Suspicious Pattern',
    difficulty: 'intermediate',
    points: 100,
    story: 'Multiple small transactions are being sent from one account in rapid succession. Is this normal activity or something suspicious?',
    objective: 'Analyze the transaction pattern and identify whether this is legitimate activity.',
    clues: [
      'Look at the frequency of transactions',
      'Check the amounts being transferred',
      'Examine the recipient accounts'
    ],
    startingAccount: '0.0.4827366',
    questions: [
      {
        id: 'q1',
        question: 'What pattern do you observe in the transactions?',
        type: 'multiple_choice',
        options: [
          'Random transfers to different accounts',
          'Regular small transfers to the same account',
          'Large transfers followed by many small ones',
          'Alternating send and receive pattern'
        ],
        correctAnswer: 'Regular small transfers to the same account',
        hint: 'Look at the transaction history chronologically',
        explanation: 'The account shows a pattern of regular small transfers - this could be an automated payment system or bot.'
      },
      {
        id: 'q2',
        question: 'Based on the pattern, what is the most likely explanation?',
        type: 'multiple_choice',
        options: [
          'Malicious activity - likely a hack',
          'Automated payment system (e.g., subscription)',
          'Manual testing by a developer',
          'Random user behavior'
        ],
        correctAnswer: 'Automated payment system (e.g., subscription)',
        hint: 'Think about what would cause regular, consistent transfers',
        explanation: 'The regular interval and consistent amounts suggest an automated system, possibly a subscription or recurring payment.'
      }
    ],
    unlocked: false,
    completed: false,
  },
  {
    id: 'case-3',
    title: 'The Token Trail',
    difficulty: 'advanced',
    points: 150,
    story: 'A valuable NFT was minted, transferred between several accounts, and then disappeared. Track down where it ended up!',
    objective: 'Follow the NFT through multiple transfers to find its current owner.',
    clues: [
      'Start with the token creation transaction',
      'NFT transfers show as token transfers in HashScan',
      'Follow the trail through at least 3 accounts'
    ],
    startingAccount: '0.0.4827367',
    questions: [
      {
        id: 'q1',
        question: 'How many accounts did the NFT pass through?',
        type: 'multiple_choice',
        options: ['2 accounts', '3 accounts', '4 accounts', '5 or more accounts'],
        correctAnswer: '3 accounts',
        hint: 'Count each unique account that received the NFT',
        explanation: 'The NFT was transferred through 3 different accounts before reaching its current owner.'
      },
      {
        id: 'q2',
        question: 'What is the current owner\'s account ID?',
        type: 'account_id',
        correctAnswer: '0.0.4827370',
        hint: 'Look at the most recent token transfer - who received it?',
        explanation: 'By following the transfer chain, we can see the NFT is currently held by account 0.0.4827370.'
      }
    ],
    unlocked: false,
    completed: false,
  },
];

export const TransactionDetective: React.FC<TransactionDetectiveProps> = ({ onInteract }) => {
  const [cases, setCases] = useState<Case[]>(CASES);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const totalPoints = cases.reduce((sum, c) => sum + c.points, 0);
  const earnedPoints = cases.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);
  const completedCount = cases.filter(c => c.completed).length;

  /**
   * Start investigating a case
   */
  const handleStartCase = (caseItem: Case) => {
    if (!caseItem.unlocked) {
      toast.error('Complete previous cases to unlock this one');
      return;
    }

    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }

    setActiveCase(caseItem);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowHint(false);
    setIsInvestigating(true);

    // Open HashScan to starting account
    window.open(`${HASHSCAN_BASE}/account/${caseItem.startingAccount}`, '_blank');
    toast.success('Case file opened! Start your investigation on HashScan.');
  };

  /**
   * Submit an answer for the current question
   */
  const handleSubmitAnswer = (answer: string) => {
    if (!activeCase) return;

    const currentQuestion = activeCase.questions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    if (isCorrect) {
      toast.success('Correct! ' + currentQuestion.explanation);

      // Move to next question or complete case
      if (currentQuestionIndex < activeCase.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowHint(false);
        }, 1500);
      } else {
        // Case completed!
        setTimeout(() => {
          handleCompleteCase();
        }, 1500);
      }
    } else {
      toast.error('Not quite right. Try again or check the hint!');
    }
  };

  /**
   * Complete a case
   */
  const handleCompleteCase = () => {
    if (!activeCase) return;

    const updatedCases = cases.map((c, index) => {
      if (c.id === activeCase.id) {
        return { ...c, completed: true };
      }
      // Unlock next case
      if (index === cases.findIndex(c2 => c2.id === activeCase.id) + 1) {
        return { ...c, unlocked: true };
      }
      return c;
    });

    setCases(updatedCases);
    toast.success(`Case solved! +${activeCase.points} points! 🎉`);
    setActiveCase(null);
    setIsInvestigating(false);
  };

  /**
   * Get difficulty badge color
   */
  const getDifficultyColor = (difficulty: Case['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  // Active case investigation view
  if (activeCase && isInvestigating) {
    const currentQuestion = activeCase.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeCase.questions.length) * 100;

    return (
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium border-2 ${getDifficultyColor(activeCase.difficulty)}`}>
                {activeCase.difficulty.toUpperCase()} CASE
              </span>
              <span className="text-sm text-gray-400">
                Question {currentQuestionIndex + 1} of {activeCase.questions.length}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{activeCase.title}</h2>
            <p className="text-gray-400">{activeCase.story}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            </div>
          </div>

          {/* Case Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 bg-gray-800 border-2 border-gray-700">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-blue-400" />
                Objective
              </h3>
              <p className="text-gray-300 text-sm">{activeCase.objective}</p>
            </Card>

            <Card className="p-6 bg-gray-800 border-2 border-gray-700">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-yellow-400" />
                Starting Point
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-mono text-sm">{activeCase.startingAccount}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`${HASHSCAN_BASE}/account/${activeCase.startingAccount}`, '_blank')}
                  className="border-gray-600 hover:border-gray-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Clues */}
          <Card className="p-6 mb-8 bg-blue-900/30 border-2 border-blue-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-300">
              <Eye className="w-5 h-5" />
              Clues
            </h3>
            <ul className="space-y-2">
              {activeCase.clues.map((clue, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Current Question */}
          <Card className="p-8 mb-6 bg-gray-800 border-2 border-gray-700">
            <h3 className="text-xl font-bold mb-6 text-white">{currentQuestion.question}</h3>

            {/* Multiple Choice */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmitAnswer(option)}
                    className="w-full p-4 text-left bg-gray-700 hover:bg-gray-600 rounded-xl border-2 border-gray-600 hover:border-blue-500 transition-all"
                  >
                    <span className="text-white">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Text/Account ID Input */}
            {(currentQuestion.type === 'text_input' || currentQuestion.type === 'account_id') && (
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={currentQuestion.type === 'account_id' ? '0.0.xxxxx' : 'Your answer...'}
                  className="flex-1 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white font-mono"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitAnswer((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                    handleSubmitAnswer(input.value);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit
                </Button>
              </div>
            )}
          </Card>

          {/* Hint Section */}
          <Card className="p-6 bg-yellow-900/30 border-2 border-yellow-700">
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="font-semibold text-yellow-300 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Need a Hint?
              </h3>
              <ChevronRight className={`w-5 h-5 text-yellow-400 transition-transform ${showHint ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-yellow-700"
                >
                  <p className="text-gray-300">{currentQuestion.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    );
  }

  // Main case selection screen
  return (
    <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Transaction Detective</h2>
          <p className="text-gray-400 text-lg mb-4">
            Solve blockchain mysteries by investigating real testnet transactions
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-3xl font-bold text-blue-400">{completedCount}/{cases.length}</p>
              <p className="text-sm text-gray-400">Cases Solved</p>
            </div>
            <div className="w-px bg-gray-700"></div>
            <div>
              <p className="text-3xl font-bold text-purple-400">{earnedPoints}/{totalPoints}</p>
              <p className="text-sm text-gray-400">Points</p>
            </div>
          </div>
        </div>

        {/* Completion Banner */}
        {completedCount === cases.length && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-yellow-500 to-amber-500 border-2 border-yellow-400">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Master Detective!</h3>
                  <p className="text-gray-800">
                    You've solved all cases! You earned {totalPoints} points and mastered blockchain forensics.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Case Files */}
        <div className="space-y-4">
          {cases.map((caseItem, index) => (
            <Card
              key={caseItem.id}
              className={`p-6 transition-all ${
                caseItem.completed
                  ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600'
                  : caseItem.unlocked
                  ? 'bg-gray-800 border-2 border-gray-700 hover:border-blue-600'
                  : 'bg-gray-900 border-2 border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {caseItem.unlocked ? (
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{caseItem.title}</h3>
                        {caseItem.completed && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(caseItem.difficulty)}`}>
                          {caseItem.difficulty}
                        </span>
                        <span className="text-sm text-gray-400">{caseItem.points} points</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4">{caseItem.story}</p>

                  {caseItem.unlocked && !caseItem.completed && (
                    <Button
                      onClick={() => handleStartCase(caseItem)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Start Investigation
                    </Button>
                  )}

                  {caseItem.completed && (
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      Case Solved
                    </div>
                  )}

                  {!caseItem.unlocked && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-5 h-5" />
                      Complete previous cases to unlock
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="mt-8 p-6 bg-blue-900/30 border-2 border-blue-700">
          <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Detective Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Use HashScan to view detailed transaction information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Click on account IDs to trace transaction flows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Pay attention to timestamps and transaction ordering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Look for patterns in transaction amounts and frequency</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
