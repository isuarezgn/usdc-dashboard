'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/types/blockchain';
import { connectToMetaMask, switchToTestnet, getUSDCContract, formatUSDCAmount } from '@/lib/wallet-utils';
import { DEFAULT_CHAIN_ID } from '@/lib/constants';
import { EtherscanAPI } from '@/lib/etherscan-api';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  transferUSDC: (to: string, amount: string) => Promise<string>;
  setError: (error: string | null) => void;
  error: string | null;
}

type WalletAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; chainId: number; networkName: string } }
  | { type: 'CONNECT_ERROR' }
  | { type: 'DISCONNECT' }
  | { type: 'UPDATE_BALANCE'; payload: { balance: string; usdcBalance: string } }
  | { type: 'UPDATE_CHAIN'; payload: { chainId: number; networkName: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } };

// Add networkName to WalletState
const initialState: WalletState & { networkName?: string } = {
  address: null,
  balance: '0',
  usdcBalance: '0',
  chainId: null,
  isConnected: false,
  isConnecting: false,
  networkName: '',
};

function walletReducer(
  state: WalletState & { networkName?: string },
  action: WalletAction
): WalletState & { networkName?: string } {
  switch (action.type) {
    case 'CONNECT_START':
      return { ...state, isConnecting: true };
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        address: action.payload.address,
        chainId: action.payload.chainId,
        isConnected: true,
        isConnecting: false,
        networkName: action.payload.networkName,
      };
    case 'CONNECT_ERROR':
      return { ...state, isConnecting: false };
    case 'DISCONNECT':
      return { ...initialState };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.payload.balance,
        usdcBalance: action.payload.usdcBalance,
      };
    case 'UPDATE_CHAIN':
      return {
        ...state,
        chainId: action.payload.chainId,
        networkName: action.payload.networkName,
      };
    default:
      return state;
  }
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const [error, setErrorState] = React.useState<string | null>(null);

  const setError = (error: string | null) => {
    setErrorState(error);
  };

  const connectWallet = async () => {
    try {
      dispatch({ type: 'CONNECT_START' });
      setError(null);

      const address = await connectToMetaMask();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Switch to testnet
      if (Number(network.chainId) !== DEFAULT_CHAIN_ID) {
        await switchToTestnet();
      }

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address,
          chainId: Number(network.chainId),
          networkName: network.name,
        }
      });

      // Refresh balances
      await refreshBalanceInternal(address, provider);
    } catch (error: any) {
      console.log('Failed to connect wallet:', error);
      setError(error.message);
      dispatch({ type: 'CONNECT_ERROR' });
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
    setError(null);
  };

  const refreshBalanceInternal = async (address: string, provider?: ethers.BrowserProvider) => {
    try {
      const ethProvider = provider || new ethers.BrowserProvider(window.ethereum);
      
      // Get ETH balance
      const ethBalance = await ethProvider.getBalance(address);
      const formattedEthBalance = ethers.formatEther(ethBalance);

      // Get USDC balance via Etherscan API (testnet)
      const etherscanApi = new EtherscanAPI(true);
      const usdcBalanceRaw = await etherscanApi.getUSDCBalance(address);
      const formattedUsdcBalance = formatUSDCAmount(usdcBalanceRaw);

      dispatch({
        type: 'UPDATE_BALANCE',
        payload: {
          balance: formattedEthBalance,
          usdcBalance: formattedUsdcBalance,
        }
      });
    } catch (error) {
      console.log('Failed to refresh balance:', error);
    }
  };

  const refreshBalance = async () => {
    if (state.address) {
      await refreshBalanceInternal(state.address);
    }
  };

  const transferUSDC = async (to: string, amount: string): Promise<string> => {
    if (!state.address || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdcContract = getUSDCContract(provider).connect(signer);

      const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      const tx = await usdcContract.transfer(to, amountWei);
      
      return tx.hash;
    } catch (error) {
      let message = '';
      console.log('Transfer failed:', error.message);
      if(error.message?.includes('user rejected action'))
        message = 'Transaction was rejected by user.';
      else
        message = error.message;

      setError(message);
      throw new Error(message);
    }
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.address) {
          // Get network name
          const provider = new ethers.BrowserProvider(window.ethereum);
          provider.getNetwork().then(network => {
            dispatch({
              type: 'CONNECT_SUCCESS',
              payload: {
                address: accounts[0],
                chainId: Number(network.chainId),
                networkName: network.name,
              }
            });
            refreshBalanceInternal(accounts[0]);
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getNetwork().then(network => {
          dispatch({
            type: 'UPDATE_CHAIN',
            payload: {
              chainId: newChainId,
              networkName: network.name,
            }
          });
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.address, state.chainId]);

  const contextValue: WalletContextType & { networkName?: string } = {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    transferUSDC,
    setError,
    error,
    networkName: state.networkName,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}