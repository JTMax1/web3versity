/**
 * DeFi Simulator Component
 *
 * Interactive interface for learning DeFi concepts through simulation.
 * Users can deposit/withdraw from liquidity pools and see rewards calculations.
 */

import React, { useState, useEffect } from 'react';
import {
  MOCK_POOLS,
  LiquidityPool,
  UserPosition,
  simulateDeposit,
  simulateWithdraw,
  calculateRewards,
  getRiskDescription,
  getRiskColor,
  formatTVL,
  getPoolById,
} from '../../../lib/defi/simulator';
import { Button } from '../../ui/button';
import { TrendingUp, TrendingDown, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DeFiSimulatorProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  targetPoolId?: string; // For guided lessons
  targetAmount?: number; // For guided lessons
}

export function DeFiSimulator({
  onSuccess,
  onError,
  targetPoolId,
  targetAmount = 1,
}: DeFiSimulatorProps) {
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(
    targetPoolId ? getPoolById(targetPoolId) || null : null
  );
  const [depositAmount, setDepositAmount] = useState(targetAmount);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [liveRewards, setLiveRewards] = useState(0);

  // Update live rewards every second when user has a position
  useEffect(() => {
    if (!userPosition || !selectedPool) return;

    const interval = setInterval(() => {
      const daysElapsed = Math.max(
        (new Date().getTime() - userPosition.depositedAt.getTime()) / (1000 * 60 * 60 * 24),
        0.001
      );
      const rewards = calculateRewards(userPosition.amount, selectedPool.apy, daysElapsed);
      setLiveRewards(rewards);
    }, 1000);

    return () => clearInterval(interval);
  }, [userPosition, selectedPool]);

  const handleSelectPool = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setUserPosition(null);
    setShowSuccess(false);
  };

  const handleDeposit = async () => {
    if (!selectedPool || depositAmount <= 0) {
      toast.error('Please enter a valid deposit amount');
      onError?.('Invalid deposit amount');
      return;
    }

    setIsDepositing(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const position = simulateDeposit(selectedPool.id, depositAmount);
    setUserPosition(position);
    setIsDepositing(false);
    setShowSuccess(true);

    toast.success('🎉 Successfully deposited into pool!', {
      description: `${depositAmount} HBAR deposited into ${selectedPool.name}`,
    });

    onSuccess?.();
  };

  const handleWithdraw = () => {
    if (!userPosition || !selectedPool) return;

    const result = simulateWithdraw(userPosition);

    toast.success('Withdrawal successful!', {
      description: `Principal: ${result.principal.toFixed(4)} ℏ | Rewards: ${result.rewards.toFixed(6)} ℏ`,
    });

    setUserPosition(null);
    setShowSuccess(false);
  };

  // Pool selection view
  if (!selectedPool) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Select a Liquidity Pool</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_POOLS.map(pool => (
            <div
              key={pool.id}
              onClick={() => handleSelectPool(pool)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-[#0084C7]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {pool.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{pool.name}</h4>
                  <p className="text-sm text-gray-600">{pool.protocol}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">TVL:</span>
                  <span className="font-semibold text-gray-900">{formatTVL(pool.tvl)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">APY:</span>
                  <span className="font-bold text-green-600 text-lg">{pool.apy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk:</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRiskColor(pool.risk)}`}>
                    {pool.risk.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600">{pool.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pool details and deposit/withdraw view
  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <div className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-3xl p-8 text-white shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
        <button
          onClick={() => setSelectedPool(null)}
          className="text-white/90 hover:text-white text-sm mb-4"
        >
          ← Back to Pools
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
            {selectedPool.icon}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{selectedPool.name}</h2>
            <p className="text-white/80">{selectedPool.protocol}</p>
          </div>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="text-sm text-gray-600 mb-2">Total Value Locked</div>
          <div className="text-2xl font-bold text-gray-900">{formatTVL(selectedPool.tvl)}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="text-sm text-gray-600 mb-2">Annual Percentage Yield</div>
          <div className="text-2xl font-bold text-green-600">{selectedPool.apy}%</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="text-sm text-gray-600 mb-2">Risk Level</div>
          <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getRiskColor(selectedPool.risk)}`}>
            {selectedPool.risk.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Risk Description */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>Risk Level:</strong> {getRiskDescription(selectedPool.risk)}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              This is a simulated environment for learning. In real DeFi, you would earn actual rewards but also face impermanent loss and smart contract risks.
            </p>
          </div>
        </div>
      </div>

      {/* User Position or Deposit Form */}
      {!userPosition ? (
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Deposit into Pool</h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deposit Amount (HBAR)
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-lg"
            />
          </div>

          {/* Expected Returns */}
          {depositAmount > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Expected Returns</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Daily:</span>
                  <span className="font-bold text-green-600">
                    +{calculateRewards(depositAmount, selectedPool.apy, 1).toFixed(6)} ℏ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Weekly:</span>
                  <span className="font-bold text-green-600">
                    +{calculateRewards(depositAmount, selectedPool.apy, 7).toFixed(6)} ℏ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Monthly:</span>
                  <span className="font-bold text-green-600">
                    +{calculateRewards(depositAmount, selectedPool.apy, 30).toFixed(4)} ℏ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Yearly:</span>
                  <span className="font-bold text-green-600 text-lg">
                    +{calculateRewards(depositAmount, selectedPool.apy, 365).toFixed(4)} ℏ
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleDeposit}
            disabled={isDepositing || depositAmount <= 0}
            className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl text-lg font-semibold shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all disabled:opacity-50"
          >
            {isDepositing ? 'Depositing...' : 'Deposit into Pool'}
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 mb-6">
            {showSuccess && <CheckCircle className="w-8 h-8 text-green-600" />}
            <h3 className="text-2xl font-bold text-gray-900">Your Position</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-green-200">
              <span className="text-gray-700">Deposited Amount:</span>
              <span className="font-bold text-gray-900">{userPosition.amount.toFixed(4)} ℏ</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-green-200">
              <span className="text-gray-700">Current Rewards:</span>
              <span className="font-bold text-green-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                +{liveRewards.toFixed(6)} ℏ
              </span>
            </div>
            <div className="flex items-center justify-between py-3 bg-white rounded-xl px-4">
              <span className="font-semibold text-gray-900">Total Value:</span>
              <span className="font-bold text-[#0084C7] text-xl">
                {(userPosition.amount + liveRewards).toFixed(6)} ℏ
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Rewards accumulate every second based on the pool's APY. In a real DeFi protocol, rewards would be distributed through smart contracts.
            </p>
          </div>

          <Button
            onClick={handleWithdraw}
            variant="outline"
            className="w-full py-6 rounded-2xl text-lg font-semibold"
          >
            Withdraw All
          </Button>
        </div>
      )}
    </div>
  );
}
