import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Droplet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export function Faucet() {
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequest = async () => {
    if (!accountId.match(/^0\.0\.\d+$/)) {
      setStatus('error');
      setErrorMessage('Please enter a valid Hedera account ID (e.g., 0.0.123456)');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate API call
    setTimeout(() => {
      const mockTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`;
      setTransactionId(mockTransactionId);
      setStatus('success');
    }, 2000);
  };

  const handleReset = () => {
    setStatus('idle');
    setAccountId('');
    setTransactionId('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <Droplet className="w-10 h-10 text-[#0084C7]" />
          </div>
          <h1 className="mb-2">Testnet Faucet</h1>
          <p className="text-gray-600">Get free testnet HBAR for learning and testing</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          {status === 'idle' && (
            <>
              <div className="mb-6">
                <label className="block mb-2 text-gray-700">
                  Hedera Account ID
                </label>
                <input
                  type="text"
                  placeholder="0.0.123456"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Enter your Hedera testnet account ID to receive 10 test HBAR
                </p>
              </div>

              <Button
                onClick={handleRequest}
                disabled={!accountId}
                className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-2xl py-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Test HBAR
              </Button>

              {/* Info Boxes */}
              <div className="mt-8 space-y-4">
                <InfoBox
                  emoji="ℹ️"
                  title="Rate Limit"
                  description="You can request test HBAR once every 24 hours per account"
                />
                <InfoBox
                  emoji="⚠️"
                  title="Testnet Only"
                  description="These tokens have no real-world value and work only on Hedera testnet"
                />
                <InfoBox
                  emoji="🎓"
                  title="For Learning"
                  description="Use these tokens to practice transactions and build DApps"
                />
              </div>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7]/20 to-[#00a8e8]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <Droplet className="w-8 h-8 text-[#0084C7]" />
              </div>
              <h3 className="mb-2">Processing Request...</h3>
              <p className="text-gray-600">Sending 10 test HBAR to {accountId}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-green-900">Success!</h3>
              <p className="text-gray-600 mb-6">10 test HBAR sent to {accountId}</p>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-sm text-gray-600 mb-2">Transaction ID</div>
                <div className="font-mono text-sm text-gray-800 break-all">{transactionId}</div>
              </div>

              <a
                href={`https://hashscan.io/testnet/transaction/${transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0084C7] hover:underline mb-6"
              >
                View on HashScan
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex gap-4">
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-white text-[#0084C7] hover:bg-gray-50 rounded-2xl py-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]"
                >
                  Request Again
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-red-900">Error</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-2xl px-8 py-4 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <h3 className="mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <FAQItem
              question="How do I create a testnet account?"
              answer="You can create a Hedera testnet account using the Hedera Portal or by installing a wallet like HashPack and switching to testnet mode."
            />
            <FAQItem
              question="How much test HBAR will I receive?"
              answer="Each successful request provides 10 test HBAR, which is sufficient for educational purposes and testing transactions."
            />
            <FAQItem
              question="Can I request multiple times?"
              answer="Yes, but there's a 24-hour cooldown period between requests for the same account and IP address."
            />
            <FAQItem
              question="What can I do with test HBAR?"
              answer="Use test HBAR to practice transactions, create tokens, deploy smart contracts, and experiment with Hedera services in a risk-free environment."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <div className="text-sm text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h4 className="text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
