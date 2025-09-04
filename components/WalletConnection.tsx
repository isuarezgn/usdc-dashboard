'use client';

import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Box,
  Typography
} from '@mui/material';
import {
  AccountBalanceWallet,
  Logout,
  Refresh,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/wallet-utils';
import { DEFAULT_CHAIN_ID } from '@/lib/constants';

export function WalletConnection() {
  const { 
    address, 
    balance, 
    usdcBalance, 
    chainId, 
    isConnected, 
    isConnecting,
    networkName, 
    connectWallet, 
    disconnectWallet, 
    refreshBalance,
    error,
    setError
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      console.log('Connection failed:', error.message);
    }
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await refreshBalance();
    } catch (error: any) {
      setError('Failed to refresh balance');
    }
  };

  if (!isConnected) {
    return (
      <Box className="space-y-4">
        {error && (
          <Alert 
            severity="error" 
            className="w-full max-w-md mx-auto"
            icon={<ErrorIcon className="h-4 w-4" />}
          >
            {error}
          </Alert>
        )}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Box className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <AccountBalanceWallet className="h-8 w-8 text-white" />
            </Box>
            <Typography variant="h6" className="font-semibold mb-2">
              Connect Your Wallet
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-6">
              Connect your MetaMask wallet to view USDC transactions on Ethereum testnet
            </Typography>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full h-12 text-base"
              variant="contained"
              fullWidth
            >
              {isConnecting ? (
                <>
                  <Refresh className="h-5 w-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <AccountBalanceWallet className="h-5 w-5 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <Box className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <AccountBalanceWallet className="h-6 w-6 text-white" />
            </Box>
            <Box>
              <Box className="flex items-center gap-2 mb-1">
                <Typography variant="h6" className="font-semibold">
                  {formatAddress(address!)}
                </Typography>
                <Chip 
                  label={networkName}
                  color={chainId === DEFAULT_CHAIN_ID ? "success" : "error"}
                  size="small"
                />
              </Box>
              <Typography variant="body2" className="text-muted-foreground">
                <span className="mr-4">ETH: {parseFloat(balance).toFixed(4)}</span>
                <span className="font-medium">USDC: {usdcBalance}</span>
              </Typography>
            </Box>
          </Box>
          <Box className="flex items-center gap-2">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleRefresh}
              className="min-w-0 p-2"
            >
              <Refresh className="h-4 w-4" />
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={disconnectWallet}
              className="min-w-0 p-2"
            >
              <Logout className="h-4 w-4" />
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}