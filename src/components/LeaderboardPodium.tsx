/**
 * Leaderboard Podium Component
 *
 * Displays top 3 users in an animated podium layout
 * with rankings, avatars, usernames, and XP
 */

import { Crown, Trophy, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../lib/api/leaderboard';

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
}

export function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
  if (topThree.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No leaderboard data yet</p>
      </div>
    );
  }

  // Reorder for podium display: [2nd, 1st, 3rd]
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const podiumOrder = [second, first, third].filter(Boolean);

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-48';
      case 2:
        return 'h-36';
      case 3:
        return 'h-28';
      default:
        return 'h-24';
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-500" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Podium Display */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {podiumOrder.map((user) => {
          if (!user) return null;

          const isFirst = user.rank === 1;
          const podiumHeight = getPodiumHeight(user.rank);
          const podiumColor = getPodiumColor(user.rank);

          return (
            <div
              key={user.user_id}
              className={`relative flex flex-col items-center ${
                isFirst ? 'order-2' : user.rank === 2 ? 'order-1' : 'order-3'
              }`}
              style={{
                animation: `slideUp 0.6s ease-out ${user.rank * 0.1}s both`,
              }}
            >
              {/* Rank Icon */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <div
                className={`${
                  isFirst ? 'w-24 h-24 mb-3' : 'w-20 h-20 mb-2'
                } rounded-full bg-gradient-to-br ${podiumColor} flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-110 transition-transform ${
                  user.is_current_user ? 'ring-4 ring-blue-400' : ''
                }`}
              >
                <span className={isFirst ? 'text-4xl' : 'text-3xl'}>{user.avatar_emoji}</span>
              </div>

              {/* Username */}
              <div className={`text-center ${isFirst ? 'mb-3' : 'mb-2'}`}>
                <p
                  className={`font-bold text-gray-900 ${
                    isFirst ? 'text-lg' : 'text-base'
                  } truncate max-w-[120px]`}
                >
                  {user.username}
                </p>
                <p className={`text-xs text-gray-600 mt-1`}>
                  Level {user.level}
                </p>
              </div>

              {/* XP Badge */}
              <div
                className={`${
                  isFirst ? 'mb-4' : 'mb-3'
                } px-4 py-2 bg-white rounded-full shadow-md border-2 ${
                  user.rank === 1
                    ? 'border-yellow-400'
                    : user.rank === 2
                    ? 'border-gray-400'
                    : 'border-orange-400'
                }`}
              >
                <p className="text-sm font-bold text-gray-900">
                  {user.total_xp.toLocaleString()} XP
                </p>
              </div>

              {/* Podium */}
              <div
                className={`${podiumHeight} w-32 bg-gradient-to-br ${podiumColor} rounded-t-2xl shadow-xl relative overflow-hidden`}
              >
                {/* Rank Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white opacity-20">
                    {user.rank}
                  </span>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline CSS for animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
