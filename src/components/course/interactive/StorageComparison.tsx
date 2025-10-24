import React, { useState } from 'react';

interface StorageComparisonProps {
  content: any;
  onInteract: () => void;
}

export function StorageComparison({ content, onInteract }: StorageComparisonProps) {
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);

  // Default storage methods if not provided
  const defaultMethods = [
    {
      method: "Write on Paper",
      safety: "high",
      pros: ["Offline security", "Simple and free", "Works everywhere"],
      cons: ["Can be damaged", "Can be lost", "Ink may fade"],
      recommendation: "✅ GOOD for beginners and amounts under $1000. Store in a safe place."
    },
    {
      method: "Screenshot on Phone",
      safety: "critical",
      pros: ["Quick and convenient"],
      cons: ["Phone gets stolen", "Backs up to cloud", "Very risky"],
      recommendation: "❌ NEVER DO THIS. Phones get stolen frequently."
    },
    {
      method: "Metal Backup Plate",
      safety: "very-high",
      pros: ["Fireproof", "Waterproof", "Very durable"],
      cons: ["Costs $40-120", "Less convenient"],
      recommendation: "✅ EXCELLENT for large amounts or long-term storage."
    }
  ];

  const methods = content.methods || defaultMethods;

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'very-high': return 'bg-green-500';
      case 'high': return 'bg-green-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-orange-400';
      case 'very-low':
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSafetyLabel = (safety: string) => {
    switch (safety) {
      case 'very-high': return '🛡️ Very Safe';
      case 'high': return '✅ Safe';
      case 'medium': return '⚠️ Moderate';
      case 'low': return '⚠️ Risky';
      case 'very-low': return '❌ Dangerous';
      case 'critical': return '🚨 Critical Risk';
      default: return 'Unknown';
    }
  };

  const handleMethodClick = (index: number) => {
    setSelectedMethod(index);
    onInteract();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="mb-2">How Should You Store Your Seed Phrase?</h3>
        <p className="text-gray-600">Click on each method to learn more</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {methods.map((method: any, index: number) => {
          const isSelected = selectedMethod === index;
          const safetyColor = getSafetyColor(method.safety);
          
          return (
            <button
              key={index}
              onClick={() => handleMethodClick(index)}
              className={`text-left p-6 rounded-3xl transition-all ${
                isSelected
                  ? 'bg-white shadow-[0_12px_48px_rgba(0,132,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] border-2 border-[#0084C7]'
                  : 'bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] hover:-translate-y-1'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h4>{method.method}</h4>
                <div className={`px-3 py-1 rounded-full text-white text-xs ${safetyColor}`}>
                  {getSafetyLabel(method.safety)}
                </div>
              </div>

              {isSelected && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                  {/* Pros */}
                  <div>
                    <div className="text-sm text-green-700 mb-2">✅ Advantages:</div>
                    <ul className="space-y-1">
                      {method.pros.map((pro: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <div className="text-sm text-red-700 mb-2">❌ Disadvantages:</div>
                    <ul className="space-y-1">
                      {method.cons.map((con: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className={`rounded-2xl p-4 ${
                    method.safety.includes('high') 
                      ? 'bg-green-50 border-2 border-green-300' 
                      : 'bg-red-50 border-2 border-red-300'
                  }`}>
                    <p className={`text-sm ${
                      method.safety.includes('high') ? 'text-green-900' : 'text-red-900'
                    }`}>
                      <strong>Recommendation:</strong> {method.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMethod !== null && (
        <div className="bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-3xl p-6 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
          <h4 className="mb-3">💡 Best Practice</h4>
          <p className="text-gray-700">
            For maximum security, write your seed phrase on paper and store it in a safe, dry place like a locked drawer or safe. 
            For larger amounts of crypto, consider using a fireproof and waterproof metal backup. 
            <strong className="text-[#0084C7]"> Never store it digitally!</strong>
          </p>
        </div>
      )}
    </div>
  );
}
