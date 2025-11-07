import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Award, TrendingUp, Flame, Calendar, Edit2, Check, X, Eye, EyeOff, Wallet, BookOpen, Trophy, Target, Lock, Download, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useWallet } from '../../contexts/WalletContext';
import { useUserStats } from '../../hooks/useStats';
import { useCompletedCourses } from '../../hooks/useEnrollment';
import { useUserBadgesWithStatus } from '../../hooks/useBadges';
import { useUpdateUserProfile } from '../../hooks/useUser';
import { ProgressChart } from '../dashboard/ProgressChart';
import { StreakCalendar } from '../dashboard/StreakCalendar';
import { CertificatesGallery } from '../profile/CertificatesGallery';
import { CourseCompleteModal } from '../CourseCompleteModal';

export function Profile() {
  const { username: urlUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useWallet();

  // Use URL username if provided, otherwise use current user
  const isOwnProfile = !urlUsername || urlUsername === user?.username;
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { enrollments: completedCourses, isLoading: coursesLoading } = useCompletedCourses(user?.id);
  const { data: allBadges, isLoading: badgesLoading } = useUserBadgesWithStatus(user?.id);
  const updateProfile = useUpdateUserProfile();

  // Redirect to own profile if viewing someone else's profile (in useEffect to avoid render warning)
  useEffect(() => {
    if (user && !isOwnProfile) {
      navigate(`/profile/${user.username}`, { replace: true });
    }
  }, [user, isOwnProfile, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <p className="text-gray-600">Please connect your wallet to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  // If viewing someone else's profile, show loading while redirect happens
  if (!isOwnProfile) {
    return null;
  }

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user.username || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [editedAvatar, setEditedAvatar] = useState(user.avatar_emoji || '👤');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(user.email || '');
  const [showBalance, setShowBalance] = useState(false);
  const [certificateModal, setCertificateModal] = useState<{ show: boolean; courseId: string; courseName: string }>({
    show: false,
    courseId: '',
    courseName: ''
  });
  const [showBadges, setShowBadges] = useState(false);
  const [showLockedBadges, setShowLockedBadges] = useState(false);

  const isLoading = statsLoading || coursesLoading || badgesLoading;
  const memberSince = user.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Recently';

  const handleSaveUsername = async () => {
    if (editedUsername.trim() === '') {
      toast.error('Username cannot be empty');
      return;
    }

    const result = await updateProfile.mutateAsync({
      userId: user.id,
      updates: { username: editedUsername.trim() }
    });

    if (result.success) {
      setIsEditingUsername(false);
      toast.success('Username updated successfully!');
      // Refetch user to update context
      if (refreshUser) refreshUser();
    } else {
      toast.error(result.error || 'Failed to update username');
    }
  };

  const handleCancelUsernameEdit = () => {
    setEditedUsername(user.username);
    setIsEditingUsername(false);
  };

  const handleSaveAvatar = async () => {
    if (!editedAvatar.trim()) {
      toast.error('Please select an emoji');
      return;
    }

    const result = await updateProfile.mutateAsync({
      userId: user.id,
      updates: { avatar_emoji: editedAvatar }
    });

    if (result.success) {
      setIsEditingAvatar(false);
      toast.success('Avatar updated successfully!');
      // Refetch user to update context
      if (refreshUser) refreshUser();
    } else {
      toast.error(result.error || 'Failed to update avatar');
    }
  };

  const handleCancelAvatarEdit = () => {
    setEditedAvatar(user.avatar_emoji || '👤');
    setIsEditingAvatar(false);
  };

  const handleSaveEmail = async () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedEmail && !emailRegex.test(editedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const result = await updateProfile.mutateAsync({
      userId: user.id,
      updates: { email: editedEmail.trim() || null }
    });

    if (result.success) {
      setIsEditingEmail(false);
      toast.success('Email updated successfully!');
      // Refetch user to update context
      if (refreshUser) refreshUser();
    } else {
      toast.error(result.error || 'Failed to update email');
    }
  };

  const handleCancelEmailEdit = () => {
    setEditedEmail(user.email || '');
    setIsEditingEmail(false);
  };

  const earnedBadgesCount = allBadges?.filter(b => b.earned).length || 0;
  const lockedBadgesCount = allBadges?.filter(b => !b.earned).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 mb-6 md:mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-32 bg-gradient-to-br from-[#0084C7]/20 to-[#00a8e8]/20 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,132,199,0.2),inset_-4px_-4px_16px_rgba(0,0,0,0.05),inset_4px_4px_16px_rgba(255,255,255,0.9)]">
                <span className="text-6xl">{stats?.avatarEmoji || user.avatar_emoji || '👤'}</span>
              </div>

              {/* Avatar Edit Controls */}
              {isEditingAvatar ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedAvatar}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Limit to 2 characters (for emojis)
                      if (value.length <= 2) {
                        setEditedAvatar(value);
                      }
                    }}
                    placeholder="Type emoji"
                    className="w-20 text-center text-2xl px-2 py-1 border-2 border-[#0084C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]/50"
                    autoFocus
                    maxLength={2}
                  />
                  <button
                    onClick={handleSaveAvatar}
                    className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelAvatarEdit}
                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingAvatar(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#0084C7]/10 text-[#0084C7] text-sm rounded-xl hover:bg-[#0084C7]/20 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Avatar
                </button>
              )}
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
                      onClick={handleCancelUsernameEdit}
                      className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="mb-0">{stats?.username || editedUsername}</h1>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-2 bg-[#0084C7]/10 text-[#0084C7] rounded-xl hover:bg-[#0084C7]/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Member Since */}
              <p className="text-gray-600 mb-2">Member since {memberSince}</p>

              {/* Email with Edit */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                {isEditingEmail ? (
                  <>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="px-3 py-1 border-2 border-[#0084C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]/50 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEmailEdit}
                      className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {user.email || 'No email set'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="p-2 bg-[#0084C7]/10 text-[#0084C7] rounded-xl hover:bg-[#0084C7]/20 transition-colors"
                      title="Edit Email"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <StatBadge
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Level"
                  value={isLoading ? '...' : (stats?.currentLevel || user.current_level || 1).toString()}
                  color="blue"
                />
                <StatBadge
                  icon={<Award className="w-5 h-5" />}
                  label="Total XP"
                  value={isLoading ? '...' : (stats?.totalXp || user.total_xp || 0).toLocaleString()}
                  color="yellow"
                />
                <StatBadge
                  icon={<Flame className="w-5 h-5" />}
                  label="Streak"
                  value={isLoading ? '...' : `${stats?.currentStreak || user.current_streak || 0} days`}
                  color="orange"
                />
                <StatBadge
                  icon={<Trophy className="w-5 h-5" />}
                  label="Rank"
                  value={isLoading ? '...' : `#${stats?.leaderboardRank || 0}`}
                  color="purple"
                />
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700">
                Level {stats?.currentLevel || user.current_level || 1} Progress
              </span>
              <span className="text-[#0084C7]">
                {isLoading ? 'Loading...' : `${stats?.xpToNextLevel || 0} XP to next level`}
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
              <div
                className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,132,199,0.5)]"
                style={{ width: `${stats?.levelProgress || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* NFT Certificates Gallery - Moved to top */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-0">NFT Certificates</h2>
            </div>
            <CertificatesGallery />
          </div>
        </div>

        {/* Completed Courses - Claim Certificates */}
        {completedCourses && completedCourses.length > 0 && (
          <div className="mb-6 md:mb-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-0">
                  Completed Courses
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {completedCourses.map((enrollment) => (
                <div
                  key={enrollment.course_id}
                  className="bg-white rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {(enrollment as any).course?.title || enrollment.courses?.title || 'Course Title'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Completed {enrollment.completed_at ? format(new Date(enrollment.completed_at), 'MMM d, yyyy') : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-green-600 font-semibold">100%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full w-full" />
                    </div>
                  </div>

                  <button
                    onClick={() => setCertificateModal({
                      show: true,
                      courseId: enrollment.course_id,
                      courseName: (enrollment as any).course?.title || enrollment.courses?.title || 'Course'
                    })}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(251,191,36,0.3)]"
                  >
                    <Award className="w-5 h-5" />
                    View Certificate
                  </button>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements & Badges - Collapsible */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading badges...</p>
              </div>
            ) : allBadges && allBadges.length > 0 ? (
              <>
                {/* Earned Badges Section */}
                {earnedBadgesCount > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowBadges(!showBadges)}
                      className="w-full flex items-center justify-between mb-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                          <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-2xl font-bold text-gray-900 mb-0">
                            Earned Badges
                          </h2>
                          <p className="text-sm text-gray-600">{earnedBadgesCount} badges unlocked</p>
                        </div>
                      </div>
                      {showBadges ? (
                        <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                    {showBadges && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {allBadges.filter(b => b.earned).map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} earned={true} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Locked Badges Section */}
                {lockedBadgesCount > 0 && (
                  <div>
                    <button
                      onClick={() => setShowLockedBadges(!showLockedBadges)}
                      className="w-full flex items-center justify-between mb-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                          <Lock className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-2xl font-bold text-gray-900 mb-0">
                            Locked Badges
                          </h2>
                          <p className="text-sm text-gray-600">{lockedBadgesCount} badges to unlock</p>
                        </div>
                      </div>
                      {showLockedBadges ? (
                        <ChevronUp className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                    {showLockedBadges && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {allBadges.filter(b => !b.earned).map((badge) => (
                          <BadgeCard key={badge.id} badge={badge} earned={false} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                  <Award className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No badges available</h3>
                <p className="text-gray-600">Badges will appear as you progress!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {certificateModal.show && (
        <CourseCompleteModal
          isOpen={certificateModal.show}
          onClose={() => setCertificateModal({ show: false, courseId: '', courseName: '' })}
          courseName={certificateModal.courseName}
          courseId={certificateModal.courseId}
        />
      )}
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
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function BadgeCard({ badge, earned }: { badge: any; earned: boolean }) {
  const rarityColors = {
    common: {
      bg: 'from-gray-50 to-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-700',
      glow: 'shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
    },
    rare: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      glow: 'shadow-[0_4px_16px_rgba(59,130,246,0.15)]'
    },
    epic: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
      glow: 'shadow-[0_4px_16px_rgba(168,85,247,0.2)]'
    },
    legendary: {
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-700',
      glow: 'shadow-[0_4px_16px_rgba(251,191,36,0.25)]'
    }
  };

  const colors = rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common;

  // Locked badge styling
  const lockedClass = !earned ? 'opacity-50 grayscale' : '';
  const lockedBorder = !earned ? 'border-gray-300' : colors.border;

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} border-2 ${lockedBorder} rounded-xl md:rounded-2xl p-3 md:p-4 ${earned ? colors.glow : 'shadow-[0_4px_16px_rgba(0,0,0,0.06)]'} ${earned ? 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1' : ''} transition-all relative ${lockedClass}`}
    >
      {/* Lock Icon for Locked Badges */}
      {!earned && (
        <div className="absolute top-1 right-1 md:top-2 md:right-2">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-500 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </div>
        </div>
      )}

      {/* Badge Icon */}
      <div className="flex justify-center mb-2 md:mb-3">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
          <span className="text-2xl md:text-4xl">{badge.icon_emoji}</span>
        </div>
      </div>

      {/* Badge Name */}
      <h4 className={`text-center mb-1 text-sm md:text-base ${colors.text} font-bold line-clamp-1`}>
        {badge.name}
      </h4>

      {/* Badge Rarity */}
      <p className={`text-xs text-center ${colors.text} opacity-80 mb-2 uppercase tracking-wide font-medium`}>
        {badge.rarity}
      </p>

      {/* Badge Description */}
      <p className="text-xs text-center text-gray-600 mb-2 md:mb-3 line-clamp-2">
        {badge.description}
      </p>

      {/* Earned Date or Locked Status */}
      {earned && badge.earned_at ? (
        <div className="pt-2 md:pt-3 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            {format(new Date(badge.earned_at), 'MMM d, yyyy')}
          </p>
        </div>
      ) : !earned && (
        <div className="pt-2 md:pt-3 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500 font-medium">
            🔒 Locked
          </p>
        </div>
      )}

      {/* XP Reward Badge */}
      <div className="mt-2 md:mt-3 flex items-center justify-center gap-1">
        <Award className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600 font-medium">+{badge.xp_reward} XP</span>
      </div>
    </div>
  );
}
