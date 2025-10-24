import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Calendar, Percent, Info, Calculator } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Strategy {
  id: string;
  name: string;
  type: 'staking' | 'lending' | 'liquidity' | 'mixed';
  baseAPY: number;
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  africaExample: string;
  minAmount: number;
}

const strategies: Strategy[] = [
  {
    id: 'hbar-staking',
    name: 'HBAR Staking',
    type: 'staking',
    baseAPY: 6.5,
    compoundFrequency: 'never',
    riskLevel: 'low',
    description: 'Stake HBAR to network nodes and earn rewards for helping secure the network',
    africaExample: 'Like earning dividends from a cooperative (sacco) - passive, predictable income',
    minAmount: 1
  },
  {
    id: 'usdc-lending',
    name: 'USDC Lending',
    type: 'lending',
    baseAPY: 8.0,
    compoundFrequency: 'monthly',
    riskLevel: 'low',
    description: 'Lend stablecoins to borrowers and earn interest',
    africaExample: 'Like a village savings group, but automated and you earn more than banks (0.5-2%)',
    minAmount: 10
  },
  {
    id: 'saucerswap-lp',
    name: 'SaucerSwap Liquidity Provider',
    type: 'liquidity',
    baseAPY: 15.0,
    compoundFrequency: 'daily',
    riskLevel: 'medium',
    description: 'Provide liquidity to HBAR/USDC pool and earn trading fees',
    africaExample: 'Like being a money changer at the border, earning a cut from every exchange',
    minAmount: 100
  },
  {
    id: 'mixed-strategy',
    name: 'Balanced DeFi Portfolio',
    type: 'mixed',
    baseAPY: 12.0,
    compoundFrequency: 'weekly',
    riskLevel: 'medium',
    description: '50% HBAR staking + 30% USDC lending + 20% liquidity providing',
    africaExample: 'Diversified like investing in multiple businesses - reduces risk, steady returns',
    minAmount: 500
  }
];

interface YieldCalculatorProps {
  onInteract?: () => void;
}

export const YieldCalculator: React.FC<YieldCalculatorProps> = ({ onInteract }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(strategies[0]);
  const [principal, setPrincipal] = useState(1000);
  const [timeMonths, setTimeMonths] = useState(12);
  const [hbarPrice, setHbarPrice] = useState(0.085);
  const [results, setResults] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    calculateYield();
  }, [selectedStrategy, principal, timeMonths, hbarPrice]);

  const calculateYield = () => {
    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }

    const years = timeMonths / 12;
    let finalAmount = principal;
    let totalEarned = 0;

    // Calculate compound interest based on frequency
    if (selectedStrategy.compoundFrequency === 'never') {
      // Simple interest
      totalEarned = principal * (selectedStrategy.baseAPY / 100) * years;
      finalAmount = principal + totalEarned;
    } else {
      // Compound interest
      const compoundsPerYear = {
        daily: 365,
        weekly: 52,
        monthly: 12
      }[selectedStrategy.compoundFrequency];

      const rate = selectedStrategy.baseAPY / 100;
      finalAmount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
      totalEarned = finalAmount - principal;
    }

    // Calculate monthly breakdown
    const monthlyBreakdown: any[] = [];
    for (let month = 1; month <= timeMonths; month++) {
      const monthYears = month / 12;
      let monthAmount;

      if (selectedStrategy.compoundFrequency === 'never') {
        monthAmount = principal + (principal * (selectedStrategy.baseAPY / 100) * monthYears);
      } else {
        const compoundsPerYear = {
          daily: 365,
          weekly: 52,
          monthly: 12
        }[selectedStrategy.compoundFrequency];
        const rate = selectedStrategy.baseAPY / 100;
        monthAmount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * monthYears);
      }

      monthlyBreakdown.push({
        month,
        amount: monthAmount,
        earned: monthAmount - principal
      });
    }

    // Calculate equivalent values
    const hbarAmount = principal / hbarPrice;
    const finalHbarAmount = finalAmount / hbarPrice;
    const earnedHbar = finalHbarAmount - hbarAmount;

    // Calculate comparison with traditional savings
    const bankAPY = 2.0; // Typical African bank savings rate
    const bankEarnings = principal * (bankAPY / 100) * years;
    const extraVsBank = totalEarned - bankEarnings;

    setResults({
      finalAmount,
      totalEarned,
      monthlyBreakdown,
      hbarAmount,
      finalHbarAmount,
      earnedHbar,
      bankEarnings,
      extraVsBank,
      effectiveAPY: ((finalAmount / principal) ** (1 / years) - 1) * 100
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-950/30';
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-950/30';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-950/30';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Calculator className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold">DeFi Yield Calculator</h2>
            </div>
            <p className="text-muted-foreground">
              Calculate potential earnings from staking, lending, and liquidity providing
            </p>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Select Strategy
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {strategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedStrategy.id === strategy.id
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{strategy.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                          {strategy.riskLevel}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{strategy.baseAPY}% APY</div>
                      <div className="text-xs text-muted-foreground">
                        Compounds: {strategy.compoundFrequency}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Strategy Info */}
          <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4" />
                {selectedStrategy.name}
              </h4>
              <p className="text-sm">{selectedStrategy.description}</p>
              <p className="text-sm text-muted-foreground">
                🌍 <strong>African Context:</strong> {selectedStrategy.africaExample}
              </p>
            </div>
          </Card>

          {/* Input Controls */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Principal Amount */}
            <Card className="p-5 space-y-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <DollarSign className="w-4 h-4" />
                Initial Amount (USD)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(selectedStrategy.minAmount, Number(e.target.value)))}
                className="w-full px-4 py-3 text-lg font-bold border-2 rounded-lg focus:outline-none focus:border-primary"
                min={selectedStrategy.minAmount}
                step={100}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Min: ${selectedStrategy.minAmount}</span>
                <span>≈ {(principal / hbarPrice).toFixed(0)} HBAR</span>
              </div>
            </Card>

            {/* Time Period */}
            <Card className="p-5 space-y-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Calendar className="w-4 h-4" />
                Time Period (Months)
              </label>
              <input
                type="range"
                value={timeMonths}
                onChange={(e) => setTimeMonths(Number(e.target.value))}
                className="w-full"
                min={1}
                max={60}
                step={1}
              />
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">{timeMonths}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({(timeMonths / 12).toFixed(1)} years)
                </span>
              </div>
            </Card>

            {/* HBAR Price */}
            <Card className="p-5 space-y-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Percent className="w-4 h-4" />
                HBAR Price (USD)
              </label>
              <input
                type="number"
                value={hbarPrice}
                onChange={(e) => setHbarPrice(Math.max(0.01, Number(e.target.value)))}
                className="w-full px-4 py-3 text-lg font-bold border-2 rounded-lg focus:outline-none focus:border-primary"
                min={0.01}
                step={0.01}
              />
              <div className="text-xs text-muted-foreground text-center">
                Current market estimate
              </div>
            </Card>
          </div>

          {/* Calculate Button */}
          <Button onClick={calculateYield} size="lg" className="w-full">
            <Calculator className="w-5 h-5 mr-2" />
            Recalculate Yield
          </Button>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-5 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <div className="space-y-1">
                    <p className="text-sm opacity-90">Total Earned</p>
                    <p className="text-3xl font-bold">${results.totalEarned.toFixed(2)}</p>
                    <p className="text-xs opacity-75">≈ {results.earnedHbar.toFixed(0)} HBAR</p>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <div className="space-y-1">
                    <p className="text-sm opacity-90">Final Amount</p>
                    <p className="text-3xl font-bold">${results.finalAmount.toFixed(2)}</p>
                    <p className="text-xs opacity-75">≈ {results.finalHbarAmount.toFixed(0)} HBAR</p>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <div className="space-y-1">
                    <p className="text-sm opacity-90">Effective APY</p>
                    <p className="text-3xl font-bold">{results.effectiveAPY.toFixed(2)}%</p>
                    <p className="text-xs opacity-75">
                      {selectedStrategy.compoundFrequency !== 'never' ? 'With compounding' : 'Simple interest'}
                    </p>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <div className="space-y-1">
                    <p className="text-sm opacity-90">vs. Bank Savings</p>
                    <p className="text-3xl font-bold">+${results.extraVsBank.toFixed(2)}</p>
                    <p className="text-xs opacity-75">
                      {((results.extraVsBank / results.bankEarnings) * 100).toFixed(0)}% more than 2% APY
                    </p>
                  </div>
                </Card>
              </div>

              {/* Comparison with Traditional Savings */}
              <Card className="p-6 bg-yellow-50/50 dark:bg-yellow-950/20">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  💡 Comparison: DeFi vs. Traditional Bank
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-red-600">🏦 Traditional Bank (2% APY)</p>
                    <ul className="text-sm space-y-1 list-disc list-inside ml-2">
                      <li>After {timeMonths} months: ${(principal + results.bankEarnings).toFixed(2)}</li>
                      <li>Total earned: ${results.bankEarnings.toFixed(2)}</li>
                      <li>Often below inflation (real loss of value)</li>
                      <li>May have withdrawal fees/limits</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-600">⚡ {selectedStrategy.name} ({selectedStrategy.baseAPY}% APY)</p>
                    <ul className="text-sm space-y-1 list-disc list-inside ml-2">
                      <li>After {timeMonths} months: ${results.finalAmount.toFixed(2)}</li>
                      <li>Total earned: ${results.totalEarned.toFixed(2)}</li>
                      <li><strong>Extra ${results.extraVsBank.toFixed(2)}</strong> compared to bank</li>
                      <li>Withdraw anytime, ultra-low fees ($0.0001)</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Growth Chart (Simple Text Visualization) */}
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Over Time
                </h4>
                <div className="space-y-2">
                  {results.monthlyBreakdown
                    .filter((_: any, i: number) => i % (timeMonths > 24 ? 6 : timeMonths > 12 ? 3 : 1) === 0 || i === results.monthlyBreakdown.length - 1)
                    .map((month: any) => {
                      const percentage = (month.earned / principal) * 100;
                      return (
                        <div key={month.month} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Month {month.month}</span>
                            <span className="font-semibold">
                              ${month.amount.toFixed(2)} <span className="text-green-600">(+${month.earned.toFixed(2)})</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, percentage + 100)}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>

              {/* Real Example */}
              <Card className="p-6 bg-purple-50/50 dark:bg-purple-950/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  🌍 Real African Example
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Amina in Nairobi</strong> has saved {(principal / hbarPrice).toFixed(0)} HBAR (${principal} USD) from her freelance work.
                  </p>
                  <p>
                    Instead of keeping it in a local bank earning 2% APY, she uses <strong>{selectedStrategy.name}</strong> earning {selectedStrategy.baseAPY}% APY.
                  </p>
                  <p>
                    After {timeMonths} months ({(timeMonths / 12).toFixed(1)} years):
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bank would give her: <span className="line-through text-red-600">${results.bankEarnings.toFixed(2)}</span></li>
                    <li>DeFi gives her: <span className="font-bold text-green-600">${results.totalEarned.toFixed(2)}</span></li>
                    <li>Extra earnings: <span className="font-bold text-green-600">${results.extraVsBank.toFixed(2)}</span></li>
                  </ul>
                  <p className="pt-2 border-t">
                    💡 <strong>That's enough to:</strong> Pay for 3 months of internet, buy a new laptop, or invest in her business!
                  </p>
                </div>
              </Card>

              {/* Risk Disclaimer */}
              <Card className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border-2 border-orange-400">
                <p className="text-sm">
                  <strong>⚠️ Important Disclaimer:</strong> APY rates are estimates and can change based on market conditions. {selectedStrategy.riskLevel === 'high' && 'This strategy has higher risk - only invest what you can afford to lose.'}
                  {selectedStrategy.riskLevel === 'medium' && 'This strategy has moderate risk - diversification is recommended.'}
                  {selectedStrategy.riskLevel === 'low' && 'This is a lower-risk strategy, but all crypto investments carry some risk.'}
                  Always do your own research (DYOR) and start small.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};
