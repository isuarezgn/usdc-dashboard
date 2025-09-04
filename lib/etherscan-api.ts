import { EtherscanTransaction } from '@/types/blockchain';
import { 
  ETHERSCAN_API_BASE, 
  ETHERSCAN_TESTNET_API_BASE, 
  ETHERSCAN_API_KEY, 
  DEFAULT_USDC_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDC_TESTNET_ADDRESS,
  DEFAULT_CHAIN_ID 
} from './constants';

export class EtherscanAPI {
  private baseUrl: string;
  private apiKey: string;
  private contractAddress: string;

  constructor(isTestnet: boolean = true) {
    this.baseUrl = isTestnet ? ETHERSCAN_TESTNET_API_BASE : ETHERSCAN_API_BASE;
    this.apiKey = ETHERSCAN_API_KEY;
    this.contractAddress = isTestnet ? DEFAULT_USDC_ADDRESS : USDC_CONTRACT_ADDRESS;
  }

  private async makeRequest(params: Record<string, string>): Promise<any> {
    const url = new URL(this.baseUrl);
    
    // Add API key and common params
    url.searchParams.append('apikey', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      //if(key != "address")
        url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      const data = await response.json();      
      
      if (data.status === '0' && data.message !== 'No transactions found') {
        // Instead of throwing, return a special object with error info
        return { error: true, message: data.result || 'API request failed' };
      }
      
      return data;
    } catch (error) {
      console.log('Etherscan API error:', error);
      throw error;
    }
  }

  async getUSDCTransfers(address: string, page: number = 1, offset: number = 100, contractAddress?: string): Promise<EtherscanTransaction[]> {
    const params = {
      module: 'account',
      action: 'tokentx',
      contractaddress: contractAddress || this.contractAddress,
      address: address,
      page: page.toString(),
      offset: offset.toString(),
      startblock: '0',
      endblock: '999999999',
      sort: 'desc'
    };

    const response = await this.makeRequest(params);
    return response.result || [];
  }

  async getUSDCBalance(address: string): Promise<string> {
    const params = {
      module: 'account',
      action: 'tokenbalance',
      contractaddress: this.contractAddress,
      address: address,
      tag: 'latest'
    };

    const response = await this.makeRequest(params);
    return response.result || '0';
  }

  async getTransactionDetails(txHash: string): Promise<any> {
    const params = {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash: txHash
    };

    const response = await this.makeRequest(params);
    return response.result;
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    const params = {
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      txhash: txHash
    };

    const response = await this.makeRequest(params);
    return response.result;
  }
}

export async function fetchSepoliaUsdcTransfers({
  startBlock = 0,
  endBlock = 99999999,
  page = 1,
  offset = 100,
  sort = 'asc'
} = {}) {
  const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx` +
    `&contractaddress=${USDC_TESTNET_ADDRESS}` +
    `&apikey=${ETHERSCAN_API_KEY}` +
    `&chainid=${DEFAULT_CHAIN_ID}` +
    `&startblock=${startBlock}` +
    `&endblock=${endBlock}` +
    `&page=${page}` +
    `&offset=${offset}` +
    `&sort=${sort}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Etherscan API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}