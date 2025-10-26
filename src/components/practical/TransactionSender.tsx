/**
 * Transaction Sender Component
 *
 * Interactive interface for sending HBAR transactions on Hedera Testnet.
 * Used in practical lessons to teach users how to send blockchain transactions.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Send, AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { sendHBAR, estimateTransactionFee, getDynamicTransactionFee, formatTransactionId } from '../../lib/hedera/transactions';
import { isValidAccountId } from '../../lib/hedera/validation';
import { useWallet } from '../../contexts/WalletContext';
import { toast } from 'sonner';

interface TransactionSenderProps {
  /**
   * Pre-filled recipient account ID (optional)
   */
  defaultRecipient?: string;

  /**
   * Pre-filled amount (optional)
   */
  defaultAmount?: number;

  /**
   * Pre-filled memo (optional)
   */
  defaultMemo?: string;

  /**
   * Callback when transaction succeeds
   */
  onSuccess?: (transactionId: string, hashScanUrl: string) => void;

  /**
   * Callback when transaction fails
   */
  onError?: (error: string) => void;

  /**
   * Whether to show advanced options (memo, etc.)
   */
  showAdvancedOptions?: boolean;
}

export function TransactionSender({
  defaultRecipient = '',
  defaultAmount = 0,
  defaultMemo = '',
  onSuccess,
  onError,
  showAdvancedOptions = true,
}: TransactionSenderProps) {
  const { user, account, accountId, balance } = useWallet();
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState(defaultAmount);
  const [memo, setMemo] = useState(defaultMemo);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    transactionId?: string;
    hashScanUrl?: string;
    error?: string;
  } | null>(null);

  // Dynamic fee estimation
  const [estimatedFee, setEstimatedFee] = useState(estimateTransactionFee('transfer'));
  const [isFetchingFee, setIsFetchingFee] = useState(false);

  // Form validation
  const isRecipientValid = isValidAccountId(recipient);
  const isAmountValid = amount > 0 && amount <= balance;
  const totalCost = amount + estimatedFee;
  const canSubmit = isRecipientValid && isAmountValid && !isSending;

  // Fetch dynamic fee when recipient or amount changes
  useEffect(() => {
    const fetchDynamicFee = async () => {
      if (!isRecipientValid || amount <= 0) {
        setEstimatedFee(estimateTransactionFee('transfer'));
        return;
      }

      setIsFetchingFee(true);
      try {
        // Convert Hedera account ID to EVM address for fee estimation
        let toAddress: string;
        if (recipient.startsWith('0.0.')) {
          const accountNum = recipient.split('.')[2];
          toAddress = '0x' + parseInt(accountNum).toString(16).padStart(40, '0');
        } else {
          toAddress = recipient;
        }

        const dynamicFee = await getDynamicTransactionFee(toAddress, amount);
        setEstimatedFee(dynamicFee);
      } catch (error) {
        console.error('Failed to fetch dynamic fee:', error);
        setEstimatedFee(estimateTransactionFee('transfer'));
      } finally {
        setIsFetchingFee(false);
      }
    };

    // Debounce fee fetching to avoid too many requests
    const timeoutId = setTimeout(fetchDynamicFee, 500);
    return () => clearTimeout(timeoutId);
  }, [recipient, amount, isRecipientValid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!accountId || !user?.id) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSending(true);
    setShowConfirmation(false);

    try {
      const result = await sendHBAR(
        accountId,
        recipient,
        amount,
        memo || undefined,
        user.id
      );

      setTransactionResult(result);

      if (result.success && result.transactionId) {
        toast.success('Transaction sent successfully!');
        onSuccess?.(result.transactionId, result.hashScanUrl || '');
      } else {
        toast.error(result.error || 'Transaction failed');
        onError?.(result.error || 'Transaction failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMsg);
      onError?.(errorMsg);
      setTransactionResult({ success: false, error: errorMsg });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleReset = () => {
    setRecipient(defaultRecipient);
    setAmount(defaultAmount);
    setMemo(defaultMemo);
    setTransactionResult(null);
  };

  // Success state
  if (transactionResult?.success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your HBAR has been sent successfully to the recipient.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm text-gray-900">
                  {formatTransactionId(transactionResult.transactionId || '')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Sent:</span>
                <span className="font-semibold text-green-600">{amount} ℏ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To Account:</span>
                <span className="font-mono text-sm text-gray-900">{recipient}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.open(transactionResult.hashScanUrl, '_blank')}
              className="bg-[#0084C7] text-white hover:bg-[#006ba3] rounded-full px-6"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on HashScan
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-full px-6"
            >
              Send Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation modal
  if (showConfirmation) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Confirm Transaction</h3>

        <div className="bg-white rounded-2xl p-6 mb-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">From:</span>
              <span className="font-mono text-sm text-gray-900">{accountId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">To:</span>
              <span className="font-mono text-sm text-gray-900">{recipient}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-[#0084C7]">{amount} ℏ</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Network Fee:</span>
              <span className="text-gray-700">{estimatedFee.toFixed(4)} ℏ</span>
            </div>
            {memo && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Memo:</span>
                <span className="text-gray-900">{memo}</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-4">
              <span className="font-semibold text-gray-900">Total Cost:</span>
              <span className="font-bold text-[#0084C7] text-lg">{totalCost.toFixed(4)} ℏ</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-700 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important Notice</p>
              <p>
                This transaction is permanent and cannot be reversed. Please verify all details
                before confirming. You will be prompted to sign this transaction with your wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 rounded-full"
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[#0084C7] text-white hover:bg-[#006ba3] rounded-full"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Confirm & Send
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Send HBAR Transaction</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Account ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Recipient Account ID
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0.0.xxxxx"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-colors font-mono text-sm ${
              recipient && !isRecipientValid
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-[#0084C7]'
            } focus:outline-none`}
          />
          {recipient && !isRecipientValid && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Invalid account ID format. Expected: 0.0.xxxxx
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (HBAR)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              step="0.01"
              min="0"
              max={balance}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                amount > 0 && !isAmountValid
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#0084C7]'
              } focus:outline-none`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
              ℏ
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Your balance: {balance.toFixed(4)} ℏ</span>
            <span className="text-gray-600 flex items-center gap-1">
              Fee: ~{estimatedFee.toFixed(6)} ℏ
              {isFetchingFee && <Loader2 className="w-3 h-3 animate-spin" />}
            </span>
          </div>
          {amount > balance && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Insufficient balance
            </p>
          )}
        </div>

        {/* Memo (Optional) */}
        {showAdvancedOptions && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Memo (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a message to your transaction"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
            />
            <p className="text-gray-500 text-xs mt-2">
              {memo.length}/100 characters
            </p>
          </div>
        )}

        {/* Transaction Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Cost:</span>
            <span className="text-2xl font-bold text-[#0084C7]">
              {(amount + estimatedFee).toFixed(4)} ℏ
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] rounded-full py-6 text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 mr-2" />
          Review Transaction
        </Button>
      </form>
    </div>
  );
}
