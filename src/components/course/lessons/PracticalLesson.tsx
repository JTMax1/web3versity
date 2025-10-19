import React, { useState } from 'react';
import { CheckCircle, Wallet, Send, ExternalLink, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { connectWallet, submitTransaction, formatHbar, TRAINING_WALLET_ADDRESS, getHashScanUrl, type TransactionResult } from '../../../lib/hederaUtils';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

interface PracticalLessonProps {
  content: {
    title: string;
    description: string;
    objective: string;
    steps: string[];
    transactionAmount: number;
    successMessage: string;
    tips: string[];
  };
  onComplete: () => void;
}

type Step = 'intro' | 'connect' | 'ready' | 'sending' | 'pending' | 'success' | 'failed';

export function PracticalLesson({ content, onComplete }: PracticalLessonProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState<string>('');
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleConnectWallet = async () => {
    setCurrentStep('connect');
    setError('');
    
    try {
      // Simulate wallet connection
      const result = await connectWallet();
      setAccountId(result.accountId);
      setWalletConnected(true);
      setCurrentStep('ready');
      toast.success('Wallet connected!', {
        description: `Account: ${result.accountId}`
      });
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      setCurrentStep('intro');
      toast.error('Connection failed');
    }
  };

  const handleSubmitTransaction = async () => {
    if (!walletConnected) return;
    
    setCurrentStep('sending');
    setError('');

    try {
      // Show pending state
      setCurrentStep('pending');
      
      // Submit transaction
      const result = await submitTransaction(
        accountId,
        TRAINING_WALLET_ADDRESS,
        content.transactionAmount
      );
      
      setTransactionResult(result);
      
      if (result.status === 'success') {
        setCurrentStep('success');
        toast.success('🎉 Transaction Successful!', {
          description: 'Click to view on HashScan'
        });
        onComplete();
      } else {
        setCurrentStep('failed');
        setError('Transaction failed. Please try again.');
        toast.error('Transaction failed');
      }
    } catch (err) {
      setCurrentStep('failed');
      setError('An error occurred. Please try again.');
      toast.error('Transaction error');
    }
  };

  const handleTryAgain = () => {
    setCurrentStep('ready');
    setTransactionResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-3xl p-8 mb-8 text-white shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl mb-0">{content.title}</h2>
        </div>
        <p className="text-white/90 text-lg">{content.description}</p>
      </div>

      {/* Demo Mode Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Demo Mode:</strong> This lesson currently simulates wallet connection and blockchain transactions for learning purposes. In production, this would connect to your real Hedera wallet (HashPack/Blade) and submit actual testnet transactions.
        </AlertDescription>
      </Alert>

      {/* Objective */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-white text-lg">🎯</span>
          </div>
          <div>
            <h3 className="mb-2">Learning Objective</h3>
            <p className="text-gray-700">{content.objective}</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {(['intro', 'ready', 'success'] as const).map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep === step || (step === 'intro' && currentStep === 'connect') || (step === 'ready' && ['sending', 'pending'].includes(currentStep))
                    ? 'bg-[#0084C7] text-white shadow-[0_4px_16px_rgba(0,132,199,0.4)]'
                    : currentStep === 'success' && index <= 2
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 'intro' && <span>1</span>}
                  {step === 'ready' && <span>2</span>}
                  {step === 'success' && <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="text-xs mt-2 text-gray-600">
                  {step === 'intro' && 'Setup'}
                  {step === 'ready' && 'Execute'}
                  {step === 'success' && 'Complete'}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                  currentStep === 'success' && index === 1 ? 'bg-green-500' : 
                  currentStep === 'ready' || currentStep === 'sending' || currentStep === 'pending' || currentStep === 'success' ? 'bg-[#0084C7]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Based on Step */}
      <div className="bg-white rounded-3xl p-8 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">What You'll Do:</h3>
              <div className="space-y-3">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#0084C7]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#0084C7] text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="mb-3">💡 Tips Before You Start:</h4>
              <ul className="space-y-2 text-gray-700">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#0084C7] mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleConnectWallet}
              className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet to Continue
            </Button>
          </div>
        )}

        {/* Connecting Step */}
        {currentStep === 'connect' && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Loader2 className="w-16 h-16 text-[#0084C7]" />
            </motion.div>
            <h3 className="mb-2">Connecting to Wallet...</h3>
            <p className="text-gray-600">Please wait while we establish a secure connection</p>
          </div>
        )}

        {/* Ready to Send Step */}
        {currentStep === 'ready' && (
          <div className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet connected! Account: <span className="font-mono">{accountId}</span>
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <h4 className="mb-4">Transaction Details:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-[#0084C7]">{accountId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-gray-700">{TRAINING_WALLET_ADDRESS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-[#0084C7]">{formatHbar(content.transactionAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="text-gray-700">Hedera Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Fee:</span>
                  <span className="text-gray-700">~$0.0001</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a testnet transaction using test HBAR. It has no real monetary value but will be recorded on the Hedera testnet blockchain.
              </p>
            </div>

            <Button
              onClick={handleSubmitTransaction}
              className="w-full py-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
            >
              <Send className="w-5 h-5 mr-2" />
              Submit Transaction
            </Button>
          </div>
        )}

        {/* Sending/Pending Step */}
        {(currentStep === 'sending' || currentStep === 'pending') && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-3xl flex items-center justify-center shadow-[0_8px_32px_rgba(0,132,199,0.3)]"
            >
              <Send className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="mb-2">Transaction Processing...</h3>
            <p className="text-gray-600 mb-4">
              {currentStep === 'sending' 
                ? 'Broadcasting transaction to the Hedera network...'
                : 'Waiting for consensus confirmation...'
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>This usually takes 3-5 seconds on Hedera</span>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && transactionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(34,197,94,0.4)]"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <div>
              <h3 className="mb-2 text-green-600">🎉 {content.successMessage}</h3>
              <p className="text-gray-600">Your transaction has been confirmed on the Hedera testnet!</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <h4 className="mb-3">Transaction Confirmed</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs text-[#0084C7] break-all text-right ml-2">
                    {transactionResult.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">✓ Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="text-gray-700">Hedera Testnet</span>
                </div>
              </div>
            </div>

            <a
              href={transactionResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0084C7] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.15)] transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              View on HashScan Explorer
            </a>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>🏆 Achievement Unlocked!</strong> You've successfully completed your first blockchain transaction. You've earned bonus points and a special badge!
              </p>
            </div>
          </motion.div>
        )}

        {/* Failed Step */}
        {currentStep === 'failed' && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(239,68,68,0.4)]">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>

            <div>
              <h3 className="mb-2 text-red-600">Transaction Failed</h3>
              <p className="text-gray-600">Don't worry! This happens sometimes. Let's try again.</p>
            </div>

            <Button
              onClick={handleTryAgain}
              className="px-8 py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Completion Status */}
      {currentStep === 'success' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-green-800">
            Lesson completed! You can now continue to the next lesson.
          </p>
        </div>
      )}
    </div>
  );
}
