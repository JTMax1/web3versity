import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, DollarSign, TrendingUp, AlertCircle, FileText, BookOpen } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface TaxCalculatorProps {
  onInteract?: () => void;
}

interface CountryTaxInfo {
  name: string;
  capitalGainsTax: number;
  holdingPeriodBenefit: boolean;
  longTermRate: number;
  taxFreeAllowance: number;
  notes: string[];
}

const africanCountryTaxes: Record<string, CountryTaxInfo> = {
  nigeria: {
    name: 'Nigeria',
    capitalGainsTax: 10,
    holdingPeriodBenefit: false,
    longTermRate: 10,
    taxFreeAllowance: 0,
    notes: [
      'Capital gains tax is 10% on all crypto profits',
      'FIRS considers crypto as property',
      'Must report all crypto transactions',
      'VAT may apply to crypto services (7.5%)'
    ]
  },
  southAfrica: {
    name: 'South Africa',
    capitalGainsTax: 18,
    holdingPeriodBenefit: true,
    longTermRate: 18,
    taxFreeAllowance: 40000,
    notes: [
      'First R40,000 in capital gains is tax-free annually',
      'Individual rate: 18% of net capital gain',
      'Considered as either capital asset or revenue',
      'SARS requires crypto reporting in tax returns'
    ]
  },
  kenya: {
    name: 'Kenya',
    capitalGainsTax: 5,
    holdingPeriodBenefit: false,
    longTermRate: 5,
    taxFreeAllowance: 0,
    notes: [
      'Capital gains tax is 5% on net gains',
      'KRA is developing clearer crypto guidelines',
      'Digital asset transfers may incur taxes',
      'Keep detailed records of all transactions'
    ]
  },
  ghana: {
    name: 'Ghana',
    capitalGainsTax: 15,
    holdingPeriodBenefit: false,
    longTermRate: 15,
    taxFreeAllowance: 0,
    notes: [
      'Capital gains tax is 15% on profits',
      'GRA treats crypto as property',
      'Income from trading may be taxed as business income',
      'Report in annual tax returns'
    ]
  },
  egypt: {
    name: 'Egypt',
    capitalGainsTax: 10,
    holdingPeriodBenefit: false,
    longTermRate: 10,
    taxFreeAllowance: 0,
    notes: [
      'Capital gains: 10% on listed securities',
      'Crypto regulations still developing',
      'Consult tax professional for latest rules',
      'Central Bank has restrictions on crypto trading'
    ]
  }
};

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onInteract }) => {
  const [country, setCountry] = useState<string>('southAfrica');
  const [purchasePrice, setPurchasePrice] = useState(1000);
  const [salePrice, setSalePrice] = useState(2500);
  const [hasInteracted, setHasInteracted] = useState(false);

  const countryInfo = africanCountryTaxes[country];
  const profit = salePrice - purchasePrice;
  const taxableGain = Math.max(0, profit - countryInfo.taxFreeAllowance);
  const taxOwed = (taxableGain * countryInfo.capitalGainsTax) / 100;
  const netProfit = profit - taxOwed;
  const effectiveRate = profit > 0 ? (taxOwed / profit) * 100 : 0;

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    handleInteraction();
  };

  const handlePurchaseChange = (value: number[]) => {
    setPurchasePrice(value[0]);
    handleInteraction();
  };

  const handleSaleChange = (value: number[]) => {
    setSalePrice(value[0]);
    handleInteraction();
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-3xl">African Crypto Tax Calculator</h3>
        </div>
        <p className="text-muted-foreground text-lg">
          Calculate your crypto capital gains tax across different African countries
        </p>
      </div>

      {/* Country Selector */}
      <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <h4 className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          Select Your Country
        </h4>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-full h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
            <SelectItem value="southAfrica">🇿🇦 South Africa</SelectItem>
            <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
            <SelectItem value="ghana">🇬🇭 Ghana</SelectItem>
            <SelectItem value="egypt">🇪🇬 Egypt</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Input Sliders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Purchase Price */}
        <Card className="p-6 space-y-4 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Purchase Price
            </span>
            <span className="text-2xl font-bold">${purchasePrice}</span>
          </div>
          <Slider
            value={[purchasePrice]}
            onValueChange={handlePurchaseChange}
            min={100}
            max={5000}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            What you paid for the crypto
          </p>
        </Card>

        {/* Sale Price */}
        <Card className="p-6 space-y-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Sale Price
            </span>
            <span className="text-2xl font-bold">${salePrice}</span>
          </div>
          <Slider
            value={[salePrice]}
            onValueChange={handleSaleChange}
            min={100}
            max={10000}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            What you sold it for
          </p>
        </Card>
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
          <h3 className="text-center mb-6 flex items-center justify-center gap-2">
            <FileText className="w-6 h-6" />
            Tax Calculation for {countryInfo.name}
          </h3>

          <div className="space-y-4">
            {/* Calculation Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <span className="text-sm">Sale Price</span>
                <span className="font-bold text-lg">${salePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <span className="text-sm">Purchase Price</span>
                <span className="font-bold text-lg text-red-600">-${purchasePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-300">
                <span className="font-semibold">Capital Gain</span>
                <span className="font-bold text-xl text-blue-600">${profit.toLocaleString()}</span>
              </div>

              {countryInfo.taxFreeAllowance > 0 && (
                <div className="flex justify-between items-center p-4 bg-green-100/50 dark:bg-green-900/20 rounded-xl">
                  <span className="text-sm">Tax-Free Allowance</span>
                  <span className="font-bold text-green-600">-${countryInfo.taxFreeAllowance.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-xl">
                <span className="text-sm">Taxable Gain</span>
                <span className="font-bold">${taxableGain.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl border-2 border-red-300">
                <span className="font-semibold">Tax Owed ({countryInfo.capitalGainsTax}%)</span>
                <span className="font-bold text-xl text-red-600">${taxOwed.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white shadow-lg">
                <span className="font-bold text-lg">Net Profit After Tax</span>
                <span className="font-bold text-2xl">${netProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* Effective Rate */}
            <div className="text-center p-4 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
              <p className="text-3xl font-bold text-purple-600">{effectiveRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Country-Specific Information */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
        <h4 className="mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          {countryInfo.name} Crypto Tax Rules
        </h4>
        <ul className="space-y-2 text-sm">
          {countryInfo.notes.map((note, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Important Disclaimer */}
      <Card className="p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="space-y-2 text-sm">
            <p className="font-bold text-red-800">⚠️ Important Disclaimer:</p>
            <ul className="space-y-1 text-red-700">
              <li>• This is a simplified calculator for educational purposes only</li>
              <li>• Tax laws change frequently - always verify current rates</li>
              <li>• Consult a qualified tax professional in your country</li>
              <li>• Additional taxes may apply (income tax, VAT, etc.)</li>
              <li>• Keep detailed records of ALL crypto transactions</li>
              <li>• Penalties for not reporting can be severe</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h4 className="mb-4">📋 Tax Best Practices</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-semibold">Keep Records</p>
              <p className="text-muted-foreground">Track every buy, sell, trade, and transfer with dates and amounts</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-semibold">Set Aside Tax Money</p>
              <p className="text-muted-foreground">Put 20-30% of profits aside for taxes immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-semibold">Know Deadlines</p>
              <p className="text-muted-foreground">File on time to avoid penalties and interest</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-xl">🔍</span>
            <div>
              <p className="font-semibold">Use Tax Software</p>
              <p className="text-muted-foreground">Tools like Koinly, CoinTracker can help with African tax reporting</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
