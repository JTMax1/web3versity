import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle, XCircle, Trophy, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Scenario {
  id: number;
  title: string;
  description: string;
  emoji: string;
  isLegit: boolean;
  explanation: string;
  redFlags: string[];
  africanContext: string;
}

const beginnerScenarios: Scenario[] = [
  {
    id: 1,
    title: 'Free Money Giveaway',
    emoji: '🎁',
    description: 'You see a post on Facebook: "Send me 1,000 Naira and I\'ll send you back 10,000 Naira! Limited time offer! First 100 people only!"',
    isLegit: false,
    redFlags: [
      'Asking you to send money first',
      'Too good to be true (1000 → 10,000)',
      'Creates urgency ("first 100 people")',
      'No legitimate business model'
    ],
    explanation: 'This is a classic scam! No one gives free money for sending them money first. Once you send, they disappear. Real businesses don\'t work this way.',
    africanContext: '🇳🇬 This is like the "MMM Ponzi scheme" that crashed in Nigeria. Many people lost money believing they\'d get rich quick.'
  },
  {
    id: 2,
    title: 'Bank Mobile App Download',
    emoji: '🏦',
    description: 'You go to your bank\'s official website (gtbank.com) and download their mobile banking app from the link on their website.',
    isLegit: true,
    redFlags: [],
    explanation: 'This is legitimate! Downloading apps from official company websites is safe. Always verify the URL matches the real company.',
    africanContext: '🇰🇪 Just like downloading M-Pesa from Safaricom\'s official website - that\'s the safe way to do it!'
  },
  {
    id: 3,
    title: 'WhatsApp Wallet Request',
    emoji: '💬',
    description: 'Your friend\'s WhatsApp account messages you: "Hey bro, my phone got stolen. Send me your wallet private keys so I can help you backup your money before the thief gets it!"',
    isLegit: false,
    redFlags: [
      'Asking for private keys (NEVER share!)',
      'Creates panic ("before thief gets it")',
      'Friend\'s account might be hacked',
      'No legitimate reason to share private keys'
    ],
    explanation: 'HUGE scam! Your friend\'s account was hacked. NEVER share private keys with anyone - not even friends or family. Private keys = full access to your money.',
    africanContext: '🇬🇭 This happened a lot during the "SIM swap" scams in Ghana. Scammers take over phone numbers and pretend to be your friends.'
  },
  {
    id: 4,
    title: 'Airtime Purchase',
    emoji: '📱',
    description: 'You buy airtime from your local shop. The shop owner sends you a recharge code via SMS after you pay cash.',
    isLegit: true,
    redFlags: [],
    explanation: 'This is normal and legitimate! Buying airtime with cash from authorized vendors is a standard transaction. You paid cash, received a valid recharge code.',
    africanContext: '🇹🇿 This is how most Tanzanians buy airtime - perfectly safe and normal!'
  },
  {
    id: 5,
    title: 'Cryptocurrency Multiplication',
    emoji: '💎',
    description: 'A telegram group promises: "Join our Bitcoin investment pool. We use AI trading bots. Guaranteed 50% profit every week. Minimum investment: $100. Already 5,000 members!"',
    isLegit: false,
    redFlags: [
      'Guaranteed profits (nothing is guaranteed!)',
      '50% every week = impossible',
      'Pressure to invest minimum amount',
      'Claims of "AI bots" with no proof',
      'Telegram groups are not regulated'
    ],
    explanation: 'Classic investment scam! No legitimate investment can guarantee 50% weekly returns. That\'s 2,600% per year - impossible! The "AI bot" doesn\'t exist. Early members get paid from new members\' money (Ponzi scheme).',
    africanContext: '🇿🇦 South Africa saw many Bitcoin Ponzi schemes like "BTC Global" that collapsed, leaving thousands broke.'
  },
  {
    id: 6,
    title: 'University Registration',
    emoji: '🎓',
    description: 'You\'re registering for university. The school website asks you to pay registration fees via bank transfer to the university\'s official account number listed on the website.',
    isLegit: true,
    redFlags: [],
    explanation: 'Legitimate! Paying school fees to the official university account via bank transfer is normal. Just make sure you\'re on the REAL university website (check the URL carefully).',
    africanContext: '🇳🇬 Nigerian universities like UNILAG accept fees this way - it\'s the standard process.'
  },
  {
    id: 7,
    title: 'Help a Stranger',
    emoji: '🆘',
    description: 'Someone on Twitter DMs you: "Please help! I\'m stranded and need money urgently. Can you send 5,000 Naira to this account? I\'ll pay you back double tomorrow. God bless you!"',
    isLegit: false,
    redFlags: [
      'Stranger asking for money',
      'Creates emotional urgency',
      'Promise to pay back double (bait)',
      'Random DM from unknown person',
      'No way to verify their story'
    ],
    explanation: 'Scam! Scammers send thousands of these DMs hoping someone sympathetic will send money. There\'s no stranded person - just a scammer. Even if the story sounds real, NEVER send money to strangers online.',
    africanContext: '🇰🇪 Many Kenyans lost money to these "emergency" scams during COVID-19.'
  },
  {
    id: 8,
    title: 'Grocery Market Payment',
    emoji: '🛒',
    description: 'You buy vegetables at your local market. The vendor asks you to pay via mobile money (M-Pesa/MTN) to their number that\'s written on their stall sign.',
    isLegit: true,
    redFlags: [],
    explanation: 'Totally legitimate! Paying market vendors via mobile money is common and safe in Africa. The vendor\'s number is publicly displayed, and you\'re paying for goods you received.',
    africanContext: '🇷🇼 In Rwanda, even small market vendors accept mobile money - it\'s safer than carrying cash!'
  }
];

interface BeginnerScamOrLegitProps {
  onInteract?: () => void;
}

export const BeginnerScamOrLegit: React.FC<BeginnerScamOrLegitProps> = ({ onInteract }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameComplete, setGameComplete] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const scenario = beginnerScenarios[currentIndex];

  const handleAnswer = (answer: boolean) => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    setUserAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === scenario.isLegit;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentIndex < beginnerScenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const getGrade = () => {
      if (percentage >= 90) return { emoji: '🏆', title: 'Scam Expert!', color: 'text-green-600' };
      if (percentage >= 70) return { emoji: '✅', title: 'Good Job!', color: 'text-blue-600' };
      if (percentage >= 50) return { emoji: '⚠️', title: 'Getting There', color: 'text-orange-600' };
      return { emoji: '📚', title: 'Keep Learning', color: 'text-red-600' };
    };
    const grade = getGrade();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto p-4 md:p-6"
      >
        <Card className="p-6 md:p-8 text-center space-y-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="text-5xl md:text-6xl">{grade.emoji}</div>
          <h2 className={`text-2xl md:text-3xl font-bold ${grade.color}`}>{grade.title}</h2>
          <p className="text-4xl md:text-6xl font-bold text-primary">{percentage}%</p>
          <p className="text-lg md:text-xl">
            You got {score.correct} out of {score.total} correct!
          </p>

          <Card className="p-4 md:p-6 bg-white/50 dark:bg-gray-900/50 text-left">
            <h4 className="font-semibold mb-3 text-sm md:text-base">🛡️ Remember These Rules:</h4>
            <ul className="space-y-2 text-xs md:text-sm list-disc list-inside">
              <li>If it sounds too good to be true, it IS a scam</li>
              <li>NEVER share your private keys or passwords</li>
              <li>Don't send money to strangers online</li>
              <li>Always verify URLs and official company websites</li>
              <li>Be suspicious of "guaranteed" profits</li>
              <li>Real businesses don't create fake urgency</li>
            </ul>
          </Card>

          <Button onClick={handleRestart} size="lg" className="w-full">
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <h2 className="text-xl md:text-2xl font-bold">Scam or Legit? (Beginner)</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Learn to spot scams in everyday situations
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-between items-center text-xs md:text-sm">
            <span className="text-muted-foreground">
              Scenario {currentIndex + 1} of {beginnerScenarios.length}
            </span>
            <span className="font-bold">
              Score: {score.correct}/{score.total}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              animate={{ width: `${((currentIndex + 1) / beginnerScenarios.length) * 100}%` }}
            />
          </div>

          {/* Scenario Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4 md:p-6 space-y-6">
                {/* Emoji */}
                <div className="text-center text-5xl md:text-6xl">{scenario.emoji}</div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-center">{scenario.title}</h3>

                {/* Description */}
                <Card className="p-4 md:p-5 bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm md:text-base leading-relaxed">{scenario.description}</p>
                </Card>

                {/* Question */}
                {!showExplanation && (
                  <div className="text-center space-y-4">
                    <p className="text-base md:text-lg font-semibold">Is this a SCAM or LEGIT?</p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="destructive"
                        size="lg"
                        className="flex-1 py-6 text-base md:text-lg"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        SCAM
                      </Button>
                      <Button
                        onClick={() => handleAnswer(true)}
                        size="lg"
                        className="flex-1 py-6 bg-green-600 hover:bg-green-700 text-base md:text-lg"
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
                    {/* Feedback */}
                    <Card className={`p-4 ${
                      userAnswer === scenario.isLegit
                        ? 'bg-green-50 dark:bg-green-950/20 border-2 border-green-500'
                        : 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        {userAnswer === scenario.isLegit ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-bold text-green-600 text-sm md:text-base">Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-600" />
                            <span className="font-bold text-red-600 text-sm md:text-base">
                              Incorrect - This is {scenario.isLegit ? 'LEGIT' : 'a SCAM'}
                            </span>
                          </>
                        )}
                      </div>
                    </Card>

                    {/* Red Flags */}
                    {!scenario.isLegit && scenario.redFlags.length > 0 && (
                      <Card className="p-4 bg-red-50/50 dark:bg-red-950/10">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          🚩 Red Flags:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs md:text-sm ml-6">
                          {scenario.redFlags.map((flag, i) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Explanation */}
                    <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/10">
                      <h4 className="font-semibold mb-2 text-sm md:text-base">💡 Explanation:</h4>
                      <p className="text-xs md:text-sm leading-relaxed">{scenario.explanation}</p>
                    </Card>

                    {/* African Context */}
                    <Card className="p-4 bg-green-50/50 dark:bg-green-950/10 border border-green-300">
                      <p className="text-xs md:text-sm">
                        <strong>{scenario.africanContext.substring(0, 4)}</strong> {scenario.africanContext.substring(5)}
                      </p>
                    </Card>

                    {/* Next Button */}
                    <Button onClick={handleNext} size="lg" className="w-full">
                      {currentIndex < beginnerScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};
