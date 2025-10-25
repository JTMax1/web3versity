/**
 * Practical Lesson Component - Refactored
 *
 * Generic container for ALL practical lessons that involve hands-on blockchain interaction.
 * Displays lesson objectives, step-by-step instructions, interactive components,
 * and tracks completion progress.
 */

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Sparkles, Trophy, Lightbulb } from 'lucide-react';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { TransactionSender } from '../../practical/TransactionSender';
import { DeFiSimulator } from '../../practical/DeFiSimulator';
import { DEXSwapper } from '../../practical/DEXSwapper';
import { toast } from 'sonner';

interface PracticalLessonProps {
  content: {
    title: string;
    description: string;
    objective: string;
    steps: string[];
    transactionAmount?: number;
    successMessage: string;
    tips: string[];
    interactiveType?: 'transaction' | 'defi' | 'dex' | 'staking' | 'security' | 'charts';
    defaultRecipient?: string;
    defaultAmount?: number;
    defaultMemo?: string;
  };
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

type Step = 'intro' | 'interactive' | 'success';

export function PracticalLesson({
  content,
  onComplete,
  isCompleted = false,
  isCompleting = false,
}: PracticalLessonProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [hashScanUrl, setHashScanUrl] = useState('');

  const handleTransactionSuccess = (txId?: string, scanUrl?: string) => {
    setTransactionCompleted(true);
    if (txId) setTransactionId(txId);
    if (scanUrl) setHashScanUrl(scanUrl);
    toast.success('🎉 Transaction Successful!', {
      description: 'You can now complete the lesson.'
    });
    // Move to success step but don't auto-complete
    setCurrentStep('success');
  };

  const handleCompleteLesson = () => {
    // Award 50 XP for practical lessons when user clicks Save & Continue
    onComplete(50);
  };

  const handleTransactionError = (error: string) => {
    toast.error('Transaction failed', {
      description: error
    });
  };

  const handleStartLesson = () => {
    setCurrentStep('interactive');
  };

  const handleTryAgain = () => {
    setCurrentStep('interactive');
    setTransactionCompleted(false);
    setTransactionId('');
    setHashScanUrl('');
  };

  const renderInteractiveComponent = () => {
    const type = content.interactiveType || 'transaction';

    switch (type) {
      case 'transaction':
        return (
          <TransactionSender
            defaultRecipient={content.defaultRecipient}
            defaultAmount={content.defaultAmount || content.transactionAmount}
            defaultMemo={content.defaultMemo}
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
            showAdvancedOptions={true}
          />
        );

      case 'defi':
        return (
          <DeFiSimulator
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
          />
        );

      case 'dex':
        return (
          <DEXSwapper
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
          />
        );

      case 'charts':
        // TODO: Implement PriceChart component in Task 3.10
        return (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600">Price Charts coming soon...</p>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600">Unknown interactive type: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-3xl p-8 mb-8 text-white shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-0">{content.title}</h2>
        </div>
        <p className="text-white/90 text-lg">{content.description}</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(['intro', 'interactive', 'success'] as const).map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep === step
                    ? 'bg-[#0084C7] text-white shadow-[0_4px_16px_rgba(0,132,199,0.4)]'
                    : currentStep === 'success' && index <= 2
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 capitalize">
                  {step}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                  currentStep === 'success' || (currentStep === 'interactive' && index === 0)
                    ? 'bg-[#0084C7]'
                    : currentStep === 'success'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Based on Step */}
      <div className="space-y-6">
        {/* Intro Step */}
        {currentStep === 'intro' && (
          <>
            {/* Objective */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Learning Objective</h3>
                  <p className="text-gray-700">{content.objective}</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Do:</h3>
              <div className="space-y-3">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#0084C7]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#0084C7] text-sm font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <h4 className="text-lg font-bold text-gray-900">Tips Before You Start:</h4>
              </div>
              <ul className="space-y-2 text-gray-700 ml-9">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleStartLesson}
              className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Practical Lesson
            </Button>
          </>
        )}

        {/* Interactive Step */}
        {currentStep === 'interactive' && (
          <>
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Hands-On Practice:</strong> Complete the interactive exercise below to finish this lesson.
              </AlertDescription>
            </Alert>

            {renderInteractiveComponent()}
          </>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Trophy className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{content.successMessage}</h3>
                <p className="text-gray-600 mb-6">
                  Click "Save & Continue" below to earn 50 XP and move to the next lesson.
                </p>

                {transactionId && (
                  <div className="bg-white rounded-2xl p-6 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-sm text-gray-900">
                          {transactionId.substring(0, 20)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-600 font-semibold">✓ Confirmed</span>
                      </div>
                    </div>
                  </div>
                )}

                {hashScanUrl && (
                  <Button
                    onClick={() => window.open(hashScanUrl, '_blank')}
                    variant="outline"
                    className="rounded-full px-6 mb-4"
                  >
                    View on HashScan
                  </Button>
                )}

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200 mb-6">
                  <p className="text-sm text-yellow-900">
                    <strong>🏆 Achievement Unlocked!</strong> You've successfully completed a practical blockchain lesson. Keep learning to unlock more achievements!
                  </p>
                </div>
              </div>
            </div>

            {/* Save & Continue Button - Like other lessons */}
            <Button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className={`w-full py-6 rounded-2xl transition-all duration-200 text-lg font-semibold ${
                isCompleting
                  ? 'bg-gray-400 text-white cursor-wait'
                  : isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_16px_rgba(34,197,94,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(34,197,94,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
                  : 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(0,132,199,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {isCompleting
                ? 'Saving...'
                : isCompleted
                ? 'Continue to Next Lesson →'
                : 'Save & Continue'}
            </Button>
          </>
        )}
      </div>

      {/* Already Completed Notice */}
      {isCompleted && (
        <Alert className="mt-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You've already completed this lesson!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
