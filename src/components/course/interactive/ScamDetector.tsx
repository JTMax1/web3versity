import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface ScamScenario {
  id: number;
  title: string;
  description: string;
  isScam: boolean;
  redFlags: string[];
  explanation: string;
  imageEmoji: string;
}

const scenarios: ScamScenario[] = [
  {
    id: 1,
    title: 'WhatsApp Investment Group',
    description: 'A stranger adds you to a WhatsApp group promising 50% returns monthly on Bitcoin investments. They show screenshots of "successful" traders earning thousands. To join, you must first send 0.1 BTC to "activate" your account.',
    isScam: true,
    redFlags: [
      'Unsolicited contact from stranger',
      'Unrealistic returns (50% monthly = 14,000% yearly!)',
      'Requires payment upfront to "activate"',
      'Screenshots easily faked',
      'Pressure to act quickly'
    ],
    explanation: 'Classic advance-fee fraud adapted for crypto. Screenshots are fake, early "profits" come from new victims\' money. Once you send BTC, they disappear. Real investments never guarantee returns or require activation fees.',
    imageEmoji: '📱'
  },
  {
    id: 2,
    title: 'Hedera Support DM',
    description: 'You post in Hedera Discord about a wallet issue. Minutes later, "Hedera Support" DMs you saying they need your seed phrase to "fix the sync issue" on their backend.',
    isScam: true,
    redFlags: [
      'Real support NEVER DMs first',
      'Asking for seed phrase (NEVER share!)',
      'Creating urgency',
      'No official badge/verification',
      'Support happens in public channels'
    ],
    explanation: 'Extremely common scam! Real support never DMs first and NEVER asks for seed phrases. Once they have your seed phrase, they instantly drain your wallet. Always report and block.',
    imageEmoji: '🎣'
  },
  {
    id: 3,
    title: 'SaucerSwap DEX',
    description: 'You visit saucerswap.finance (official site) to swap HBAR for USDC. The site asks you to connect your wallet. You review the transaction which shows swapping 10 HBAR for approximately 0.8 USDC.',
    isScam: false,
    redFlags: [],
    explanation: 'This is legitimate! SaucerSwap is Hedera\'s official DEX. Connecting wallet to known, verified dApps is normal. The transaction clearly shows what you\'re swapping. Always verify URLs match official links.',
    imageEmoji: '✅'
  },
  {
    id: 4,
    title: 'Elon Musk Twitter Giveaway',
    description: 'A Twitter account that looks like Elon Musk tweets: "To celebrate 1M followers, I\'m giving back! Send 0.5-2 ETH to this address and I\'ll send back 2-10 ETH! Only for 30 minutes!" The account has a blue checkmark.',
    isScam: true,
    redFlags: [
      'Asking you to send crypto first',
      'Too good to be true',
      'Time pressure (30 minutes)',
      'Even with checkmark, check carefully - could be impersonation',
      'Real giveaways never require payment'
    ],
    explanation: 'Classic doubling scam! The account is fake (similar username, bought verification). Real figures never ask you to send crypto first. Even with 1000 replies saying "I got mine!", all are bots.',
    imageEmoji: '🎁'
  },
  {
    id: 5,
    title: 'HashPack Wallet Download',
    description: 'You search "HashPack wallet" on Google. The first result (an ad) takes you to hashpack-wallet.download. The site looks professional and offers "Enhanced HashPack with 2x staking rewards".',
    isScam: true,
    redFlags: [
      'Domain is hashpack-wallet.download not hashpack.app',
      'Google ad (scammers pay for top spot)',
      'Promises "enhanced" version with better rewards',
      'Real wallet is at hashpack.app',
      'Fake wallet will steal your seed phrase'
    ],
    explanation: 'Malicious wallet clone! Fake wallet looks real but steals your seed phrase when you create/import wallet. Always verify URL! Bookmark real sites. HashPack is at hashpack.app only.',
    imageEmoji: '🎭'
  },
  {
    id: 6,
    title: 'Binance Official Announcement',
    description: 'Binance\'s verified Twitter account announces new staking program. You log into binance.com (correct URL), navigate to Staking section, and see the program listed. APY is 5-8% for various coins.',
    isScam: false,
    redFlags: [],
    explanation: 'Legitimate! You verified it\'s the real Twitter account, navigated to official website (not clicked a link), and the returns are realistic (5-8% is normal for staking). This is how you should verify opportunities.',
    imageEmoji: '✅'
  },
  {
    id: 7,
    title: 'Romance Scam Crypto Help',
    description: 'You\'ve been chatting with someone on a dating app for 2 months. They seem perfect! Now they mention a "crypto emergency" - their exchange account is frozen with $50k. They need you to send 1 ETH to "verify" their identity to unlock it. They promise to pay you back double.',
    isScam: true,
    redFlags: [
      'Romance + crypto = red flag combination',
      'Haven\'t met in person after 2 months',
      'Sudden financial emergency',
      'Exchange doesn\'t "verify" with other people\'s crypto',
      'Promise to pay back double'
    ],
    explanation: 'Romance scam! They build emotional connection over weeks/months, then create urgent financial need. No exchange requires someone else to send crypto. Once you send, they disappear. Very common, very devastating.',
    imageEmoji: '💔'
  },
  {
    id: 8,
    title: 'University Degree Verification',
    description: 'A Ghanaian university announces they\'re issuing digital degree certificates on Hedera blockchain. You pay your graduation fee through normal university channels. Later, you receive an email from university.edu.gh address with instructions to claim your NFT degree certificate.',
    isScam: false,
    redFlags: [],
    explanation: 'Legitimate blockchain use case! Educational institutions are adopting blockchain credentials. You paid through official channels and email is from official university domain. This represents proper Web3 adoption.',
    imageEmoji: '🎓'
  }
];

interface ScamDetectorProps {
  onInteract?: () => void;
}

export const ScamDetector: React.FC<ScamDetectorProps> = ({ onInteract }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameComplete, setGameComplete] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const scenario = scenarios[currentScenario];

  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setShowExplanation(true);

    // Call onInteract on first answer
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    const isCorrect = answer === scenario.isScam;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setUserAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentScenario(0);
    setUserAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-6"
      >
        <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          {passed ? (
            <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          ) : (
            <AlertTriangle className="w-20 h-20 mx-auto text-orange-600" />
          )}
          
          <div>
            <h2 className="text-3xl mb-2">
              {passed ? 'Scam Detector Expert!' : 'Keep Learning!'}
            </h2>
            <p className="text-6xl font-bold text-primary my-4">{percentage}%</p>
            <p className="text-xl">
              You correctly identified {score.correct} out of {score.total} scenarios
            </p>
          </div>

          <div className="space-y-2 text-left p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <h4>🎓 Your Scam Protection Level:</h4>
            {percentage >= 90 && (
              <p className="text-green-600">🛡️ Expert - You're well-protected!</p>
            )}
            {percentage >= 70 && percentage < 90 && (
              <p className="text-blue-600">👍 Good - Keep practicing!</p>
            )}
            {percentage < 70 && (
              <p className="text-orange-600">⚠️ At Risk - Review the explanations!</p>
            )}
          </div>

          <div className="space-y-2 text-sm text-left">
            <p>💡 <strong>Remember:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>If it's too good to be true, it IS a scam</li>
              <li>NEVER share your seed phrase with anyone</li>
              <li>Real support never DMs first</li>
              <li>Verify URLs carefully - one character difference = scam</li>
              <li>Take time to research - scammers create urgency</li>
            </ul>
          </div>

          <Button onClick={handleRestart} size="lg" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Scenario {currentScenario + 1} of {scenarios.length}
        </span>
        <span className="text-sm font-bold">
          Score: {score.correct}/{score.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Scenario Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 space-y-6">
            {/* Emoji Icon */}
            <div className="text-center">
              <span className="text-6xl">{scenario.imageEmoji}</span>
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-2xl mb-2">{scenario.title}</h3>
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm leading-relaxed">{scenario.description}</p>
            </div>

            {/* Question */}
            {!showExplanation && (
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold">Is this a scam?</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => handleAnswer(true)}
                    variant="destructive"
                    size="lg"
                    className="w-32"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    SCAM
                  </Button>
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="default"
                    size="lg"
                    className="w-32 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    LEGIT
                  </Button>
                </div>
              </div>
            )}

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Correct/Incorrect Feedback */}
                <Card className={`p-4 ${
                  userAnswer === scenario.isScam
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                }`}>
                  <div className="flex items-center gap-2">
                    {userAnswer === scenario.isScam ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-600">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="font-bold text-red-600">
                          Incorrect - This is {scenario.isScam ? 'a SCAM' : 'LEGITIMATE'}
                        </span>
                      </>
                    )}
                  </div>
                </Card>

                {/* Red Flags (if scam) */}
                {scenario.isScam && scenario.redFlags.length > 0 && (
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/10 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      🚩 Red Flags:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                      {scenario.redFlags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Explanation:</h4>
                  <p className="text-sm leading-relaxed">{scenario.explanation}</p>
                </div>

                {/* Next Button */}
                <Button onClick={handleNext} size="lg" className="w-full">
                  {currentScenario < scenarios.length - 1 ? (
                    <>
                      Next Scenario
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      See Results
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
