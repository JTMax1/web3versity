/**
 * DEX Swapper Component
 *
 * Interactive interface for learning decentralized token swapping.
 * Educational simulation of DEX mechanics like slippage, price impact, and liquidity.
 */

import React, { useState, useEffect } from 'react';
import {
  MOCK_TOKENS,
  Token,
  SwapQuote,
  getSwapQuote,
  executeSwap,
  formatTokenAmount,
  formatUSD,
  getPriceImpactColor,
  getPriceImpactWarning,
  getTokenBySymbol,
} from '../../../lib/dex/simulator';
import { Button } from '../../ui/button';
import { ArrowDownUp, Settings, AlertCircle, CheckCircle, Loader2, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface DEXSwapperProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultFromToken?: string;
  defaultToToken?: string;
  defaultAmount?: number;
}

export function DEXSwapper({
  onSuccess,
  onError,
  defaultFromToken = 'HBAR',
  defaultToToken = 'USDC',
  defaultAmount = 10,
}: DEXSwapperProps) {
  const [fromToken, setFromToken] = useState<Token>(
    getTokenBySymbol(defaultFromToken) || MOCK_TOKENS[0]
  );
  const [toToken, setToToken] = useState<Token>(
    getTokenBySymbol(defaultToToken) || MOCK_TOKENS[1]
  );
  const [fromAmount, setFromAmount] = useState(defaultAmount);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  // Update quote when inputs change
  useEffect(() => {
    if (fromToken && toToken && fromAmount > 0) {
      const newQuote = getSwapQuote(fromToken, toToken, fromAmount, slippageTolerance);
      setQuote(newQuote);
    } else {
      setQuote(null);
    }
  }, [fromToken, toToken, fromAmount, slippageTolerance]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleSwap = async () => {
    if (!quote) {
      toast.error('Invalid swap configuration');
      onError?.('No quote available');
      return;
    }

    if (fromAmount > fromToken.balance) {
      toast.error('Insufficient balance');
      onError?.('Insufficient balance');
      return;
    }

    setIsSwapping(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = executeSwap(quote);

    setIsSwapping(false);

    if (result.success) {
      setSwapSuccess(true);
      toast.success('🎉 Swap Successful!', {
        description: `Swapped ${formatTokenAmount(result.fromAmount)} ${fromToken.symbol} for ${formatTokenAmount(result.toAmount)} ${toToken.symbol}`,
      });
      onSuccess?.();
    } else {
      toast.error('Swap Failed', {
        description: result.message,
      });
      onError?.(result.message);
    }
  };

  const handleReset = () => {
    setSwapSuccess(false);
    setFromAmount(defaultAmount);
  };

  const priceImpactWarning = quote ? getPriceImpactWarning(quote.priceImpact) : null;

  if (swapSuccess && quote) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Swap Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your tokens have been swapped successfully.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Swapped:</span>
                <span className="font-semibold text-gray-900">
                  {formatTokenAmount(fromAmount)} {fromToken.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Received:</span>
                <span className="font-semibold text-green-600">
                  {formatTokenAmount(quote.toAmount)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="font-mono text-sm text-gray-900">
                  1 {fromToken.symbol} = {formatTokenAmount(quote.exchangeRate, 6)} {toToken.symbol}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-full px-6"
          >
            Swap Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Token Swap</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Slippage Settings */}
      {showSettings && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Slippage Tolerance
          </label>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map(value => (
              <button
                key={value}
                onClick={() => setSlippageTolerance(value)}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-colors ${
                  slippageTolerance === value
                    ? 'bg-[#0084C7] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) || 0.5)}
              placeholder="Custom"
              step="0.1"
              min="0.1"
              max="50"
              className="w-24 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none text-center"
            />
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">From</label>
          <span className="text-sm text-gray-600">
            Balance: {formatTokenAmount(fromToken.balance)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={fromToken.symbol}
            onChange={(e) => {
              const token = getTokenBySymbol(e.target.value);
              if (token) setFromToken(token);
            }}
            className="flex-shrink-0 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none font-semibold appearance-none cursor-pointer"
          >
            {MOCK_TOKENS.filter(t => t.symbol !== toToken.symbol).map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.icon} {token.symbol}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={fromAmount || ''}
            onChange={(e) => setFromAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.0"
            step="0.01"
            min="0"
            max={fromToken.balance}
            className="flex-1 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none text-right text-2xl font-bold"
          />
        </div>

        {fromAmount > 0 && (
          <div className="text-right text-sm text-gray-600 mt-2">
            ≈ {formatUSD(fromAmount * fromToken.usdPrice)}
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwapTokens}
          className="w-12 h-12 bg-[#0084C7] hover:bg-[#006ba3] rounded-xl flex items-center justify-center transition-all shadow-lg hover:scale-110"
        >
          <ArrowDownUp className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">To</label>
          <span className="text-sm text-gray-600">
            Balance: {formatTokenAmount(toToken.balance)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={toToken.symbol}
            onChange={(e) => {
              const token = getTokenBySymbol(e.target.value);
              if (token) setToToken(token);
            }}
            className="flex-shrink-0 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none font-semibold appearance-none cursor-pointer"
          >
            {MOCK_TOKENS.filter(t => t.symbol !== fromToken.symbol).map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.icon} {token.symbol}
              </option>
            ))}
          </select>

          <div className="flex-1 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 text-right text-2xl font-bold text-gray-900">
            {quote ? formatTokenAmount(quote.toAmount, 6) : '0.0'}
          </div>
        </div>

        {quote && quote.toAmount > 0 && (
          <div className="text-right text-sm text-gray-600 mt-2">
            ≈ {formatUSD(quote.toAmount * toToken.usdPrice)}
          </div>
        )}
      </div>

      {/* Swap Details */}
      {quote && quote.toAmount > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate:</span>
            <span className="font-semibold text-gray-900">
              1 {fromToken.symbol} = {formatTokenAmount(quote.exchangeRate, 6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price Impact:</span>
            <span className={`font-semibold ${getPriceImpactColor(quote.priceImpact)}`}>
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trading Fee (0.3%):</span>
            <span className="font-semibold text-gray-900">
              {formatTokenAmount(quote.fee)} {fromToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Received:</span>
            <span className="font-semibold text-gray-900">
              {formatTokenAmount(quote.minimumReceived)} {toToken.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {priceImpactWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1">High Price Impact Warning</p>
              <p>{priceImpactWarning}</p>
            </div>
          </div>
        </div>
      )}

      {fromAmount > fromToken.balance && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">
              Insufficient {fromToken.symbol} balance. You need {formatTokenAmount(fromAmount - fromToken.balance)} more {fromToken.symbol}.
            </p>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-900">
          💡 <strong>Educational Simulation:</strong> This is a simulated DEX swap for learning purposes. In a real DEX, prices are determined by automated market makers (AMMs) and liquidity pools.
        </p>
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={isSwapping || !quote || fromAmount <= 0 || fromAmount > fromToken.balance}
        className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl text-lg font-semibold shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSwapping ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Swapping...
          </>
        ) : (
          'Swap Tokens'
        )}
      </Button>
    </div>
  );
}
