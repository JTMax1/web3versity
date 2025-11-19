/**
 * Practical Lesson Component - Refactored
 *
 * Generic container for ALL practical lessons that involve hands-on blockchain interaction.
 * Displays lesson objectives, step-by-step instructions, interactive components,
 * and tracks completion progress.
 *
 * COMPONENT ORGANIZATION:
 * All practical components are imported from '../practical/' directory.
 * If you move components between ../practical/ and ../interactive/ folders:
 * 1. Update the import path below (change '../practical/' to '../interactive/')
 * 2. The fuzzy matcher (practicalTypeMatcher.ts) handles type variations automatically
 * 3. Components work identically regardless of folder location
 *
 * SUPPORTED TYPES:
 * - transaction: Send HBAR transactions
 * - nft_minting: Mint NFTs on testnet
 * - contract: Deploy smart contracts
 * - hcs_message: Submit HCS messages
 * - defi: DeFi protocol simulation
 * - dex_swap: Token swapping
 * - wallet_creation: Generate new wallets
 * - wallet_investigation: Blockchain forensics
 * - explorer_navigation: HashScan challenges
 * - transaction_detective: Transaction mystery games
 */

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Sparkles, Trophy, Lightbulb, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { TransactionSender } from '../practical/TransactionSender';
import { DeFiSimulator } from '../practical/DeFiSimulator';
import { DEXSwapper } from '../practical/DEXSwapper';
import { HCSMessageBoard } from '../practical/HCSMessageBoard';
import { NFTMinterStudio } from '../practical/NFTMinterStudio';
import { SmartContractPlayground } from '../practical/SmartContractPlayground';
import { WalletCreator } from '../practical/WalletCreator';
import { WalletInvestigation } from '../practical/WalletInvestigation';
import { ExplorerNavigation } from '../practical/ExplorerNavigation';
import { TransactionDetective } from '../practical/TransactionDetective';
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
    interactiveType?:
      | 'transaction'
      | 'dex_swap'
      | 'hcs_message'
      | 'nft_minting'
      | 'wallet_creation'
      | 'wallet_investigation'
      | 'explorer_navigation'
      | 'transaction_detective'
      | 'defi' // Legacy - maps to DeFiSimulator
      | 'contract'; // Future use - Smart Contract Playground
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
  const [canComplete, setCanComplete] = useState(false);
  const [latestTransactionId, setLatestTransactionId] = useState('');
  const [latestHashScanUrl, setLatestHashScanUrl] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(true);

  const handleTransactionSuccess = (txId?: string, scanUrl?: string) => {
    setCanComplete(true);
    if (txId) setLatestTransactionId(txId);
    if (scanUrl) setLatestHashScanUrl(scanUrl);
    setShowSuccessCard(true);
    toast.success('🎉 Transaction Successful!', {
      description: 'You can continue interacting or save your progress.'
    });
    // DON'T switch to success step - keep user on interactive step
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
    setCanComplete(false);
    setLatestTransactionId('');
    setLatestHashScanUrl('');
    setShowSuccessCard(false);
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

      case 'dex_swap':
        return (
          <DEXSwapper
            onSuccess={handleTransactionSuccess}
            onError={handleTransactionError}
          />
        );

      case 'hcs_message':
        return (
          <HCSMessageBoard
            onInteract={() => {
              // When user interacts with HCS, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'nft_minting':
        return (
          <NFTMinterStudio
            onInteract={() => {
              // When user mints NFT, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'contract':
        return (
          <SmartContractPlayground
            onInteract={() => {
              // When user deploys contract, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'wallet_creation':
        return (
          <WalletCreator
            onInteract={() => {
              // When user creates wallet, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'wallet_investigation':
        return (
          <WalletInvestigation
            onInteract={() => {
              // When user completes investigation, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'explorer_navigation':
        return (
          <ExplorerNavigation
            onInteract={() => {
              // When user completes navigation challenge, mark as completed
              handleTransactionSuccess();
            }}
          />
        );

      case 'transaction_detective':
        return (
          <TransactionDetective
            onInteract={() => {
              // When user solves the case, mark as completed
              handleTransactionSuccess();
            }}
          />
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
          {(['intro', 'interactive'] as const).map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep === step
                    ? 'bg-[#0084C7] text-white shadow-[0_4px_16px_rgba(0,132,199,0.4)]'
                    : step === 'interactive' && currentStep === 'intro'
                    ? 'bg-gray-200 text-gray-500'
                    : canComplete && step === 'interactive'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {canComplete && step === 'interactive' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 capitalize">
                  {step === 'interactive' ? 'Practice' : step}
                </span>
              </div>
              {index < 1 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                  currentStep === 'interactive'
                    ? 'bg-[#0084C7]'
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
                <strong>Hands-On Practice:</strong> Complete the interactive exercise below. You can interact as many times as you want!
              </AlertDescription>
            </Alert>

            {renderInteractiveComponent()}

            {/* Inline Success Card - Shows after first interaction */}
            {canComplete && showSuccessCard && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-[0_4px_16px_rgba(34,197,94,0.2)] border-2 border-green-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        🎉 {content.successMessage}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        You can continue practicing or save your progress below.
                      </p>

                      {latestTransactionId && (
                        <div className="bg-white rounded-lg p-3 mb-3 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Latest Transaction:</span>
                            <span className="font-mono text-gray-900">
                              {latestTransactionId.substring(0, 25)}...
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-green-600 font-semibold">✓ Confirmed</span>
                          </div>
                        </div>
                      )}

                      {latestHashScanUrl && (
                        <Button
                          onClick={() => window.open(latestHashScanUrl, '_blank')}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto mb-3"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on HashScan
                        </Button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSuccessCard(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <span className="sr-only">Dismiss</span>
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Inline Save & Continue Button - Shows after first interaction */}
            {canComplete && (
              <Button
                onClick={handleCompleteLesson}
                disabled={isCompleting}
                className={`
                  w-full mt-4 py-6 rounded-2xl transition-all duration-200 text-lg font-semibold
                  ${isCompleting
                    ? 'bg-gray-400 text-white cursor-wait'
                    : isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_16px_rgba(34,197,94,0.3)]'
                    : 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3)]'
                  }
                `}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isCompleting
                  ? 'Saving...'
                  : isCompleted
                  ? 'Continue to Next Lesson →'
                  : 'Save & Continue (+50 XP)'}
              </Button>
            )}
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
