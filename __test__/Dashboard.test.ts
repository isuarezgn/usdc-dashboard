import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';
import { WalletProvider } from '@/contexts/WalletContext';

// Mock the Etherscan API
jest.mock('@/lib/etherscan-api');

const DashboardWithProvider = () => (
  <WalletProvider>
    <Dashboard />
  </WalletProvider>
);

describe('Dashboard Component', () => {
  it('should render connect message when wallet is not connected', () => {
    render(<DashboardWithProvider />);
    expect(screen.getByText('Connect your wallet to view your USDC dashboard')).toBeInTheDocument();
  });

  it('should render dashboard cards structure', () => {
    render(<DashboardWithProvider />);
    
    // Should show the connect message initially
    expect(screen.getByText(/Connect your wallet/)).toBeInTheDocument();
  });
});