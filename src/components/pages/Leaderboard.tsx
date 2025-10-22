/**
 * Leaderboard Page - Real-time Rankings
 *
 * Displays competitive leaderboard with:
 * - Top 100 users
 * - Timeframe switching (All Time, Week, Month)
 * - Animated podium for top 3
 * - Current user highlight
 * - Context view for users outside top 100
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Flame, Medal, Users, Award, RefreshCw, Crown } from 'lucide-react';
import { LeaderboardPodium } from '../LeaderboardPodium';
import {
  getLeaderboard,
  getUserRank,
  getLeaderboardContext,
  getLeaderboardStats,
  type LeaderboardTimeframe,
  type LeaderboardEntry,
  type UserRankInfo,
  type LeaderboardStats,
} from '../../lib/api/leaderboard';
import { useAuth } from '../../hooks/useAuth';

export function Leaderboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [contextUsers, setContextUsers] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [timeframe, user?.id]);

  const loadLeaderboard = async () => {
    try {
      // Load leaderboard data
      const [leaderboardData, statsData] = await Promise.all([
        getLeaderboard(timeframe, 100),
        getLeaderboardStats(),
      ]);

      // Mark current user
      const updatedLeaderboard = leaderboardData.map((entry) => ({
        ...entry,
        is_current_user: entry.user_id === user?.id,
      }));

      setLeaderboard(updatedLeaderboard);
      setStats(statsData);

      // Get current user's rank
      if (user?.id) {
        const rankInfo = await getUserRank(user.id, timeframe);
        setUserRank(rankInfo);

        // If user is outside top 100, load context
        if (rankInfo && rankInfo.rank > 100) {
          const context = await getLeaderboardContext(rankInfo.rank, timeframe, 5);
          setContextUsers(
            context.map((entry) => ({
              ...entry,
              is_current_user: entry.user_id === user.id,
            }))
          );
        } else {
          setContextUsers([]);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);
  const isUserInTop100 = userRank && userRank.rank <= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other learners</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.total_users.toLocaleString()} />
            <StatCard
              icon={TrendingUp}
              label="Total XP Earned"
              value={stats.total_xp_earned.toLocaleString()}
            />
            <StatCard
              icon={Award}
              label="Most Completed"
              value={stats.most_completed_course?.title.substring(0, 20) || 'N/A'}
            />
            <StatCard
              icon={Flame}
              label="Top This Week"
              value={stats.top_performer_this_week?.username || 'N/A'}
            />
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="flex justify-center gap-2 mb-8">
          <TimeframeButton
            label="All Time"
            active={timeframe === 'all'}
            onClick={() => setTimeframe('all')}
            icon={Trophy}
          />
          <TimeframeButton
            label="This Week"
            active={timeframe === 'week'}
            onClick={() => setTimeframe('week')}
            icon={Flame}
          />
          <TimeframeButton
            label="This Month"
            active={timeframe === 'month'}
            onClick={() => setTimeframe('month')}
            icon={TrendingUp}
          />
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow hover:shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <LeaderboardPodium topThree={topThree} />
              </div>
            )}

            {/* Rest of Leaderboard */}
            {remaining.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Rankings</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {remaining.map((entry) => (
                    <LeaderboardRow key={entry.user_id} entry={entry} />
                  ))}
                </div>
              </div>
            )}

            {/* Current User Rank (if not in top 100) */}
            {userRank && !isUserInTop100 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-blue-600" />
                    Your Rank
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Rank</p>
                      <p className="text-2xl font-bold text-blue-600">#{userRank.rank}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">XP</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(userRank.total_xp || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Users Above</p>
                      <p className="text-2xl font-bold text-gray-900">{userRank.users_above || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Percentile</p>
                      <p className="text-2xl font-bold text-green-600">Top {userRank.percentile || 0}%</p>
                    </div>
                  </div>

                  {/* Context Users */}
                  {contextUsers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Users Around You</p>
                      <div className="bg-white rounded-xl overflow-hidden">
                        {contextUsers.map((entry) => (
                          <LeaderboardRow key={entry.user_id} entry={entry} compact />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {leaderboard.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Rankings Yet</h3>
                <p className="text-gray-600">
                  {timeframe === 'week'
                    ? 'No activity this week. Be the first to earn XP!'
                    : timeframe === 'month'
                    ? 'No activity this month. Be the first to earn XP!'
                    : 'Start learning to appear on the leaderboard!'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <p className="text-xs text-gray-600 font-medium">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

// Timeframe Button Component
function TimeframeButton({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  const getRankBadge = (rank: number) => {
    if (rank <= 3) return null; // Top 3 in podium
    if (rank <= 10) return '🔥';
    if (rank <= 50) return '⭐';
    return '';
  };

  return (
    <div
      className={`flex items-center justify-between ${
        compact ? 'p-3' : 'p-6'
      } hover:bg-gray-50 transition-all ${entry.is_current_user ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Rank */}
        <div
          className={`${
            compact ? 'w-10' : 'w-12'
          } text-center font-bold ${
            entry.is_current_user ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <span className={compact ? 'text-base' : 'text-lg'}>#{entry.rank}</span>
          {getRankBadge(entry.rank) && (
            <span className="ml-1 text-xs">{getRankBadge(entry.rank)}</span>
          )}
        </div>

        {/* Avatar */}
        <div
          className={`${
            compact ? 'w-10 h-10' : 'w-12 h-12'
          } rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ${
            entry.is_current_user ? 'ring-4 ring-blue-400' : ''
          }`}
        >
          <span className={compact ? 'text-lg' : 'text-xl'}>{entry.avatar_emoji}</span>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {entry.username}
            </p>
            {entry.is_current_user && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                YOU
              </span>
            )}
            {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
          </div>
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>Level {entry.level}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {entry.total_xp.toLocaleString()} XP
          </p>
          <p className="text-xs text-gray-600">
            {entry.lessons_completed} lessons • {entry.streak_days}🔥
          </p>
        </div>
      </div>
    </div>
  );
}
