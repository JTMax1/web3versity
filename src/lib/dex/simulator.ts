/**
 * DEX (Decentralized Exchange) Simulator
 *
 * Educational simulator for demonstrating token swaps and DEX mechanics
 * without using real funds.
 */

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: number; // User's simulated balance
  usdPrice: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  priceImpact: number;
  fee: number;
  minimumReceived: number;
}

// Mock tokens available on Hedera DEXes
export const MOCK_TOKENS: Token[] = [
  {
    symbol: 'HBAR',
    name: 'Hedera',
    icon: 'ℏ',
    balance: 100,
    usdPrice: 0.08,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    balance: 50,
    usdPrice: 1.00,
  },
  {
    symbol: 'SAUCE',
    name: 'SaucerSwap Token',
    icon: '🌶️',
    balance: 500,
    usdPrice: 0.012,
  },
  {
    symbol: 'HBARX',
    name: 'Stader Staked HBAR',
    icon: '🔒',
    balance: 25,
    usdPrice: 0.085,
  },
  {
    symbol: 'PACK',
    name: 'HashPack Token',
    icon: '📦',
    balance: 200,
    usdPrice: 0.005,
  },
  {
    symbol: 'HST',
    name: 'Hedera Starter Token',
    icon: '🚀',
    balance: 1000,
    usdPrice: 0.002,
  },
];

// Mock exchange rates (in practice, these come from liquidity pools)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  HBAR: {
    USDC: 0.08,
    SAUCE: 6.67,
    HBARX: 0.94,
    PACK: 16.0,
    HST: 40.0,
  },
  USDC: {
    HBAR: 12.5,
    SAUCE: 83.33,
    HBARX: 11.76,
    PACK: 200.0,
    HST: 500.0,
  },
  SAUCE: {
    HBAR: 0.15,
    USDC: 0.012,
    HBARX: 0.141,
    PACK: 2.4,
    HST: 6.0,
  },
  HBARX: {
    HBAR: 1.06,
    USDC: 0.085,
    SAUCE: 7.08,
    PACK: 17.0,
    HST: 42.5,
  },
  PACK: {
    HBAR: 0.0625,
    USDC: 0.005,
    SAUCE: 0.417,
    HBARX: 0.059,
    HST: 2.5,
  },
  HST: {
    HBAR: 0.025,
    USDC: 0.002,
    SAUCE: 0.167,
    HBARX: 0.024,
    PACK: 0.4,
  },
};

/**
 * Get exchange rate between two tokens
 */
export function getExchangeRate(fromSymbol: string, toSymbol: string): number {
  if (fromSymbol === toSymbol) return 1;
  return EXCHANGE_RATES[fromSymbol]?.[toSymbol] || 0;
}

/**
 * Calculate price impact based on swap size
 * Larger swaps have higher price impact
 */
export function calculatePriceImpact(
  fromAmount: number,
  fromToken: Token,
  toToken: Token
): number {
  // Simulate price impact (in real DEX, this depends on liquidity depth)
  const swapSizeUSD = fromAmount * fromToken.usdPrice;

  // Small swaps (<$10): minimal impact
  if (swapSizeUSD < 10) return 0.1;
  // Medium swaps ($10-100): moderate impact
  if (swapSizeUSD < 100) return 0.5;
  // Large swaps (>$100): higher impact
  return 1.0 + (swapSizeUSD - 100) / 1000;
}

/**
 * Calculate swap fee (typically 0.3% on most DEXes)
 */
export function calculateSwapFee(fromAmount: number, feePercent: number = 0.3): number {
  return fromAmount * (feePercent / 100);
}

/**
 * Get swap quote
 */
export function getSwapQuote(
  fromToken: Token,
  toToken: Token,
  fromAmount: number,
  slippageTolerance: number = 0.5
): SwapQuote {
  if (fromAmount <= 0) {
    return {
      fromToken,
      toToken,
      fromAmount: 0,
      toAmount: 0,
      exchangeRate: 0,
      priceImpact: 0,
      fee: 0,
      minimumReceived: 0,
    };
  }

  const exchangeRate = getExchangeRate(fromToken.symbol, toToken.symbol);
  const priceImpact = calculatePriceImpact(fromAmount, fromToken, toToken);
  const fee = calculateSwapFee(fromAmount);

  // Calculate output amount considering price impact
  const baseAmount = (fromAmount - fee) * exchangeRate;
  const priceImpactAmount = baseAmount * (priceImpact / 100);
  const toAmount = baseAmount - priceImpactAmount;

  // Minimum received considering slippage
  const minimumReceived = toAmount * (1 - slippageTolerance / 100);

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    exchangeRate,
    priceImpact,
    fee,
    minimumReceived,
  };
}

/**
 * Execute swap (simulation)
 */
export function executeSwap(quote: SwapQuote): {
  success: boolean;
  fromAmount: number;
  toAmount: number;
  actualRate: number;
  message: string;
} {
  // Simulate execution with slight slippage (random between 0-0.3%)
  const executionSlippage = Math.random() * 0.3;
  const actualToAmount = quote.toAmount * (1 - executionSlippage / 100);

  // Check if amount falls within minimum received
  if (actualToAmount < quote.minimumReceived) {
    return {
      success: false,
      fromAmount: quote.fromAmount,
      toAmount: 0,
      actualRate: 0,
      message: 'Swap failed: Price moved beyond slippage tolerance',
    };
  }

  return {
    success: true,
    fromAmount: quote.fromAmount,
    toAmount: actualToAmount,
    actualRate: actualToAmount / quote.fromAmount,
    message: 'Swap executed successfully',
  };
}

/**
 * Get token by symbol
 */
export function getTokenBySymbol(symbol: string): Token | undefined {
  return MOCK_TOKENS.find(t => t.symbol === symbol);
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: number, decimals: number = 4): string {
  return amount.toFixed(decimals);
}

/**
 * Format USD value
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Get price impact color
 */
export function getPriceImpactColor(impact: number): string {
  if (impact < 1) return 'text-green-600';
  if (impact < 3) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get price impact warning
 */
export function getPriceImpactWarning(impact: number): string | null {
  if (impact < 1) return null;
  if (impact < 3) return 'Moderate price impact. Consider reducing swap size.';
  return 'High price impact! You will receive significantly less due to low liquidity.';
}
