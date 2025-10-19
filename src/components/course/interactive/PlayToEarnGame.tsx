import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Coins, Zap, Heart, Star, RotateCcw, ArrowRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner@2.0.3';

interface PlayToEarnGameProps {
  onInteract?: () => void;
}

interface Enemy {
  id: number;
  type: 'scam' | 'legit';
  name: string;
  emoji: string;
  description: string;
}

const enemies: Enemy[] = [
  { id: 1, type: 'scam', name: 'Fake Airdrop', emoji: '🎁', description: 'Send 0.1 ETH to claim 10 ETH!' },
  { id: 2, type: 'legit', name: 'Hedera Network', emoji: '⚡', description: 'Fast & eco-friendly blockchain' },
  { id: 3, type: 'scam', name: 'Ponzi DeFi', emoji: '💸', description: '1000% APY guaranteed!' },
  { id: 4, type: 'legit', name: 'Hardware Wallet', emoji: '🔒', description: 'Secure cold storage' },
  { id: 5, type: 'scam', name: 'Fake Support DM', emoji: '📧', description: 'Share your seed phrase to fix issue' },
  { id: 6, type: 'legit', name: 'Official DEX', emoji: '🔄', description: 'SaucerSwap verified exchange' },
  { id: 7, type: 'scam', name: 'Clone Wallet', emoji: '🎭', description: 'Download "better" wallet version' },
  { id: 8, type: 'legit', name: 'Smart Contract', emoji: '📜', description: 'Audited & open source code' },
  { id: 9, type: 'scam', name: 'Celebrity Giveaway', emoji: '🌟', description: 'Elon: Send BTC, get 2x back!' },
  { id: 10, type: 'legit', name: 'Testnet Faucet', emoji: '💧', description: 'Free test tokens for learning' }
];

export const PlayToEarnGame: React.FC<PlayToEarnGameProps> = ({ onInteract }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'won'>('intro');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [shuffledEnemies, setShuffledEnemies] = useState<Enemy[]>([]);

  useEffect(() => {
    // Shuffle enemies on mount
    const shuffled = [...enemies].sort(() => Math.random() - 0.5);
    setShuffledEnemies(shuffled);
  }, []);

  const currentEnemy = shuffledEnemies[currentEnemyIndex];

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCurrentEnemyIndex(0);
    setStreak(0);
    setHasWon(false);
    const shuffled = [...enemies].sort(() => Math.random() - 0.5);
    setShuffledEnemies(shuffled);
    onInteract?.();
  };

  const handleChoice = (choice: 'scam' | 'legit') => {
    if (!currentEnemy) return;

    const isCorrect = choice === currentEnemy.type;

    if (isCorrect) {
      const basePoints = 10;
      const streakBonus = streak * 5;
      const totalPoints = basePoints + streakBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      
      toast.success('Correct! +' + totalPoints + ' coins', {
        description: streak > 0 ? `${streak} streak bonus!` : undefined
      });

      // Move to next enemy
      if (currentEnemyIndex < shuffledEnemies.length - 1) {
        setTimeout(() => {
          setCurrentEnemyIndex(prev => prev + 1);
        }, 500);
      } else {
        // Won the game!
        setTimeout(() => {
          setGameState('won');
          setHasWon(true);
          toast.success('🎉 You Won! Claimed 5 Points!');
        }, 800);
      }
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      toast.error('Wrong! Lost a life', {
        description: currentEnemy.type === 'scam' ? 'This was a SCAM!' : 'This was LEGIT!'
      });

      if (lives <= 1) {
        setTimeout(() => {
          setGameState('gameover');
        }, 800);
      } else {
        // Move to next enemy even if wrong
        if (currentEnemyIndex < shuffledEnemies.length - 1) {
          setTimeout(() => {
            setCurrentEnemyIndex(prev => prev + 1);
          }, 1000);
        }
      }
    }
  };

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            🎮
          </motion.div>
          <h2 className="text-4xl mb-4">Crypto Defender</h2>
          <p className="text-xl text-white/90 mb-2">A Play-to-Earn Mini Game</p>
          <p className="text-white/80">
            Identify scams and legit projects to earn coins!
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            How to Play
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Identify Each Project</p>
                <p className="text-muted-foreground">Decide if it's a SCAM or LEGIT</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-semibold">Build Your Streak</p>
                <p className="text-muted-foreground">Consecutive correct answers = bonus coins!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <span className="text-2xl">❤️</span>
              <div>
                <p className="font-semibold">Don't Lose All Lives</p>
                <p className="text-muted-foreground">You have 3 lives - use them wisely!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Win to Earn Points</p>
                <p className="text-muted-foreground">Complete all challenges to claim 5 platform points!</p>
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={startGame}
          size="lg"
          className="w-full py-8 text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Zap className="w-6 h-6 mr-2" />
          Start Game
        </Button>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing' && currentEnemy) {
    return (
      <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
        {/* Score Bar */}
        <div className="flex items-center justify-between gap-4">
          <Card className="flex-1 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Score
              </span>
              <span className="text-2xl font-bold">{score}</span>
            </div>
          </Card>

          <Card className="flex-1 p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Lives
              </span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${i < lives ? 'fill-white' : 'opacity-20'}`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {streak > 0 && (
            <Card className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span className="font-bold">{streak}x</span>
              </div>
            </Card>
          )}
        </div>

        {/* Progress */}
        <div className="text-center text-sm text-muted-foreground">
          Challenge {currentEnemyIndex + 1} of {shuffledEnemies.length}
        </div>

        {/* Enemy Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEnemyIndex}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-4 border-blue-300 dark:border-blue-700">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-9xl"
                >
                  {currentEnemy.emoji}
                </motion.div>

                <div>
                  <h2 className="text-3xl mb-3">{currentEnemy.name}</h2>
                  <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl">
                    <p className="text-lg italic">"{currentEnemy.description}"</p>
                  </div>
                </div>

                <div>
                  <p className="text-xl font-semibold mb-4">Is this a scam or legit?</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleChoice('scam')}
                      size="lg"
                      className="w-40 py-8 text-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      ❌ SCAM
                    </Button>
                    <Button
                      onClick={() => handleChoice('legit')}
                      size="lg"
                      className="w-40 py-8 text-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      ✅ LEGIT
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'gameover') {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <div className="text-8xl">💔</div>
            <h2 className="text-4xl">Game Over!</h2>
            <p className="text-xl text-muted-foreground">
              You ran out of lives, but you learned valuable lessons!
            </p>

            <div className="p-6 bg-white/70 dark:bg-gray-900/70 rounded-2xl">
              <p className="text-sm text-muted-foreground mb-2">Final Score</p>
              <p className="text-5xl font-bold text-orange-600">{score}</p>
              <p className="text-sm text-muted-foreground mt-2">coins earned</p>
            </div>

            <div className="space-y-2 text-sm text-left p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="font-semibold">💡 Remember:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>If it's too good to be true, it's a scam</li>
                <li>Never share your seed phrase</li>
                <li>Verify URLs and official sources</li>
                <li>Real support never DMs first</li>
              </ul>
            </div>

            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Won Screen
  if (gameState === 'won') {
    const finalScore = score;
    const accuracy = Math.round((finalScore / (shuffledEnemies.length * 10)) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 dark:from-yellow-950/20 dark:via-green-950/20 dark:to-emerald-950/20 border-4 border-green-400">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-9xl"
            >
              🏆
            </motion.div>

            <h2 className="text-5xl">Victory!</h2>
            <p className="text-2xl text-green-600 font-bold">
              You're a Crypto Defense Expert!
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/70 dark:bg-gray-900/70 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-2">Final Score</p>
                <p className="text-4xl font-bold text-yellow-600">{finalScore}</p>
                <p className="text-xs text-muted-foreground mt-1">coins</p>
              </div>

              <div className="p-6 bg-white/70 dark:bg-gray-900/70 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-green-600">{accuracy}%</p>
                <p className="text-xs text-muted-foreground mt-1">correct</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
                <span className="text-3xl font-bold">+5 Points</span>
                <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
              </div>
              <p className="text-white/90">
                Platform points claimed! 🎉
              </p>
            </div>

            <div className="space-y-2 text-sm text-left p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="font-semibold text-green-700">🎓 You've Learned:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-green-700">
                <li>How to identify common crypto scams</li>
                <li>Recognizing legitimate blockchain projects</li>
                <li>Red flags to watch out for</li>
                <li>Safe practices in the crypto space</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={startGame}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Continue Learning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
};
