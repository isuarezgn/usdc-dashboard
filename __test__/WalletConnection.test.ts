import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WalletConnection } from '@/components/WalletConnection';
import { WalletProvider } from '@/contexts/WalletContext';

const WalletConnectionWithProvider = () => (
  <WalletProvider>
    <WalletConnection />
  </WalletProvider>
);

// Mock MetaMask
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true,
});

describe('WalletConnection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render connect button when wallet is not connected', () => {
    render(<WalletConnectionWithProvider />);
    expect(screen.getByText('Connect MetaMask')).toBeInTheDocument();
  });

  it('should show connecting state when wallet connection is in progress', async () => {
    mockEthereum.request.mockResolvedValue(['0x123...']);
    
    render(<WalletConnectionWithProvider />);
    
    const connectButton = screen.getByText('Connect MetaMask');
    
    await act(async () => {
      fireEvent.click(connectButton);
    });    
    
    // Should show connecting state briefly
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should display proper help text for new users', () => {
    render(<WalletConnectionWithProvider />);
    expect(screen.getByText(/Connect your MetaMask wallet to view USDC transactions/)).toBeInTheDocument();
  });
});