import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';
import { useUserStats } from '../hooks/useStats';
import { Menu, X } from 'lucide-react';
import { ProfileDropdown } from './profile/ProfileDropdown';

// ===== Helpers =====
const formatEvmAddress = (address: string) => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const formatAccountId = (id: string) => {
  if (!id) return '';
  if (id.startsWith('0x')) return formatEvmAddress(id);
  const parts = id.split('.');
  if (parts.length === 3) {
    const lastPart = parts[2];
    if (lastPart.length > 8) {
      return `${parts[0]}.${parts[1]}.${lastPart.substring(0, 4)}...${lastPart.substring(lastPart.length - 4)}`;
    }
  }
  return id;
};

const formatBalance = (bal: number) => bal.toFixed(2);

// ===== Component =====
export function Navigation() {
  const location = useLocation();
  const { connected, account, accountId, balance, loading, connect, disconnect, user } = useWallet();
  const { data: stats } = useUserStats(user?.id);

  const previousConnected = useRef(connected);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (connected && !previousConnected.current) {
      toast.success('Wallet connected successfully!', {
        description: `Connected to Hedera Testnet`
      });
    }
    previousConnected.current = connected;
  }, [connected]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: unknown) {
      console.error('Connection error:', error);

      const message =
        (typeof error === 'object' && error && 'message' in error && typeof (error as any).message === 'string')
          ? (error as any).message
          : 'Failed to connect wallet';

      if (!message.includes('rejected') && !message.includes('denied')) {
        toast.error('Connection failed', {
          description: message,
          duration: 5000
        });
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Left Section: Hamburger (mobile only) + Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - ONLY on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo + Brand text only shown on desktop */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/w3v-logo.png"
                alt="Web3versity Logo"
                className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
              />
              <span className="hidden md:inline-block text-white text-xl md:text-2xl font-bold tracking-tight drop-shadow-md">
                Web3versity
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavButton
              label="Courses"
              to="/courses"
              active={location.pathname === '/courses' || location.pathname.startsWith('/courses/')}
            />
            <NavButton
              label="Leaderboard"
              to="/leaderboard"
              active={location.pathname === '/leaderboard'}
            />
            <NavButton
              label="Community"
              to="/community"
              active={location.pathname === '/community'}
            />

            {connected && (
              <>
                <NavButton
                  label="Dashboard"
                  to="/dashboard"
                  active={location.pathname === '/dashboard'}
                />
                <NavButton
                  label="AI Generator ✨"
                  to="/ai/generate"
                  active={location.pathname === '/ai/generate'}
                />
                <NavButton
                  label="Playground"
                  to="/playground"
                  active={location.pathname === '/playground'}
                />
                <NavButton
                  label="Faucet"
                  to="/faucet"
                  active={location.pathname === '/faucet'}
                />
                {stats?.isEducator && (
                  <NavButton
                    label="Review Courses"
                    to="/admin/review"
                    active={location.pathname === '/admin/review'}
                  />
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {connected ? (
              <ProfileDropdown />
            ) : (
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-white text-[#0084C7] hover:bg-white/90 rounded-full px-6 md:px-8 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all text-sm md:text-base"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col gap-2">
              <MobileNavButton
                label="Courses"
                to="/courses"
                active={location.pathname === '/courses' || location.pathname.startsWith('/courses/')}
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavButton
                label="Leaderboard"
                to="/leaderboard"
                active={location.pathname === '/leaderboard'}
                onClick={() => setMobileMenuOpen(false)}
              />
              <MobileNavButton
                label="Community"
                to="/community"
                active={location.pathname === '/community'}
                onClick={() => setMobileMenuOpen(false)}
              />

              {connected && (
                <>
                  <div className="my-2 border-t border-white/20"></div>
                  <MobileNavButton
                    label="Dashboard"
                    to="/dashboard"
                    active={location.pathname === '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <MobileNavButton
                    label="Playground"
                    to="/playground"
                    active={location.pathname === '/playground'}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <MobileNavButton
                    label="Faucet"
                    to="/faucet"
                    active={location.pathname === '/faucet'}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  {stats?.isEducator && (
                    <MobileNavButton
                      label="Review Courses"
                      to="/admin/review"
                      active={location.pathname === '/admin/review'}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  )}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <button
                      onClick={() => {
                        handleDisconnect();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ===== Subcomponents =====
function NavButton({ label, to, active }: { label: string; to: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full transition-all ${
        active
          ? 'bg-white/90 text-[#0084C7] shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.9)]'
          : 'text-white/90 hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavButton({
  label,
  to,
  active,
  onClick
}: {
  label: string;
  to: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-xl transition-all text-left font-medium ${
        active
          ? 'bg-white/20 text-white shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.1)]'
          : 'text-white/90 hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
}
