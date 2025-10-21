import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Droplet, CheckCircle, AlertCircle, ExternalLink, Clock, History } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import {
  requestFaucetHBAR,
  checkFaucetEligibility,
  getFaucetHistory,
  getTimeUntilAvailable,
  type FaucetHistoryEntry,
} from '../../lib/api/faucet';

export function Faucet() {
  const { user, accountId } = useWallet(); // Use accountId instead of evmAddress
  const [amount, setAmount] = useState<number>(5);
  const [status, setStatus] = useState<'idle' | 'checking' | 'loading' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [hashScanUrl, setHashScanUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [eligible, setEligible] = useState(true);
  const [remainingAmount, setRemainingAmount] = useState(10);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [history, setHistory] = useState<FaucetHistoryEntry[]>([]);
  const [cooldownTime, setCooldownTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showHistory, setShowHistory] = useState(false);

  // Check eligibility on mount and when user changes
  useEffect(() => {
    if (user) {
      checkEligibilityStatus();
      loadHistory();
    }
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (!nextAvailable) return;

    const interval = setInterval(() => {
      const timeLeft = getTimeUntilAvailable(nextAvailable);
      setCooldownTime(timeLeft);

      if (timeLeft.totalSeconds <= 0) {
        setEligible(true);
        setNextAvailable(null);
        checkEligibilityStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAvailable]);

  const checkEligibilityStatus = async () => {
    if (!user) return;

    try {
      const result = await checkFaucetEligibility(user.id);
      setEligible(result.eligible);
      setRemainingAmount(result.remainingAmount);
      setNextAvailable(result.nextAvailableAt);

      if (!result.eligible && result.nextAvailableAt) {
        const timeLeft = getTimeUntilAvailable(result.nextAvailableAt);
        setCooldownTime(timeLeft);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getFaucetHistory(10);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleRequest = async () => {
    console.log('=== FAUCET REQUEST DEBUG ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('Account ID:', accountId);
    console.log('Amount:', amount);
    console.log('===========================');

    if (!user) {
      setStatus('error');
      setErrorMessage('Please connect your wallet first');
      return;
    }

    if (!accountId) {
      setStatus('error');
      setErrorMessage('Unable to determine your Hedera account ID. Please ensure you\'re connected to Hedera Testnet.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      console.log('📞 Calling requestFaucetHBAR with userId:', user.id);
      const result = await requestFaucetHBAR(accountId, amount, user.id);

      if (result.success) {
        setTransactionId(result.transactionId || '');
        setHashScanUrl(result.hashScanUrl || '');
        setStatus('success');

        // Refresh eligibility and history
        await checkEligibilityStatus();
        await loadHistory();
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Request failed');

        if (result.nextAvailableAt) {
          setNextAvailable(result.nextAvailableAt);
        }
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Network error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setTransactionId('');
    setHashScanUrl('');
    setErrorMessage('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          {user && (
            <div className="mt-4 inline-block bg-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm text-gray-600">Remaining today: </span>
              <span className="text-lg font-bold text-[#0084C7]">{remainingAmount} ℏ</span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          {!user && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Please connect your wallet to use the faucet</p>
            </div>
          )}

          {user && status === 'idle' && (
            <>
              {/* Amount Selector */}
              <div className="mb-6">
                <label className="block mb-3 text-gray-700 font-medium">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 5, 10].map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(value)}
                      disabled={value > remainingAmount}
                      className={`py-4 px-6 rounded-2xl font-medium transition-all ${
                        amount === value
                          ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_4px_12px_rgba(0,132,199,0.3)]'
                          : value > remainingAmount
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {value} ℏ
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Connected: {accountId || 'Not connected'}
                </p>
              </div>

              {/* Cooldown Warning */}
              {!eligible && nextAvailable && (
                <div className="mb-6 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-medium text-amber-900">Cooldown Active</div>
                      <div className="text-sm text-amber-700">
                        Next request available in {cooldownTime.hours}h {cooldownTime.minutes}m {cooldownTime.seconds}s
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRequest}
                disabled={!eligible || amount > remainingAmount}
                className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-2xl py-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {eligible ? `Request ${amount} ℏ HBAR` : 'Cooldown Active'}
              </Button>

              {/* Info Boxes */}
              <div className="mt-8 space-y-4">
                <InfoBox
                  emoji="ℹ️"
                  title="Rate Limit"
                  description="You can request up to 10 HBAR every 24 hours"
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
              <p className="text-gray-600">Sending {amount} test HBAR from faucet</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-green-900">Success!</h3>
              <p className="text-gray-600 mb-6">{amount} test HBAR sent to your account</p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-sm text-gray-600 mb-2">Transaction ID</div>
                <div className="font-mono text-xs text-gray-800 break-all">{transactionId}</div>
              </div>

              {hashScanUrl && (
                <a
                  href={hashScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0084C7] hover:underline mb-6"
                >
                  View on HashScan
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleReset}
                  className="w-full bg-white text-[#0084C7] hover:bg-gray-50 rounded-2xl py-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]"
                >
                  Back to Faucet
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

        {/* History Section */}
        {user && history.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0084C7]" />
                <h3>Request History</h3>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-[#0084C7] hover:underline"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{entry.amount_hbar} ℏ</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : entry.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{formatDate(entry.requested_at)}</div>
                    {entry.transaction_id && (
                      <a
                        href={`https://hashscan.io/testnet/transaction/${entry.transaction_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0084C7] hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        View transaction
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {entry.error_message && (
                      <div className="text-xs text-red-600 mt-2">{entry.error_message}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <h3 className="mb-6">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <FAQItem
              question="How do I create a testnet account?"
              answer="Connect your MetaMask wallet to Hedera Testnet. The platform will automatically detect your account ID."
            />
            <FAQItem
              question="How much test HBAR can I receive?"
              answer="You can request up to 10 HBAR per day in amounts of 1, 5, or 10 HBAR per request."
            />
            <FAQItem
              question="Can I request multiple times?"
              answer="Yes, but there's a 24-hour cooldown period between requests to ensure fair distribution."
            />
            <FAQItem
              question="What can I do with test HBAR?"
              answer="Use test HBAR to complete practical lessons, practice transactions, create tokens, and experiment with Hedera services in a risk-free environment."
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
