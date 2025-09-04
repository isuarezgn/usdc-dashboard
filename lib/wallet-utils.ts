import { ethers } from 'ethers';
import { USDC_ABI, DEFAULT_USDC_ADDRESS, DEFAULT_CHAIN_ID } from './constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const formatUSDCAmount = (amount: string, decimals: number = 6): string => {
  const value = ethers.formatUnits(amount, decimals);
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

export const parseUSDCAmount = (amount: string, decimals: number = 6): string => {
  return ethers.parseUnits(amount, decimals).toString();
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTransactionHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
};

export const getEtherscanUrl = (hash: string, type: 'tx' | 'address' = 'tx', isTestnet: boolean = true): string => {
  const baseUrl = 'https://etherscan.io';
  return `${baseUrl}/${type}/${hash}`;
};

export const isValidEthereumAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const connectToMetaMask = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw error;
  }
};

export const switchToTestnet = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }]
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added to MetaMask, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
          chainName: 'Sepolia Test Network',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }]
      });
    } else {
      throw error;
    }
  }
};

export const getUSDCContract = (provider: ethers.Provider): ethers.Contract => {
  return new ethers.Contract(DEFAULT_USDC_ADDRESS, USDC_ABI, provider);
};