import { formatUSDCAmount, formatAddress, formatTransactionHash, isValidEthereumAddress } from '@/lib/wallet-utils';

describe('Wallet Utils', () => {
  describe('formatUSDCAmount', () => {
    it('should format USDC amounts correctly', () => {
      expect(formatUSDCAmount('1000000')).toBe('1.00'); // 1 USDC (6 decimals)
      expect(formatUSDCAmount('1500000')).toBe('1.50'); // 1.5 USDC
      expect(formatUSDCAmount('123456789')).toBe('123.456789'); // 123.456789 USDC
    });

    it('should handle zero amounts', () => {
      expect(formatUSDCAmount('0')).toBe('0.00');
    });
  });

  describe('formatAddress', () => {
    it('should format Ethereum addresses correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b8D421B80000000000';
      expect(formatAddress(address)).toBe('0x742d...0000');
    });

    it('should handle empty addresses', () => {
      expect(formatAddress('')).toBe('');
    });
  });

  describe('formatTransactionHash', () => {
    it('should format transaction hashes correctly', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      expect(formatTransactionHash(hash)).toBe('0x12345678...90abcdef');
    });

    it('should handle empty hashes', () => {
      expect(formatTransactionHash('')).toBe('');
    });
  });

  describe('isValidEthereumAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b8D421B80000000000')).toBe(true);
      expect(isValidEthereumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(isValidEthereumAddress('invalid-address')).toBe(false);
      expect(isValidEthereumAddress('')).toBe(false);
      expect(isValidEthereumAddress('0x123')).toBe(false);
    });
  });
});