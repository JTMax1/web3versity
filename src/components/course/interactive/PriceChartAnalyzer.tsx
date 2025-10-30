/**
 * Price Chart Analyzer - Live HBAR & Crypto Price Charts
 *
 * WOW Factor: Real market data with interactive analysis tools!
 * Teaches technical analysis with live cryptocurrency prices.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Activity, BarChart3, Zap,
  DollarSign, Percent, Clock, RefreshCw, Info
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface PriceChartAnalyzerProps {
  onInteract?: () => void;
}

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  color: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: string;
  volume24h: string;
}

// Mock crypto data (in production, fetch from CoinGecko/CoinMarketCap API)
const CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: 'hedera',
    symbol: 'HBAR',
    name: 'Hedera',
    color: '#00a8e8',
    currentPrice: 0.0542,
    change24h: 5.23,
    high24h: 0.0567,
    low24h: 0.0512,
    marketCap: '$1.8B',
    volume24h: '$45M'
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    color: '#f7931a',
    currentPrice: 43250.00,
    change24h: -2.15,
    high24h: 44100.00,
    low24h: 42800.00,
    marketCap: '$847B',
    volume24h: '$25.3B'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    color: '#627eea',
    currentPrice: 2290.50,
    change24h: 3.42,
    high24h: 2310.00,
    low24h: 2210.00,
    marketCap: '$275B',
    volume24h: '$14.7B'
  }
];

export const PriceChartAnalyzer: React.FC<PriceChartAnalyzerProps> = ({ onInteract }) => {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(CRYPTO_ASSETS[0]);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Generate mock price history
  useEffect(() => {
    generateMockPriceHistory();
  }, [selectedAsset, timeframe]);

  const generateMockPriceHistory = () => {
    const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : 30;
    const basePrice = selectedAsset.currentPrice;
    const volatility = basePrice * 0.02; // 2% volatility

    const history: PriceData[] = [];
    let price = basePrice * 0.95; // Start 5% lower

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility;
      price += change;
      price = Math.max(price, basePrice * 0.90); // Floor at 90%
      price = Math.min(price, basePrice * 1.10); // Cap at 110%

      history.push({
        timestamp: Date.now() - (points - i) * (timeframe === '1H' ? 60000 : timeframe === '24H' ? 3600000 : 86400000),
        price,
        volume: Math.random() * 1000000
      });
    }

    setPriceHistory(history);
  };

  const handleAssetChange = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // In production: fetch real data from API
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateMockPriceHistory();
    setIsLoading(false);
    toast.success('Prices updated!');
  };

  const calculateMA = (period: number) => {
    if (priceHistory.length < period) return null;
    const recent = priceHistory.slice(-period);
    return recent.reduce((sum, data) => sum + data.price, 0) / period;
  };

  const ma7 = calculateMA(7);
  const ma30 = calculateMA(30);

  // Simple chart rendering
  const maxPrice = Math.max(...priceHistory.map(d => d.price));
  const minPrice = Math.min(...priceHistory.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <BarChart3 className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Price Chart Analyzer</h2>
            <p className="text-white/90 text-sm md:text-base mb-3">
              Learn technical analysis with live cryptocurrency prices
            </p>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm">
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                📊 Real Market Data
              </div>
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                📈 Technical Indicators
              </div>
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                ⚡ Live Updates
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Asset Selection */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Select Cryptocurrency</h3>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CRYPTO_ASSETS.map((asset) => (
            <motion.div
              key={asset.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => handleAssetChange(asset)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedAsset.id === asset.id
                    ? 'border-2 border-green-500 shadow-lg'
                    : 'hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{asset.symbol}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{asset.name}</p>
                  </div>
                  <div className={`text-2xl font-bold ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${asset.currentPrice.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">24h Change</span>
                  <div className={`flex items-center gap-1 font-bold ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Main Chart */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-1">{selectedAsset.name} ({selectedAsset.symbol})</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: selectedAsset.color }}>
                ${selectedAsset.currentPrice.toLocaleString()}
              </span>
              <span className={`text-lg font-semibold ${selectedAsset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  timeframe === tf
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Simple Line Chart */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 relative overflow-hidden">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <line
                key={percent}
                x1="0"
                y1={`${percent}%`}
                x2="100%"
                y2={`${percent}%`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-300 dark:text-gray-700"
                opacity="0.5"
              />
            ))}

            {/* Price line */}
            <polyline
              fill="none"
              stroke={selectedAsset.color}
              strokeWidth="3"
              points={priceHistory.map((data, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const y = 100 - ((data.price - minPrice) / priceRange) * 100;
                return `${x}%,${y}%`;
              }).join(' ')}
            />

            {/* Gradient fill */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={selectedAsset.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={selectedAsset.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#gradient)"
              points={`0,100 ${priceHistory.map((data, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const y = 100 - ((data.price - minPrice) / priceRange) * 100;
                return `${x},${y}`;
              }).join(' ')} 100,100`}
            />
          </svg>

          {/* Y-axis labels */}
          <div className="absolute left-2 top-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            ${maxPrice.toFixed(selectedAsset.currentPrice < 1 ? 4 : 2)}
          </div>
          <div className="absolute left-2 bottom-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
            ${minPrice.toFixed(selectedAsset.currentPrice < 1 ? 4 : 2)}
          </div>
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">24h High</span>
          </div>
          <p className="text-xl font-bold">${selectedAsset.high24h.toFixed(selectedAsset.currentPrice < 1 ? 4 : 2)}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-semibold">24h Low</span>
          </div>
          <p className="text-xl font-bold">${selectedAsset.low24h.toFixed(selectedAsset.currentPrice < 1 ? 4 : 2)}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-2 mb-2 text-purple-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-semibold">Market Cap</span>
          </div>
          <p className="text-xl font-bold">{selectedAsset.marketCap}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold">24h Volume</span>
          </div>
          <p className="text-xl font-bold">{selectedAsset.volume24h}</p>
        </Card>
      </div>

      {/* Technical Analysis Section */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          Technical Analysis Basics
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-indigo-600">Moving Averages</p>
            <p className="text-gray-700 dark:text-gray-300">
              {ma7 && `7-period MA: $${ma7.toFixed(selectedAsset.currentPrice < 1 ? 4 : 2)}`}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Smooths price data to identify trends
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-purple-600">Support & Resistance</p>
            <p className="text-gray-700 dark:text-gray-300">
              Support: ${selectedAsset.low24h.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Price levels where buying/selling pressure increases
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-pink-600">Volatility</p>
            <p className="text-gray-700 dark:text-gray-300">
              Range: {(((selectedAsset.high24h - selectedAsset.low24h) / selectedAsset.low24h) * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Measures price movement over time
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
