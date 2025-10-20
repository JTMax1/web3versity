import React from 'react';
import { Button } from './ui/button';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner@2.0.3';
import { useUserStats } from '../hooks/useStats';


interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { connected, account, accountId, balance, loading, connect, disconnect } = useWallet();
  const { user } = useWallet();
  const { data: stats } = useUserStats(user?.id);


  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!', {
        description: `Connected to Hedera Testnet`
      });
    } catch (error: any) {
      toast.error('Connection failed', {
        description: error.message || 'Failed to connect wallet'
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };
  // Helper function to format EVM address (show first 6 and last 4)
  const formatEvmAddress = (address: string) => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Helper function to format Hedera account ID
  const formatAccountId = (id: string) => {
    if (!id) return '';
    // If it's an EVM address (starts with 0x), format as EVM
    if (id.startsWith('0x')) {
      return formatEvmAddress(id);
    }
    // Otherwise, it's a Hedera account ID (0.0.xxxxx format)
    const parts = id.split('.');
    if (parts.length === 3) {
      const lastPart = parts[2];
      if (lastPart.length > 8) {
        return `${parts[0]}.${parts[1]}.${lastPart.substring(0, 4)}...${lastPart.substring(lastPart.length - 4)}`;
      }
    }
    return id;
  };

  // Format balance with 2 decimals
  const formatBalance = (bal: number) => {
    return bal.toFixed(2);
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
          {connected && (
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
            {connected ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-3 bg-white/90 rounded-full px-4 py-2 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform"
                >
                  <span className="text-xl">{stats?.avatarEmoji || '👤'}</span>
                  <div className="hidden md:flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[#0084C7] text-sm font-medium">
                        {formatEvmAddress(account || '')}
                      </span>
                      <span className="text-[#0084C7] text-xs bg-green-100 px-2 py-0.5 rounded-full">
                        {formatBalance(balance)} ℏ
                      </span>
                    </div>
                    {accountId && (
                      <span className="text-gray-500 text-xs">
                        {formatAccountId(accountId)}
                      </span>
                    )}
                  </div>
                </button>
                <Button
                  onClick={handleDisconnect}
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-full px-6 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-white text-[#0084C7] hover:bg-white/90 rounded-full px-8 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
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
