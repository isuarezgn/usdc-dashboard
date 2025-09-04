'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { EtherscanAPI } from '@/lib/etherscan-api';
import { EtherscanTransaction } from '@/types/blockchain';
import { formatUSDCAmount, formatTimestamp, formatAddress, getEtherscanUrl } from '@/lib/wallet-utils';

// Simple in-memory cache for transactions by address
const transactionCache: Record<string, { data: EtherscanTransaction[]; timestamp: number }> = {};
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function TransactionHistory() {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<EtherscanTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<EtherscanTransaction | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [isConnected, address]);

  const loadTransactions = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const cacheEntry = transactionCache[address];
      const now = Date.now();
      if (cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
        setTransactions(cacheEntry.data);
      } else {
        const etherscanApi = new EtherscanAPI(true); // Using testnet
        const txs = await etherscanApi.getUSDCTransfers(address, 1, 100);
        setTransactions(txs);
        transactionCache[address] = { data: txs, timestamp: now };
      }
    } catch (error) {
      console.log('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => {
        const isSent = tx.from.toLowerCase() === address?.toLowerCase();
        return filterType === 'sent' ? isSent : !isSent;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = parseInt(a.timeStamp) - parseInt(b.timeStamp);
      } else if (sortBy === 'amount') {
        comparison = parseFloat(formatUSDCAmount(a.value)) - parseFloat(formatUSDCAmount(b.value));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortBy, sortOrder, address]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount (USDC)', 'From', 'To', 'Transaction Hash'];
    const csvData = filteredTransactions.map(tx => [
      formatTimestamp(tx.timeStamp),
      tx.from.toLowerCase() === address?.toLowerCase() ? 'Sent' : 'Received',
      formatUSDCAmount(tx.value),
      tx.from,
      tx.to,
      tx.hash
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usdc-transactions-${address}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Transaction History</CardTitle>
              <CardDescription>Complete history of your USDC transactions on testnet</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadTransactions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by hash, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sent">Sent Only</SelectItem>
                <SelectItem value="received">Received Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-');
              setSortBy(newSortBy as 'date' | 'amount');
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-destructive">No Transactions Found</h3>
              <p className="text-muted-foreground">
                {transactions.length === 0
                  ? "No transaction data could be retrieved from Etherscan. Please check your wallet address or try again later."
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">From/To</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => {
                      const isSent = tx.from.toLowerCase() === address?.toLowerCase();
                      return (
                        <TableRow key={new Date().getTime()} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-full ${
                                isSent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {isSent ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                              </div>
                              <Badge variant={isSent ? 'destructive' : 'default'}>
                                {isSent ? 'Sent' : 'Received'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-lg">
                              ${formatUSDCAmount(tx.value)}
                            </div>
                            <div className="text-xs text-muted-foreground">USDC</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{formatAddress(isSent ? tx.to : tx.from)}</div>
                              <div className="text-muted-foreground">{isSent ? 'To' : 'From'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatTimestamp(tx.timeStamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedTransaction(tx)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Transaction Details</DialogTitle>
                                    <DialogDescription>
                                      Complete information for transaction {tx.hash.slice(0, 20)}...
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedTransaction && (
                                    <TransactionDetail transaction={selectedTransaction} />
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Button variant="ghost" size="sm" asChild>
                                <a 
                                  href={getEtherscanUrl(tx.hash, 'tx', true)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionDetail({ transaction }: { transaction: EtherscanTransaction }) {
  const { address } = useWallet();
  const isSent = transaction.from.toLowerCase() === address?.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">{transaction.hash}</code>
              <Button variant="ghost" size="sm" asChild>
                <a href={getEtherscanUrl(transaction.hash, 'tx', true)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">${formatUSDCAmount(transaction.value)}</span>
              <Badge>USDC</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <div className="flex items-center gap-2 mt-1">
              <div className={`p-2 rounded-full ${
                isSent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {isSent ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              </div>
              <Badge variant={isSent ? 'destructive' : 'default'}>
                {isSent ? 'Sent' : 'Received'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">From Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">{transaction.from}</code>
              <Button variant="ghost" size="sm" asChild>
                <a href={getEtherscanUrl(transaction.from, 'address', true)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">To Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">{transaction.to}</code>
              <Button variant="ghost" size="sm" asChild>
                <a href={getEtherscanUrl(transaction.to, 'address', true)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
            <div className="mt-1">
              <span className="text-sm">{formatTimestamp(transaction.timeStamp)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Block Number</label>
          <div className="mt-1 p-2 bg-muted rounded">
            <span className="text-sm font-mono">{transaction.blockNumber}</span>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Gas Used</label>
          <div className="mt-1 p-2 bg-muted rounded">
            <span className="text-sm font-mono">{parseInt(transaction.gasUsed).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">Gas Price</label>
          <div className="mt-1 p-2 bg-muted rounded">
            <span className="text-sm font-mono">{(parseInt(transaction.gasPrice) / 1e9).toFixed(2)} Gwei</span>
          </div>
        </div>
      </div>
    </div>
  );
}