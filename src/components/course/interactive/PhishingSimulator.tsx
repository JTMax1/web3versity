import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Mail, MessageSquare, Chrome, CheckCircle, XCircle, AlertTriangle, Award } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface PhishingAttempt {
  id: number;
  type: 'email' | 'sms' | 'website';
  isPhishing: boolean;
  content: {
    from?: string;
    subject?: string;
    message: string;
    url?: string;
    sender?: string;
  };
  redFlags: string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const phishingAttempts: PhishingAttempt[] = [
  {
    id: 1,
    type: 'email',
    isPhishing: true,
    difficulty: 'easy',
    content: {
      from: 'support@hashpack-verify.com',
      subject: 'URGENT: Your HashPack wallet will be deleted in 24 hours',
      message: 'Dear User,\n\nWe have detected suspicious activity on your HashPack wallet. To prevent deletion, you must verify your account immediately by clicking the link below and entering your 12-word recovery phrase.\n\nVerify Now: https://hashpack-verify.com/urgent\n\nIf you do not verify within 24 hours, your wallet and all funds will be permanently deleted.\n\nHashPack Security Team',
    },
    redFlags: [
      'Domain is hashpack-verify.com (fake, real is hashpack.app)',
      'Creates urgency (24 hours threat)',
      'Asks for seed phrase (NEVER legitimate)',
      'Threatening language ("will be deleted")',
      'Generic greeting ("Dear User")'
    ],
    explanation: 'Classic phishing! Real companies NEVER ask for seed phrases. HashPack would never delete your wallet (it\'s non-custodial - they don\'t control it). The domain is fake. Always verify sender domains carefully!'
  },
  {
    id: 2,
    type: 'sms',
    isPhishing: true,
    difficulty: 'medium',
    content: {
      sender: '+1-555-0123 (Hedera Network)',
      message: '🎉 Congratulations! You\'ve been selected for the Hedera Airdrop! Claim 1,000 FREE HBAR now: hederaairdrop.live/claim?user=296834\n\nValid for 2 hours only! Click now to connect your wallet and receive tokens.'
    },
    redFlags: [
      'Unsolicited airdrop (you didn\'t sign up)',
      'Time pressure (2 hours)',
      'Suspicious domain (hederaairdrop.live)',
      'Asking to "connect wallet" via SMS link',
      'Generic user ID (not personalized)'
    ],
    explanation: 'Airdrop scam! Real Hedera airdrops are announced on official channels (hedera.com, verified Twitter). This link would connect to a malicious site that drains your wallet when you "connect". Never click crypto links in SMS!'
  },
  {
    id: 3,
    type: 'website',
    isPhishing: false,
    difficulty: 'easy',
    content: {
      url: 'https://saucerswap.finance/swap',
      message: 'You are visiting SaucerSwap DEX. The site is asking for wallet connection permission to enable token swaps. SSL certificate is valid. Domain matches official documentation.'
    },
    redFlags: [],
    explanation: 'This is legitimate! saucerswap.finance is the real SaucerSwap DEX. The HTTPS connection is secure, and connecting your wallet to verified dApps is normal. Always double-check the URL matches official sources!'
  },
  {
    id: 4,
    type: 'email',
    isPhishing: true,
    difficulty: 'hard',
    content: {
      from: 'notifications@hedera.com',
      subject: 'Hedera Network Upgrade: Action Required',
      message: 'Hello HBAR holder,\n\nHedera is upgrading to version 0.42.0 on March 15th. To ensure compatibility, you must upgrade your wallet before the deadline.\n\nDownload the new HashPack version here: https://hedera.com/wallet-upgrade\n\n(Link actually goes to: hedera.com.verify-upgrade.net)\n\nFailure to upgrade will result in loss of access to your funds after March 15th.\n\nBest regards,\nHedera Technical Team'
    },
    redFlags: [
      'Actual link destination differs from displayed text (hover to see real URL)',
      'Real domain would be hedera.com, not hedera.com.verify-upgrade.net',
      'Creates false deadline urgency',
      'Threatens "loss of access"',
      'From email might be spoofed (check email headers)'
    ],
    explanation: 'Sophisticated phishing! The email looks professional and sender seems real, BUT the link goes to a fake domain (hedera.com.verify-upgrade.net is NOT hedera.com). Wallet upgrades come from wallet providers (HashPack.app), not Hedera. Always hover over links before clicking!'
  },
  {
    id: 5,
    type: 'sms',
    isPhishing: false,
    difficulty: 'medium',
    content: {
      sender: 'MTN Mobile Money',
      message: 'Dear customer, you have received 5,000 KES from JOHN DOE. Your new balance is 12,450 KES. Transaction ID: MP240315ABC123. Thank you for using M-Pesa.'
    },
    redFlags: [],
    explanation: 'Legitimate transaction notification from M-Pesa. These SMS confirmations are standard for mobile money. You\'re NOT being asked to click links, provide info, or take urgent action. Just a receipt.'
  },
  {
    id: 6,
    type: 'website',
    isPhishing: true,
    difficulty: 'hard',
    content: {
      url: 'https://hashpack.app.secure-login.cc',
      message: 'You are visiting what appears to be HashPack. The site looks identical to the real HashPack interface. It\'s asking you to enter your seed phrase to "restore your wallet after the recent update".'
    },
    redFlags: [
      'Domain is hashpack.app.secure-login.cc (fake subdomain trick)',
      'Real HashPack is hashpack.app ONLY',
      'Asking for seed phrase (NEVER enter seed phrase on websites)',
      'Uses security words like "secure-login" to seem trustworthy',
      'Claims there was a "recent update" requiring restoration'
    ],
    explanation: 'Extremely dangerous clone site! The URL uses a clever trick: "hashpack.app" appears in the URL but the real domain is "secure-login.cc". Real domain is ONLY hashpack.app. Never enter seed phrases on websites, even if they look perfect!'
  },
  {
    id: 7,
    type: 'email',
    isPhishing: true,
    difficulty: 'medium',
    content: {
      from: 'no-reply@hedera-foundation.org',
      subject: 'KYC Verification Required for HBAR Holdings',
      message: 'Dear HBAR Holder,\n\nDue to new regulations, all HBAR holders must complete KYC verification by April 1st. Failure to comply will result in your wallet being frozen.\n\nComplete KYC here: https://hedera-kyc-portal.org/verify\n\nRequired documents:\n- Government ID\n- Proof of address\n- Wallet seed phrase for verification\n\nThis is mandatory under new SEC regulations.\n\nHedera Compliance Team'
    },
    redFlags: [
      'Hedera is decentralized - they can\'t freeze your wallet',
      'Asking for seed phrase (huge red flag)',
      'Fake domain (hedera-kyc-portal.org)',
      'Creates false regulatory urgency',
      'Real Hedera never requires KYC for holding HBAR'
    ],
    explanation: 'Scam using regulatory fear! Hedera cannot freeze wallets (decentralized). No legitimate service ever needs your seed phrase for KYC. This is designed to steal your ID documents AND your crypto. Real regulations don\'t work this way!'
  },
  {
    id: 8,
    type: 'sms',
    isPhishing: true,
    difficulty: 'hard',
    content: {
      sender: '+234-801-555-0198 (saved as "Mary - Sister")',
      message: 'Brother, my phone got stolen! I created new wallet but need 0.5 HBAR for gas to transfer my funds out before thief accesses it. Please send urgently to: 0.0.845721. Will pay you back tomorrow. Thanks!'
    },
    redFlags: [
      'Creates urgency ("phone stolen", "before thief accesses")',
      'Number is different from your sister\'s real number',
      'Phone was likely cloned/SIM swapped',
      'Real sister would verify identity through other means',
      'Hedera transactions don\'t require "gas" (low, flat fees)'
    ],
    explanation: 'Social engineering attack! Scammer compromised your sister\'s phone/contacts and is impersonating her. Always verify through alternate channel (video call, different app, secret question). The "gas fee" story is fake - HBAR has ultra-low fees ($0.0001).'
  }
];

interface PhishingSimulatorProps {
  onInteract?: () => void;
}

export const PhishingSimulator: React.FC<PhishingSimulatorProps> = ({ onInteract }) => {
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameComplete, setGameComplete] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const attempt = phishingAttempts[currentAttempt];

  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setShowExplanation(true);

    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    const isCorrect = answer === attempt.isPhishing;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentAttempt < phishingAttempts.length - 1) {
      setCurrentAttempt(prev => prev + 1);
      setUserAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentAttempt(0);
    setUserAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setGameComplete(false);
  };

  const getTypeIcon = () => {
    switch (attempt.type) {
      case 'email': return <Mail className="w-6 h-6" />;
      case 'sms': return <MessageSquare className="w-6 h-6" />;
      case 'website': return <Chrome className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = () => {
    switch (attempt.difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-orange-500';
      case 'hard': return 'bg-red-500';
    }
  };

  if (gameComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const getGrade = () => {
      if (percentage >= 90) return { emoji: '🛡️', title: 'Phishing Expert', color: 'text-green-600' };
      if (percentage >= 70) return { emoji: '✅', title: 'Well Protected', color: 'text-blue-600' };
      if (percentage >= 50) return { emoji: '⚠️', title: 'Needs Improvement', color: 'text-orange-600' };
      return { emoji: '🚨', title: 'High Risk', color: 'text-red-600' };
    };
    const grade = getGrade();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto p-6"
      >
        <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="text-6xl">{grade.emoji}</div>
          <h2 className={`text-3xl font-bold ${grade.color}`}>{grade.title}</h2>
          <p className="text-6xl font-bold text-primary">{percentage}%</p>
          <p className="text-xl">
            You correctly identified {score.correct} out of {score.total} attempts
          </p>

          <Card className="p-6 bg-white/50 dark:bg-gray-900/50 text-left">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Breakdown:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Correct Phishing Detection:</span>
                <span className="font-bold">{score.correct}/{score.total}</span>
              </div>
              <div className="flex justify-between">
                <span>False Positives (marked legit as phishing):</span>
                <span className="font-bold">
                  {score.total - score.correct - phishingAttempts.filter((a, i) => i < score.total && a.isPhishing).length + phishingAttempts.filter((a, i) => i < score.total && a.isPhishing).filter((a, i) => userAnswer === a.isPhishing).length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 text-left text-sm">
            <h4 className="font-semibold mb-2">🔒 Key Takeaways:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>NEVER</strong> share your seed phrase, even if the site looks real</li>
              <li>Hover over links to see the REAL destination URL</li>
              <li>Verify domains character-by-character (one typo = scam)</li>
              <li>Real support never DMs first or creates urgency</li>
              <li>When in doubt, access sites via bookmarks, not links</li>
              <li>Use hardware wallets for large amounts</li>
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleRestart} size="lg" className="flex-1">
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Attempt {currentAttempt + 1} of {phishingAttempts.length}
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor()}`}>
            {attempt.difficulty.toUpperCase()}
          </span>
          <span className="text-sm font-bold">
            Score: {score.correct}/{score.total}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          animate={{ width: `${((currentAttempt + 1) / phishingAttempts.length) * 100}%` }}
        />
      </div>

      {/* Attempt Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAttempt}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6 space-y-6">
            {/* Type Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/30 rounded-full">
                {getTypeIcon()}
                <span className="text-sm font-semibold capitalize">{attempt.type}</span>
              </div>
            </div>

            {/* Content Display */}
            <Card className="p-5 bg-gray-50 dark:bg-gray-900 space-y-3">
              {attempt.type === 'email' && (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground">FROM:</span>
                    <p className="font-mono text-sm">{attempt.content.from}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">SUBJECT:</span>
                    <p className="font-semibold">{attempt.content.subject}</p>
                  </div>
                  <div className="border-t pt-3">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{attempt.content.message}</pre>
                  </div>
                </>
              )}

              {attempt.type === 'sms' && (
                <>
                  <div>
                    <span className="text-xs text-muted-foreground">FROM:</span>
                    <p className="font-semibold">{attempt.content.sender}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm">{attempt.content.message}</p>
                  </div>
                </>
              )}

              {attempt.type === 'website' && (
                <>
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                    <Chrome className="w-4 h-4" />
                    <span className="font-mono text-sm flex-1">{attempt.content.url}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm">{attempt.content.message}</p>
                  </div>
                </>
              )}
            </Card>

            {/* Question */}
            {!showExplanation && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-orange-600" />
                  <p className="text-lg font-semibold">Is this a phishing attempt?</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => handleAnswer(true)}
                    variant="destructive"
                    size="lg"
                    className="w-40"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    PHISHING
                  </Button>
                  <Button
                    onClick={() => handleAnswer(false)}
                    size="lg"
                    className="w-40 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    LEGITIMATE
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
                  userAnswer === attempt.isPhishing
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                }`}>
                  <div className="flex items-center gap-2">
                    {userAnswer === attempt.isPhishing ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-600">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="font-bold text-red-600">
                          Incorrect - This is {attempt.isPhishing ? 'PHISHING' : 'LEGITIMATE'}
                        </span>
                      </>
                    )}
                  </div>
                </Card>

                {/* Red Flags */}
                {attempt.isPhishing && (
                  <Card className="p-4 bg-red-50/50 dark:bg-red-950/10">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      🚩 Red Flags:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-6">
                      {attempt.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Explanation */}
                <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/10">
                  <h4 className="font-semibold mb-2">💡 Explanation:</h4>
                  <p className="text-sm leading-relaxed">{attempt.explanation}</p>
                </Card>

                <Button onClick={handleNext} size="lg" className="w-full">
                  {currentAttempt < phishingAttempts.length - 1 ? 'Next Attempt' : 'See Results'}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
