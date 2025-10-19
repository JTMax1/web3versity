import React, { useState } from 'react';
import { User, Badge as BadgeType } from '../../lib/mockData';
import { calculateLevelProgress, getRarityColor } from '../../lib/utils';
import { Award, TrendingUp, Flame, Calendar, Edit2, Check, X, Eye, EyeOff, Wallet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileProps {
  user: User;
  badges: BadgeType[];
}

export function Profile({ user, badges }: ProfileProps) {
  const levelProgress = calculateLevelProgress(user.totalPoints);
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user.username);
  const [showBalance, setShowBalance] = useState(false);

  const handleSaveUsername = () => {
    if (editedUsername.trim() === '') {
      toast.error('Username cannot be empty');
      return;
    }
    // In a real app, this would save to backend
    setIsEditingUsername(false);
    toast.success('Username updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedUsername(user.username);
    setIsEditingUsername(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-[#0084C7]/20 to-[#00a8e8]/20 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,132,199,0.2),inset_-4px_-4px_16px_rgba(0,0,0,0.05),inset_4px_4px_16px_rgba(255,255,255,0.9)]">
              <span className="text-6xl">{user.profilePicture}</span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Username with Edit */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                {isEditingUsername ? (
                  <>
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="px-3 py-1 border-2 border-[#0084C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]/50"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="mb-0">{editedUsername}</h1>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-2 bg-[#0084C7]/10 text-[#0084C7] rounded-xl hover:bg-[#0084C7]/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Hedera Account ID */}
              {user.hederaAccountId && (
                <p className="text-gray-600 mb-2">Hedera ID: {user.hederaAccountId}</p>
              )}

              {/* Wallet Balance */}
              {user.walletBalance !== undefined && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#0084C7]/10 to-[#00a8e8]/10 px-4 py-2 rounded-xl shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                    <Wallet className="w-5 h-5 text-[#0084C7]" />
                    <span className="text-[#0084C7]">
                      {showBalance ? `${user.walletBalance.toFixed(2)} HBAR` : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-[#0084C7]/10 rounded-lg transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="w-4 h-4 text-[#0084C7]" />
                      ) : (
                        <Eye className="w-4 h-4 text-[#0084C7]" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <StatBadge
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Level"
                  value={user.level.toString()}
                  color="blue"
                />
                <StatBadge
                  icon={<Award className="w-5 h-5" />}
                  label="Points"
                  value={user.totalPoints.toLocaleString()}
                  color="yellow"
                />
                <StatBadge
                  icon={<Flame className="w-5 h-5" />}
                  label="Streak"
                  value={`${user.streakDays} days`}
                  color="orange"
                />
                <StatBadge
                  icon={<Calendar className="w-5 h-5" />}
                  label="Badges"
                  value={earnedBadges.length.toString()}
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">Level {user.level} Progress</span>
              <span className="text-[#0084C7]">
                {levelProgress.currentLevelPoints}/{levelProgress.nextLevelPoints} pts
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
              <div 
                className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,132,199,0.5)]"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {levelProgress.nextLevelPoints - levelProgress.currentLevelPoints} points to Level {user.level + 1}
            </p>
          </div>
        </div>

        {/* Earned Badges */}
        <div className="mb-8">
          <h2 className="mb-6">Earned Badges ({earnedBadges.length})</h2>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="mb-2">No badges yet</h3>
              <p className="text-gray-600">Complete lessons and challenges to earn your first badge!</p>
            </div>
          )}
        </div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <h2 className="mb-6">Locked Badges ({lockedBadges.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {lockedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} locked />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'yellow' | 'orange' | 'purple' }) {
  const colorClasses = {
    blue: 'from-[#0084C7]/10 to-[#00a8e8]/20 text-[#0084C7]',
    yellow: 'from-yellow-100 to-yellow-200 text-yellow-600',
    orange: 'from-orange-100 to-orange-200 text-orange-500',
    purple: 'from-purple-100 to-purple-200 text-purple-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} px-4 py-3 rounded-2xl shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm opacity-80">{label}</span>
      </div>
      <div className="text-xl">{value}</div>
    </div>
  );
}

function BadgeCard({ badge, locked = false }: { badge: BadgeType; locked?: boolean }) {
  const rarityColor = getRarityColor(badge.rarity);

  return (
    <div className={`bg-white rounded-3xl p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-1 group ${locked ? 'opacity-50' : ''}`}>
      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform ${locked ? 'grayscale' : ''}`}>
        <span className="text-3xl">{badge.image}</span>
      </div>
      {locked && (
        <div className="mb-2">
          <span className="text-2xl">🔒</span>
        </div>
      )}
      <h4 className="mb-2 text-sm">{badge.name}</h4>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
        {badge.description}
      </p>
      <div 
        className="text-xs capitalize"
        style={{ color: rarityColor }}
      >
        {badge.rarity}
      </div>
      {badge.earnedAt && !locked && (
        <div className="text-xs text-gray-500 mt-2">
          Earned: {badge.earnedAt}
        </div>
      )}
    </div>
  );
}
