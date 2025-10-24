/**
 * Transaction Details Modal
 *
 * Displays detailed information about a specific blockchain transaction.
 */

import React from 'react';
import { TransactionHistoryItem } from '../lib/hedera/transactions';
import { X, ExternalLink, CheckCircle, XCircle, Clock, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface TransactionDetailsModalProps {
  transaction: TransactionHistoryItem;
  onClose: () => void;
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'success':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold">Success</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-semibold">Failed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
            <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
            <span className="text-yellow-800 font-semibold">Pending</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-gray-800 font-semibold">Unknown</span>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-center">
            {getStatusBadge()}
          </div>

          {/* Transaction Amount */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <div className="text-sm text-gray-600 mb-2">Transaction Amount</div>
            <div className="text-4xl font-bold text-[#0084C7]">
              {transaction.amount.toFixed(4)} ℏ
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction ID
              </label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <span className="font-mono text-sm text-gray-900 flex-1 break-all">
                  {transaction.transaction_id}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.transaction_id, 'Transaction ID')}
                  className="flex-shrink-0 w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date & Time
              </label>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-900">{formatDate(transaction.created_at)}</span>
              </div>
            </div>

            {/* From Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Account
              </label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <span className="font-mono text-sm text-gray-900 flex-1">
                  {transaction.from_account}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.from_account, 'From account')}
                  className="flex-shrink-0 w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Account
              </label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <span className="font-mono text-sm text-gray-900 flex-1">
                  {transaction.to_account}
                </span>
                <button
                  onClick={() => copyToClipboard(transaction.to_account, 'To account')}
                  className="flex-shrink-0 w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Memo */}
            {transaction.memo && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Memo
                </label>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-sm text-gray-900">{transaction.memo}</span>
                </div>
              </div>
            )}

            {/* Network */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Network
              </label>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-900">Hedera Testnet</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => window.open(transaction.hash_scan_url, '_blank')}
              className="flex-1 bg-[#0084C7] text-white hover:bg-[#006ba3] rounded-full py-6"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View on HashScan
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-full px-8 py-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
