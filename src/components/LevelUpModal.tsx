/**
 * Level Up Modal Component
 *
 * Celebration modal that appears when user levels up.
 * Shows confetti animation and level milestone info.
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  nextLevelXP?: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  nextLevelXP = 100,
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Confetti animation duration
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-bounce-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Level Icon */}
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(0,132,199,0.4)] animate-pulse-slow">
              <TrendingUp className="w-16 h-16 text-white" />
              <div className="absolute top-0 right-0">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-spin-slow" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] bg-clip-text text-transparent">
              Level Up!
            </h2>

            {/* New Level */}
            <p className="text-gray-600 mb-6">You've reached</p>
            <div className="text-7xl font-bold mb-6 text-[#0084C7]">
              {newLevel}
            </div>

            {/* Next Milestone */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Next Level</p>
              <p className="text-2xl font-bold text-gray-900">Level {newLevel + 1}</p>
              <p className="text-sm text-gray-500 mt-2">
                {nextLevelXP} XP needed
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl text-lg font-semibold shadow-[0_8px_24px_rgba(0,132,199,0.4)] hover:shadow-[0_12px_32px_rgba(0,132,199,0.5)] transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Simple Confetti Effect
 */
function ConfettiEffect() {
  const colors = ['#0084C7', '#00a8e8', '#fbbf24', '#f97316', '#8b5cf6'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1000,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 3s ease-in forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
