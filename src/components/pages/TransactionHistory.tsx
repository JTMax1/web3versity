/**
 * Transaction History Page
 *
 * Displays user's blockchain transaction history with filtering and search capabilities.
 * Shows all HBAR transactions sent/received by the user.
 */

import React, { useState, useMemo } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { getTransactionHistory, formatTransactionId, TransactionHistoryItem } from '../../lib/hedera/transactions';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { ExternalLink, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { TransactionDetailsModal } from '../TransactionDetailsModal';

type TransactionType = 'all' | 'send' | 'receive' | 'faucet';
type StatusFilter = 'all' | 'success' | 'failed' | 'pending';

export function TransactionHistory() {
  const { user, accountId } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch transaction history
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactionHistory', user?.id],
    queryFn: () => getTransactionHistory(user?.id || '', 100),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tx =>
        tx.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from_account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to_account.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => {
        if (typeFilter === 'send') return tx.from_account === accountId;
        if (typeFilter === 'receive') return tx.to_account === accountId;
        if (typeFilter === 'faucet') return tx.memo?.includes('faucet');
        return true;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    return filtered;
  }, [transactions, searchQuery, typeFilter, statusFilter, accountId]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTransactionType = (tx: TransactionHistoryItem): 'send' | 'receive' => {
    return tx.from_account === accountId ? 'send' : 'receive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <p className="text-gray-600">Please connect your wallet to view transaction history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-3xl p-8 mb-8 text-white shadow-[0_8px_32px_rgba(0,132,199,0.3)]">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-white/90">View all your blockchain transactions on Hedera Testnet</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by transaction ID or account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
              >
                <option value="all">All Types</option>
                <option value="send">Sent</option>
                <option value="receive">Received</option>
                <option value="faucet">Faucet</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0084C7] mx-auto mb-4" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load transactions</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">From/To</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((tx) => {
                      const type = getTransactionType(tx);
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedTransaction(tx)}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(tx.created_at)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {type === 'send' ? (
                                <ArrowUpRight className="w-4 h-4 text-red-500" />
                              ) : (
                                <ArrowDownLeft className="w-4 h-4 text-green-500" />
                              )}
                              <span className={`text-sm font-medium ${type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                                {type === 'send' ? 'Send' : 'Receive'}
                              </span>
                            </div>
                          </td>
                          <td className={`py-4 px-4 text-right font-semibold ${type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                            {type === 'send' ? '-' : '+'}{tx.amount.toFixed(4)} ℏ
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-sm text-gray-700">
                              {type === 'send' ? tx.to_account : tx.from_account}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(tx.status)}
                              <span className="text-sm capitalize">{tx.status}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-xs text-gray-600">
                              {formatTransactionId(tx.transaction_id)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(tx.hash_scan_url, '_blank');
                              }}
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedTransactions.map((tx) => {
                  const type = getTransactionType(tx);
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className="bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {type === 'send' ? (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          )}
                          <span className={`font-medium ${type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                            {type === 'send' ? 'Send' : 'Receive'}
                          </span>
                        </div>
                        <span className={`font-bold ${type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                          {type === 'send' ? '-' : '+'}{tx.amount.toFixed(4)} ℏ
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{formatDate(tx.created_at)}</div>
                        <div className="font-mono text-xs">
                          {type === 'send' ? 'To: ' : 'From: '}
                          {type === 'send' ? tx.to_account : tx.from_account}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">{tx.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="rounded-full"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="rounded-full"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
