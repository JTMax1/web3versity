import React from 'react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  userAvatar?: string;
  username?: string;
  hederaAccountId?: string;
}

export function Navigation({ currentPage, onNavigate, isLoggedIn, onLogin, onLogout, userAvatar, username, hederaAccountId }: NavigationProps) {
  // Helper function to truncate username
  const truncateUsername = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Helper function to format Hedera account ID (show first 4 and last 4)
  const formatHederaId = (id: string) => {
    if (!id) return '';
    const parts = id.split('.');
    if (parts.length === 3) {
      const lastPart = parts[2];
      if (lastPart.length > 8) {
        return `${parts[0]}.${parts[1]}.${lastPart.substring(0, 4)}...${lastPart.substring(lastPart.length - 4)}`;
      }
    }
    return id;
  };
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] group-hover:scale-105 transition-transform">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Web3versity</span>
          </button>

          {/* Navigation Links */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <NavButton 
                label="Dashboard" 
                active={currentPage === 'dashboard'} 
                onClick={() => onNavigate('dashboard')}
              />
              <NavButton 
                label="Courses" 
                active={currentPage === 'courses'} 
                onClick={() => onNavigate('courses')}
              />
              <NavButton 
                label="Playground" 
                active={currentPage === 'playground'} 
                onClick={() => onNavigate('playground')}
              />
              <NavButton 
                label="Community" 
                active={currentPage === 'community'} 
                onClick={() => onNavigate('community')}
              />
              <NavButton 
                label="Faucet" 
                active={currentPage === 'faucet'} 
                onClick={() => onNavigate('faucet')}
              />
              <NavButton 
                label="Leaderboard" 
                active={currentPage === 'leaderboard'} 
                onClick={() => onNavigate('leaderboard')}
              />
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-3 bg-white/90 rounded-full px-4 py-2 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform"
                >
                  <span className="text-xl">{userAvatar || '👨‍💻'}</span>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-[#0084C7] text-sm">{username ? truncateUsername(username) : 'User'}</span>
                    {hederaAccountId && (
                      <span className="text-gray-500 text-xs">{formatHederaId(hederaAccountId)}</span>
                    )}
                  </div>
                </button>
                <Button
                  onClick={onLogout}
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-full px-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={onLogin}
                className="bg-white text-[#0084C7] hover:bg-white/90 rounded-full px-8 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)]"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full transition-all ${
        active 
          ? 'bg-white/90 text-[#0084C7] shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)]' 
          : 'text-white/90 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}
