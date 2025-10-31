import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useUserStats } from '../../hooks/useStats';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function ProfileDropdown() {
  const { user, accountId, disconnect } = useWallet();
  const { data: stats } = useUserStats(user?.id);
  const navigate = useNavigate();

  if (!user) return null;

  // Use calculated level from stats, fallback to database value
  const currentLevel = stats?.currentLevel || user.current_level || 1;

  const handleMyProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const formatAccountId = (id: string | null) => {
    if (!id) return '';
    // Truncate to first 11 characters for long addresses, or full if shorter
    return id.length > 11 ? `${id.slice(0, 11)}...` : id;
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 outline-none focus:ring-2 focus:ring-[#0084C7] focus:ring-offset-2">
          {/* Avatar with Account ID */}
          {accountId && (
            <span className="hidden lg:inline text-xs font-mono text-gray-700">
              {formatAccountId(accountId)}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0084C7] to-[#00a8e8] flex items-center justify-center text-white text-lg font-medium shadow-inner">
            {user.avatar_emoji || '👤'}
          </div>
          <div className=" md:block text-left">
            <div className="text-sm font-semibold text-gray-900 leading-tight">
              {user.username}
            </div>
            <div className="text-xs text-gray-500 leading-tight">
              {/* Level {currentLevel} */}
              {formatAccountId(accountId)}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[280px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
          sideOffset={8}
          align="end"
        >
          {/* User Info Header */}
          <div className="px-4 py-4 bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0084C7] to-[#00a8e8] flex items-center justify-center text-white text-2xl font-medium shadow-lg">
                {user.avatar_emoji || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {user.username}
                </div>
                {user.email && (
                  <div className="text-xs text-gray-600 truncate">
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            {/* XP & Level */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">Level</span>
                <span className="font-bold text-[#0084C7]">{currentLevel}</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">XP</span>
                <span className="font-bold text-[#0084C7]">
                  {user.total_xp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Hedera Account ID */}
            {accountId && (
              <div className="mt-2 px-3 py-1.5 bg-white rounded-lg text-xs">
                <span className="text-gray-500">Hedera: </span>
                <span className="font-mono font-medium text-gray-900">
                  {formatAccountId(accountId)}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
              onSelect={handleMyProfile}
            >
              <User className="w-5 h-5 text-gray-600" />
              My Profile
            </DropdownMenu.Item>

            {user.is_admin && (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                onSelect={handleAdminDashboard}
              >
                <Shield className="w-5 h-5 text-purple-600" />
                Admin Dashboard
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="my-2 h-px bg-gray-100" />

            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-red-50 transition-colors outline-none cursor-pointer group"
              onSelect={handleDisconnect}
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              <span className="group-hover:text-red-600 transition-colors">
                Disconnect Wallet
              </span>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
