/**
 * DeFi Protocol Simulator
 *
 * Educational simulator for demonstrating DeFi concepts like liquidity pools,
 * staking, and yield farming without using real funds.
 */

export interface LiquidityPool {
  id: string;
  name: string;
  pair: string;
  tvl: number; // Total Value Locked in USD
  apy: number; // Annual Percentage Yield
  risk: 'low' | 'medium' | 'high';
  protocol: string;
  icon: string;
  description: string;
}

export interface UserPosition {
  poolId: string;
  amount: number;
  depositedAt: Date;
  rewards: number;
}

// Mock liquidity pools
export const MOCK_POOLS: LiquidityPool[] = [
  {
    id: 'hbar-usdc',
    name: 'HBAR/USDC Pool',
    pair: 'HBAR-USDC',
    tvl: 1500000,
    apy: 12.5,
    risk: 'low',
    protocol: 'SaucerSwap',
    icon: '💧',
    description: 'Stable liquidity pool for HBAR and USDC trading with low impermanent loss risk.',
  },
  {
    id: 'hbar-sauce',
    name: 'HBAR/SAUCE Pool',
    pair: 'HBAR-SAUCE',
    tvl: 800000,
    apy: 35.8,
    risk: 'medium',
    protocol: 'SaucerSwap',
    icon: '🌶️',
    description: 'High-yield pool with moderate risk. SAUCE is the native token of SaucerSwap.',
  },
  {
    id: 'sauce-usdc',
    name: 'SAUCE/USDC Pool',
    pair: 'SAUCE-USDC',
    tvl: 450000,
    apy: 28.3,
    risk: 'medium',
    protocol: 'SaucerSwap',
    icon: '💰',
    description: 'Balanced pool offering good yields with manageable risk.',
  },
  {
    id: 'hbar-hbarx',
    name: 'HBAR/HBARX Pool',
    pair: 'HBAR-HBARX',
    tvl: 2100000,
    apy: 8.2,
    risk: 'low',
    protocol: 'Stader',
    icon: '🔒',
    description: 'Liquid staking pool with very low risk. HBARX is staked HBAR.',
  },
  {
    id: 'pack-usdc',
    name: 'PACK/USDC Pool',
    pair: 'PACK-USDC',
    tvl: 320000,
    apy: 52.1,
    risk: 'high',
    protocol: 'HashPack DEX',
    icon: '📦',
    description: 'High-risk, high-reward pool for experienced DeFi users.',
  },
];

/**
 * Calculate rewards based on deposit amount, APY, and time elapsed
 */
export function calculateRewards(
  amount: number,
  apy: number,
  daysElapsed: number
): number {
  // Convert APY to daily rate
  const dailyRate = apy / 365 / 100;
  // Calculate compound interest
  const rewards = amount * Math.pow(1 + dailyRate, daysElapsed) - amount;
  return rewards;
}

/**
 * Calculate APR (Annual Percentage Rate) from APY
 */
export function apyToApr(apy: number): number {
  // Assuming daily compounding: APR = (1 + APY)^(1/365) - 1) * 365
  return ((Math.pow(1 + apy / 100, 1 / 365) - 1) * 365) * 100;
}

/**
 * Estimate impermanent loss for a given price change
 */
export function estimateImpermanentLoss(priceChangePercent: number): number {
  const priceRatio = 1 + priceChangePercent / 100;
  const il = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  return il * 100; // Return as percentage
}

/**
 * Get risk level description
 */
export function getRiskDescription(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'Stable assets with minimal impermanent loss risk';
    case 'medium':
      return 'Moderate volatility, balanced risk/reward';
    case 'high':
      return 'High volatility, potential for significant impermanent loss';
  }
}

/**
 * Get risk color
 */
export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
  }
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers (TVL)
 */
export function formatTVL(tvl: number): string {
  if (tvl >= 1000000) {
    return `$${(tvl / 1000000).toFixed(2)}M`;
  } else if (tvl >= 1000) {
    return `$${(tvl / 1000).toFixed(1)}K`;
  }
  return `$${tvl.toFixed(0)}`;
}

/**
 * Simulate depositing into a pool
 */
export function simulateDeposit(
  poolId: string,
  amount: number
): UserPosition {
  return {
    poolId,
    amount,
    depositedAt: new Date(),
    rewards: 0,
  };
}

/**
 * Simulate withdrawing from a pool
 */
export function simulateWithdraw(position: UserPosition): {
  principal: number;
  rewards: number;
  total: number;
} {
  const daysElapsed = Math.max(
    (new Date().getTime() - position.depositedAt.getTime()) / (1000 * 60 * 60 * 24),
    0.001 // Minimum to avoid division by zero
  );

  const pool = MOCK_POOLS.find(p => p.id === position.poolId);
  if (!pool) {
    return {
      principal: position.amount,
      rewards: 0,
      total: position.amount,
    };
  }

  const rewards = calculateRewards(position.amount, pool.apy, daysElapsed);

  return {
    principal: position.amount,
    rewards: rewards,
    total: position.amount + rewards,
  };
}

/**
 * Get pool by ID
 */
export function getPoolById(poolId: string): LiquidityPool | undefined {
  return MOCK_POOLS.find(p => p.id === poolId);
}
