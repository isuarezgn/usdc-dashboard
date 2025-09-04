export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface WalletState {
  address: string | null;
  balance: string;
  usdcBalance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  networkName: string;
}

export interface TransactionMetrics {
  totalTransactions: number;
  totalVolume: string;
  averageAmount: string;
  lastTransaction: EtherscanTransaction | null;
}

export interface ChartData {
  date: string;
  volume: number;
  count: number;
}

export interface TransferFormData {
  recipientAddress: string;
  amount: string;
}