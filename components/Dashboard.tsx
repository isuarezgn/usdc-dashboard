'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity, Clock, ArrowUpRight } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { EtherscanAPI } from '@/lib/etherscan-api';
import { EtherscanTransaction, TransactionMetrics, ChartData } from '@/types/blockchain';
import { formatUSDCAmount, formatTimestamp, getEtherscanUrl } from '@/lib/wallet-utils';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Dashboard() {
  const { address, isConnected } = useWallet();
  const [metrics, setMetrics] = useState<TransactionMetrics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<EtherscanTransaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const etherscanApi = new EtherscanAPI(true); // Using testnet
      
      // Get recent transactions
      const transactions = await etherscanApi.getUSDCTransfers(address, 1, 100);
      setRecentTransactions(transactions.slice(0, 5));

      // Calculate metrics
      if (transactions.length > 0) {
        const totalVolume = transactions.reduce((sum, tx) => {
          return sum + parseFloat(formatUSDCAmount(tx.value));
        }, 0);

        const averageAmount = totalVolume / transactions.length;

        setMetrics({
          totalTransactions: transactions.length,
          totalVolume: totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          averageAmount: averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          lastTransaction: transactions[0] || null,
        });

        // Prepare chart data for the last 30 days
        const last30Days = eachDayOfInterval({
          start: subDays(new Date(), 29),
          end: new Date()
        });

        const volumeByDay = last30Days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayTransactions = transactions.filter(tx => {
            const txDate = format(new Date(parseInt(tx.timeStamp) * 1000), 'yyyy-MM-dd');
            return txDate === dayStr;
          });

          const dayVolume = dayTransactions.reduce((sum, tx) => {
            return sum + parseFloat(formatUSDCAmount(tx.value));
          }, 0);

          return {
            date: format(day, 'MMM dd'),
            volume: dayVolume,
            count: dayTransactions.length
          };
        });

        setChartData(volumeByDay);
      }
    } catch (error) {
      console.log('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart.js configuration
  const volumeChartData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Transaction Volume',
        data: chartData.map(item => item.volume),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.1,
        fill: true
      }
    ]
  };

  const countChartData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Transaction Count',
        data: chartData.map(item => item.count),
        backgroundColor: '#10B981',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            if (label.includes('Volume')) {
              return `${label}: $${value?.toLocaleString()}`;
            } else {
              return `${label}: ${value}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">Connect your wallet to view your USDC dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metrics?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time activity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${metrics?.totalVolume || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">USDC transferred</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Amount
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${metrics?.averageAmount || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Activity
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-600">
              {metrics?.lastTransaction 
                ? format(new Date(parseInt(metrics.lastTransaction.timeStamp) * 1000), 'MMM dd, HH:mm')
                : 'No transactions'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">Most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume (30 Days)</CardTitle>
            <CardDescription>Daily USDC transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={volumeChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Count (30 Days)</CardTitle>
            <CardDescription>Daily transaction frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={countChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest USDC transactions on testnet</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No USDC Transactions Found</h3>
              <p className="text-muted-foreground">Your USDC transaction history will appear here once you start transacting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.hash} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full transition-colors ${
                      tx.from.toLowerCase() === address?.toLowerCase() 
                        ? 'bg-red-100 text-red-600 group-hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 group-hover:bg-green-200'
                    }`}>
                      {tx.from.toLowerCase() === address?.toLowerCase() 
                        ? <TrendingDown className="h-5 w-5" />
                        : <TrendingUp className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {tx.from.toLowerCase() === address?.toLowerCase() ? 'Sent' : 'Received'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimestamp(tx.timeStamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      ${formatUSDCAmount(tx.value)} <span className="text-sm font-normal text-muted-foreground">USDC</span>
                    </div>
                    <a 
                      href={getEtherscanUrl(tx.hash, 'tx', true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end transition-colors"
                    >
                      View on Etherscan <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}