// USDC Contract Address on Ethereum Mainnet
export const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;
export const USDC_TESTNET_ADDRESS = process.env.NEXT_PUBLIC_USDC_TESTNET_ADDRESS;

export const ETHERSCAN_API_BASE = 'https://api-sepolia.etherscan.io/api';
export const ETHERSCAN_TESTNET_API_BASE = 'https://api-sepolia.etherscan.io/api';

export const ETHEREUM_MAINNET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_CHAIN_ID) || 1;
export const ETHEREUM_SEPOLIA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_CHAIN_ID) || 11155111;

export const DEFAULT_CHAIN_ID = ETHEREUM_SEPOLIA_CHAIN_ID;
export const DEFAULT_USDC_ADDRESS = USDC_TESTNET_ADDRESS;

export const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];