import React, { useState } from 'react';
import { LeaderboardEntry } from '../../lib/mockData';
import { Trophy, TrendingUp, Flame, Medal } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number;
}

export function Leaderboard({ leaderboard, currentUserRank }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other learners</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center gap-2 mb-8">
          <TimeframeButton
            label="All Time"
            active={timeframe === 'all'}
            onClick={() => setTimeframe('all')}
          />
          <TimeframeButton
            label="This Week"
            active={timeframe === 'week'}
            onClick={() => setTimeframe('week')}
          />
          <TimeframeButton
            label="This Month"
            active={timeframe === 'month'}
            onClick={() => setTimeframe('month')}
          />
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <div className="pt-12">
              <TopPodiumCard
                entry={leaderboard[1]}
                rank={2}
                color="silver"
              />
            </div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <div className="pt-0">
              <TopPodiumCard
                entry={leaderboard[0]}
                rank={1}
                color="gold"
              />
            </div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <div className="pt-12">
              <TopPodiumCard
                entry={leaderboard[2]}
                rank={3}
                color="bronze"
              />
            </div>
          )}
        </div>

        {/* Rest of Leaderboard */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="divide-y divide-gray-100">
            {leaderboard.slice(3).map((entry) => (
              <LeaderboardRow
                key={entry.rank}
                entry={entry}
                isCurrentUser={entry.rank === currentUserRank}
              />
            ))}
          </div>
        </div>

        {/* Current User Rank (if not in top) */}
        {currentUserRank > leaderboard.length && (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-[#0084C7]/10 to-[#00a8e8]/10 border-2 border-[#0084C7]/30 rounded-3xl p-6 shadow-[0_4px_16px_rgba(0,132,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl text-[#0084C7]">#{currentUserRank}</div>
                  <div>
                    <div className="text-gray-900">Your Rank</div>
                    <div className="text-sm text-gray-600">Keep learning to climb higher!</div>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-[#0084C7]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopPodiumCard({ entry, rank, color }: { entry: LeaderboardEntry; rank: number; color: 'gold' | 'silver' | 'bronze' }) {
  const colorClasses = {
    gold: 'from-yellow-100 to-yellow-200 border-yellow-400',
    silver: 'from-gray-100 to-gray-200 border-gray-400',
    bronze: 'from-orange-100 to-orange-200 border-orange-400'
  };

  const medalEmoji = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-3xl p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-1`}>
      <div className="text-4xl mb-3">{medalEmoji[color]}</div>
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <span className="text-3xl">{entry.avatar}</span>
      </div>
      <div className="text-gray-900 mb-1">{entry.username}</div>
      <div className="text-2xl text-gray-800 mb-1">{entry.points.toLocaleString()}</div>
      <div className="text-sm text-gray-600">Level {entry.level}</div>
    </div>
  );
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div className={`flex items-center justify-between p-6 transition-all ${isCurrentUser ? 'bg-[#0084C7]/5' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 text-center text-gray-500 ${isCurrentUser ? 'text-[#0084C7]' : ''}`}>
          #{entry.rank}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
          <span className="text-2xl">{entry.avatar}</span>
        </div>
        <div className="flex-1">
          <div className={`${isCurrentUser ? 'text-[#0084C7]' : 'text-gray-900'}`}>
            {entry.username}
            {isCurrentUser && <span className="ml-2 text-xs bg-[#0084C7] text-white px-2 py-1 rounded-full">You</span>}
          </div>
          <div className="text-sm text-gray-600">Level {entry.level}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl text-gray-900">{entry.points.toLocaleString()}</div>
        <div className="text-sm text-gray-600">points</div>
      </div>
    </div>
  );
}

function TimeframeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full transition-all ${
        active
          ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
          : 'bg-white text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]'
      }`}
    >
      {label}
    </button>
  );
}
