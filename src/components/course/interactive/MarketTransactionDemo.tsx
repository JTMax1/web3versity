import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { ArrowRight, Users, CheckCircle } from 'lucide-react';

interface MarketTransactionDemoProps {
  content: any;
  onInteract: () => void;
}

export function MarketTransactionDemo({ content, onInteract }: MarketTransactionDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showBlockchain, setShowBlockchain] = useState(false);

  const handleNext = () => {
    if (currentStep < content.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowBlockchain(true);
    }
    onInteract();
  };

  const step = content.steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="text-center mb-8">
        <h3 className="mb-2">{content.scenario}</h3>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0084C7]/10 to-[#00a8e8]/10 px-6 py-3 rounded-full">
          <span className="text-2xl">🏪</span>
          <span className="text-sm text-gray-700">African Market Example</span>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <span className="text-2xl">{currentStep === 0 ? '🏦' : '⛓️'}</span>
          </div>
          <h4>{step.title}</h4>
        </div>

        <p className="text-lg text-gray-700 mb-6">{step.description}</p>

        {/* Traditional Way */}
        {step.traditional && (
          <div className="mb-6 p-6 bg-gray-50 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">👤</span>
              <div>
                <h5 className="text-gray-900 mb-2">Traditional Way</h5>
                <p className="text-gray-700">{step.traditional}</p>
              </div>
            </div>
            {step.problem && (
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                <p className="text-sm text-orange-800">
                  <strong>Problem:</strong> {step.problem}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Way */}
        {step.blockchain && (
          <div className="p-6 bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-2xl shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">⛓️</span>
              <div>
                <h5 className="text-[#0084C7] mb-2">Blockchain Way</h5>
                <p className="text-gray-700">{step.blockchain}</p>
              </div>
            </div>
            {step.benefit && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-sm text-green-800">
                  <strong>Benefit:</strong> {step.benefit}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        <div className="mt-6">
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-2xl py-4 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
          >
            {currentStep < content.steps.length - 1 ? 'Next Step' : 'See How It Works'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Visual Demonstration */}
      {showBlockchain && (
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <h4 className="mb-6 text-center">How the Network Verifies the Transaction</h4>
          
          <div className="space-y-6">
            {/* Transaction Announcement */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-yellow-200 px-6 py-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <span className="text-2xl">📢</span>
                <div className="text-left">
                  <div className="text-sm text-yellow-900">Transaction Announced</div>
                  <div className="text-xs text-yellow-800">Amina sends 500 Naira to Kwame</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
            </div>

            {/* Verification by Network */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((node) => (
                <div key={node} className="text-center p-4 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                  <Users className="w-8 h-8 text-[#0084C7] mx-auto mb-2" />
                  <div className="text-xs text-gray-600">Verifier {node}</div>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
            </div>

            {/* Recorded in Block */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-green-200 px-6 py-4 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <div className="text-sm text-green-900">Transaction Confirmed</div>
                  <div className="text-xs text-green-800">Added to permanent record</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-2xl">
            <h5 className="mb-3">🔐 Why This Matters</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#0084C7]">•</span>
                <span><strong>Multiple verifiers</strong> ensure the transaction is valid</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0084C7]">•</span>
                <span><strong>Everyone has a copy</strong> of the record</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0084C7]">•</span>
                <span><strong>Can't be changed</strong> once confirmed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0084C7]">•</span>
                <span><strong>No disputes</strong> because everyone can see the proof</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
