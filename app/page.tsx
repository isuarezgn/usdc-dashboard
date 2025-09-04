'use client';

import React, { useState } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { Dashboard } from '@/components/Dashboard';
import { Navigation } from '@/components/Navigation';
import { Coins, TestTube } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TransferUSDC } from '@/components/TransferUSDC';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isConnected } = useWallet();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <TransactionHistory />;
      case 'transfer':
        return <TransferUSDC />; 
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  USDC Dashboard
                </h1>
                <p className="text-muted-foreground">Ethereum Testnet Transaction Monitor</p>
              </div>
            </div>
            
          </div>

          <WalletConnection />
        </header>

        {/* Navigation */}
        {isConnected && (
          <div className="mb-8">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* Main Content */}
        <main>
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built for Ethereum testnet.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}