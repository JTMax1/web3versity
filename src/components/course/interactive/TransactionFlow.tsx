import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../ui/button';
import { ArrowRight, User, Send, CheckCircle, Clock } from 'lucide-react';

interface TransactionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface TransactionFlowProps {
  onInteract?: () => void;
}

export function TransactionFlow({ onInteract }: TransactionFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: TransactionStep[] = [
    {
      id: 'init',
      title: 'Amara Initiates Transaction',
      description: 'Amara wants to send 10 HBAR to her sister Zuri in another city',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending'
    },
    {
      id: 'sign',
      title: 'Digital Signature',
      description: 'Amara signs the transaction with her private key to prove she owns the funds',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 'broadcast',
      title: 'Broadcast to Network',
      description: 'The transaction is sent to Hedera nodes across the world',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 'consensus',
      title: 'Consensus Reached',
      description: 'Nodes verify and agree on the transaction order and validity',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    },
    {
      id: 'confirm',
      title: 'Transaction Confirmed',
      description: 'Zuri receives 10 HBAR! The transaction is permanent on the blockchain',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      if (currentStep === 0 && onInteract) {
        onInteract();
      }
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 500);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50" 
         style={{ boxShadow: '0 8px 32px rgba(0, 132, 199, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Transaction Journey</h3>
        <p className="text-gray-600">Watch how a transaction moves through the Hedera network</p>
      </div>

      {/* Visual Flow */}
      <div className="mb-8 flex items-center justify-between px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: step.status === 'active' ? 1.1 : 1,
                backgroundColor: step.status === 'completed' ? '#10b981' : 
                                step.status === 'active' ? '#0084C7' : '#e5e7eb'
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ boxShadow: step.status === 'active' ? '0 4px 16px rgba(0, 132, 199, 0.4)' : '' }}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="w-6 h-6" />
              ) : step.status === 'active' ? (
                <Clock className="w-6 h-6 animate-pulse" />
              ) : (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ width: '60px' }}
                animate={{ 
                  backgroundColor: currentStep > index ? '#10b981' : '#e5e7eb'
                }}
                transition={{ duration: 0.5 }}
                className="h-1 mx-2"
                style={{ width: '60px' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-white"
        style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-100">
            {currentStep === 0 && <User className="w-6 h-6 text-blue-600" />}
            {currentStep === 1 && <span className="text-2xl">✍️</span>}
            {currentStep === 2 && <Send className="w-6 h-6 text-blue-600" />}
            {currentStep === 3 && <span className="text-2xl">🌍</span>}
            {currentStep === 4 && <CheckCircle className="w-6 h-6 text-green-600" />}
          </div>
          
          <div className="flex-1">
            <h4 className="mb-2">{steps[currentStep].title}</h4>
            <p className="text-gray-600">{steps[currentStep].description}</p>
            
            {currentStep === 0 && (
              <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm">💡 <strong>African Context:</strong> Just like sending mobile money, but the transaction is recorded on a global, permanent ledger that no one can change!</p>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm">⚡ <strong>Speed:</strong> On Hedera, consensus happens in 3-5 seconds - faster than most payment systems!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1 || isAnimating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === steps.length - 1 ? 'Completed!' : 'Next Step'}
          {currentStep < steps.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
        </Button>
        
        {currentStep === steps.length - 1 && (
          <Button
            onClick={handleReset}
            variant="outline"
          >
            Start Over
          </Button>
        )}
      </div>

      {/* Summary */}
      {currentStep === steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50"
          style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)' }}
        >
          <h4 className="mb-3">🎉 Transaction Complete!</h4>
          <p className="text-gray-700 mb-3">
            The transaction is now permanently recorded on the Hedera blockchain. Unlike traditional banking:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>✅ No bank needed as middleman</li>
            <li>✅ Completed in seconds, not hours or days</li>
            <li>✅ Very low fees (less than $0.01)</li>
            <li>✅ Can send money anywhere in the world</li>
            <li>✅ Transaction is permanent and verifiable</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
