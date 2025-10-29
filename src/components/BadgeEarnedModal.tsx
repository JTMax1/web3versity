/**
 * Badge Earned Modal Component
 *
 * Celebration modal that appears when user earns a badge.
 * Shows badge details with animation and rarity effects.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, X, Sparkles, Star } from 'lucide-react';
import type { BadgeAwardResult } from '../lib/api/badge-auto-award';

interface BadgeEarnedModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeAwardResult;
  badgeIcon?: string;
  badgeRarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColors = {
  common: {
    bg: 'from-gray-400 to-gray-600',
    glow: 'rgba(156, 163, 175, 0.4)',
    text: 'text-gray-700'
  },
  rare: {
    bg: 'from-blue-400 to-blue-600',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: 'text-blue-700'
  },
  epic: {
    bg: 'from-purple-400 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.4)',
    text: 'text-purple-700'
  },
  legendary: {
    bg: 'from-yellow-400 to-orange-500',
    glow: 'rgba(251, 191, 36, 0.4)',
    text: 'text-yellow-700'
  }
};

export function BadgeEarnedModal({
  isOpen,
  onClose,
  badge,
  badgeIcon = '🏆',
  badgeRarity = 'common'
}: BadgeEarnedModalProps) {
  const [showStars, setShowStars] = useState(false);
  const rarity = rarityColors[badgeRarity];

  useEffect(() => {
    if (isOpen) {
      setShowStars(true);
      const timer = setTimeout(() => setShowStars(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Stars Effect */}
          {showStars && <StarsEffect rarity={badgeRarity} />}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="bg-white rounded-3xl p-8 shadow-[0_24px_96px_rgba(0,0,0,0.25)]">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Content */}
                <div className="text-center">
                  {/* Badge Icon with Glow */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="relative w-32 h-32 mx-auto mb-6"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${rarity.bg} rounded-full blur-xl opacity-50`}
                      style={{
                        boxShadow: `0 0 60px ${rarity.glow}`
                      }}
                    />
                    <div
                      className={`relative w-32 h-32 bg-gradient-to-br ${rarity.bg} rounded-full flex items-center justify-center text-6xl shadow-2xl`}
                    >
                      {badgeIcon}
                    </div>
                    {badgeRarity === 'legendary' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0"
                      >
                        <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-400" />
                        <Sparkles className="absolute bottom-0 left-0 w-8 h-8 text-yellow-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold mb-3 text-gray-900"
                  >
                    Badge Earned!
                  </motion.h2>

                  {/* Badge Name */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xl font-semibold mb-2 ${rarity.text}`}
                  >
                    {badge.badgeName}
                  </motion.p>

                  {/* Rarity Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 mb-6"
                  >
                    <Star className={`w-4 h-4 ${rarity.text}`} />
                    <span className={`text-sm font-medium ${rarity.text} capitalize`}>
                      {badgeRarity}
                    </span>
                  </motion.div>

                  {/* XP Reward */}
                  {badge.xpEarned && badge.xpEarned > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 mb-6"
                    >
                      <p className="text-sm text-gray-600 mb-1">Bonus Reward</p>
                      <p className="text-3xl font-bold text-green-600">
                        +{badge.xpEarned} XP
                      </p>
                    </motion.div>
                  )}

                  {/* Continue Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl text-lg font-semibold shadow-[0_8px_24px_rgba(0,132,199,0.4)] hover:shadow-[0_12px_32px_rgba(0,132,199,0.5)] transition-all"
                  >
                    Awesome!
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Animated Stars Effect for Badge Earned
 */
function StarsEffect({ rarity }: { rarity: string }) {
  const starCount = rarity === 'legendary' ? 80 : rarity === 'epic' ? 50 : 30;
  const colors = rarityColors[rarity as keyof typeof rarityColors];

  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2000,
    duration: 2000 + Math.random() * 1000,
  }));

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: star.duration / 1000,
            delay: star.delay / 1000,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
        >
          <Sparkles className={`w-4 h-4 ${colors.text}`} />
        </motion.div>
      ))}
    </div>
  );
}
