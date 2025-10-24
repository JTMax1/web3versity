import React, { useState } from 'react';
import { Smartphone, Coins } from 'lucide-react';

interface MobileMoneyComparisonProps {
  content: any;
  onInteract: () => void;
}

export function MobileMoneyComparison({ content, onInteract }: MobileMoneyComparisonProps) {
  const [selectedAspect, setSelectedAspect] = useState<number | null>(null);

  const handleAspectClick = (index: number) => {
    setSelectedAspect(index);
    onInteract();
  };

  // Default comparison data if not provided in content
  const defaultComparison = [
    {
      aspect: "Control & Ownership",
      mobileMoney: "Controlled by telecom companies (Safaricom, MTN, Airtel). They can freeze your account, reverse transactions, or change fees anytime.",
      crypto: "YOU control everything with your private key. No company can freeze, limit, or access your funds. True ownership."
    },
    {
      aspect: "Accessibility",
      mobileMoney: "Need SIM card from specific telecom. Limited to countries where service operates. Requires telecom approval.",
      crypto: "Only need internet connection. Works globally from any device. No approval needed - completely permissionless."
    },
    {
      aspect: "Transaction Costs",
      mobileMoney: "Free for small amounts, 1-3% for larger transfers. Fees increase with amount. Cross-border very expensive (7-12%).",
      crypto: "Fixed ultra-low fee (~$0.0001) regardless of amount. Send ₦100 or ₦10,000,000 - same tiny fee. Cross-border same as local."
    },
    {
      aspect: "Speed",
      mobileMoney: "Instant for local transfers. Cross-border can take 1-3 days. Subject to network downtime.",
      crypto: "3-5 seconds globally. Same speed whether sending across the street or across continents. 24/7/365 availability."
    },
    {
      aspect: "Recovery",
      mobileMoney: "Forgot PIN? Visit agent or call customer service. Wrong recipient? Can request reversal. Company can help if hacked.",
      crypto: "Lost private key? Funds gone FOREVER - no recovery possible. Wrong address? Transaction irreversible. Full responsibility on you."
    },
    {
      aspect: "Privacy",
      mobileMoney: "Company knows all your transactions. Can share with government. Your financial data is tracked and stored.",
      crypto: "Transactions are public on blockchain (transparent) but pseudonymous. No company tracking your spending habits or personal data."
    },
    {
      aspect: "Limits & Restrictions",
      mobileMoney: "Daily/monthly transaction limits. Withdrawal limits. Can be blocked for 'suspicious activity'. KYC required.",
      crypto: "No limits on transactions. Send any amount anytime. No one can block you. Optional KYC only on exchanges, not on-chain."
    }
  ];

  const comparison = content.comparison || defaultComparison;

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="text-center mb-8">
        <h3 className="mb-4">Cryptocurrency vs Mobile Money</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">{content.explanation || "Compare how mobile money and cryptocurrency work to understand the key differences."}</p>
        {content.analogy && (
          <p className="text-sm text-gray-500 mt-3 italic max-w-2xl mx-auto">
            💡 {content.analogy}
          </p>
        )}
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {comparison.map((item: any, index: number) => {
          const isSelected = selectedAspect === index;

          return (
            <button
              key={index}
              onClick={() => handleAspectClick(index)}
              className={`w-full text-left transition-all ${
                isSelected
                  ? 'bg-white shadow-[0_12px_48px_rgba(0,132,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] border-2 border-[#0084C7]'
                  : 'bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)]'
              } rounded-3xl p-6`}
            >
              <h4 className="mb-4">{item.aspect}</h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Mobile Money */}
                <div className={`p-4 rounded-2xl ${
                  isSelected ? 'bg-orange-50' : 'bg-gray-50'
                } shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-orange-700">Mobile Money (M-Pesa, MTN, etc.)</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.mobileMoney}</p>
                </div>

                {/* Cryptocurrency */}
                <div className={`p-4 rounded-2xl ${
                  isSelected ? 'bg-[#0084C7]/5' : 'bg-gray-50'
                } shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-5 h-5 text-[#0084C7]" />
                    <span className="text-sm text-[#0084C7]">Cryptocurrency</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.crypto}</p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0084C7]/10 rounded-full text-sm text-[#0084C7]">
                    Click another aspect to compare
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-3xl p-8 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
        <h4 className="mb-4">🌍 The African Advantage</h4>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Mobile money revolutionized African finance</strong> by providing banking services to millions without bank accounts. 
            Cryptocurrency takes this even further:
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-[#0084C7]">•</span>
              <span><strong>Global access:</strong> Send money anywhere in the world instantly and cheaply</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0084C7]">•</span>
              <span><strong>No borders:</strong> Your crypto works the same everywhere - Kenya, Nigeria, South Africa, anywhere</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0084C7]">•</span>
              <span><strong>Full control:</strong> No company can freeze your account or limit your transactions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0084C7]">•</span>
              <span><strong>Hedge against inflation:</strong> Protect your savings when local currency loses value</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h5 className="text-yellow-900 mb-2">Crypto Complements Mobile Money</h5>
            <p className="text-sm text-yellow-800">
              Cryptocurrency doesn't replace mobile money - they work together! Use mobile money for daily transactions 
              in your local area, and crypto for international transfers, savings, and accessing global opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
